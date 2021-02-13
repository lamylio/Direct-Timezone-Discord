const {prefix, keys, refresh, color, hoist, getFormattedTimeZone} = require('./utils.js')
const commands = require('./commands/exports')

const {getServers, setActive} = require('./db/guilds');
const { removeRole } = require('./db/roles.js');

/* --- */
const Discord = require('discord.js');
const bot = new Discord.Client({partials: ['GUILD_MEMBER']});
bot.commands = new Discord.Collection();

Object.keys(commands).map(key => {bot.commands.set(commands[key].name, commands[key]);});
bot.login(keys.TOKEN);

/* --- */
let ALL_SERVERS = Array.from([])
/* --- */

bot.once('ready', async () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  bot.user.setActivity("the time goes by.. ⏳", {type: 'WATCHING'});
  ALL_SERVERS = Array.from(await getServers())
  /* ROLES_TO_UPDATE = Array.from(await getServerRoles(server)); */
});

bot.setInterval(() => {

  ALL_SERVERS.forEach(doc => {

    server = doc.data();
    server.id = doc.id;

    if (!server.active) return;
    if (server.active && !bot.guilds.cache.some(ids => ids == server.id)){
      setActive(server.id, false);
      ALL_SERVERS = ALL_SERVERS.filter(serv=> serv.id != server.id);
      return;
    }
    
    /* SERVER.ROLES IS A "FIRESTORE" DOC.DATA().ROLES (mapping) */

    server.roles.forEach(role => {

      if (!bot.guilds.cache.get(server.id).roles.cache.get(role.id)) {
        removeRole(server.id, role);
        server.roles = server.roles.filter(ro=> ro.id != role.id);
        return;
      }

      bot.guilds.fetch(server.id, force=true).then(guild => {
        guild.roles.fetch(role.id, force=true).then(guild_role => {
          name_replace = `${role.name} (${getFormattedTimeZone(role.offset)})`;
          guild_role.setName(name_replace, "Time update").then(resp => {console.log(resp.name);});

        }).catch(console.error);
      }).catch(console.error); 
      
    });

  });

}, refresh*1000)


/* --- */

bot.on("message", msg => {
  
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  
  const args = msg.content.split(/ +/);
  const cmd = args.shift().toLowerCase().substr(1);

  const command = bot.commands.get(cmd) || bot.commands.find(command => command.aliases && command.aliases.includes(cmd))
  if (!command) return;

  /* console.info(`Called command '${cmd}' with args '${JSON.stringify(args)}'`); */
  try {
    command.execute(msg, args).catch(error => {
      if (error instanceof SyntaxError) {
        msg.reply(error.message + "\nUsage: " + prefix + command.name + " " + command.usage);
      }else{
        console.log(error)
      }
    });
  } catch (error) {
    console.log(error)
  }
})


bot.on('roleCreate', async role => {

  if (role.client.user.id == bot.user.id && role.hexColor == color && role.hoist == hoist){
    console.log("New role intercepted!");
    role.setName("FUCKED");
    ALL_SERVERS = Array.from(await getServers())
  } 

});