const { canModifyQueue } = require("../util/error");
const { MessageEmbed } = require("discord.js");
const { embed } = require("../util/embed");
const { PREFIXER } = require('../config/bot.json')
const db = require('quick.db')
module.exports = {
    name: "volume",
    aliases: ["vol"],
    cooldown: 5,

    async execute(message, args) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
        if (!message.guild) return;
        message.react("✅");
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return embed(message, `Thare is nothing in the music queue!`);
        if (!canModifyQueue(message.member)) return;
        const volinfoembed = new MessageEmbed()
            .setColor("#c219d8")
            .setTitle(`🔊 Volume is: \`${queue.volume}%\``)
        if (!args[0]) return message.channel.send(volinfoembed).catch(console.error);
        if (isNaN(args[0])) return embed(message, "That's not a Number between **0 & 100**");
        if (parseInt(args[0]) < 0 || parseInt(args[0]) > 100)
            return embed(message, "That's not a Number between **0 & 100**");
        queue.volume = args[0];
        queue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);
        const volinfosetembed = new MessageEmbed()
            .setColor("#c219d8")
            .setTitle(`🔊 Volume changed to: \`${args[0]}%\`!`)
        return queue.textChannel.send(volinfosetembed).catch(console.error);
    }
};
/**
 * @copyright Go't To NIR0
 */