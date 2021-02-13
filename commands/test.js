module.exports = {
    name: "test",
    usage : ``,
    async execute(msg, args){
        let test = msg.guild.roles.cache.get("809992771091824681");
        console.log("before", test.name)
        msg.guild.roles.fetch("809992771091824681").then(role => role.setName("Hello").then(x => msg.channel.send(x.name)).catch(console.error).finally(() => console.log("setName end")));
        console.log("after", msg.guild.roles.cache.get("809992771091824681").name);
    }
}