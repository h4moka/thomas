const createBar = require("string-progressbar");
const { MessageEmbed } = require("discord.js");
const { embed } = require("../util/embed");
const { PREFIXER } = require('../config/bot.json')
const db = require('quick.db')
module.exports = {
    name: "nowplaying",
    aliases: ['np'],
    cooldown: 20,

    async execute(message) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
        if (!message.guild) return;
        message.react("✅")
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return embed(message, "Thare is nothing in the music queue!").catch(console.error);
        const song = queue.songs[0];
        let minutes = song.duration.split(":")[0];
        let seconds = song.duration.split(":")[1];
        let ms = (Number(minutes) * 60 + Number(seconds));
        let thumb;
        if (song.thumbnail === undefined) thumb = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.designtrends.com%2Fwp-content%2Fuploads%2F2016%2F04%2F06131325%2FSnoopy-Playing-Music-Image.jpg&f=1&nofb=1";
        else thumb = song.thumbnail.url;
        const seek = (queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime) / 1000;
        const left = ms - seek;
        let nowPlaying = new MessageEmbed()
            .setTitle("Now playing")
            .setDescription(`[${song.title}](${song.url})`)
            .setThumbnail(song.thumbnail.url)
            .setColor("#c219d8")
            .setFooter("Time Remaining: " + new Date(left * 1000).toISOString().substr(11, 8));
        if (ms >= 10000) {
            nowPlaying.addField("\u200b", "🔴 LIVE", false);
            return message.channel.send(nowPlaying);
        }
        if (ms > 0 && ms < 10000) {
            nowPlaying.addField("\u200b", "**[" + createBar((ms == 0 ? seek : ms), seek, 25, "▬", "⚪️")[0] + "]**\n**" + new Date(seek * 1000).toISOString().substr(11, 8) + " / " + (ms == 0 ? " ◉ LIVE" : new Date(ms * 1000).toISOString().substr(11, 8)) + "**", false);
            return message.channel.send(nowPlaying);
        }
    }
};
/**
 * @copyright Go't To NIR0
 */