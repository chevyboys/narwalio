/* eslint-disable space-before-function-paren */
/*eslint no-undef: "error"*/
const Discord = require("discord.js");
let config = require("../config/config.json");
let fs = require("fs");
const { AugurClient } = require("augurbot");
const colors = require('colors');
const cron = require('cron');
let clientObj;

const errorLog = new Discord.WebhookClient(config.devLogs.error.id, config.devLogs.error.token);
let serverSettings = new Map();

const Utils = {
    Collection: Discord.Collection,
    initiateUtilsClient: function (client) {
        if (client instanceof Discord.Client)
            clientObj = client;
        else Utils.log("Invalid Client");
    },
    clean: function (msg, t = 20000) {
        setTimeout((m) => {
            if (m.deletable && !m.deleted) m.delete();
        }, t, msg);
        return Promise.resolve(msg);
    },
    confirm: async function (msg, prompt = "Are you sure?", timeout = 15) {
        try {
            const buttons = ["✅", "⛔"];
            const embed = Utils.embed().setColor(0xff0000)
                .setTitle(`Confirmation Required - Confirm in ${timeout}s`)
                .setAuthor(msg.member ? msg.member.displayName : msg.author.username, msg.author.displayAvatarURL())
                .setDescription(prompt)
                .setFooter(`${buttons[0]} to Confirm, ${buttons[1]} to Deny`);
            const dialog = await msg.channel.send({ embed });
            for (const button of buttons) await dialog.react(button);

            const react = await dialog.awaitReactions((reaction, user) => buttons.includes(reaction.emoji.name) && msg.author.id == user.id, { max: 1, time: timeout * 1000 });
            dialog.delete();
            if (react.size == 1 && react.first().emoji.name == buttons[0]) {
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) { Utils.errorHandler(error, "Confirmation Prompt"); }
    },
    
    embed: (data, color) => new Discord.MessageEmbed(data).setColor(color || config.color).setTimestamp(),
    errorHandler: function (error, msg = null) {
        if (!error) return;

        console.error(Date());

        const embed = Utils.embed().setTitle(error.name);

        if (msg instanceof Discord.Message) {
            let authorName = "unknown";
            if (msg.author && msg.author.username) {
                authorName = msg.author.username;
            }
            console.error(`${authorName} in ${(msg.guild ? `${msg.guild.name} > ${msg.channel.name}` : "DM")}: ${msg.cleanContent}`);
            const client = msg.client;
            msg.channel.send("I've run into an error. I've let my devs know.")
                .then(Utils.clean);
            if (msg.author) {
                let UsrName = msg.author.username || msg.author.nickname || "unknown";
                embed.addField("User", UsrName, true)
            }
            if (msg.client && msg.client.user && msg.client.user) {
                embed.addField("Bot", msg.client.user.username);
            } else if (clientObj) {
                embed.addField("Bot", clientObj.user.username);
            }
            embed.addField("Location", (msg.guild ? `${msg.guild.name} > ${msg.channel.name}` : "DM"), true)
                .addField("Command", msg.cleanContent || "`undefined`", true);
        }
        else if (typeof msg === "string") {
            console.error(msg);
            embed.addField("Message", msg);
        }

        console.trace(error);

        let stack = (error.stack ? error.stack : error.toString())
        if (msg && msg.client && msg.client.config && msg.client.config.token && msg.client.config.devLogs && msg.client.config.devLogs.token) {
            stack = stack.replace(msg.client.config.token, 'TOKEN-THAT-WAS-NEARLY-LEAKED').replace(msg.client.config.devLogs.token, 'WEBHOOK-TOKEN');
        }
        if (stack.length > 1024) stack = stack.slice(0, 1000);

        embed.addField("Error", stack);

        errorLog.send(embed);
    },
    errorLog,
    escape: (text, options = {}) => Discord.escapeMarkdown(text, options),
    escapeText: (txt) => txt.replace(/(\*|_|`|~|\\|\|)/g, '\\$1'),
    getClient: () => { return clientObj },
    getUser: function (msg, user, strict = false) {
        // Finds a user in the same guild as the message.

        // If no user to look for, return message author.
        if (!user || user.length == 0 || !msg.guild) return (msg.guild ? msg.member : msg.author);

        let lcUser = user.toLowerCase();
        let memberCollection = msg.guild.members.cache;

        let myFn = (element) => false;
        // If there's a discriminator given, look for exact match
        if (lcUser.length > 5 && lcUser.charAt(lcUser.length - 5) === "#")
            myFn = (element) => element.user.tag.toLowerCase() === lcUser;
        // Otherwise look for exact match of either nickname or username
        else if (!strict)
            myFn = (element) => (element.displayName.toLowerCase() === lcUser || element.user.username.toLowerCase() === lcUser);

        let foundUser = memberCollection.find(myFn);


        // If still no match, search by ID
        if (!foundUser)
            foundUser = memberCollection.get(user);
        // If no exact match, find a user whose nick or username begins with the query

        if (!foundUser && !strict) {
            myFn = (element) => {
                if (element.length < 3) return false;
                else return (element.displayName.toLowerCase().startsWith(lcUser) || element.user.username.toLowerCase().startsWith(lcUser));
            }
            foundUser = memberCollection.find(myFn);
        }
        //if still no match, return first person mentioned in message
        if (!foundUser && !strict)
            foundUser = msg.membentions.users.first();

        // If still no match, return message author
        if (!foundUser && !strict)
            foundUser = msg.member;

        return foundUser;
    },
    getMessageLink: (msg) => {
        if (msg instanceof Discord.Message) {
            if (msg.channel.type === 'dm') {
                return "";
            }
            return `https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;
        }
    },
    globalDebug: false,
    log: async (msg, color, client) => {
        if (client && !clientObj && client instanceof Discord.Client) clientObj = client;
        let commandName = "";
        let logger = "";
        let embed = Utils.embed()
        let embedColor;
        const [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);
        if (msg instanceof Discord.Message) {
            embedColor = await msg.guild.members.cache.get(msg.client.user.id).displayHexColor;
            commandName = Utils.parse(msg).command;
            embed.setColor(embedColor)
                .setAuthor(msg.member ? msg.member.displayName + " called " + commandName : msg.author.username + " called " + commandName, msg.author.displayAvatarURL())
                .setFooter(`${msg.client.user.username}`);
            logger = msg.cleanContent;
            if (msg && msg.client && msg.client.config && msg.client.config.token && msg.client.config.devLogs && msg.client.config.devLogs.token) {
                logger = logger.replace(msg.client.config.token, 'TOKEN-THAT-WAS-NEARLY-LEAKED').replace(msg.client.config.devLogs.token, 'WEBHOOK-TOKEN');
            }
            embed.setDescription("```" + logger + "```\n") + Utils.getMessageLink(msg);
            logger = `${msg.member ? msg.member.displayName : msg.author.username}` + " called " + commandName + " in:\n" + logger + "\n" + Utils.getMessageLink(msg);
            clientObj = msg.client;
        }
        else {
            logger = (`${hour}:${minute}:${second}: `) + msg;
            if (msg && msg.client && msg.client.config && msg.client.config.token && msg.client.config.devLogs && msg.client.config.devLogs.token) {
                logger = logger.replace(msg.client.config.token, 'TOKEN-THAT-WAS-NEARLY-LEAKED').replace(msg.client.config.devLogs.token, 'WEBHOOK-TOKEN');
            }
            embed.setColor(embedColor)
                .setTitle(commandName)
                .setDescription(logger);
            if (clientObj) {
                let Chan = await clientObj.channels.fetch(config.devLogs.logChannel.id);
                let BotGuildMember = await Chan.guild.members.fetch(clientObj.user.id)
                let username = BotGuildMember.displayName;
                embed.setAuthor(username, clientObj.user.displayAvatarURL())
                    .setFooter(`${clientObj.user.username}`);
            }
        }
        console.log(logger);
        if (clientObj) clientObj.channels.cache.get(config.devLogs.logChannel.id).send({ embed });
        // eslint-disable-next-line no-undef

    },
    parse: (msg, clean = false) => {
        let content = msg.content;
        let setPrefix = msg.client.config.prefix || "!";
        if (msg.author.bot) return null;
        for (let prefix of [setPrefix, `<@${msg.client.user.id}>`, `<@!${msg.client.user.id}>`]) {
            if (!content.startsWith(prefix)) continue;
            let trimmed = content.substr(prefix.length).trim();
            let [command, ...params] = content.substr(prefix.length).split(" ");
            if (command) {
                return {
                    command: command.toLowerCase(),
                    suffix: params.join(" "),
                    params
                };
            }
        }
        return null;
    },
    postCommand: async (msg, disableLog = false) => {
        if (msg) {
            if (msg.author.bot) return;
            await msg.channel.stopTyping();
            if (!disableLog) u.log(msg);
        }
        if(!Utils.globalDebug) clientObj.user.setStatus("idle");
        else clientObj.user.setStatus("dnd");
    },
    preCommand: (msg) => {
        if (msg) {
            if (msg.author.bot) return;
            msg.channel.startTyping();
        }
     clientObj.user.setStatus("online");  
    },
    properCase: (txt) => txt.split(" ").map(word => (word[0].toUpperCase() + word.substr(1).toLowerCase())).join(" "),
    //sets the avatar of the bot
    setAvatar: async function (filename = "default.jpg") {
        const file = './avatars/' + filename;
        client.user.setAvatar(file)
            .then(user => Utils.log(`New avatar set!`))
            .catch(errorHandler(error));
        return true;
    },
    rand: (array) => array[Math.floor(Math.random() * array.length)],
    run: async (msg, command, newSuffix) => {
        //throw errors for invalid cases
        if (!msg.id || !msg.channel) {
            throw "utils/utils.js run() was not able to parse the message object you sent.";
        }
        if (!msg.channel.id) {
            throw "utils/utils.js run() was not able to parse the channel of the message object you sent.";
        }

        let channel = await msg.client.channels.fetch(msg.channel.id);
        if (channel && (channel.type == 'text' || channel.type == 'dm')) {
            let newMsg = await channel.messages.fetch(msg.id);
            //check for the command to exist
            if (!command || !newMsg.client.commands.has(command)) {
                throw "Invalid command. Either no command was specified, or the command is not a valid command of this bot"
            }
            //finish building the new msg.
            if (newSuffix) newMsg.content = `${config.prefix}${command} ${newSuffix}`;
            else {
                newSuffix = "";
                newMsg.content = `${config.prefix}${command}`;
            }
            newMsg.client.commands.execute(command, newMsg, newSuffix);
        }
    },
    updateScheduledEvents: async function (client) {
        const pendingEvents = require('../storage/pendingEvents.json');
        if (pendingEvents[0]) {
            pendingEvents.forEach(event => {
                if (event.hasStarted) return;
                let time = new Date(event.executionTime);
                Utils.log(time.toString().yellow);
                Utils.log(`${event.command} @ ${event.executionTime - time}`.red);
                let eventCronJob = new cron.CronJob(time, () => {

                    let dummyMsg = {
                        id: event.msgID,
                        channel: {
                            id: event.channelID
                        },
                        client: client
                    }
                    Utils.run(dummyMsg, event.command, event.suffix);
                    Utils.log("Got past u.run".green);
                });

                try { eventCronJob.start(); }
                catch (e) {
                    u.log(e);
                }
                Utils.log("cron started.");
                let now = new Date();
                let newPendingEvents = pendingEvents.filter(element => element.executionTime >= now - 1000);
                //file reading and writing
                const data = JSON.stringify(newPendingEvents, null, 4);
                fs.writeFileSync('./storage/pendingEvents.json', data);
            });
        }
    },
    userMentions: (msg, member = false) => {
        // Useful to ensure the bot isn't included in the mention list,
        // such as when the bot mention is the command prefix
        const userMentions = (member ? msg.mentions.members : msg.mentions.users);
        if (userMentions.has(msg.client.user.id)) userMentions.delete(msg.client.user.id);

        // Now, if mentions don't exist, run queries until they fail
        /*if (userMentions.size == 0) {
          guildMembers = msg.guild.members;
          let parse = msg.content.trim().split(" ");
          parse.shift(); // Ditch the command
          do {
            let q = parse.shift(); // Get next potential user/member
            let keepGoing = false;
            try {
              // Query it as a Snowflake first, otherwise search by username
              let mem = (await guildMembers.fetch(q)) || (await guildMembers.fetch({query: q}));
              if (mem instanceof Discord.Collection && mem.size == 1) {
                // Treat a multiple-match search result as a failed search
                mem = mem.first(); // Convert the Collection into a GuildMember
              }
              if (mem instanceof Discord.GuildMember) {
                // Either the Snowflake search worked, or there was exactly one username match
                userMentions.set(mem.id, member ? mem : mem.user);
                keepGoing = true;
              }
            } catch (e) {
              Utils.errorHandler(e, msg);
            }
          } while (keepGoing && parse.length > 0);
        }*/
        return userMentions;
    },
};

module.exports = Utils;