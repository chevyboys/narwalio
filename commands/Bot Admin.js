/* this category is for commands that are restricted to bot devs, that relate to editing the bot or testing*/ 
const Augur = require("augurbot");
const u = require('../utils/utils');
const Module = new Augur.Module();
const path = require("path");
const config = require('../config/config.json');
const { Message } = require("discord.js");
const fs = require("fs");
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
        if (msg.content.indexOf("sudox") > -1) {
            eval(suffix);
        }
        else {
            async function sender() {
                let foo = await (`\`\`\`Output: ${eval(suffix)}\`\`\``);
                msg.channel.send(foo.replace(msg.client.config.token, 'TOKEN-THAT-WAS-NEARLY-LEAKED').replace(msg.client.config.devLogs.error.token, 'WEBHOOK-TOKEN'));
            }
            sender();
        }
        //u.log(msg);
    } // required
})
    .addCommand({
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

                if (msg.client.shard) {
                    msg.client.shard.broadcastEval("this.destroy().then(() => process.exit())");
                } else {
                    await msg.client.destroy();
                    process.exit();
                }
            } catch (e) { u.errorHandler(e, msg); }
        },
        permissions: (msg) => config.adminId.includes(msg.author.id) || config.ownerId == msg.author.id
    })
    .addCommand({
        name: "playing",
        category: "Bot Admin",
        hidden: true,
        description: "Set playing status",
        syntax: "[game]",
        aliases: ["setgame", "game"],
        process: (msg, suffix) => {
            if (suffix) msg.client.user.setActivity(suffix);
            else msg.client.user.setActivity("");
            msg.react("👌");
        },
        permissions: (msg) => (config.adminId.includes(msg.author.id) || config.ownerId == msg.author.id || msg.channel.id == "708136881916870707")
    })
    .addCommand({
        name: "pull",
        category: "Bot Admin",
        description: "Pull bot updates from git",
        hidden: true,
        process: (msg) => {
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
            try {
                let client = msg.client;

                let embed = u.embed()
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

                    msg.channel.send({ embed: embed });
                } else {
                    let uptime = process.uptime();
                    embed
                        .addField("Uptime", `Discord: ${Math.floor(client.uptime / (24 * 60 * 60 * 1000))} days, ${Math.floor(client.uptime / (60 * 60 * 1000)) % 24} hours, ${Math.floor(client.uptime / (60 * 1000)) % 60} minutes\nProcess: ${Math.floor(uptime / (24 * 60 * 60))} days, ${Math.floor(uptime / (60 * 60)) % 24} hours, ${Math.floor(uptime / (60)) % 60} minutes`, true)
                        .addField("Reach", `${client.guilds.cache.size} Servers\n${client.channels.cache.size} Channels\n${client.users.cache.size} Users`, true)
                        .addField("Commands Used", `${client.commands.commandCount} (${(client.commands.commandCount / (client.uptime / (60 * 1000))).toFixed(2)}/min)`, true)
                        .addField("Memory", `${Math.round(process.memoryUsage().rss / 1024 / 1000)}MB`, true);

                    msg.channel.send({ embed: embed });
                }
            } catch (e) { u.errorHandler(e, msg); }
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
            u.clean(msg);
            let path = require("path");
            let files = (suffix ? suffix.split(" ") : fs.readdirSync(path.resolve(__dirname)).filter(file => file.endsWith(".js")));

            for (const file of files) {
                try {
                    msg.client.moduleHandler.reload(path.resolve(__dirname, file));
                } catch (error) { msg.client.errorHandler(error, msg); }
            }
            msg.react("👌");
        },
        permissions: (msg) => config.adminId.includes(msg.author.id) || config.ownerId == msg.author.id
    });
module.exports = Module;