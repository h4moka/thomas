const ytdl = require("discord-ytdl-core");
const { canModifyQueue } = require("../util/error");
const { Client, Collection, MessageEmbed, splitMessage, escapeMarkdown, MessageAttachment } = require("discord.js");
const { embed } = require("../util/embed");
const createBar = require("string-progressbar");
const lyricsFinder = require("lyrics-finder");
module.exports = {
    async play(song, message, client, filters) {
        const { PRUNING, SOUNDCLOUD_CLIENT_ID } = require("../config/bot.json");
        const queue = message.client.queue.get(message.guild.id);
        if (!song) {
            queue.channel.leave();
            message.client.queue.delete(message.guild.id);
        }
        let stream = null;
        let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";
        let isnotayoutube = false;
        let seekTime = 0;
        let oldSeekTime = queue.realseek;
        let encoderArgstoset;
        if (filters === "remove") {
            queue.filters = ['-af', 'dynaudnorm=f=200'];
            encoderArgstoset = queue.filters;
            try {
                seekTime = (queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime) / 1000 + oldSeekTime;
            } catch{
                seekTime = 0;
            }
            queue.realseek = seekTime;
        } else if (filters) {
            try {
                seekTime = (queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime) / 1000 + oldSeekTime;
            } catch{
                seekTime = 0;
            }
            queue.realseek = seekTime;
            queue.filters.push(filters)
            encoderArgstoset = ['-af', queue.filters]
        }
        try {
            if (song.url.includes("youtube.com")) {
                stream = ytdl(song.url, {
                    filter: "audioonly",
                    opusEncoded: true,
                    encoderArgs: encoderArgstoset,
                    bitrate: 320,
                    seek: seekTime,
                    quality: "highestaudio",
                    liveBuffer: 40000,
                    highWaterMark: 1 << 25,

                });
            } else if (song.url.includes(".mp3") || song.url.includes("baseradiode")) {
                stream = song.url;
                isnotayoutube = true;
            }
        } catch (error) {
            if (queue) {
                queue.songs.shift();
                module.exports.play(queue.songs[0], message);
            }
            console.error(error);
            return message.channel.send(`Error: البوت مفشوخ`);
        }
        queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));
        if (isnotayoutube) {
            console.log("TEST")
            const dispatcher = queue.connection
                .play(stream)
                .on("finish", () => {
                    if (collector && !collector.ended) collector.stop();

                    if (queue.loop) {
                        let lastSong = queue.songs.shift();
                        queue.songs.push(lastSong);
                        module.exports.play(queue.songs[0], message);
                    } else {
                        queue.songs.shift();
                        module.exports.play(queue.songs[0], message);
                    }
                })
                .on("error", (err) => {
                    console.error(err);
                    queue.songs.shift();
                    module.exports.play(queue.songs[0], message);
                });
            dispatcher.setVolumeLogarithmic(queue.volume / 100);
        } else {
            const dispatcher = queue.connection
                .play(stream, { type: streamType })
                .on("finish", () => {
                    if (collector && !collector.ended) collector.stop();

                    if (queue.loop) {
                        let lastSong = queue.songs.shift();
                        queue.songs.push(lastSong);
                        module.exports.play(queue.songs[0], message);
                    } else {
                        queue.songs.shift();
                        module.exports.play(queue.songs[0], message);
                    }
                })
                .on("error", (err) => {
                    console.error(err);
                    queue.songs.shift();
                    module.exports.play(queue.songs[0], message);
                });
            dispatcher.setVolumeLogarithmic(queue.volume / 100);
        }
        let thumb;
        if (song.thumbnail === undefined) thumb = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.designtrends.com%2Fwp-content%2Fuploads%2F2016%2F04%2F06131325%2FSnoopy-Playing-Music-Image.jpg&f=1&nofb=1";
        else thumb = song.thumbnail.url;
        const serverQueue = message.client.queue.get(message.guild.id);
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
            if(song.title === undefined ) title = "UMbot (NEvo Vesrion)";
            else title = song.title;
            if(song.url === undefined ) url = "https://www.youtube.com/watch?v=gnyW6uaUgk4";
            else url = song.url
            if(song.ago === undefined) ago = "UMbot (NEvo Vesrion)";
            else ago = song.ago;
            if(song.views === undefined) views = "UMbot (NEvo Vesrion)";
            else views = song.views;
            if(song.duration === undefined) duration = "UMbot (NEvo Vesrion)";
            else duration = song.duration;
        try {
            const newsong = new MessageEmbed()
                .setTitle("✅" + song.title)
                .setURL(song.url)
                .setColor("#c219d8")
                .setThumbnail(thumb)
                .setFooter(`Requested by: ${message.author.tag}`, message.member.user.displayAvatarURL({ dynamic: true }))
                .addField("Estimated time until playing:", `\`${estimatedtime}\``, true)
                .addField("Position in queue", `**\`${serverQueue.songs.length - 1}\`**`, true)
                .addField(`duration`, `**\`${song.duration}\`**`, true)
                .addField(`Views`, `**\`${song.views}\`**`, true)
                .addField(`Older`, `**\`${song.ago}\`**`, true)
            var playingMessage = await queue.textChannel.send(newsong);
            await playingMessage.react("⏭"); 
            await playingMessage.react("⏯"); 
            await playingMessage.react("🔄"); 
            await playingMessage.react("⏹");
            await playingMessage.react("❓");
            await playingMessage.react("🎵");
            await playingMessage.react("📑");
        } catch (error) {
            console.error(error);
        }



        const filter = (reaction, user) => user.id !== message.client.user.id;
        var collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });

        collector.on("collect", async (reaction, user) => {
            if (!queue) return;
            const member = message.guild.member(user);

            switch (reaction.emoji.name) {
                case "🎵":
                    reaction.users.remove(user).catch(console.error);
                    const description = queue.songs.map((song, index) => `${index + 1}. ${escapeMarkdown(song.title)}`);

                    let queueEmbed = new MessageEmbed()
                        .setTitle("Music Queue")
                        .setDescription(description)
                        .setColor("#c219d8")
                        ;

                    const splitDescription = splitMessage(description, {
                        maxLength: 2048,
                        char: "\n",
                        prepend: "",
                        append: ""
                    });

                    splitDescription.forEach(async (m) => {

                        queueEmbed.setDescription(m);
                        message.react("✅")
                        message.channel.send(queueEmbed).then(m => {
                            m.delete({ timeout: 1500 })
                        })
                    });
                    break;
                case "❓":
                    reaction.users.remove(user).catch(console.error);
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
                        .setDescription(`[**${song.title}**](${song.url})`)
                        .setThumbnail(song.thumbnail.url)
                        .setColor("#c219d8")
                        .setFooter("Time Remaining: " + new Date(left * 1000).toISOString().substr(11, 8));
                    if (ms >= 10000) {
                        nowPlaying.addField("\u200b", "🔴 LIVE", false);
                        return message.channel.send(nowPlaying)
                    }
                    if (ms > 0 && ms < 10000) {
                        nowPlaying.addField("\u200b", "**[" + createBar((ms == 0 ? seek : ms), seek, 25, "▬", "⚪️")[0] + "]**\n**" + new Date(seek * 1000).toISOString().substr(11, 8) + " / " + (ms == 0 ? " ◉ LIVE" : new Date(ms * 1000).toISOString().substr(11, 8)) + "**", false);
                        return message.channel.send(nowPlaying)
                    }
                    break;
                case "⏭":
                    queue.playing = true;
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    queue.connection.dispatcher.end();
                    const skipembed = new MessageEmbed().setColor("#c219d8").setAuthor(`${user.username} skipped the song.`)
                    queue.textChannel.send(skipembed).then(m => {
                            m.delete({ timeout: 1500 })
                        }).catch(console.error);
                    collector.stop();
                    break;
                case "📑":
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    let lyrics = null;
                    let temEmbed = new MessageEmbed()
                        .setAuthor("Searching...").setFooter("Lyrics")
                        .setColor("#c219d8")
                    let result = await message.channel.send(temEmbed)
                    try {
                        lyrics = await lyricsFinder(queue.songs[0].title, "");
                        if (!lyrics) lyrics = `No lyrics found for ${queue.songs[0].title}.`;
                    } catch (error) {
                        lyrics = `No lyrics found for ${queue.songs[0].title}.`;
                    }

                    let lyricsEmbed = new MessageEmbed()
                        .setTitle("📑 Lyrics")
                        .setDescription(lyrics)
                        .setColor("#c219d8")

                    if (lyricsEmbed.description.length >= 2048)

                        lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
                    message.react("✅");
                    return result.edit(lyricsEmbed).catch(console.error);
                    break;
                case "⏯":
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    if (queue.playing) {
                        queue.playing = !queue.playing;
                        queue.connection.dispatcher.pause(true);
                        const pausemebed = new MessageEmbed().setColor("#c219d8")
                            .setAuthor(`${user.username} paused the music.`)
                        queue.textChannel.send(pausemebed).then(m => {
                            m.delete({ timeout: 1500 })
                        }).catch(console.error);
                    } else {
                        queue.playing = !queue.playing;
                        queue.connection.dispatcher.resume();
                        const playembed = new MessageEmbed().setColor("#c219d8")
                            .setAuthor(`${user.username} resumed the music!`)
                        queue.textChannel.send(playembed).then(m => {
                            m.delete({ timeout: 1500 })
                        }).catch(console.error);
                    }
                    break;
                case "🔄":
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    queue.loop = !queue.loop;
                    const loopembed = new MessageEmbed().setColor("#c219d8")
                        .setAuthor(`Loop is now ${queue.loop ? " enabled" : " disabled"}`)
                    queue.textChannel.send(loopembed).then(m => {
                            m.delete({ timeout: 1500 })
                        }).catch(console.error);
                    break;
                case "⏹":
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    queue.songs = [];
                    const stopembed = new MessageEmbed().setColor("#c219d8").setAuthor(`${user.username} stopped the music!`)
                    queue.textChannel.send(stopembed).then(m => {
                            m.delete({ timeout: 1500 })
                        }).catch(console.error);
                    try {
                        queue.connection.dispatcher.end();
                    } catch (error) {
                        console.error(error);
                        queue.connection.disconnect();
                    }
                    collector.stop();
                    break;

                default:
                    reaction.users.remove(user).catch(console.error);
                    break;
            }
        });

        collector.on("end", () => {
            playingMessage.reactions.removeAll().catch(console.error);
            if (PRUNING && playingMessage && !playingMessage.deleted) {
                playingMessage.delete({ timeout: 3000 }).catch(console.error);
            }
        });
    }
}
}