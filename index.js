const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('All Copyrights Gos To: NIR0')
});
app.listen(3000, () => {
    console.log('UMusic Bot (NEvo Version!)');
});

const Discord = require(`discord.js`);
const { Client, Collection, MessageEmbed, MessageAttachment } = require(`discord.js`);
const { readdirSync } = require(`fs`);
const { join } = require(`path`);
const db = require('quick.db');
const { TOKEN, PREFIXER, CHANNEL } = require(`./config/bot.json`);
const client = new Client({ disableMentions: ``, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(TOKEN);
const pre = PREFIXER



client.on('message', async message => {
    var prefix = await db.fetch(`prefix_${message.guild.id}`);
    if (prefix == null) prefix = pre;
    if (!message.guild || message.author.bot) return;
    var prefix = await db.fetch(`prefix_${message.guild.id}`);
    if (prefix == null) prefix = pre;
    var args = message.content.toLowerCase().split(' ');
    var cmd = args[0];
    var prefix = await db.fetch(`prefix_${message.guild.id}`);
    if (prefix == null) prefix = pre;
    if (cmd === `${prefix}set-prefix`) {
        if (!message.member.hasPermission('ADMINISTRATOR')) return;
        if (!args[1]) {
            return message.channel.send("Type The New Prefix!")
        }
        await db.set(`prefix_${message.guild.id}`, `${args[1]}`);
        let embed = new Discord.MessageEmbed().setColor('00e8ff')
            .setAuthor(`${message.author.tag}`, `${message.author.avatarURL()}`)
            .setColor('00e8ff')
            .setDescription(`**The new prefix is : ${args[1]}**`);
        message.channel.send(embed);
    }
}).on('message', async message => {
    var prefix = await db.fetch(`prefix_${message.guild.id}`);
    if (prefix == null) prefix = pre;
    if (message.content.startsWith(prefix + "bot_restart")) {
        if (!message.member.hasPermission('ADMINISTRATOR')) return;
        let RestartEmbed = new Discord.MessageEmbed().setColor('#c219d8')
            .setColor(`#c219d8`)
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(`**👍 The Bot Is Restarting...**`)
            .setFooter(client.user.username)
        message.channel.send(RestartEmbed)
        client.destroy()
        client.login(TOKEN)
            .then(console.log(`The Bot Restarted !!
            By : ${message.author.username} | ID : ${message.author.id}`))
        var res = new Discord.MessageEmbed().setColor('#c219d8')
            .setColor('#c219d8')
            .setTitle(`**Done Restarted The Bot**`)
        message.channel.send(res)

    }
}).on('message', async message => {
    var prefix = await db.fetch(`prefix_${message.guild.id}`);
    if (prefix == null) prefix = pre;
    if (message.author.bot || message.channel.type === "dm") return;
    let args = message.content.split(" ");
    let author = message.author.id;
    if (args[0].toLowerCase() === `${prefix}bot_stop`) {
        if (!message.member.hasPermission('ADMINISTRATOR')) return;
        message.channel.send(new Discord.MessageEmbed().setColor('00e8ff').setColor('BLUE').setDescription(`👍 **Bot Is Closeing...**`)).then(m => {
            setTimeout(() => {
                process.exit();
            }, 3000)
        })
    }
}).on('message', async (message) => {
    var prefix = await db.fetch(`prefix_${message.guild.id}`);
    if (prefix == null) prefix = pre;
    if (message.content === prefix + "ping" || message.conetnt === prefix + "pn") {
        var msg = `${Date.now() - message.createdTimestamp}`
        var api = `${Math.round(client.ws.ping)}`
        var ping = new Discord.MessageEmbed()
            .setColor("#B00EFC")
            .addField(`**Ping**:`, `${msg}`, true)
            .addField(`**Discord API**:`, `${api}`, true)
        message.channel.send(ping)

        db.set(`${name}_${message.author.id}`, Date.now())
    }
})
client.commands = new Collection();
client.prefix = PREFIXER;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
client.on(`ready`, async () => {
    client.user.setActivity(`${PREFIXER}help | ${client.guilds.cache.size} Server`, {
        type: "STREAMING",
        url: "https://www.twitch.tv/NAAR_Stadio"
    });
    setInterval(() => {
        let member;
        client.guilds.cache.forEach(async guild => {
            await delay(15);
            member = await client.guilds.cache.get(guild.id).members.cache.get(client.user.id)
            if (!member.voice.channel)
                return;
            if (!member.speaking && !client.queue) { return member.voice.channel.leave(); }
            if (member.voice.channel.members.size === 1) { return member.voice.channel.leave(); }
        });

    }, (5000));
    console.log(client.user.tag)
});
client.on(`warn`, (info) => console.log(info));
client.on(`error`, console.error);
commandFiles = readdirSync(join(__dirname, `commands`)).filter((file) => file.endsWith(`.js`));
for (const file of commandFiles) {
    const command = require(join(__dirname, `commands`, `${file}`));
    client.commands.set(command.name, command);
}

setInterval(() => {
    const channel = client.channels.cache.get(CHANNEL);
    if (!channel) return;
    channel.join().catch(e => {
        console.error(e);
    });
}, 3000);

client.on(`message`, async (message) => {
    var prefix = await db.fetch(`prefix_${message.guild.id}`);
    if (prefix == null) prefix = pre;
    if (message.author.bot) return;
    if (message.content.includes(client.user.id)) {
        message.reply(new Discord.MessageEmbed().setColor("#00ebaa").setAuthor(`My Prefix is ${prefix}`));
    }
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command =
        client.commands.get(commandName) ||
        client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 1) * 1000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(
                new MessageEmbed().setColor("#30ff91")
                    .setTitle("❌ Please wait `" + timeLeft.toFixed(1) +" seconds` before reusing the `" + prefix + command.name + "`!")
            );
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    try {
        command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply(`There was an error executing that command.`).catch(console.error);
    }


});
function delay(delayInms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, delayInms);
    });
} 
