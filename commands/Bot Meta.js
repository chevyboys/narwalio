/* This category is for commands useable by everyone that give information about the bot or specifically aid in the bots ability to be run on the server.
*/ 
const Augur = require("augurbot");
const chars = require("../utils/emojiCharacters");
const config = require('../config/config.json');
const fs = require('fs');
moment = require("moment");

const Module = new Augur.Module()
    .addCommand({
        name: "feedback",
        description: "sends feedback to the bot makers",
        syntax: "[feedback]",
        category: "Bot Meta", // optional
        process: async (msg, suffix) => {
            if (suffix.length) {
                const data = [];
                data.push(`\`\`\`diff\n- FEEDBACK: ${msg.author.username} says:`);
                data.push(suffix);
                data.push(`\`\`\``);
                msg.client.channels.cache.get(msg.client.config.devLogs.feedbackChannel.id).send(data.join(" "), { split: true })
                    .then(() => {
                        msg.react('👍');
                    })
                    .catch(error => {
                        u.errorHandler(`I wasn't able to do that.`, error);
                    });
                /**/
            }
        }
    }).addCommand({
        name: "help",
        description: "Get a list of available commands or more indepth info about a single command.",
        syntax: "[command name] -b (-b to broadcast in the current channel, optional)",
        category: "Bot Meta", // optional
        aliases: ["commands"],
        process: async (msg, suffix) => {
            msg.react("👌");
            u.clean(msg);   
            let broadcast = false;

            let prefix = Module.config.prefix;
            let commands = Module.client.commands.filter(c => c.permissions(msg) && c.enabled);
            if (suffix.toLowerCase().indexOf("-b") || suffix.toLowerCase().indexOf("-broadcast")) {
                await suffix.replace("-b", "");
                await suffix.replace("-broadcast", "");
                broadcast = true;
            }
            let embed = u.embed()
                .setThumbnail(msg.client.user.displayAvatarURL({ size: 128 }));

            if (!suffix || suffix == "-b" || suffix == "-broadcast") { // FULL HELP
                embed
                    .setTitle(msg.client.user.username + " Commands" + (msg.guild ? ` in ${msg.guild.name}.` : "."))
                    .setDescription(`You have access to the following commands. For more info, type \`${prefix}help <command>\`.`);
                let categories;
                if (Module.config.adminId.includes(msg.author.id)) {
                    categories = commands
                        .filter(c => c.category != "General")
                        .map(c => c.category)
                        .reduce((a, c, i, all) => ((all.indexOf(c) == i) ? a.concat(c) : a), [])
                        .sort();
                }
                else {
                    categories = commands
                        .filter(c => !c.hidden && c.category != "General")
                        .map(c => c.category)
                        .reduce((a, c, i, all) => ((all.indexOf(c) == i) ? a.concat(c) : a), [])
                        .sort();
                }

                categories.unshift("General");

                let i = 1;
                for (let category of categories) {
                    if ((category == "Bot Admin" && msg.client.config.adminId.includes(msg.author.id)) || category != "Bot Admin" && category != "General" && category != "Server Admin" || (category == "Server Admin" && msg.channel.permissionsFor(msg.member).has(["MANAGE_MESSAGES", "MANAGE_CHANNELS"]))) {
                        embed.addField(`🔲🔲🔲◾${category}◾🔲🔲🔲`, `᲼`);
                    }
                    for (let [name, command] of commands.filter(c => c.category == category && (!c.hidden || msg.client.config.adminId.includes(msg.author.id))).sort((a, b) => a.name.localeCompare(b.name))) {
                        embed.addField(prefix + command.name + " " + command.syntax, (command.description ? command.description : "Description"));
                        if (i == 20) {
                            try {
                                if(!broadcast) await msg.author.send({ embed });
                                else await msg.channel.send({ embed });
                            } catch (e) {
                                msg.channel.send("I couldn't send you a DM. Make sure that `Allow direct messages from server members` is enabled under the privacy settings, and that I'm not blocked.").then(u.clean);
                                return;
                            }
                            embed = u.embed().setTitle(msg.client.user.username + " Commands" + (msg.guild ? ` in ${msg.guild.name}.` : ".") + " (Cont.)")
                                .setDescription(`You have access to the following commands. For more info, type \`${prefix}help <command>\`.`);
                            i = 0;
                        }
                        i++;
                    }
                    if ((category == "Bot Admin" && msg.client.config.adminId.includes(msg.author.id)) || category != "Bot Admin" && category != "General") {
                        embed.addField(`᲼`, `᲼`);
                    }
                }
                try {
                    if(!broadcast) await msg.author.send({ embed });
                    else await msg.channel.send({ embed });
                } catch (e) {
                    msg.channel.send("I couldn't send you a DM. Make sure that `Allow direct messages from server members` is enabled under the privacy settings, and that I'm not blocked.").then(u.clean);
                    return;
                }
            } else { // SINGLE COMMAND HELP
                let command = null;
                if (commands.has(suffix)) command = commands.get(suffix);
                else if (Module.client.commands.aliases.has(suffix)) command = Module.client.commands.aliases.get(suffix);
                if (command) {
                    embed
                        .setTitle(prefix + command.name + " help")
                        .setDescription(command.info)
                        .addField("Category", command.category)
                        .addField("Usage", prefix + command.name + " " + command.syntax);

                    if (command.aliases.length > 0) embed.addField("Aliases", command.aliases.map(a => `!${a}`).join(", "));
                    try {
                        if(!broadcast) await msg.author.send({ embed });
                        else await msg.channel.send({ embed });
                    } catch (e) {
                        msg.channel.send("I couldn't send you a DM. Make sure that `Allow direct messages from server members` is enabled under the privacy settings, and that I'm not blocked.").then(u.clean);
                        return;
                    }
                } else {
                    msg.reply("I don't have a command by the name of \"" + suffix + "\".").then(u.clean);
                }
            }
        }
    }).addCommand({
        name: "git", // required
        aliases: ["github", "code", "repo"], // optional
        syntax: "", // optional
        description: "creates a link to my github repository", // recommended
        info: "", // recommended
        hidden: false, // optional
        category: "Bot Meta", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg) => {
            let holyMessage = `https://github.com/chevyboys/narwalio/`;
            msg.channel.send(holyMessage);
            u.log(msg);
        } // required
    }).addCommand({
        name: "iamyourdev", // required
        description: "Makes someone a narwalio developer", // recommended
        info: "", // recommended
        hidden: true, // optional
        category: "Bot Meta", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg) => {
            let holyMessage = `I guess ${msg.author} is my dev now.`;
            msg.channel.send(holyMessage);
            u.clean(msg, 0);
            msg.author.send(`Here is the link to my super secret dev server\n ${msg.client.config.devServerInvite} Don't share this command with others. Let them find it in the github themselves`)
            u.log(msg);
        } // required
    }).addCommand({
        name: "invite", // required
        description: "Generates the invite link for narwalio, so you can invite him to a server", // recommended
        info: "", // recommended
        hidden: false, // optional
        category: "Bot Meta", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg) => {
            let holyMessage = `https://discord.com/oauth2/authorize?client_id=637030744610439176&permissions=8&scope=bot`;
            msg.channel.send(holyMessage);
            u.log(msg);
        } // required
    }).addCommand({
        name: "ping", // required
        aliases: ["beep", "ding", "yeet"], // optional
        syntax: "", // optional
        description: "Checks to see if the bot is online, and what the current response time is.", // recommended
        info: "", // recommended
        hidden: false, // optional
        category: "Bot Meta", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg, suffix) => {
            let pong;
            let { command } = u.parse(msg);
            if (command.toLowerCase() == "beep") {
                pong = "Boop";
            }
            else if (command.toLowerCase() == "yeet") {
                pong = "Yoink";
            }
            else pong = u.properCase(command.replace(/ing/gi, "ong"));
            msg.channel.send(`${command}ing...`).then(sent => {
                sent.edit(`${pong}! Took ${sent.createdTimestamp - (msg.editedTimestamp ? msg.editedTimestamp : msg.createdTimestamp)}ms`);
            });
            u.log(msg);
        } // required
    })/**/.addInteraction({
        id: "839655445911044139",
        process: async (interaction) => {
            let time = Date.now();
            interaction._call(`/interactions/${interaction.id}/${interaction.token}/callback`, {type: 1}, "post");
            interaction.channel.send(`pinging...`).then(m => {
              m.edit(`pong! Took ${m.createdTimestamp - time}ms`);
            });
        },
        category: "Bot Meta",
        description: "Checks to see if the bot is online, and what the current response time is.",
        enabled: true,
        hidden: false,
        info: "",
        name: "ping",
        options: {},
        permissions: async (interaction) => {return true},
        syntax: ""
      }) /**/
      .addCommand({
        name: "schedule", // required
        description: "runs a command at a specified time", // recommended
        info: "", // recommended
        hidden: true, // optional
        category: "Bot Meta", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: async (msg, suffix) => {
            //u.log(msg);
            let newSuffix = suffix.substring(suffix.indexOf('{') + 1, (suffix.indexOf('}') || suffix.length - 1)) || "This is a test string";
            const args = newSuffix.trim().split(/ +/);
            const commandName = args.shift().toLowerCase().replace(globalThis.regex, "");
            newSuffix = args.join(" ");
            let execTimeString = suffix.substring(0, suffix.indexOf('{'));
            ///-----------------------------------------------------

            let inExp = /in (\d+) (minute|hour|day|week|month|year)s? (.*)$/i;
            let dateExp = /(\d{1,2} \w{3} \d{4} \d{2}:\d{2} \w+) (.*)$/i;
            let match, reminder, timestamp;
            if (match = inExp.exec(execTimeString)) {
                // "in duration" format
                timestamp = await moment().add(parseInt(match[1], 10), match[2].toLowerCase()).valueOf();
                reminder = match[3];
            } else if (match = dateExp.exec(execTimeString)) {
                timestamp = await moment(match[1]).valueOf();
                reminder = match[2];
            }
            const pendingEvents = require('../storage/pendingEvents.json');
            var now = new Date();
            var oneYearFromNow = now;
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            if (timestamp && timestamp < oneYearFromNow) {
                /**/   let NewEvent = {
                    "command": await commandName,
                    "suffix": await newSuffix,
                    "executionTime": timestamp,
                    "msgID": await msg.id,
                    "channelID": await msg.channel.id,
                };
                pendingEvents.push(NewEvent);/**/
                //await pendingEvents.push(msg);


                msg.react("👌");
            } else {
                msg.reply("you need to use one of the following formats:\n> DD MM YYYY HH:MM PST/MDT/EST/Etc Your Reminder Text\n> in N hours/days/weeks/months Your Reminder Text");
            }
            //Json garbage collection, prevents old events from sticking around after they should have been executed.
            let newPendingEvents = pendingEvents//.filter(element => element.executionTime >= now - 1);
            //file reading and writing
            const data = await JSON.stringify(newPendingEvents, null, 4);
            u.log(data.toString());
            await fs.writeFileSync('./storage/pendingEvents.json', data);
            ///------------------------------------------------------
            u.updateScheduledEvents(msg.client);
            u.log(msg);
        } // required
    });

module.exports = Module;