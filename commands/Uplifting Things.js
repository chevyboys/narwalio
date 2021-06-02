const Discord = require('discord.js');
const Augur = require("augurbot");
const u = require("../utils/utils");
const fetch = require("node-fetch");
const colors = require('colors');
const lastGoodMorningSent = new Discord.Collection();


function loadCuties(msg, suffix, subreddit, limit) {
    let returner;
    let random = Math.floor(Math.random() * 3);
    if (subreddit) {
        fetch(`https://www.reddit.com/r/${subreddit}.json?limit=${limit || 300}&?sort=top&t=day`)
            .then(res => res.json())
            .then(json => json.data.children.map(v => v.data).filter((u => u.url.endsWith('.jpg') || u.url.endsWith('.gif') || u.url.endsWith('.png') || u.url.endsWith('.jpg') || u.url.endsWith('.jpeg') || u.url.endsWith('.webp') || u.url.endsWith('.tiff') || u.url.endsWith('.bmp'))))
            .then(urls => returner = postRandomCutie(urls, msg));
    }
    else if (random == 1 || suffix.indexOf("smile") > -1) {
        fetch(`https://www.reddit.com/r/wholesomememes.json?limit==${limit || 300}&?sort=top&t=month`)
            .then(res => res.json())
            .then(json => json.data.children.map(v => v.data).filter((u => u.url.endsWith('.jpg') || u.url.endsWith('.gif') || u.url.endsWith('.png') || u.url.endsWith('.jpg') || u.url.endsWith('.jpeg') || u.url.endsWith('.webp') || u.url.endsWith('.tiff') || u.url.endsWith('.bmp'))))
            .then(urls => returner = postRandomCutie(urls, msg));
    }
    else if (random >= 2) {
        fetch('https://www.reddit.com/r/aww.json?limit=100&?sort=top&t=week')
            .then(res => res.json())
            .then(json => json.data.children.map(v => v.data).filter((u => u.url.endsWith('.jpg') || u.url.endsWith('.gif') || u.url.endsWith('.png') || u.url.endsWith('.jpg') || u.url.endsWith('.jpeg') || u.url.endsWith('.webp') || u.url.endsWith('.tiff') || u.url.endsWith('.bmp'))))
            .then(urls => returner = postRandomCutie(urls, msg));
    }
    else {
        fetch('https://www.reddit.com/r/Eyebleach.json?limit=100&?sort=top&t=week')
            .then(res => res.json())
            .then(json => json.data.children.map(v => v.data).filter((u => u.url.endsWith('.jpg') || u.url.endsWith('.gif') || u.url.endsWith('.png') || u.url.endsWith('.jpg') || u.url.endsWith('.jpeg') || u.url.endsWith('.webp') || u.url.endsWith('.tiff') || u.url.endsWith('.bmp'))))
            .then(urls => returner = postRandomCutie(urls, msg));
    }
    return returner;
}

