module.exports = {
    name: "test",
    usage : ``,
    async execute(msg, args){
        const reaction = await msg.react("🎉");
        console.log(reaction.users.cache);
    
    }
}