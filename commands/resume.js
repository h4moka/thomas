const { canModifyQueue } = require("../util/error");
const { MessageEmbed } = require("discord.js");
const { embed } = require("../util/embed");
const { PREFIXER } = require('../config/bot.json')
const db = require('quick.db')
module.exports = {
    name: "resume",
    aliases: ["r"],
    cooldown: 10,

    async execute(message) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
        if (!message.guild) return;
        message.react("✅").catch(console.error);
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return embed(message, "Thare is nothing in the music queue!").catch(console.error);
        if (!canModifyQueue(message.member)) return;
        if (!queue.playing) {
            queue.playing = true;
            queue.connection.dispatcher.resume();
            const playembed = new MessageEmbed().setColor("#c219d8")
                .setAuthor(`**${message.author.username}** resumed the music!`)
            return queue.textChannel.send(playembed).catch(console.error);
        }
        return embed(message, "The Queue is not paused!").catch(console.error);
    }
};
/**
 * @copyright Go't To NIR0
 */