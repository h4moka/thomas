const { canModifyQueue } = require("../util/error");
const { MessageEmbed } = require("discord.js");
const { embed } = require("../util/embed");
const { PREFIXER } = require('../config/bot.json')
const db = require('quick.db')
module.exports = {
    name: "remove",
    aliases: ["delete"],
    cooldown: 5,

    async execute(message, args) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = pre;
        if (!message.guild) return;
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return embed(message, "Thare is nothing in the music queue!");
        if (!canModifyQueue(message.member)) return;
        if (!args.length) return embed(message, `Try: ${prefix}remove <Music Queue Number>`);
        if (isNaN(args[0])) return embed(message, `Try: ${prefix}remove <Music Queue Number>`);
        const song = queue.songs.splice(args[0] - 1, 1);
        message.react("✅")
        queue.textChannel.send(new MessageEmbed()
            .setDescription(`❌ | ${message.author} removed **${song[0].title}** from the Queue`)
            .setColor("#c219d8")
        );
    }
};
/**
 * @copyright Go't To NIR0
 */