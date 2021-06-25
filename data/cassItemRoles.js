const { Collection, BaseManager } = require("discord.js");
const u = require("../utils/utils"),
inventory = require("../utils/roleColors");

class Item {
    roleID;
    name;
    emoji;
    description;
    consumable;
    process;
    passive;


    constructor(options) {
        this.roleID = options.roleID;
        this.name = options.name;
        this.emoji = options.emoji;
        this.description = options.description;
        this.consumable = options.consumable || true;
        this.process = options.process;
        if (options.passive) {
            this.passive = true;
        } else this.passive = false;

    }

    async use(msg, member) {
        if (this.consumable) {
            await member.roles.remove(this.roleID);
        }
        if (this.passive) {
            u.clean(msg.reply("This is a passive ability"));
        } else this.process(msg, member);
    }

}
//meta functions
async function silence(msg) {
    let silenceRole;
    if (msg.guild.id == "819031079104151573") {
        silenceRole = msg.guild.roles.cache.get("819031079268122634");
    } else if (msg.guild.id == "639630243111501834") {
        silenceRole = msg.guild.roles.cache.get("753462049723646013");
    }
    let member = msg.mentions.members.first();
    if ((member.permissions.has("MANAGE_GUILD") || member.permissions.has("ADMINISTRATOR") || msg.client.config.adminId.includes(member.id) || member.roles.cache.has("857772273389666324"))) {
        msg.channel.send("You try to mute <@" + member.id + "> but their powers are too great. The hammer rebounds and you find yourself muted.")
        if (member.roles.cache.has(Shield.roleID)) Shield.process(msg, member);
        member = msg.member;
    }
    if (!member.roles.cache.has(silenceRole)) {
        member.roles.add(silenceRole);
    } else {
        msg.channel.send("That person is already muted.");
    }
    return member;
}
async function silenceRestore(msg) {
    let silenceRole;
    if (msg.guild.id == "819031079104151573") {
        silenceRole = msg.guild.roles.cache.get("819031079268122634");
    } else if (msg.guild.id == "639630243111501834") {
        silenceRole = msg.guild.roles.cache.get("753462049723646013");
    }
    if (msg.mentions) msg.mentions.members.forEach(member => {
        member.roles.remove(silenceRole);
    });
}

async function nicksOffice(msg) {
    let nicksOfficeRole;
    if (msg.guild.id == "819031079104151573") {
        nicksOfficeRole = msg.guild.roles.cache.get("819031079298138184");
    } else if (msg.guild.id == "639630243111501834") {
        nicksOfficeRole = msg.guild.roles.cache.get("796590326529261588");
    }
    let i = 0;
    msg.mentions.members.forEach(member => {
        if (i > 0) return;
        if (!member.roles.cache.has(nicksOfficeRole)) {
            member.roles.add(nicksOfficeRole);
            if (!((msg.member.permissions.has("MANAGE_GUILD") || msg.member.permissions.has("ADMINISTRATOR") || msg.client.config.adminId.includes(msgmember.id)))) i++;
            try {
                member.previousRoles = member.roles.cache.map(role => {
                    if (role.id != "833852680581152828" && role.id != "819031079104151573");
                    {
                        try {
                            member.roles.remove(role.id);
                            return role.id;
                        } catch (error) {
                            u.log("could not remove: " + role.id);
                        }
                    }

                });
            } catch (error) {
                u.log(error);
            }
        }
    });
}
async function nicksOfficeRestore(msg) {
    let nicksOfficeRole;
    if (msg.guild.id == "819031079104151573") {
        nicksOfficeRole = msg.guild.roles.cache.get("819031079298138184");
    } else if (msg.guild.id == "639630243111501834") {
        nicksOfficeRole = msg.guild.roles.cache.get("796590326529261588");
    }
    if (msg.mentions) msg.mentions.members.forEach(member => {
        try {
            member.previousRoles.forEach(element => {
                member.roles.add(element);
            });
        } catch (error) {
            u.log(error);
        }
        member.previousRoles = null;
        member.roles.remove(nicksOfficeRole);
    });
}

