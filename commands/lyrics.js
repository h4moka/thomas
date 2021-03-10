const { canModifyQueue } = require("../util/error");
const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("lyrics-finder");
const { embed } = require("../util/embed");
const { PREFIXER } = require('../config/bot.json')
const db = require('quick.db')
module.exports = {
  name: "lyrics",
  aliases: ["ly", "text"],
  cooldown: 30,

async execute(message) {
    var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
    if(!message.guild) return;
    message.react("✅").catch(console.error);
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return embed(message, "Thare is nothing in the music queue!");
    if (!canModifyQueue(message.member)) return;
    let lyrics = null;
    let temEmbed = new MessageEmbed()
    .setAuthor("Searching...").setFooter("Lyrics")
    .setColor("#f300e5")
    let result = await message.channel.send(temEmbed)
    try {
      lyrics = await lyricsFinder(queue.songs[0].title,"");
      if (!lyrics) lyrics = `No lyrics found for ${queue.songs[0].title}.`;
    }
    catch (error) {
      lyrics = `**No lyrics found for ${queue.songs[0].title}.**`;
    }
    let lyricsEmbed = new MessageEmbed()
      .setTitle("📑 Lyrics")
      .setDescription(`**${lyrics}**`)
      .setColor("#f300e5")
    if (lyricsEmbed.description.length >= 2048)
      lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
    return result.edit(lyricsEmbed).catch(console.error);
  }
};
/**
 * @copyright Go't To NIR0
 */