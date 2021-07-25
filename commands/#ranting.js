const Augur = require("augurbot");
const u = require('../utils/utils');
const Module = new Augur.Module();
const config = require('../config/config.json');
let rantingChannel = "708140469527379978";
let dungeonGuild = "639630243111501834";
const flaggedWords = require('../config/rantingFlaggedWords.json');
let updateConcernScore = async (user, change) => {
    u.log("updating concern score");
    if (!change) return;
    change = change + 0;
    let currentConcern = (await Module.db.user.fetchUser(user)).concernScore;
    await Module.db.user.update(user, { concernScore: (change + currentConcern) });
}

async function normalizeConcern(reductionPercent, msg) {
    let users = (await Module.db.user.getUsers({ concernScore: { $gt: 0 } }));
    if (msg) {
        users = users.filter(u => {
            return (msg.guild.members.cache.has(u.discordId) ? !(msg.guild.members.cache.get(u.discordId).user.bot) : false);
        });
    }
    let concernLog = [];
    let embed = u.embed().setColor("#a1fdff").setTitle("User Concern Levels This hour");
    let channel;
    let EtuID = "854552593509253150";
    let NarwalioID = "637030744610439176"
    if (Module.client.user.id == EtuID) channel = await Module.client.channels.cache.get("868684629857669130");
    else channel = await Module.client.channels.cache.get("868685481204940800");
    let i = 0;
    for (user of users) {
        embed.addField((channel.guild.members.cache.has(user.discordId) ? (channel.guild.members.cache.get(user.discordId).displayName || Module.client.users.cache.get(user.discordId).username) : Module.client.users.cache.get(user.discordId).username), `Total: \`${user.concernScore}\``);
        if (i == 20) {
            try {
                channel.send({ embed });

            } catch (e) {
                u.log("Concern Error:" + e.toString());
                return;
            }
            embed = u.embed().setColor("#a1fdff").setTitle("User Concern Levels This hour (Cont.)");
            i = 0;
        }
        i++;
        if (reductionPercent > 0) updateConcernScore(user, 0 - (user.concernScore < 1 ? user.concernScore : user.concernScore * (reductionPercent || 5) / 100));
    }
    try {
        channel.send({ embed });

    } catch (e) {
        u.log("Concern Error:" + e.toString());
        return;
    }
}

Module
    .addCommand({
        name: "concern", // required, must be one word, all lower case
        description: "[add/subtract/set/summary] [@target]\n - add/subtract (+/-): adds or removes concern levels\n - set (=): overrides the current concern level\n - summary (all):sends a summary of all current concern levels to the admins of the primary servers", // recommended
        permissions: (msg) => config.adminId.includes(msg.author.id), // optional, command will onnly run if this evaluate to true
        process: async (msg, suffix) => {
            u.preCommand(msg)
            //Your code here
            let target = msg.mentions.members.first() || msg.member || (() => {
                return;
            })

            let args = [].concat(suffix.replace(/<+.*>\s*/gm, "").trim().split(" "));


            let change;
            switch (args[0].toLowerCase().trim()) {
                //subtract from the current value
                case "-":
                case "subtract":
                case "lower":
                case "reduce":
                    if (!args[1]) {
                        return msg.channel.send("You need to tell me how much you want to change someone's concern score by");
                    }
                    change = parseInt(args[1].trim());
                    await updateConcernScore(target, (0 - change));
                    msg.react(`➖`);
                    break;
                //add to the current value
                case "+":
                case "add":
                case "raise":
                case "increase":
                    if (!args[1]) {
                        return msg.channel.send("You need to tell me how much you want to change someone's concern score by");
                    }
                    change = parseInt(args[1].trim());
                    await updateConcernScore(target, change);
                    msg.react(`➕`);
                    break;
                case "summary":
                case "all": normalizeConcern(0, msg);
                    break;
                //set to a specific number 
                case "=":
                case "set":
                case "reset":
                    if (!args[1]) {
                        return msg.channel.send("You need to tell me how much you want to change someone's concern score by");
                    }
                    change = parseInt(args[1].trim());
                    await Module.db.user.update(target.user, { concernScore: change });
                default:
                    targetConcernLevel = [].concat(await Module.db.user.getUsers({ discordId: target.user.id }));
                    targetConcernLevel = targetConcernLevel[0].concernScore;
                    msg.channel.send("Current Concern Score for " + target.displayName + " is: `" + targetConcernLevel + "`");
                    break;
            }
            //end your code
            u.postCommand(msg);
        }, // required
    })
    //lets the bot get concerned about people
    .addEvent("message", async (msg) => {
        if (msg.author.bot) {
            return;
        }
        //Weights
        const weights = {
            severeWords: (msg.channel.id == rantingChannel) ? 3 : 2,
            moderateWords: (msg.channel.id == rantingChannel) ? 1.5 : 1,
            minorWords: (msg.channel.id == rantingChannel) ? 0.75 : 0.5,
            rantingMessageLength: 0.1
        }
        //increase concern for ranting
        let args = msg.content.trim().toLowerCase().split(" ");

        function getConcernPoints(searchString, flaggedWordsArray, weight) {
            return weight * (searchString.split(' ').map(messageWord => (flaggedWordsArray.filter(flaggedWord => (messageWord.startsWith(flaggedWord))).length)).reduce((messageWord, flaggedWord) => messageWord + flaggedWord, 0));
        };
        let total =
            getConcernPoints(msg.content, flaggedWords.severeWords, weights.severeWords)
            + getConcernPoints(msg.content, flaggedWords.moderateWords, weights.moderateWords)
            + getConcernPoints(msg.content, flaggedWords.minorWords, weights.minorWords);
        + ((msg.channel.id == rantingChannel) ? (args.length * weights.rantingMessageLength) : 0);
        if (total > 0) {
            await updateConcernScore(msg.author, total);
            console.log(`Concern for ${msg.member.displayname} increased by: ${total}`);
        }
    }
    );


Module.setClockwork(() => {
    try {
        return setInterval(normalizeConcern, 60 * 60 * 1000);
    } catch (e) { u.errorHandler(e, "Normalize Concern Clockwork Error"); }
});
module.exports = Module;