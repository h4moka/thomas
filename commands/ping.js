const { MessageEmbed } = require("discord.js");
const { PREFIXER } = require('../config/bot.json')
const db = require('quick.db')
module.exports = {
    name: "ping",
    aliases: ["pn"],
    cooldown: 10,

    async execute(message, args, client) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = pre;
        var msg = `${Date.now() - message.createdTimestamp}`
        var api = `${Math.round(client.ws.ping)}`
        var ping = new Discord.MessageEmbed()
            .setColor("#B00EFC")
            .addField(`**Ping**:`, `\`${msg}\``, true)
            .addField(`**Discord API**:`, `\`${api}\``, true)
        message.channel.send(ping)

        db.set(`${name}_${message.author.id}`, Date.now())
    }
}