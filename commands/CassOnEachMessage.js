const Augur = require("augurbot");
const u = require('../utils/utils');
const Module = new Augur.Module();
const ckConfig = require("../config/cassConfig.json")
const Discord = require("discord.js");
const cassKingdom = "819031079104151573";

function oddsThingsHappen(percentage) {
    let ran = Math.random();
    if (ran < percentage / 100) return true
    else return false
}

let DadJoke = {
    possibleMatches: [],
    calculateIAmLocation: async (str) => {
        str = " " + str.toLowerCase().replace("-", " ").replace("_", " ");
    
        //If possible matches is empty, we need to calculate the possible matches. Should only be run on the first usage of the class.
        if (DadJoke.possibleMatches.length < 1) {
            //set up variables
            const selfPronouns = "i, my name".toLowerCase().replace(" ", "").split(",");
            selfPronouns.forEach((pronoun) => pronoun = pronoun.replace(",", ""));
    
            const beVerbs = [" be", " am", " is", " being", "'m"]
    
            //handle special patterns
            const specialMatches = "am, im, call me".toLowerCase().replace(" ", "").split(",");
            specialMatches.forEach((match) => {
                match = ` ${match.replace(",", "").trim()} `;
                DadJoke.possibleMatches.push(match);
            });
            //create possbile matches
            for (const verb of beVerbs) {
                for (const pronoun of selfPronouns) {
                    let matchable = ` ${pronoun}${verb} `;
                    await DadJoke.possibleMatches.push(matchable);
                }
            }
        }
    
        //find all the matches
        for (const possibleMatch of DadJoke.possibleMatches) {
            if (str.indexOf(possibleMatch) > -1) {
                return str.indexOf(possibleMatch) + possibleMatch.length - 1;
            }
        }
        return -1;
    
    },
    revert: async (member) => {
        u.postCommand()
        if (!member.previousNick) return;
        await member.setNickname(member.previousNick, "Restoring order");
        member.previousNick = null;
    },
    initiate: async (msg) => {
        const birbCursedRole = "867524884350238780",
            oddsOfGettingDadJoked = 5,
            secondsOfNameChange = 600;
    
        //make sure we should actually dadjoke this person
        if (
            (!oddsThingsHappen(oddsOfGettingDadJoked) && (msg.member ? !(msg.member.roles.cache.find(r => r.id == birbCursedRole)) : false))
            || msg.author.bot
            || !msg.member.manageable
            || msg.member.roles.cache.find(r => r.name == "🛡")
        ) { return }
        u.preCommand();
        let imLocation = await DadJoke.calculateIAmLocation(msg.content);
        if (imLocation < 0) return;
    
        //calculate new dad joke name
        let dadJokeName = msg.content.slice(imLocation).trim();
        dadJokeName = dadJokeName.charAt(0).toUpperCase() + dadJokeName.substr(1, dadJokeName.length);
        let maxLength = 31;
        if (msg.member.roles.cache.find(r => r.id == birbCursedRole)) {
            maxLength = maxLength - 2;
    
        }
        let postFix = "";
        if (msg.member.roles.cache.has("819031079298138187")) {
            postFix = ` | Admin`;
        } else if (msg.member.roles.cache.has("819035372390449193")) {
            postFix = ` | Mod`;
        } else if (msg.member.roles.cache.has("849748022786129961")) {
            postFix = ` | Team`;
        }
        if (postFix != "") {
            maxLength = maxLength - postFix.length;
        }
        if (dadJokeName.length > 32) {
            dadJokeName = dadJokeName.slice(0, 32)
        }
        while (dadJokeName.length > maxLength) {
            if (dadJokeName.lastIndexOf(" ") < 0) {
                dadJokeName = dadJokeName.slice(0, maxLength);
            }
            else dadJokeName = dadJokeName.slice(0, dadJokeName.lastIndexOf(" ")).trim()
        }
        if (msg.member.roles.cache.find(r => r.id == birbCursedRole)) {
            dadJokeName = `▲${dadJokeName}▲`;
        }
        dadJokeName = dadJokeName + postFix;
        try {
            if (!msg.member.previousNick) {
                msg.member.previousNick = msg.member.displayName;
    
                setTimeout(async () => {
                    await DadJoke.revert(msg.member);
                }, secondsOfNameChange * 1000);
            }
            msg.member.setNickname(dadJokeName, "For the memes");
            u.log("Hi " + dadJokeName + " I'm Dad!");
            u.clean(msg.channel.send("Hi \"" + dadJokeName + "\" I'm Dad!"));
    
        } catch (error) {
            u.log(error);
        }
    
    }
}

