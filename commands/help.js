const { MessageEmbed } = require(`discord.js`);
const db = require('quick.db')
const { PREFIXER } = require('../config/bot.json')
module.exports = {
    name: `help`,
    aliases: ["h", "commands"],
    cooldown: 10,
    async execute(message, args, client) {
        var prefix = await db.fetch(`prefix_${message.guild.id}`);
        if (prefix == null) prefix = PREFIXER;
        let commands = message.client.commands.array();

        let embed = new MessageEmbed()
            .setTitle("**Bot Orders!**")
            .setDescription(`**The New Update Off NEvo Bot 🤩 Make One From [Here]()**`)
            .setFooter(`Type: ${prefix}help <Command>  for more information!`)
            .setColor("#c219d8");

        let ifargstruedothis = -1;

        switch (args[0]) {
            case "loop":
                ifargstruedothis = 0;
                break;
            case "lyrics":
                ifargstruedothis = 1
                break;
            case "nowplaying":
                ifargstruedothis = 2
                break;
            case "pause":
                ifargstruedothis = 3
                break;
            case "play":
                ifargstruedothis = 4
                break;
            case "queue":
                ifargstruedothis = 5
                break;
            case "remove":
                ifargstruedothis = 6
                break;
            case "resume":
                ifargstruedothis = 7
                break;
            case "search":
                ifargstruedothis = 8
                break;
            case "skip":
                ifargstruedothis = 9
                break;
            case "stop":
                ifargstruedothis = 10
                break;
            case "volume":
                ifargstruedothis = 12
                break;
                case "ping":
                ifargstruedothis = 13
                break;
            case "help":
                ifargstruedothis = 14
                break;
            default:
                commands.forEach((cmd) => {
                    embed.addField(`**${prefix}${cmd.name}**`, `\`${cmd.aliases}\``, true)
                })
                if (!message.guild) {
                    if (!args[0]) {
                        message.react("✅");
                    }
                    return;
                }
                message.react("✅");
                message.author.send(embed).then(msg => {
                    message.author.send(new MessageEmbed().setColor("#c219d8")
                    .setTitle("**Admin Orders!**")
                    .addField(prefix + "set-prefix", "`Change Bot Prefix`", true)
                    .addField(prefix + "bot_restart", "`Restart The Bot`", true)
                    .addField(prefix + "bot_stop", "`Stop The Bot`", true))
                }).then(m => {
                    message.channel.send(new MessageEmbed().setDescription('👍 **Done Sended The** `Help Menu` **In Your Dm**\!'))
                })
                break;
        }
        if (ifargstruedothis >= 0) {
            let aliases = commands[ifargstruedothis].aliases;
            if (aliases === undefined || !aliases) aliases = "No Aliases!";
            let cooldown = commands[ifargstruedothis].cooldown;
            if (cooldown === undefined || !cooldown) cooldown = "No Cooldown!";

            embed.addField(`**:notes: Aliases:**`, `\`${aliases}\``, true);
            embed.addField(`**:wrench: Cooldown:**`, `\`${cooldown}\``, true);
            message.channel.send(embed)
        }
    }
}
/**
 * @copyright Go't To NIR0
 */