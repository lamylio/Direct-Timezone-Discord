/* 
==================== 
Imports 
====================
*/
const package = require('./package.json');
const {settings, keys, colors, getFormattedTimeZone, roundTime} = require('./utils/utils.js')
const {getServers, setActive} = require('./db/guilds');
const {removeRole} = require('./db/roles.js');
const {addRequests} = require('./db/requests.js');

const commands = require('./commands/exports')

/* 
==================== 
Bot setup 
====================
*/
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
Object.keys(commands).map(key => {bot.commands.set(commands[key].name, commands[key]);});
bot.login(keys.TOKEN);

/* 
==================== 
Event handlers 
====================
*/

let ALL_SERVERS = Array.from([])
let TICKING_LOOP;

bot.once('ready', async () => {
  console.info(colors.yellow(`====================\nLogged in as ${bot.user.tag}! and debug is set to ${settings.debug}\n====================`), colors.reset());
  bot.user.setPresence({ activity: { name: settings.activity, type: "WATCHING" }, status: 'available' });

  ALL_SERVERS = Array.from(await getServers())
  TICKING_LOOP = startTicking();
  
  let bot_v = `Timezone v${package.version}`
  if (bot.user.username != bot_v) {
    bot.user.setUsername(bot_v).then(console.log(colors.yellow(`Username changed to ${bot_v}`), colors.reset()));
  }
});

bot.on("debug", (msg) => {
  /* If we hit the discord api limit, we shut down the bot as its not working */
  if (msg.startsWith("429 hit")){
    console.error(colors.redBright(`====================\n!! Rate-limited !!\nNext try in 6 hours\n====================`),colors.reset());

    bot.user.setPresence({ activity: { name: "sorry, I'm API-limited !" }, status: 'dnd' });
    bot.clearInterval(TICKING_LOOP);

    setTimeout(() => {
      bot.user.setPresence({ activity: { name: "fetching the API 🔌"}, status: 'idle' });
      console.log(colors.redBright("Trying to re-launch the bot.."), colors.reset());
      TICKING_LOOP = startTicking();
    }, 3600*6*1000); // 6 hours

  }else {if (settings.debug) if(!msg.toLowerCase().includes("heartbeat")) console.log(msg);}
}).on("warn", () => {if (settings.debug) console.log});

/* 
==================== 
Catch all the message and execute if its a command.
See /commands/xx.js
====================
*/
bot.on("message", msg => {
  
  if (!msg.content.startsWith(settings.prefix) || msg.author.bot) return;
  
  const args = msg.content.split(/ +/);
  const cmd = args.shift().toLowerCase().substr(1);

  const command = bot.commands.get(cmd) || bot.commands.find(command => command.aliases && command.aliases.includes(cmd))
  if (!command) return;

  if (settings.debug) console.info(`User ${msg.author.username} called command '${cmd}' with args '${JSON.stringify(args)}'`);
  try {
    command.execute(msg, args).catch(error => {
      if (error instanceof SyntaxError) {
        let error_message = `**${error.message}** \n`;
        if (command.usage) error_message+= `**Usage**: ${settings.prefix}${command.name} ${command.usage}\n`;
        if (command.aliases) error_message+= `**Aliases** : ${JSON.stringify(command.aliases)}`;

        msg.reply(error_message).then(rep => {
          rep.delete({ timeout: 30000 });
        });
      }else{
        console.log(error);
      }
    }).finally(msg.delete({ timeout: 10000 }));
  } catch (error) {
    console.log(error);
  }
})

/* 
==================== 
Catch all roles created and check if it was created by the bot
If yes, we refresh the list of roles to update
====================
*/
bot.on('roleCreate', async role => {
  
  if (role.client.user.id == bot.user.id && role.hexColor == settings.new_role.color && role.hoist == settings.new_role.hoist){
    if (settings.debug) console.log("New role intercepted: ", role.name);
    setTimeout(async () => {
      ALL_SERVERS = Array.from(await getServers());
    }, 5000)
  } 

});


function startTicking(){

  bot.setTimeout(() => {
    bot.user.setPresence({ activity: { name: settings.activity, type: "WATCHING" }, status: 'available' });
  }, settings.refresh*1000);

  /* 
  ==================== 
  Retrieve all the roles on each server and modify the name with the current time
  ====================
  */
  return bot.setInterval(() => {
    
    /* 
    First, we need to check if its time to update
    */

    let current = Date.now();
    let expected = roundTime(current, Math.round(settings.refresh/60));
    let diff = Math.abs(current-expected);

    if (diff > 500) return;
    if (settings.debug) console.log(colors.yellow(`Ticking at ${getFormattedTimeZone(0, 1)} with ${ALL_SERVERS.length} active servers.`), colors.reset());

    /* 
    Then, we can start the loop and modify the roles
    */

    ALL_SERVERS.forEach(doc => {
  
      server = doc.data();
      server.id = doc.id;
      /* 
      If the server is not defined as active or we're not connected in anymore
      Then we remove it from the list, and ensure that its set as inactive 
      */

      if (!server.active || !bot.guilds.cache.some(ids => ids == server.id)){
        setActive(server.id, false);
        ALL_SERVERS = ALL_SERVERS.filter(serv=> serv.id != server.id);
        if (settings.debug) console.log(colors.yellow(`Server ${server.id} is now considered inactive.`) ,colors.reset());
        return;
      }
      
      addRequests(server.id, server.roles.length); // Keep track of the nb of requests
      server.roles.forEach(role => {
        
        /* If the role doesn't exist anymore, we remove it from the database and the list */
        if (!bot.guilds.cache.get(server.id).roles.cache.get(role.id)) {
          removeRole(server.id, role);
          server.roles = server.roles.filter(ro=> ro.id != role.id);
          return;
        }
  
        /* Fetch the guild, then the role and rename it. getFormattedTimeZone() is in utils.js */
        bot.guilds.fetch(server.id, force=true).then(guild => {
          guild.roles.fetch(role.id, force=true).then(guild_role => {
            name_replace = `${role.name} (${getFormattedTimeZone(role.offset)})`;
            guild_role.setName(name_replace, "Time update").catch(console.error);
  
          }).catch(console.error);
        }).catch(console.error); 
        
      });
  
    });
  }, 1000)
}