async function postRandomCutie(urls, msg, timeout) {
    let randomURL;
    do {
        randomURL = urls[Math.floor(Math.random() * urls.length) + 1];
        if (randomURL && randomURL.title.indexOf("date") > -1) {
            console.log(`randomURL.title ${randomURL.title} was blocked`.red);
            randomURL = urls[Math.floor(Math.random() * urls.length) + 1];
        }
        if (randomURL.title.length > 255) randomURL.title = randomURL.title.substring(0, 255);
    } while (!randomURL || randomURL == undefined);
    const embed = u.embed().setImage(randomURL.url).setTitle("From Reddit: " + randomURL.title).setURL(`https://reddit.com${randomURL.permalink}`).setFooter(`${randomURL.num_comments} comments, ${randomURL.ups} upvotes, posted by ${randomURL.author}`).setTimestamp((randomURL.created - 7 * 60 * 60) * 1000);

    try {
        const buttons = ["✅", "❌"];
        const dialog = await msg.channel.send({ embed });
        for (const button of buttons) await dialog.react(button);

        const react = await dialog.awaitReactions((reaction, user) => buttons.includes(reaction.emoji.name), { max: 1, time: (timeout || 30) * 1000 });

        if (react.size == 1 && react.last().emoji.name == buttons[1]) {
            dialog.delete();
        }
        else {
            dialog.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
            return true;
        }
    }
    catch (error) { Utils.errorHandler(error, "Reddit Embed"); }
    return embed;
}
const Module = new Augur.Module()
    .addCommand({
        name: "aww",
        description: "sends adorableness",
        category: "Uplifting Things",
        syntax: "",
        aliases: ["awww", "awwww", "awwwww", "adorable"],
        process: async (msg, suffix) => {
            msg.channel.startTyping();
            let returner;
            returner = loadCuties(msg, suffix);
            u.log(msg);
            msg.channel.stopTyping();
            return returner;
        },
    }).addCommand({
        name: "smiles",
        description: "sends funny wholesomeness",
        syntax: "",
        category: "Uplifting Things",
        aliases: ["giggles", "puns", "cheerup", "grins"],
        process: async (msg) => {
            suffix = 'smile'
            let returner;
            msg.channel.startTyping()
            returner = await loadCuties(msg, suffix)
            await msg.channel.stopTyping();
            u.log(msg);
            return returner;
        },
    }).addCommand({
        name: "smoles",
        description: "sends smol animal",
        syntax: "",
        category: "Uplifting Things",
        aliases: ["kitty", "kitten", "pupper", "puppy", "smols", "smol"],
        process: async (msg) => {
            suffix = 'smile'
            msg.channel.startTyping();
            let returner;
            let subreddit;
            let random = Math.floor(Math.random() * 3);
            switch (random) {
                case 1:
                    subreddit = "IllegallySmolDogs";
                    break;
                case 2:
                    subreddit = "IllegallySmolCats";
                    break;
                default:
                    subreddit = "IllegallySmol";
                    break;
            }
            returner = loadCuties(msg, suffix, subreddit);
            u.log(msg);
            msg.channel.stopTyping();
            return returner;
        },
    }).addCommand({
        name: "toebeans",
        description: "sends kitten beans. Kay's custom command",
        syntax: "",
        category: "Uplifting Things",
        aliases: ["kay", "kayanna", "beans", "toes", "bean", "toe", "toebean", "kittytoe", "kittytoes"],
        process: async (msg) => {
            msg.channel.startTyping();
            let returner;
            let subreddit = "toebeans";
            u.log(msg);
            returner = loadCuties(msg, suffix, subreddit, 20);
            msg.channel.stopTyping();
            return returner;
        }
    }).addEvent("presenceUpdate", async (oldPresence, newPresence) => {
        
        if (!newPresence.member.roles.cache.has('796965135054143488') && !newPresence.member.roles.cache.some(role => role.name === `Narwalio's Favorite`)) { return };
        const now = new Date();
        const [hour, minute, second] = new Date().toLocaleTimeString("en-US", { hour: 'numeric', hour12: false }).split(/:| /);
        const day = now.getDay();
        //if (oldPresence) console.log(`${lastGoodMorningSent.get(newPresence.member.user.id)}/${day}:${hour}:${minute}:${second}\nIs admin? ${Module.config.adminId.includes(newPresence.member.user.id)}\nPresence:${(oldPresence.status)}->${newPresence.status}`.green)
        //else console.log(`${lastGoodMorningSent.get(newPresence.member.user.id)}/${day}:${hour}:${minute}:${second}\nIs ${newPresence.member.nickname} admin? ${Module.config.adminId.includes(newPresence.member.user.id)}\nPresence: ??? ->${newPresence.status}`.green)
        if (
            ((hour > 3 && hour < 11) || Module.config.adminId.includes(newPresence.member.user.id)) &&
            (!oldPresence || !(oldPresence.status == "online" || oldPresence.status == "idle"))
            && (newPresence.status == "online" || newPresence.status == "idle")
            && (!lastGoodMorningSent.has(newPresence.member.user.id) || lastGoodMorningSent.get(newPresence.member.user.id) != day)) {
            newPresence.member.user.send(`Good Morning ${newPresence.member.nickname}!`);
            let chn;
            if (!newPresence.member.user.DMChannel) {
                chn = await newPresence.member.user.createDM();
            } else {
                chn = newPresence.member.user.DMChannel;
            }
            let fakeMsg = {
                channel: chn,
                author: newPresence.member.user,
            };
            let subreddit;
            let random = Math.floor(Math.random() * 3);
            switch (random) {
                case 1:
                    subreddit = "IllegallySmolDogs";
                    break;
                case 2:
                    subreddit = "IllegallySmolCats";
                    break;
                default:
                    subreddit = "IllegallySmol";
                    break;
            }
            loadCuties(fakeMsg, " ", subreddit, 100)
            lastGoodMorningSent.set(newPresence.member.user.id, day);
        }
        /*if (newPresence.status == "online") { console.log(`Presence: ${newPresence.guild.name}: ${newPresence.member.nickname || newPresence.user.name} is now ${newPresence.status}`.green); }
        else if (newPresence.status == "offline") { console.log(`Presence: ${newPresence.guild.name}: ${newPresence.member.nickname || newPresence.user.name} is now ${newPresence.status}`.gray); }
        else if (newPresence.status == "dnd") { console.log(`Presence: ${newPresence.guild.name}: ${newPresence.member.nickname || newPresence.user.name} is now ${newPresence.status}`.red); }
        else if (newPresence.status == "idle") { console.log(`Presence: ${newPresence.guild.name}: ${newPresence.member.nickname || newPresence.user.name} is now ${newPresence.status}`.yellow); }
*/

    });
module.exports = Module;