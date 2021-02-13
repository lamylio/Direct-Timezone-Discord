/* 
==================== 
Imports 
====================
*/
const {settings, keys, getFormattedTimeZone} = require('./utils.js')
const {getServers, setActive} = require('./db/guilds');
const {removeRole} = require('./db/roles.js');

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
  console.info(`
====================
Logged in as ${bot.user.tag}! and debug is set to ${settings.debug}
====================
  `);

  bot.user.setPresence({ activity: { name: settings.activity, type: "WATCHING" }, status: 'available' });

  ALL_SERVERS = Array.from(await getServers())
  TICKING_LOOP = startTicking();
});

bot.on("debug", (msg) => {
  /* If we hit the discord api limit, we shut down the bot as its not working */
  if (msg.startsWith("429 hit")){
    console.error(`
====================
!! Rate-limited !!
====================
    `);
    //process.exit(429);
    bot.user.setPresence({ activity: { name: "sorry, I'm API-limited !" }, status: 'dnd' });
    bot.clearInterval(TICKING_LOOP);

    setTimeout(() => {
      bot.user.setPresence({ activity: { name: "fetching the API 🔌"}, status: 'idle' });
      console.log("Trying to re-launch the bot..");
      TICKING_LOOP = startTicking();
    }, 3600*6*1000); // 6 hours

  }else {if (settings.debug) console.log(msg);}
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

  if (settings.debug) console.info(`Called command '${cmd}' with args '${JSON.stringify(args)}'`);
  try {
    command.execute(msg, args).catch(error => {
      if (error instanceof SyntaxError) {
        msg.reply(error.message + "\nUsage: " + settings.prefix + command.name + " " + command.usage);
      }else{
        console.log(error);
      }
    });
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
    ALL_SERVERS = Array.from(await getServers());
  } 

});


function startTicking(){

  bot.setTimeout(() => {
    bot.user.setPresence({ activity: { name: settings.activity, type: "WATCHING" }, status: 'available' });
  }, settings.refresh*1000);

  return bot.setInterval(() => {
    /* 
    ==================== 
    Retrieve all the roles on each server and modify the name with the current time
    ====================
    */
    if (settings.maintenance) return;
    if (settings.debug) console.log("Interval for editing roles ticking..");
    ALL_SERVERS.forEach(doc => {
  
      server = doc.data();
      server.id = doc.id;
      
      /* 
      If the server is not defined as active or we're not connected in anymore
      Then we remove it from the list, and ensure that its set as inactive 
      */
      if (!server.active) return;
      if (server.active && !bot.guilds.cache.some(ids => ids == server.id)){
        setActive(server.id, false);
        ALL_SERVERS = ALL_SERVERS.filter(serv=> serv.id != server.id);
        return;
      }
  
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
  
  }, settings.refresh*1000)
}