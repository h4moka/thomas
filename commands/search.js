const ytsr = require("youtube-sr")
const { MessageEmbed } = require("discord.js");
const { embed } = require("../util/embed");
const db = require('quick.db')
const { CHANNEL } = require(`../config/bot.json`);
const { PREFIXER } = require('../config/bot.json')
module.exports = {
    name: "search",
    aliases: ["find"],
    cooldown: 20,

    async execute(message, args, client) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
        if (!message.guild) return;
        const { channel } = message.member.voice;
        const serverQueue = message.client.queue.get(message.guild.id);
        message.react("✅").catch(console.error);
        if (!args.length)
            return embed(message, `${prefix}${module.exports.name} <Music Name>`)
        if (message.channel.activeCollector)
            return;
        if (!message.member.voice.channel)
            return embed(message, "You Have To Join a \`Voice Channel\` First!")
        if (serverQueue && channel !== message.guild.me.voice.channel)
            return embed(message, `Iam Only Work In \`${CHANNEL.name}\``);
        const search = args.join(" ");
        let temEmbed = new MessageEmbed()
            .setAuthor("🔄 Searching...")
            .setColor("#f300e5")
        let resultsEmbed = new MessageEmbed()
            .setTitle("✅ Results for: ")
            .setDescription(`\`${search}\``)
            .setColor("#f300e5")
            .setFooter("Response with your favorite number", client.user.displayAvatarURL())
        try {
            const results = await ytsr.search(search, { limit: 5 });
            results.map((video, index) => resultsEmbed.addField(video.url, `${index + 1}. ${video.title}`));
            const resultsMessage = await message.channel.send(temEmbed)
            await resultsMessage.react("1️⃣");
            await resultsMessage.react("2️⃣");
            await resultsMessage.react("3️⃣");
            await resultsMessage.react("4️⃣");
            await resultsMessage.react("5️⃣");
            await resultsMessage.edit(resultsEmbed)
            message.channel.activeCollector = true;
            let response;
            await resultsMessage.awaitReactions((reaction, user) => user.id == message.author.id,
                { max: 1, time: 60000, errors: ['time'], }).then(collected => {
                    if (collected.first().emoji.name == "1️⃣") { return response = 1; }
                    if (collected.first().emoji.name == "2️⃣") { return response = 2; }
                    if (collected.first().emoji.name == "3️⃣") { return response = 3; }
                    if (collected.first().emoji.name == "4️⃣") { return response = 4; }
                    if (collected.first().emoji.name == "5️⃣") { return response = 5; }
                    else {
                        response = "error";
                    }
                });
            if (response === "error") {
                return resultsMessage.delete().catch(console.error);
            }
            const choice = resultsEmbed.fields[parseInt(response) - 1].name;
            message.channel.activeCollector = false;
            message.client.commands.get("play").execute(message, [choice]);
            resultsMessage.delete().catch(console.error);
        } catch (error) {
            console.error(error);
            message.channel.activeCollector = false;
        }
    }
};
/**
 * @copyright Go't To NIR0
 */