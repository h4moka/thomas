const { canModifyQueue } = require("../util/error");
const { MessageEmbed } = require("discord.js");
const { embed } = require("../util/embed");
const { CHANNEL } = require(`../config/bot.json`);
const { PREFIXER } = require('../config/bot.json');
const db = require('quick.db')
module.exports = {
    name: "stop",
    aliases: ["leave", "end"],
    cooldown: 5,

    async execute(message, args, client) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
        if (!message.guild) return;
        message.react("✅").catch(console.error);
        const { channel } = message.member.voice;
        const queue = message.client.queue.get(message.guild.id);
        if (!channel) return embed(message, "You Have To Join a \`Voice Channel\` First!");
        if (queue && channel !== message.guild.me.voice.channel)
            return embed(message, `Iam Only Work In \`${CHANNEL.name}\``);
        if (!queue)
            return embed(message, "Thare is nothing in the music queue!");
        if (!canModifyQueue(message.member)) return;
        await channel.leave();
        message.channel.send(new MessageEmbed()
            .setColor("#c219d8")
            .setAuthor(`**${message.author.username}** stopped the music!`))
            .catch(console.error);
    }
};
/**
 * @copyright Go't To NIR0
 */