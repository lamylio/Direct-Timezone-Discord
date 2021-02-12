const {prefix, keys} = require('./utils.js')
const commands = require('./commands/exports')

/* --- */
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

Object.keys(commands).map(key => {bot.commands.set(commands[key].name, commands[key]);});
bot.login(keys.TOKEN);

/* --- */

/* --- */

bot.once('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("message", msg => {
  
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  
  const args = msg.content.split(/ +/);
  const cmd = args.shift().toLowerCase().substr(1);

  const command = bot.commands.get(cmd) || bot.commands.find(command => command.aliases && command.aliases.includes(cmd))
  if (!command) return;

  console.info(`Called command '${cmd}' with args '${JSON.stringify(args)}'`);

  try {
    command.execute(msg, args);
  } catch (error) {
    if (error instanceof SyntaxError) {
      msg.reply(error.message + "\nUsage: " + prefix + command.name + " " + command.usage);
    }else{
      console.error(error)
    }
  }

})