let BirbJoke = {
    CursedRole: "867524884350238780",
    revert: async (member) => {
        u.postCommand();
        let revertedName = await member.displayName.replace(/▲/gm, "")
        await member.setNickname(revertedName);
        await member.roles.remove(BirbJoke.CursedRole);
    },
    initiate: async (msg) => {
            oddsOfGettingBirbJoked = 1,
            secondsOfbeforeRevert = 600;
        if(!msg.guild.id == "819031079104151573");
        let isBirbCursed = (msg.member ? (msg.member.roles.cache.find(r => r.id == BirbJoke.CursedRole)) : false)
        //make sure we should actually birbcurse this person
        if (
            (!oddsThingsHappen(oddsOfGettingBirbJoked) || isBirbCursed)
            || msg.author.bot
            || !msg.member.manageable
            || await msg.member.roles.cache.find(r => r.name == "🛡")
        ) { return }
        u.preCommand();
        let postFix = "";
        if (msg.member.roles.cache.has("819031079298138187")) {
            postFix = ` | Admin`;
        } else if (msg.member.roles.cache.has("819035372390449193")) {
            postFix = ` | Mod`;
        } else if (msg.member.roles.cache.has("849748022786129961")) {
            postFix = ` | Team`;
        }
        let newName = await msg.member.displayName.replace(postFix, "").replace(/▲/gm, "")
        newName = `▲${(newName.length + postFix.length + 2 > 30) ? (newName.slice(0, 30 - (postFix.length + 2))) : newName}▲` + postFix
    
        await msg.member.setNickname(newName);
        msg.channel.send(`${msg.member.displayName} has been birbcursed!`);
        await msg.member.roles.add(BirbJoke.CursedRole);
        setTimeout(async () => {
            BirbJoke.revert(msg.member);
        }, secondsOfbeforeRevert * 1000)
    },
}
 
async function coolkids(msg) {
    const coolKidsRole = "839887610306625616",
        oddsOfCoolKids = 0.01;
    //make sure we should actually coolkids this person
    if (
        (!oddsThingsHappen(oddsOfCoolKids) || (msg.member ? (msg.member.roles.cache.find(r => r.id == coolKidsRole)) : false))
        || msg.author.bot
        || !msg.member.manageable
        || msg.member.roles.cache.find(r => r.name == "🛡")
    ) { return }
    msg.channel.send(`${msg.member.displayName} is so cool, I'm making it official. Here is the certified cool kid role!`);
    msg.member.roles.add(coolKidsRole);
}

let eyeToggle = false
async function eyeSpeakToYou(msg) {
    if (Module.config.adminId.includes(msg.author.id) && msg.content.indexOf("!eye") > -1) {
        eyeToggle = !eyeToggle;
        u.clean(msg, 0);
        return;
    }
    if (!Module.config.adminId.includes(msg.author.id) || !eyeToggle) {
        return;
    }
    const eyeWebhook = new Discord.WebhookClient(ckConfig.webhooks.theEye.id, ckConfig.webhooks.theEye.token);
    u.clean(msg, 0);
    eyeWebhook.send(msg.content);
}

Module.addEvent("message", (msg) => {
    DadJoke.initiate(msg);
    BirbJoke.initiate(msg);
    coolkids(msg);
    eyeSpeakToYou(msg);
}).setUnload(async () => {
    try {
        const guild = await Module.client.guilds.fetch(cassKingdom);
    const members = await guild.members.cache;
    for (member of members) {
        if (!member.manageable) return;
        if (member.roles.cache.has(BirbJoke.CursedRole)) await BirbJoke.revert(member);
        await DadJoke.revert(member);
    }
    } catch (error) {
        if(error.toString().toLowerCase().indexOf("missing access") < 0) {
            throw error;
        }
    }
    
});

module.exports = Module;