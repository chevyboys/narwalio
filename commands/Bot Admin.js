/* this category is for commands that are restricted to bot devs, that relate to editing the bot or testing*/
const Augur = require("augurbot");
const u = require('../utils/utils');
const Module = new Augur.Module();
const path = require("path");
const config = require('../config/config.json');
const { Message, MessageEmbed } = require("discord.js");
const fs = require("fs");
const axios = require("axios").default;


async function sendDiscordStatus(msg, embed, verbose) {
    try {
        let discordStatus = await axios.get("https://srhpyqt94yxb.statuspage.io/api/v2/summary.json");
        let incidents = discordStatus.data.incidents;
        discordStatus = discordStatus.data.components;
        for (const component of discordStatus) {
            if (component.status != "operational" || verbose) {
                let emoji;
                switch (component.status) {
                    case "operational":
                        emoji = "🟢"
                        break;
                    case "partial_outage":
                        emoji = "🟡";
                        break;
                    case "major_outage":
                        emoji = "🟠";
                    default:
                        emoji = "🔴";
                        break;
                }
                embed.addField(`${emoji} ${component.name}`, `**Status**: ${component.status}`, true);
            }
        }
        for (const incident of incidents) {
            if (incident.resolved_at == null) {
                embed.addField(`❗__${incident.name}__❗`, `**Status**: ${incident.status}\n**Impact:** ${incident.impact}\n**Last Update:** ${incident.incident_updates[0].updated_at} \n\t${incident.incident_updates[0].body}`);

            }
        }
    } catch (error) {
        embed.addField(`Discord Components:`, `Unavailable`);
        u.log(error);
    }
    msg.channel.send({ embed: embed });
}


