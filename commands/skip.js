const { canModifyQueue } = require("../util/error");
const { MessageEmbed } = require("discord.js");
const { embed } = require("../util/embed");
const { PREFIXER } = require('../config/bot.json')
const db = require('quick.db')
module.exports = {
    name: "skip",
    aliases: ["s"],
    cooldown: 5,

    async execute(message) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
        if (!message.guild) return;
        message.react("✅").catch(console.error);
        const queue = message.client.queue.get(message.guild.id);
        if (!queue)
            return embed(message, "Thare is nothing in the music queue!").catch(console.error);
        if (!canModifyQueue(message.member)) return;
        queue.playing = true;
        queue.connection.dispatcher.end();
        queue.textChannel.send(
            new MessageEmbed().setColor("#c219d8").setAuthor(`**${message.author.username}** skipped the song.`)
        ).catch(console.error);
    }
};
/**
 * @copyright Go't To NIR0
 */