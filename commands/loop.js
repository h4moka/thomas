const { canModifyQueue } = require("../util/error");
const { MessageEmbed } = require("discord.js");
const { embed } = require("../util/embed");
const db = require('quick.db')
const { PREFIXER } = require('../config/bot.json')
module.exports = {
    name: "loop",
    aliases: ['l'],
    cooldown: 5,

    async execute(message) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
        if (!message.guild) return;
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return embed(message, "Thare is nothing in the music queue!").catch(console.error);
        if (!await canModifyQueue(message.member)) return;
        queue.loop = !queue.loop;
        const loopembed = new MessageEmbed()
            .setColor(queue.loop ? "#c219d8" : "#ff0e7a")
            .setAuthor(`Loop is now ${queue.loop ? " enabled" : " disabled"}`)
        message.react("✅");
        return queue.textChannel
            .send(loopembed)
            .catch(console.error);
    }
};
/**
 * @copyright Go't To NIR0
 */