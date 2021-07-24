const u = require("../utils/utils"),
inventory = require("../utils/roleColors");
let {ItemUtils, Item } = require("../utils/ItemUtils");
const Augur = require("augurbot");
//items
let MuteHammer = new Item({
    roleID: "857369407922372668",
    name: "mute-hammer",
    emoji: "🔇",
    description: "Allows the user to mute one person for 60 seconds",
    consumable: true,
    requiresTarget: true,
    process: async (msg, {empowered, targetMember}) => {
        let mutedRole = "819031079268122634";
        let muteTime = empowered ? 300 : 15;
        //prevent adding the role or removing if the user has it already
        if (targetMember.roles.cache.has(mutedRole)) {
            return msg.channel.send(`${targetMember.displayName} has already been muted`);
        }
        targetMember.roles.add(mutedRole);
        setTimeout(() => {
            targetMember.roles.remove(mutedRole);
        }, muteTime * 1000);
    }
});

let BanishHammer = new Item({
    roleID: "857766969197461504",
    name: "banish-hammer",
    emoji: "🔨",
    description: "Allows the user to banish one person for 30 seconds",
    consumable: true,
    requiresTarget: true,
    process: async (msg, {empowered, targetMember}) => {
        let banishedRole = "819031079298138184";
        let banishTime = empowered ? 150 : 30;
        //prevent adding the role or removing if the user has it already
        if (targetMember.roles.cache.has(banishedRole)) {
            return msg.channel.send(`${targetMember.displayName} has already been banished`);
        }
            try {
                let managedRoles = [];
                let banishedNewRoles = [];
                banishedNewRoles.push(banishedRole)
                targetMember.unbanishedRoles = targetMember.roles.cache.map(role => { 
                            if(role.managed){
                                managedRoles.push(role.id)
                                banishedNewRoles.push(role.id)
                            }
                            return role.id;
                });
                await targetMember.roles.set(banishedNewRoles)
            } catch (error) {
                throw error;
            }
        setTimeout(async () => {
            await targetMember.roles.set(targetMember.unbanishedRoles);
            member.unbanishedRoles = null;
        }, banishTime * 1000);
    }
});

let Shield = new Item({
    roleID: "857772273389666324",
    name: "Shield",
    emoji: "🛡️",
    description: "Sheilds the user from another item use. 20% chance of breaking",
    consumable: () => {
        var ran = Math.random();
        var oddsThatNothingHappens = 0.80;
        if (ran < oddsThatNothingHappens) { return false }
        else {
            return true;
        }
    },
    //no process needed, passive item. By not including a proccess, this item will be assumed to be passive
});

let Paintball = new Item({
    roleID: "857767406121910292",
    name: "Paintball",
    emoji: "🖌",
    description: "Lets you temporarily force one of your own colors on someone else",
    consumable: true,
    requiresTarget: true,
    requiresTargetRole: true,
    process: async (msg, {empowered, targetMember, targetRole}) => {
        let timeout = empowered ? 1200 : 15;
        let availableRoles = [].concat(...(inventory.filter((v, k) => msg.member.roles.cache.has(k)).array()));
        let toAdd = msg.guild.roles.cache.find(r => r.name.toLowerCase() == `${targetRole.name.toLowerCase().replace(" colors", "")} colors`);
        if (!targetMember.currentColors) targetMember.currentColors = targetMember.roles.color;
        if (!toAdd) {
            u.clean(msg);
            msg.reply("sorry," + toAdd + " is not a role on the server. Check `!inventory` to see what you can spray.").then(u.clean);
        } else if (availableRoles.indexOf(toAdd.id) < 0) {
            u.clean(msg);
            msg.reply("sorry, " + toAdd + " isn't in your inventory. Check `!inventory` to see what you can spray.").then(u.clean);
        } else {
            // The role exists, the member has it, and it's equippable
            await targetMember.roles.remove([].concat(...(inventory.filter((v, k) => targetMember.roles.cache.has(k)).array())));
            await targetMember.roles.add(toAdd);
            setTimeout(async () => {    
                await targetMember.roles.remove([].concat(...(inventory.filter((v, k) => targetMember.roles.cache.has(k)).array())));
                if(targetMember.currentColors) await targetMember.roles.add(targetMember.currentColors.id);
            }, timeout * 1000);
        }
    }
});

let Shatter = new Item({
    roleID: "858057300399620136",
    name: "Shatter",
    emoji: "☄",
    description: "Lets you destroy a random item from someone else",
    consumable: true,
    requiresTarget: true,
    process: async (msg, {empowered, targetMember}) => {
        let availableItems = [].concat(...(ItemUtils.registeredItems.filter(i => {
            return targetMember.roles.cache.has(i.roleID);
         })));
         let removedItem = u.rand(availableItems);
      if (!removedItem) {
          u.clean(msg.channel.send("<@" + targetMember.id + "> has no items to shatter"));
          return;
      }
        if(!empowered){
            await targetMember.roles.remove(removedItem.roleID);
            msg.channel.send("<@" + msg.mentions.members.first().id + ">'s " + removedItem.name + "has been shattered")
            msg.react(removedItem.emoji);
        } 
        else {
            availableItems.forEach(async element => {
                await targetMember.roles.remove(element.roleID);
                msg.react(element.emoji);
            });
        }
    }
});

const items = [BanishHammer, MuteHammer, Shield, Paintball, Shatter];

module.exports = items;