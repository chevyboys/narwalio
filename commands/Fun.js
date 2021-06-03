const Augur = require("augurbot");
const u = require('../utils/utils');
const Module = new Augur.Module();

async function nicksOffice(msg) {
    let nicksOffice = "796794621812146176";
    let nicksOfficeRole = msg.guild.roles.cache.get("796590326529261588");

    msg.mentions.members.forEach(member => {
        if (!member.roles.cache.has(nicksOfficeRole)) {
            member.roles.add(nicksOfficeRole);
            try {
                member.previousRoles = member.roles.cache.map(role => {
                    member.roles.remove(role.id);
                    return role.id;
                });
            } catch (error) {

            }
            //msg.channel.send(member.previousRoles.join());
        }
    });
}
async function nicksOfficeRestore(msg) {
    let nicksOfficeRole = msg.guild.roles.cache.get("796590326529261588");
    if (msg.mentions) msg.mentions.members.forEach(member => {
        try {
            member.previousRoles.forEach(element => {
                member.roles.add(element);
            });
        } catch (error) {

        }
        member.previousRoles = null;
        member.roles.remove(nicksOfficeRole);
    });
}

Module
    .addCommand({
        name: "avatar", // required
        aliases: ["icon"], // optional
        syntax: "", // optional
        description: "shows the avatar of a user or users. Make sure to tag them.", // recommended
        info: "", // recommended
        hidden: false, // optional
        category: "Fun", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg) => {

            if (!msg.mentions.users.size) {
                return msg.channel.send(`${msg.author.displayAvatarURL({ format: "png", dynamic: true })}`);
            }
            const avatarList = msg.mentions.users.map(user => {
                return `${user.displayAvatarURL({ format: "png", dynamic: true })}`;
            });
            // send the entire array of strings as a message
            // by default, discord.js will `.join()` the array with `\n`
            msg.channel.send(avatarList);
            u.log(msg);
        }, // required
    }).addCommand({
        name: "banhammer", // required
        aliases: [], // optional
        syntax: "<person>", // optional
        description: '"Bans" a person', // recomgmended
        info: "", // recommended
        hidden: false, // optional
        category: "Fun", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg) => {
            if (!msg.mentions.users.size) {
                return;
            } else {
                msg.channel.send('https://tenor.com/view/blob-banned-ban-hammer-blob-ban-emoji-gif-16021044')
                const avatarList = msg.mentions.users.map(user => {
                    if (user.id == msg.client.config.ownerId) {
                        user = msg.author;
                    }
                    msg.channel.send(`${user} Has been banned for their crimes`);
                });
            }
            u.log(msg);
        } // required
    }).addCommand({
        name: "creeper", // required
        aliases: ["rick", "boom"], // optional
        syntax: "", // optional
        description: "Summons a creeper video", // recommended
        info: "", // recommended
        hidden: false, // optional
        category: "Fun", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg) => {
            let holyMessage = `https://cdn.discordapp.com/attachments/776908726480797726/780302118329385030/video0.mp4`;
            msg.channel.send(holyMessage);
            u.log(msg);
        } // required
    }).addCommand({
        name: "petrify", // required
        aliases: ["medusa", "freeze"], // optional
        syntax: "", // optional
        description: "A personal command. Petrifies people.", // recommended
        info: "", // recommended
        hidden: true, // optional   
        category: "Fun", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg, suffix) => {
            function randomNumber(min, max) {
                let high = Math.max(max, min);
                let low = Math.min(max, min);
                return Math.floor(Math.random() * (high - low + 1)) + low;
            }
            msg.channel.send("https://tenor.com/view/die-medusa-petrify-decapitate-hero-gif-16229035");
            switch (randomNumber(1, 20)) {
                case 1: msg.channel.send(`${msg.author} hath been petrified`);
                    break;
                case 20: msg.channel.send(`@everyone hath been petrified`);
                    break;
                default:
                    if (!msg.mentions.users.size) {
                        msg.channel.send(`${suffix || 'the ferrets'} hath been petrified`);
                    } else {
                        const avatarList = msg.mentions.users.map(user => {
                            if (user.id == msg.client.config.ownerId) {
                                msg.channel.send(`${msg.author} hath been petrified`);
                            }
                            else msg.channel.send(`${user} hath been petrified`);
                        });
                    }
            }
            u.log(msg);
        } // required
    })
    .addCommand({
        name: "holyhandgrenade", // required
        aliases: ["holy", "grenade"], // optional
        syntax: "<person>", // optional
        description: "Lobs a hand grenade at someone", // recommended
        info: "", // recommended
        hidden: false, // optional
        category: "Fun", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg) => {
            let { suffix } = u.parse(msg);
            if (!msg.mentions.users.size && suffix.length == 0) {
                let holyMessage = `**Book of Armaments, 2:9-21:** \n "And Saint Attila raised the hand grenade up on high, saying: \n> *'O Lord, bless this thy hand grenade, that with it thou mayst blow thine enemies to tiny bits, in thy mercy.'*\n And the Lord did grin. \nAnd the people did feast upon the lambs, and sloths, and carp, and anchovies, and orangutans, and breakfast cereals, and fruit bats, and large chulapas. \n\n\tAnd the Lord spake, saying, \n> *"First shalt thou take out the Holy Pin.* \n> *Then shalt thou count to **three**, no more, no less.* \n> ***Three** shall be the number thou shalt count,* \n> *and the number of the counting shall be **three**.* \n> *Four shalt thou not count,* \n> *neither count thou two, (excepting that thou then proceed to three).* \n> ***Five is right out.*** \n> \n> *Once the number **three**, (being the third number) be reached,*\n> *then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in My sight, shall snuff it.'*`;
                msg.channel.send(holyMessage);
            } else {
                msg.channel.send('https://tenor.com/view/monty-python-holy-hand-grenade-antioch-gif-13499233');
                if (!msg.mentions.users.size && suffix.length > 0) {
                    msg.channel.send(`${suffix} hath snuffed it`);
                }
                else {
                    const avatarList = msg.mentions.users.map(user => {
                        if (user.id == msg.client.config.ownerId) {
                            msg.channel.send(`${msg.author} hath snuffed it`);
                        }
                        else msg.channel.send(`${user} hath snuffed it`);
                    });
                }
                u.log(msg);
            } // required
        },
    }).addCommand({
        name: "<@487085787326840843>", // required
        aliases: ["noNotAgain", "dmno"], // optional
        syntax: "", // optional
        description: "please, No", // recommended
        info: "", // recommended
        hidden: true, // optional
        category: "Fun", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg, suffix) => {
            let amount = !!parseInt(suffix.split(' ')[1]) ? parseInt(suffix.split(' ')[1]) : parseInt(suffix.split(' ')[2]) || 0;
            function randomNumber(min, max) {
                let high = Math.max(max, min);
                let low = Math.min(max, min);
                return Math.floor(Math.random() * (high - low + 1)) + low;
            }

            //Roll a D20. on a 20 get a squirell. On a 1, elmo burns. anything else you get heinz
            function hollyMessage(override) {
                switch (override || randomNumber(1, 20)) {
                    case 1: return `It's not his fault, #blameLizzie`;
                    case 20: return `**<@487085787326840843> YES!**`;
                    default: return `https://media.discordapp.net/attachments/663558345130770442/767422186960584774/Not_Another_Ben.jpg?width=622&height=593`;
                }
            }
            if (amount > 0 && amount < 21)
                msg.channel.send(hollyMessage(amount));
            else msg.channel.send(hollyMessage());
            u.log(amount);
            u.log(msg);
        } // required
    }).addCommand({
        name: "roll", // required
        aliases: ["r"], // optional
        syntax: " [number of dice (default 1)]d[number of sides]", // optional
        description: "Rolls a dice", // recommended
        info: "", // recommended
        hidden: false, // optional
        category: "Fun", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg, suffix, overrideDice, overrideFaces) => {
            if (!suffix || suffix.toLowerCase().indexOf("d") == -1) {
                return false;
            }
            let end = suffix.length - 1;
            if (suffix.indexOf(" ") > -1) end = suffix.indexOf(" ");
            let firstWord = suffix.substr(0,).toLowerCase().split("d");
            let numberOfDice = overrideDice || firstWord[0].replace(/\D/g, '') || 1;
            firstWord[0] = numberOfDice;
            let numberOfFaces = overrideFaces || firstWord[1].replace(/\D/g, '') || 20;
            let result = 0;
            let rolls = [];
            for (let index = 0; index < numberOfDice; index++) {
                rolls[index] = Math.floor(Math.random() * numberOfFaces) + 1;
                result = result + parseInt(rolls[index]);
            }
            let response;
            if (numberOfDice > 1) {
                response = `${result} (${rolls.join(", ")})`;
            }
            else {
                response = `${result}`;
            }
            msg.channel.send(response);
            u.log(msg);
            return result;
        } // required
    }).addCommand({
        name: "say",
        syntax: "<stuff>",
        aliases: [], // optional
        category: "Fun",
        hidden: true,
        process: (msg, suffix) => {
            if (msg.deletable && (suffix.indexOf("-x") > -1) && (msg.client.config.adminId.includes(msg.author.id) || msg.client.config.ownerId == msg.author.id)) msg.delete();
            msg.channel.send(suffix.replace("-x", ""));
        },
        permissions: (msg) => true,
    }).addCommand({
        name: "stealthatmeme", // required
        aliases: ["steal", "mymeme", "mymemenow"], // optional
        syntax: "", // optional
        description: "Steals someone's meme", // recommended
        info: "", // recommended
        hidden: false, // optional
        category: "Fun", // optional
        enabled: true, // optional
        permissions: (msg) => true, // optional
        process: (msg) => {
            let holyMessage = 'https://media.discordapp.net/attachments/265754164729085952/583353970324406298/image0.jpg?width=803&height=593';
            msg.channel.send(holyMessage);
            u.log(msg);
        } // required
    }).addCommand({
        name: "timeout", // required
        aliases: ["gototimeout"], // optional
        syntax: "", // optional
        description: "sends a user to time out", // recommended
        info: "", // recommended
        hidden: false, // optional
        category: "Fun", // optional
        enabled: true, // optional
        permissions: (msg) => (msg.channel.permissionsFor(msg.member).has(["MANAGE_MESSAGES", "MANAGE_CHANNELS"])) && msg.guild.id == "639630243111501834", // optional
        process: (msg, suffix) => {
            let amount = !!parseInt(suffix.split(' ')[1]) ? parseInt(suffix.split(' ')[1]) : parseInt(suffix.split(' ')[2]) || 5;
            if (!msg.mentions.users.size) {
                return msg.channel.send(`You need to tell me who you would like to send to time out`);
            }
            const timeOutList = msg.mentions.users.map(user => {
                if (!msg.guild.member(user).voice.channel) return;
                let channel = msg.guild.member(user).voice.channel;
                msg.guild.member(user).voice.setChannel("794413149558276147");
                setTimeout((m) => {
                    msg.guild.member(user).voice.setChannel(channel);
                }, amount * 1000, msg);
            });
            // send the entire array of strings as a message
            // by default, discord.js will `.join()` the array with `\n`
            u.log(msg);
        }, // required
    }).addCommand({
        name: "nicksoffice", // required
        aliases: ["office", "mutehammer", "laogai"], // optional
        syntax: "", // optional
        description: "sends a user to nick's office", // recommended
        info: "", // recommended
        hidden: true, // optional
        category: "Fun", // optional
        enabled: true, // optional
        permissions: (msg) => (msg.channel.permissionsFor(msg.member).has(["MANAGE_MESSAGES", "MANAGE_CHANNELS"])) && msg.guild.id == "639630243111501834", // optional
        process: async (msg, suffix) => {
            msg.channel.startTyping();
            let amount = !!parseInt(suffix.split(' ')[1]) ? parseInt(suffix.split(' ')[1]) : parseInt(suffix.split(' ')[2]) || 10;
            if (!msg.mentions.users.size) {
                return msg.channel.send(`You need to tell me who you would like to send to Nick's office`);
            }
            await nicksOffice(msg);
            setTimeout((m) => {
                nicksOfficeRestore(msg);
            }, amount * 1000, msg);
            msg.channel.stopTyping();
            // send the entire array of strings as a message
            // by default, discord.js will `.join()` the array with 
            u.log(msg);
        }, // required
    }).addEvent("message", (msg) => {
        //if ((msg.client.config.adminId.includes(msg.author.id) || msg.client.config.ownerId == msg.author.id || msg.author.id == "150065841776492544") && msg.guild.id == "639630243111501834") {
        if (msg.content.toLowerCase().indexOf("invite") > 0 && msg.content.toLowerCase().indexOf("you to") > 0 && msg.content.toLowerCase().indexOf(nicksOffice(msg)) > 0) {
            nicksOffice(msg);
            msg.channel.send("https://media1.tenor.com/images/eb75921cb2fc88489cbc58c7e3de3883/tenor.gif?itemid=18401680");
        }
        // }
    }).addCommand({
        name: "thereisnowar", // required
        aliases: ["basingse", "ba", "nowar"], // optional
        syntax: "", // optional
        description: "restores a user from nick's office", // recommended
        info: "", // recommended
        hidden: true, // optional
        category: "Fun", // optional
        enabled: true, // optional
        permissions: (msg) => (msg.channel.permissionsFor(msg.member).has(["MANAGE_MESSAGES", "MANAGE_CHANNELS"])) && msg.guild.id == "639630243111501834", // optional
        process: (msg, suffix) => {
            nicksOfficeRestore(msg);
            u.log(msg);
        }, // required
    }).addEvent("message", (msg) => {
        if (msg.author.bot) { return }
        var ran = Math.random();
        var oddsThatNothingHappens = 0.9;
        if (ran < oddsThatNothingHappens && !(msg.author.id == "548618555676033039")) { return }
        let im;
        let content = ` `+ msg.content.toLowerCase();
        content = content.replace(" i am ", " im ").replace(" i'm ", " im ")
        if (content.indexOf(" im ") > -1) {
            im = content.indexOf(" im ");
            subStrLeng = content.length - im;
            if (subStrLeng > 30) subStrLeng = 30;
            let dadJokeName = content.substr(im + 3, subStrLeng);
            dadJokeName = dadJokeName.charAt(1).toUpperCase() + dadJokeName.substr(2, dadJokeName.length);
            if(msg.author.id == "548618555676033039") {
                dadJokeName = `▲${dadJokeName}▲`;
            }
            try {
                u.log("got here");
                msg.member.setNickname(dadJokeName, "For the memes");
            } catch (error) {
                u.log(error);
            }
        }
    });
module.exports = Module;