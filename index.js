const {prefix, keys, server, refresh} = require('./utils.js')
const commands = require('./commands/exports')
const {getServerRoles, getAllLocations} = require('./db/firestore');

/* --- */
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

Object.keys(commands).map(key => {bot.commands.set(commands[key].name, commands[key]);});
bot.login(keys.TOKEN);

/* --- */

/* --- */

bot.once('ready', async () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  ROLES_TO_UPDATE = Array.from(await getServerRoles());
});

bot.setInterval(() => {
  if (!ROLES_TO_UPDATE || ROLES_TO_UPDATE.length < 1) return;

  ROLES_TO_UPDATE.forEach(role => {
    localstamp = Date.now() + ALL_LOCATIONS.getrole.offset*1000;
    localtime = new Date(localstamp).toLocaleTimeString("en-GB", {timeZone: "UTC", hour: '2-digit', minute:'2-digit', timeStyle: 'short'});
    
    bot.guilds.get(server).roles.get(role.id).edit({
      name: `${role.name} (${localtime})`
    }).catch(console.error);
  });

}, refresh*1000)


/* --- */

bot.on("message", msg => {
  
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  
  const args = msg.content.split(/ +/);
  const cmd = args.shift().toLowerCase().substr(1);

  const command = bot.commands.get(cmd) || bot.commands.find(command => command.aliases && command.aliases.includes(cmd))
  if (!command) return;

  console.info(`Called command '${cmd}' with args '${JSON.stringify(args)}'`);

  try {
    callback = command.execute(msg, args);
    if (callback) callback();
  } catch (error) {
    if (error instanceof SyntaxError) {
      msg.reply(error.message + "\nUsage: " + prefix + command.name + " " + command.usage);
    }else{
      console.error(error)
    }
  }
})


