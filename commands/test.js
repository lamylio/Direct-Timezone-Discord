module.exports = {
    name: "test",
    usage : ``,
    async execute(msg, args){
        let test = msg.guild.roles.cache.get("809971503239790644");
        console.log("before", test.name)
        msg.guild.roles.cache.get("809971503239790644").setName("Hello").then(x => msg.channel.send(x.name)).catch(console.error).finally(() => console.log("setName end"));
        console.log("after", msg.guild.roles.cache.get("809971503239790644").name);
    }
}