Module.addCommand({
    name: "Sudo", // required
    aliases: ["sudox"], // optional
    syntax: "", // optional
    description: "Executes code as the bot", // recommended
    info: "", // recommended
    hidden: true, // optional
    category: "Bot Admin", // optional
    enabled: true, // optional
    permissions: (msg) => config.adminId.includes(msg.author.id) || config.ownerId == msg.author.id, // optional
    process: async (msg, suffix) => {
        u.preCommand(msg);
        if (msg.content.indexOf("sudox") > -1) {
            eval(suffix);
        }
        else {
            async function sender() {
                try {
                    let foo = await eval("(async () => {" + suffix + "})()");
                    foo = `\`\`\`Output: ${foo}\`\`\``
                    msg.channel.send(foo.replace(msg.client.config.token, 'TOKEN-THAT-WAS-NEARLY-LEAKED').replace(msg.client.config.devLogs.error.token, 'WEBHOOK-TOKEN'));
                } catch (error) {
                    const embed = u.embed().setTitle("Sudo error: " + error.name).setColor(msg.guild ? msg.guild.members.cache.get(msg.client.user.id).displayHexColor : "000000");
                    let authorName = "unknown";
                    if (msg.author && msg.author.username) {
                        authorName = msg.author.username;
                    }
                    console.error(`${authorName} in ${(msg.guild ? `${msg.guild.name} > ${msg.channel.name}` : "DM")}: ${msg.cleanContent}`);
                    if (msg.author) {
                        let UsrName = msg.author.username || msg.author.nickname || "unknown";
                        embed.addField("User", UsrName, true)
                    }
                    if (msg.client && msg.client.user && msg.client.user) {
                        embed.addField("Bot", msg.client.user.username);
                    }
                    let cleanContent = msg.cleanContent;
                    if (cleanContent.length > 200)
                    cleanContent = cleanContent.slice(0, 200);
                    embed.addField("Location", (msg.guild ? `${msg.guild.name} > ${msg.channel.name}` : "DM"), true)
                        .addField("Command", cleanContent || "`undefined`", true);
                    console.trace(error);
                    let stack = (error.stack ? error.stack : error.toString())
                    if (msg && msg.client && msg.client.config && msg.client.config.token && msg.client.config.devLogs && msg.client.config.devLogs.token) {
                        stack = stack.replace(msg.client.config.token, 'TOKEN-THAT-WAS-NEARLY-LEAKED').replace(msg.client.config.devLogs.token, 'WEBHOOK-TOKEN');
                    }
                    if (stack.length > 1024) stack = stack.slice(0, 1000);

                    embed.addField("Error", stack);

                    msg.channel.send(embed);
                }
            }
            sender();

        }
        u.postCommand(msg)
    } // required
}).addCommand({
    name: "channels", // required
    hidden: true, // optional
    description: "shows unveiwable channels. !channels <roleid>",
    permissions: (msg) => config.adminId.includes(msg.author.id) || config.ownerId == msg.author.id, // optional
    process: async (msg, suffix) => {
        u.preCommand(msg)
        let construct = await msg.guild.roles.cache.get(suffix)
        msg.guild.channels.cache.map(channel => {
            let perms = construct.permissionsIn(channel).has("VIEW_CHANNEL");
            if (!perms) {
                msg.channel.send(channel.name);
            }
        });
        u.postCommand(msg);
    }
}).addCommand({
    name: "gotobed",
    category: "Bot Admin",
    hidden: true,
    aliases: ["q", "restart"],
    process: async function (msg) {

        try {
            await msg.react("🛏");

            let files = fs.readdirSync(path.resolve(process.cwd(), "./commands")).filter(f => f.endsWith(".js"));

            for (let file of files) {
                Module.client.moduleHandler.unload(path.resolve(process.cwd(), "./commands/", file));
            }
            await u.postCommand(msg, true);
            if (msg.client.shard) {

                msg.client.shard.broadcastEval("this.destroy().then(() => process.exit())");
            } else {
                await msg.client.destroy();
                process.exit();
            }
        } catch (e) { u.errorHandler(e, msg); }
    },
    permissions: (msg) => config.adminId.includes(msg.author.id) || config.ownerId == msg.author.id
}).addCommand({
    name: "message",
    category: "Bot Admin",
    hidden: true,
    description: "message a person",
    syntax: "[@target]\n[messge]",
    aliases: ["msg", "message"],
    process: (msg, suffix) => {
        u.preCommand(msg);
        let messageToSend = suffix.split("\n")[1];
        for (const recepient in msg.mentions.users) {
            if (recepient) {
                // Now we get the member from the user
                const member = message.guild.member(recepient);
                // If the member is in the guild
                if (member) {
                    /**
                     * message the member
                     * Make sure you run this on a member, not a user!
                     * There are big differences between a user and a member
                     */
                    member
                        .send(messageToSend)
                        .then(() => {
                            // We let the message author know we were able to message the person
                            message.reply(`Successfully messaged ${user.tag}`);
                        })
                        .catch(err => {
                            // An error happened
                            // This is generally due to the bot not being able to message the member,
                            // either due to missing permissions or role hierarchy
                            message.reply('I was unable to message the member');
                            // Log the error
                            u.log(err);
                        });
                } else {
                    // The mentioned user isn't in this guild
                    message.reply("That user isn't in this guild!");
                }
                // Otherwise, if no user was mentioned
            } else {
                message.reply("You didn't mention the user to message!");
            }
        }
        msg.react("👌");
        u.postCommand(msg);
    },
    permissions: (msg) => (config.adminId.includes(msg.author.id) || config.ownerId == msg.author.id)
}).addCommand({
        name: "playing",
        category: "Bot Admin",
        hidden: true,
        description: "Set playing status",
        syntax: "[game]",
        aliases: ["setgame", "game"],
        process: (msg, suffix) => {
            u.preCommand(msg);
            if (suffix) msg.client.user.setActivity(suffix);
            else msg.client.user.setActivity("");
            msg.react("👌");
            u.postCommand(msg);
        },
        permissions: (msg) => (config.adminId.includes(msg.author.id) || config.ownerId == msg.author.id || msg.channel.id == "708136881916870707") || msg.member.roles.cache.has("819036592173219841"),
    })
    .addCommand({
        name: "pull",
        category: "Bot Admin",
        description: "Pull bot updates from git",
        hidden: true,
        process: (msg) => {
            u.preCommand(msg);
            let spawn = require("child_process").spawn;

            u.clean(msg);

            let cmd = spawn("git", ["pull", "https://github.com/chevyboys/narwalio.git"], { cwd: process.cwd() });
            let stdout = [];
            let stderr = [];

            cmd.stdout.on("data", data => {
                stdout.push(data);
            });

            cmd.stderr.on("data", data => {
                stderr.push(data);
            });

            cmd.on("close", code => {
                if (code == 0)
                    msg.channel.send(stdout.join("\n") + "\n\nCompleted with code: " + code).then(u.clean);
                else
                    msg.channel.send(`ERROR CODE ${code}:\n${stderr.join("\n")}`).then(u.clean);
            });
            u.postCommand(msg);
        },
        permissions: (msg) => (Module.config.ownerId === (msg.author.id))
    })
    .addCommand({
        name: "pulse",
        category: "Bot Admin",
        hidden: true,
        description: "Check the bot's heartbeat",
        permissions: (msg) => (Module.config.ownerId === (msg.author.id)),
        process: async function (msg, suffix) {
            u.preCommand(msg);
            try {
                let client = msg.client;

                let embed = u.embed()
                .setColor(msg.guild ? msg.guild.members.cache.get(msg.client.user.id).displayHexColor : "000000")
                    .setAuthor(client.user.username + " Heartbeat", client.user.displayAvatarURL())
                    .setTimestamp();

                if (client.shard) {
                    let guilds = await client.shard.fetchClientValues('guilds.cache.size');
                    guilds = guilds.reduce((prev, val) => prev + val, 0);
                    let channels = client.shard.fetchClientValues('channels.cache.size')
                    channels = channels.reduce((prev, val) => prev + val, 0);
                    let mem = client.shard.broadcastEval("Math.round(process.memoryUsage().rss / 1024 / 1000)");
                    mem = mem.reduce((t, c) => t + c);
                    embed
                        .addField("Shards", `Id: ${client.shard.id}\n(${client.shard.count} total)`, true)
                        .addField("Total Bot Reach", `${guilds} Servers\n${channels} Channels`, true)
                        .addField("Shard Uptime", `${Math.floor(client.uptime / (24 * 60 * 60 * 1000))} days, ${Math.floor(client.uptime / (60 * 60 * 1000)) % 24} hours, ${Math.floor(client.uptime / (60 * 1000)) % 60} minutes`, true)
                        .addField("Shard Commands Used", `${client.commands.commandCount} (${(client.commands.commandCount / (client.uptime / (60 * 1000))).toFixed(2)}/min)`, true)
                        .addField("Total Memory", `${mem}MB`, true);
                    sendDiscordStatus(msg, embed, (suffix.indexOf('verbose') > -1));
                } else {
                    let uptime = process.uptime();
                    embed
                        .addField("Uptime", `Discord: ${Math.floor(client.uptime / (24 * 60 * 60 * 1000))} days, ${Math.floor(client.uptime / (60 * 60 * 1000)) % 24} hours, ${Math.floor(client.uptime / (60 * 1000)) % 60} minutes\nProcess: ${Math.floor(uptime / (24 * 60 * 60))} days, ${Math.floor(uptime / (60 * 60)) % 24} hours, ${Math.floor(uptime / (60)) % 60} minutes`, true)
                        .addField("Reach", `${client.guilds.cache.size} Servers\n${client.channels.cache.size} Channels\n${client.users.cache.size} Users`, true)
                        .addField("Commands Used", `${client.commands.commandCount} (${(client.commands.commandCount / (client.uptime / (60 * 1000))).toFixed(2)}/min)`, true)
                        .addField("Memory", `${Math.round(process.memoryUsage().rss / 1024 / 1000)}MB`, false);
                    sendDiscordStatus(msg, embed, (suffix.indexOf('verbose') > -1));
                }
            } catch (e) { u.errorHandler(e, msg); }
            u.postCommand(msg);
        }
    })
    .addCommand({
        name: "reload",
        category: "Bot Admin",
        hidden: true,
        syntax: "[file1.js] [file2.js]",
        description: "Reload command files.",
        info: "Use the command without a suffix to reload all command files.\n\nUse the command with the module name (including the `.js`) to reload a specific file.",
        process: (msg, suffix) => {
            u.preCommand(msg);
            let path = require("path");
            let files = (suffix ? suffix.split(" ") : fs.readdirSync(path.resolve(__dirname)).filter(file => file.endsWith(".js")));

            for (const file of files) {
                try {
                    msg.client.moduleHandler.reload(path.resolve(__dirname, file));
                    console.log(file + " has been reloaded");
                } catch (error) { msg.client.errorHandler(error, msg); }
            }
            msg.react("👌");
            u.postCommand(msg);
        },
        permissions: (msg) => config.adminId.includes(msg.author.id) || config.ownerId == msg.author.id
    });
module.exports = Module;