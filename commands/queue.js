const { MessageEmbed, splitMessage } = require("discord.js");
const { embed } = require("../util/embed");
const { PREFIXER } = require('../config/bot.json')
const db = require('quick.db')
module.exports = {
    name: "queue",
    aliases: ["qu"],
    cooldown: 10,

    async execute(message) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
        if (!message.guild) return;
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return embed(message, "Thare is nothing in the music queue!").catch(console.error);
        console.log(queue.songs);
        let description = "";
        for (let i = 0; i < queue.songs.length; i++) {
            description += `**${i}.** [${queue.songs[i].title.substring(0, 40)}](${queue.songs[i].url}) | \`${queue.songs[i].duration}\`\n`
        }
        let queueEmbed = new MessageEmbed()
            .setTitle("Music Queue")
            .setDescription(description)
            .setColor("#c219d8");
        const splitDescription = splitMessage(description, {
            maxLength: 2048,
            char: "\n",
            prepend: "",
            append: ""
        });
        splitDescription.forEach(async (m) => {
            queueEmbed.setDescription(m);
            message.react("✅")
            message.channel.send(queueEmbed);
        });
    }
};
/**
 * @copyright Go't To NIR0
 */