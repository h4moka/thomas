const { canModifyQueue } = require("../util/error");
const { MessageEmbed } = require("discord.js");
const { embed } = require("../util/embed");
const { PREFIXER } = require('../config/bot.json')
const db = require('quick.db')
module.exports = {
    name: "pause",
    aliases: ['pau'],
    cooldown: 10,

    async execute(message) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
        if (!message.guild) return;
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return embed(message, "Thare is nothing in the music queue!").catch(console.error);
        if (!canModifyQueue(message.member)) return;
        if (queue.playing) {
            queue.playing = false;
            queue.connection.dispatcher.pause(true);
            const pausemebed = new MessageEmbed().setColor("#c219d8")
                .setAuthor(`**${message.author.username}** paused the music.`)
            message.react("✅")
            return queue.textChannel.send(pausemebed).catch(console.error);
        }
    }
};
/**
 * @copyright Go't To NIR0
 */