async function paintball(msg, suffix) {
    try {
        //get the role they want to spray
        let target;
        if (msg.mentions.users.size) {
            target = await msg.guild.members.fetch(msg.mentions.users.first().id);
            suffix = suffix.replace(/<+.*>\s*/gm, "");
        }
        else target = await msg.guild.members.fetch(msg.author.id);
        let availableRoles = [].concat(...(inventory.filter((v, k) => msg.member.roles.cache.has(k)).array()));
        target.currentColors = target.roles.color;
        let toAdd;
        if (msg.mentions.roles.size > 0) {
          toAdd = msg.mentions.roles.first()
        } else toAdd = await msg.guild.roles.cache.find(element => ((`${suffix.toLowerCase().replace("colors", "")} colors`.trim()).indexOf(element.name.toLowerCase()) > -1 && availableRoles.indexOf(element.id) > 0));
        if (!toAdd) {
            u.clean(msg);
            msg.reply("sorry, that's not a role on the server. Check `!inventory` to see what you can spray.").then(u.clean);
        } else if (availableRoles.indexOf(toAdd.id) < 0) {
            u.clean(msg);
            msg.reply("sorry, that role isn't equippable in your inventory. Check `!inventory` to see what you can spray.").then(u.clean);
        } else {
            // The role exists, the member has it, and it's equippable
            await target.roles.remove([].concat(...(inventory.filter((v, k) => target.roles.cache.has(k)).array())));
            await target.roles.add(toAdd);
        }
    } catch (e) { u.errorHandler(e, msg); }
}
async function paintballRestore(msg, suffix) {
    let target;
        target = await msg.guild.members.fetch(msg.mentions.users.first().id);
        suffix = suffix.replace(/<+.*>\s*/gm, "");
    if (target.roles.cache.some(r => {
        r.id == target.currentColors.id
    })) {
        return; //target already has this color role
    }
    else {
        await target.roles.remove([].concat(...(inventory.filter((v, k) => msg.member.roles.cache.has(k)).array())));
        await target.roles.add(target.currentColors.id);
    }

}
//items
let MuteHammer = new Item({
    roleID: "857369407922372668",
    name: "Mute Hammer",
    emoji: "🔇",
    description: "Allows the user to mute one person for 60 seconds",
    consumable: true,
    process: async (msg) => {
        let amount = 60
        if (!msg.mentions.users.size) {
            return msg.channel.send(`You need to tell me who you would like silence`);
        }
        msg.react(MuteHammer.emoji);
        let target = await silence(msg);
        setTimeout((m) => {
            silenceRestore(msg, target);
        }, amount * 1000, msg);
    }
})

let BanishHammer = new Item({
    roleID: "857766969197461504",
    name: "Banish Hammer",
    emoji: "🔨",
    description: "Allows the user to banish one person for 30 seconds",
    consumable: true,
    process: async (msg) => {
        let amount = 30
        if (!msg.mentions.users.size) {
            return msg.channel.send(`You need to tell me who you would like banish`);
        }
        if ((msg.mentions.members.first().permissions.has("MANAGE_GUILD") || msg.mentions.members.first().permissions.has("ADMINISTRATOR") || msg.client.config.adminId.includes(msg.mentions.members.first().id))) {
            msg.channel.send("You try to banish <@" + member.id + "> but their powers are too great. The hammer fails to banish them")
            member = msg.member;
        }
        if (msg.mentions.members.first().roles.cache.has("857772273389666324")) {
            msg.channel.send("You try to banish <@" + msg.mentions.members.first().id + "> but they are shielded. The hammer fails to banish them");
            Shield.process(msg, msg.mentions.members.first());
            return;
        }
        msg.react(BanishHammer.emoji);
        nicksOffice(msg);
        setTimeout((m) => {
            nicksOfficeRestore(msg);
        }, amount * 1000, msg);
    }
})

let Shield = new Item({
    roleID: "857772273389666324",
    name: "Shield",
    emoji: "🛡",
    description: "Sheilds the user from another item use. 20% chance of breaking",
    consumable: () => {
        var ran = Math.random();
        var oddsThatNothingHappens = 0.80;
        if (ran < oddsThatNothingHappens) { return false }
        else {
            return true;
        }
    },
    passive: true,
    process: async (msg, target) => {
        if (Shield.consumable()) {
            await target.roles.remove(Shield.roleID);
        }
    }
})

let Paintball = new Item({
    roleID: "857767406121910292",
    name: "Paintball",
    emoji: "🖌",
    description: "Lets you temporarily force one of your own colors on someone else",
    consumable: true,
    process: async (msg) => {
        let {suffix} = u.parse(msg);
        let amount = 600
        if (!msg.mentions.users.size) {
            return msg.channel.send(`You need to tell me who you would like paint`);
        }
        if ((msg.mentions.members.first().permissions.has("MANAGE_GUILD") || msg.mentions.members.first().permissions.has("ADMINISTRATOR") || msg.client.config.adminId.includes(msg.mentions.members.first().id))) {
            msg.channel.send("You try to hit <@" + member.id + "> with a paintball but they easily dodge.")
            member = msg.member;
        }
        if (msg.mentions.members.first().roles.cache.has("857772273389666324")) {
            msg.channel.send("You try to hit <@" + msg.mentions.members.first().id + "> with a paintball but they are shielded.");
            Shield.process(msg, msg.mentions.members.first());
            return;
        }
        msg.react(Paintball.emoji);
        paintball(msg, suffix.replace(/<+.*>\s*/gm, "").replace(/:+.*:\s*/gm, "").trim());
        setTimeout((m) => {
            paintballRestore(msg, suffix.replace(/<+.*>\s*/gm, "").replace(/:+.*:\s*/gm, "").trim());
        }, amount * 1000, msg);
    }
})

const items = [BanishHammer, MuteHammer, Shield, Paintball];

module.exports = items;