const { play } = require("../include/play");
const { MessageEmbed } = require("discord.js");
const { embed } = require("../util/embed");
const { CHANNEL } = require(`../config/bot.json`);
const { PREFIXER } = require('../config/bot.json')
const ytsr = require("youtube-sr")
const db = require('quick.db')
module.exports = {
    name: "play",
    aliases: ["p"],
    cooldown: 10,

    async execute(message, args, client) {
        try {
            var prefix = await db.fetch(`prefix_${message.guild.id}`);
            if (prefix == null) prefix = PREFIXER;
            if (!message.guild) return;
            const { channel } = message.member.voice;
            const serverQueue = message.client.queue.get(message.guild.id);
            if (!channel) return embed(message, "You Have To Join a \`Voice Channel\` First!");
            if (serverQueue && channel !== message.guild.me.voice.channel)
                return embed(message, `Iam Only Work In \`${CHANNEL.name}\``);
            if (!args.length)
                return embed(message, `${prefix}play URL/NAME`);
            message.react("✅").catch(console.error);
            const permissions = channel.permissionsFor(message.client.user);
            if (!permissions.has("CONNECT"))
                return embed(message, `I Need \`CONNECT\` Permissions To Connect The Room!`);
            if (!permissions.has("SPEAK"))
                return embed(message, "I Need \`SPEAK\` Permissions To Speak In The Room!");
            const search = args.join(" ");
            const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
            const urlValid = videoPattern.test(args[0]);
            const queueConstruct = {
                textChannel: message.channel,
                channel,
                connection: null,
                songs: [],
                loop: false,
                volume: 69,
                filters: [],
                realseek: 0,
                playing: true
            };
            let songInfo = null;
            let song = null;
            try {
                if (serverQueue) {
                    if (urlValid) {
                        message.channel.send(new MessageEmbed().setColor("#c219d8")
                            .setDescription(`**Searching 🔍 [\`LINK\`](${args.join(" ")})**`))
                    }
                    else {
                        message.channel.send(new MessageEmbed().setColor("#c219d8")
                            .setDescription(`**Searching 🔍 \`${args.join(" ")}\`**`))
                    }
                } else {
                    queueConstruct.connection = await channel.join();
                    message.channel.send(new MessageEmbed().setColor("#c219d8")
                        .setDescription(`**<@!${client.user.id}> Joined \`${channel.name}\` 📄 bound \`<#${message.channel.id}>\`**`)
                        .setFooter(`By: ${message.author.tag}`))
                    if (urlValid) {
                        message.channel.send(new MessageEmbed().setColor("#c219d8")
                            .setDescription(`**Searching 🔍 [\`LINK\`](${args.join(" ")})**`))
                    }
                    else {
                        message.channel.send(new MessageEmbed().setColor("#c219d8")
                            .setDescription(`**Searching 🔍 \`${args.join(" ")}\`**`))
                    }
                    queueConstruct.connection.voice.setSelfDeaf(true);
                    queueConstruct.connection.voice.setDeaf(true);
                }
            }
            catch {
            }
            if (urlValid) {
                try {
                    songInfo = await ytsr.searchOne(search);
                    song = {
                        title: songInfo.title,
                        views: String(songInfo.views).padStart(10, ' '),
                        ago: songInfo.ago,
                        url: songInfo.url,
                        thumbnail: songInfo.thumbnail,
                        duration: songInfo.durationFormatted,
                    };
                } catch (error) {
                    if (error.statusCode === 403) return embed(message, "The bot has a lot of pressure, please re-load the bot!");
                    console.error(error);
                    return message.channel.send(`Error: البوت مفشوخ`);
                }
            }
            else {
                try {
                    songInfo = await ytsr.searchOne(search);
                    song = {
                        title: songInfo.title,
                        views: String(songInfo.views).padStart(10, ' '),
                        ago: songInfo.ago,
                        url: songInfo.url,
                        thumbnail: songInfo.thumbnail,
                        duration: songInfo.durationFormatted,
                    };
                if (song.title === undefined) title = "UMbot (NEvo Vesrion)";
                else title = song.title;
                if (song.url === undefined) url = "https://www.youtube.com/watch?v=gnyW6uaUgk4";
                else url = song.url
                if (song.ago === undefined) ago = "UMbot (NEvo Vesrion)";
                else ago = song.ago;
                if (song.views === undefined) views = "UMbot (NEvo Vesrion)";
                else views = song.views;
                if (song.duration === undefined) duration = "UMbot (NEvo Vesrion)";
                } catch (error) {
                    console.error(error);
                    return embed(message, error);
                }
            }
            let thumb = "https://cdn.discordapp.com/attachments/748095614017077318/769672148524335114/unknown.png"
            if (song.thumbnail === undefined) thumb = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.designtrends.com%2Fwp-content%2Fuploads%2F2016%2F04%2F06131325%2FSnoopy-Playing-Music-Image.jpg&f=1&nofb=1";
            else thumb = song.thumbnail.url;
            if (serverQueue) {
                let estimatedtime = Number(0);
                for (let i = 0; i < serverQueue.songs.length; i++) {
                    let minutes = serverQueue.songs[i].duration.split(":")[0];
                    let seconds = serverQueue.songs[i].duration.split(":")[1];
                    estimatedtime += (Number(minutes) * 60 + Number(seconds));
                }
                if (estimatedtime > 60) {
                    estimatedtime = Math.round(estimatedtime / 60 * 100) / 100;
                    estimatedtime = estimatedtime + " Minutes"
                }
                else if (estimatedtime > 60) {
                    estimatedtime = Math.round(estimatedtime / 60 * 100) / 100;
                    estimatedtime = estimatedtime + " Hours"
                }
                else {
                    estimatedtime = estimatedtime + " Seconds"
                }
                serverQueue.songs.push(song);
                if (song.title === undefined) title = "UMbot (NEvo Vesrion)";
                else title = song.title;
                if (song.url === undefined) url = "UMbot (NEvo Vesrion)";
                else url = song.url
                if (song.ago === undefined) ago = "UMbot (NEvo Vesrion)";
                else ago = song.ago;
                if (song.views === undefined) views = "UMbot (NEvo Vesrion)";
                else views = song.views;
                if (song.duration === undefined) duration = "UMbot (NEvo Vesrion)";
                else duration = song.duration;

                const newsong = new MessageEmbed()
                    .setTitle("✅ " + song.title)
                    .setColor("#c219d8")
                    .setThumbnail(thumb)
                    .setURL(song.url)
                    .setDescription(`\`\`\`Has been added to the Queue.\`\`\``)
                    .addField("Estimated time until playing:", `\`${estimatedtime}\``, true)
                    .addField("Position in queue", `**\`${serverQueue.songs.length - 1}\`**`, true)
                    .addField(`duration`, `**\`${song.duration}\`**`, true)
                    .addField(`Views`, `**\`${song.views}\`**`, true)
                    .addField(`Older`, `**\`${song.ago}\`**`, true)
                    .setFooter(`Requested by: ${message.author.tag}`, message.member.user.displayAvatarURL({ dynamic: true }))
                return serverQueue.textChannel
                    .send(newsong)
                    .catch(console.error);

            }

            queueConstruct.songs.push(song);
            message.client.queue.set(message.guild.id, queueConstruct);
            try {
                play(queueConstruct.songs[0], message, client);
            } catch (error) {
                console.error(error);
                message.client.queue.delete(message.guild.id);
                return embed(message, `Could not join the channel: ${error}`);
            }
        } catch (error) {
            console.log(error)
        }
    }
}
/**
 * @copyright Go't To NIR0
 */