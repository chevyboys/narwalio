const Discord = require("discord.js");
let config = require("../config/config.json");
const Augur = require("augurbot");
const Module = new Augur.Module();
const shieldRoleID = "857772273389666324";
let CassKingdom = "819031079104151573";
const u = require('./utils');

let passiveItemDefaultProcess = (msg, options) => {
    u.clean(msg.channel.send("This item is passive."));
}

/**
 * @class
 */
class Item {

    consumable;
    description;
    emoji;
    freeForAll;
    guildID;
    name;
    passive;
    process;
    permissions;
    requiresTarget;
    requiresTargetRole;
    roleID;


    async findEmoji(options) {
        this.emoji = options.emoji ? options.emoji : (options.guildID ? await Module.client.guilds.cache.get(options.guildID).roles.cache.get(this.roleID).name : () => { throw "Item cannot be constructed, no emoji provided" });
        this.emoji = this.emoji.trim();
    }
    async findName(options) {
        this.name = options.name ? options.name : (options.emoji ? options.emoji : (options.guildID ? await Module.client.guilds.cache.get(options.guildID).roles.cache.get(this.roleID).name : () => { throw "Item cannot be constructed, No Name Provided" }));
        this.name = this.name.trim().toLowerCase();
        if (this.name.indexOf(" ") > -1) {
            throw "Item name cannot include whitespace, use a - instead";
        }
    }
    async setFreeForAll (freeForAll) {
        this.freeForAll = freeForAll;
    }

    /**
     * @callback process
     * 
     * @construcor
     * @param {Object} options The options to pass into the object
     * @param {Boolean} [options.consumable = true] is the item consumable? (use a call back function to determine randomly if desired)
     * @param {String} [options.description] the description of what the item does.
     * @param {String} options.emoji the emoji for the item. If not provided, and both guild and role IDs are provided, then it will try to get the role name.
     * @param {String | Discord.Guild} [options.guildID = CassKingdom] the guild this item belongs to. Defaults to CK.
     * @param {String} options.name the name of the item. If not specified it will try to get the emoji name, or the role name
     * @param {Boolean} [options.passive = false] if the item is a passive item. If no process is specified, it is assumed this item is passive. 
     * @param {process} options.process what the item actually does
     * @param {boolean} [options.requiresTarget = false] Does this item target someone
     * @param {boolean} [options.requiresTargetRole = false] Does this item target a role
     * @param {String | Discord.Role]} options.roleId the role for the item
     */
    constructor(options) {
        this.consumable = options.consumable ?? true;
        this.description = options.description;
        this.findEmoji(options);
        this.guildID = (options.guildID) ? (options.guildID instanceof Discord.Guild ? options.guildID.id : options.guildID) : CassKingdom;
        this.findName(options);
        this.passive = options.passive ?? (options.process ? false : true);
        this.process = options.process ?? (this.passive ? passiveItemDefaultProcess : () => { throw `Item ${this.name ? this.name + " " : ""}cannot be constructed, no process provided` });
        this.requiresTarget = options.requiresTarget ?? false;
        this.requiresTargetRole = options.requiresTargetRole ?? false;
        this.roleID = (options.roleID) ? (options.roleID instanceof Discord.Role ? options.roleID.id : options.roleID) : null;
        ItemUtils.registeredItems.push(this);
        u.log("Registering Item:" + this.name);
        if (!this.description) {
            let warning = `No description provided for item "${(this.name ? this.name : (this.emoji ? this.emoji : (this.roleID ? `item with RoleID: ${this.roleID}` : "Unknown Item")))}"`
            console.warn(warning);
            u.log(warning);
        }
    }
    
}


const ItemUtils = {
    /** 
     * Get array of all items a GuildMember has
     * @async
     * @param {Discord.GuildMember | Discord.Message} memberResolveable accepts either a member object or a msg object. If given a message, it will get the author's member
     * @example
     * // returns array of Item objects
     * getMemberItems(member);
     * */
    getMemberItems: async (memberResolveable) => {
        if (!(memberResolveable instanceof Discord.GuildMember)) {
            if (memberResolveable instanceof Discord.Message) {
                memberResolveable = await u.getUser(memberResolveable);
            }
            else {
                throw "No member provided, cannot get items"
            }
        }
        try {
            let infinite = await ItemUtils.hasInfiniteItems(memberResolveable);
            let availableItems = ItemUtils.registeredItems.filter(
                (i) => (i.freeForAll || infinite || memberResolveable.roles.cache.has(i.roleID))
            );
            return [].concat(availableItems);
        } catch (error) {
            throw error;
        }

    },
    /** 
     * Gives an item to a target if they do not have the item
     * @async
     * @param {Item | String | Discord.Role} itemResolvable
     * @param {Discord.GuildMember} targetMember 
     * @example
     * // returns nothing
     * give(item, member);
     * */
    give: async (itemResolvable, targetMember) => {
        //validate input
        let item = (itemResolvable instanceof Item) ? itemResolvable : ItemUtils.resolveItem(itemResolvable);
        if (!item) {
            throw "Cannot give unknown item";
        }
        if (!(targetMember instanceof Discord.GuildMember)) {
            throw "Cannot give to unknown member"
        }
        await targetMember.roles.add(item.roleID);
    },
    /** 
     * Checks if the user has infinite items or is in "God Mode"
     * @async
     * @param {Discord.GuildMember | Discord.Message} member If this is a message, then it will try to get the mention, followed by the author.
     * @example
     * // returns boolean
     * hasInfiniteItems(member);
     * */
    hasInfiniteItems: async (member) => {
        if (member instanceof Discord.Message) {
            member = await u.getUser(member);
        }
        if (!(member instanceof Discord.GuildMember)) {
            throw "Cannot determine item limit for unknown member"
        }
        else if (member.partial) {
            u.log("Partial Member detected");
        } else {
            //u.log("Member:" + JSON.stringify(member));
            let thisclient = Module.client || await u.getClient() || member.client;
            let returnable;
            try {
                (
                    returnable = member && (member.hasPermission("MANAGE_GUILD") ||
                        thisclient.config.adminId.includes(member.id))
                )
            } catch (error) {
                if (error.toString().indexOf("member.hasPermission is not a function") > -1) { error = null; throw "Cannot determine item limit for unknown member"; }
                else { throw error; }
            }
            return returnable;
        }
    },
    /** 
     * Checks if the user has an item
     * @async
     * @param {Discord.GuildMember} member 
     * @param {Item | String | Discord.Role} itemResolvable
     * @returns {Boolean}
     * @example hasItem(member, itemResolvable);
     * */
    hasItem: async (member, itemResolvable) => {
        //validate data
        let item = (itemResolvable instanceof Item) ? itemResolvable : ItemUtils.resolveItem(itemResolvable);
        if (!(member instanceof Discord.GuildMember)) {
            throw "Cannot determine item inventory for unknown member"
        }
        let items = await ItemUtils.getMemberItems(member);
        return items.some(i => {
            return (item.name == i.name || item.roleID == i.roleID)
        });
    },
    /** 
     * Takes an item from a target if they have the item
     * @async
     * @param {Item | String | Discord.Role} itemResolvable
     * @param {Discord.GuildMember} targetMember 
     * @example
     * take(item, member);
     * */
    take: async (itemResolvable, targetMember) => {
        let item = (itemResolvable instanceof Item) ? itemResolvable : ItemUtils.resolveItem(itemResolvable);
        if (!(targetMember instanceof Discord.GuildMember)) {
            throw "Cannot take item from unknown member"
        }
        if (!ItemUtils.hasItem(targetMember, itemResolvable)) return;
        await targetMember.roles.remove(item.roleID);
    },
    registeredItems: [],
    /** 
     * Takes a string corresponding to the emoji, item name, role, or role id, or an item object, and returns the item object for the resolveable
     * @async
     * @param {Item | String | Discord.Role} itemResolvable
     * @example
     * resolveItem(item);
     * */
    resolveItem: async (itemResolvable) => {
        if (!itemResolvable) {
            throw "Cannot resolve item of " + itemResolvable;
        } else if (itemResolvable instanceof Item) {
            return itemResolvable;
        } else if (itemResolvable instanceof Discord.Role) {
            let itemFromRole = ItemUtils.registeredItems.filter(i => {
                return i.roleID == itemResolvable.id;
            });
            if (itemFromRole.length != 1) {
                throw `Cannot resolve item of ${itemResolvable.name}, either it is not an item role, the item is not registered, or the role is invalid`
            }
            else return itemFromRole[0];
        } else if (typeof itemResolvable === "string" ) {
            //determine if item is an item name, or item emoji, or registered RoleID
            let itemsFromString = ItemUtils.registeredItems.filter((i) => (i.name.trim().toLowerCase() == itemResolvable.trim().toLowerCase() || i.emoji == itemResolvable || itemResolvable.trim() == i.roleID.trim()) );
            if (itemsFromString.length > 0) {
                if (itemsFromString.length < 2) {
                    if (itemsFromString instanceof Array)
                        return itemsFromString[0];
                    else return itemsFromString;
                } else throw `Multiple matching items detected for "${itemResolvable}", please try a query for a single item. \nReference:  \`${itemResolvable}\` in \`\`\`JSON\n${await JSON.stringify(ItemUtils.registeredItems.map(item => { { item.name, item.emoji, item.roleID } }), 4)}\`\`\``
            }
            else throw `No matching role found for \`${itemResolvable}\` in ${JSON.stringify(itemsFromString)}\nExtracted from \`\`\`json\n${await JSON.stringify(ItemUtils.registeredItems.map(item => { { item.name, item.emoji, item.roleID } }), 4)}\`\`\``
        }
        else throw (`Unable to resolve item "${JSON.stringify(itemResolvable)}", invalid resolvable type. Only arguments that are an Item, Discord.Role, or a string matching an Item.name, Item.Emoji, or Item.RoleID can be resolved. Items are extracted from \`\`\`json\n${JSON.stringify(ItemUtils.registeredItems.map(item => { { item.name, item.emoji, item.roleID } }), 4)}\`\`\``);
    },
    /** 
     * Lets you use an item
     * @async
     * @param {Discord.Message} msg
     * @param {Item | String | Discord.Role} itemResolvable
     * @param {Object} [useItemOptions]
     * @param {Boolean} [useItemOptions.empowered] is this object being used powerfully
     * @param {Boolean} [useItemOptions.freeForAll] is this object currently infinite use
     * @param {Boolean} [useItemOptions.targetMember] the target of the item
     * @param {Discord.Role} [useItemOptions.targetRole] the role for the item to use/target
     * @returns null
     * @example
     * 
     * use(msg, exampleItem, {
     * empowered: false,
     * freeForAll: false,
     * targetMember: memberObject
     * targeRole: Role object
     * })
     * */
    use: async (msg, itemResolvable, useItemOptions) => {
        //resolve the item
        let item = (itemResolvable instanceof Item) ? itemResolvable : ItemUtils.resolveItem(itemResolvable);
        msg = (msg instanceof Discord.Message) ? msg : null;
        //validate minimum input
        if (!item) {
            throw "Cannot use unknown item";
        }
        if (!msg || msg == null) {
            throw "Cannot use item without message"
        }
        if (item.requiresTarget && !useItemOptions.targetMember) {
            throw "This item requires a target"
        }
        if (item.passive) {
            u.clean(msg.reply("This is a passive ability"));
        } else {
            //block if sheilded
            if (useItemOptions && useItemOptions.targetMember) {
                let targetMemberItems = await ItemUtils.getMemberItems(msg, useItemOptions.targetMember);
                if ((await useItemOptions.targetMember.roles.cache.has(shieldRoleID) || await ItemUtils.hasInfiniteItems(useItemOptions.targetMember)) && (!useItemOptions.empowered)) {
                    let reply = useItemOptions.targetMember.displayName + " was shielded";
                    //should we remove the sheild
                    if (targetMemberItems.includes(shieldRoleID) && !ItemUtils.hasInfiniteItems(useItemOptions.targetMember) && (empowered || ItemUtils.resolveItem(shieldRoleID).consumable)) {
                        ItemUtils.resolveItem(shieldRoleID).take(targetMember);
                        reply = reply + ", but your " + useItemOptions.empowered ? "empowered " : "" + item.name + " broke it!";
                        targetMember.send("Your sheild was broken by " + msg.member.displayName + "'s " + useItemOptions.empowered ? "empowered " : "" + item.name + "!");
                    } else {
                        reply = reply + " and your item had no effect";
                        await msg.react("❌");
                    }
                    u.clean(msg.reply(reply));
                    if (!useItemOptions.empowered) {
                        msg.react("🛡");
                        return;
                    }
                }
            }
            //remove item if it should be removed.
            if (item.consumable && (!useItemOptions || (!useItemOptions.empowered && !useItemOptions.freeForAll)) && !ItemUtils.hasInfiniteItems(msg.member)) {
                await ItemUtils.take(item, msg.member);
            }
            //run the item
            u.preCommand(msg);
            item.process(msg, useItemOptions);
            u.postCommand(msg);
            msg.react(item.emoji);
        }
    }
};

module.exports = { ItemUtils, Item };