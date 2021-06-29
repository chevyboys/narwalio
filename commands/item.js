const Augur = require("augurbot"),
  inventory = require("../utils/roleColors"),
  u = require("../utils/utils"),
  items = require('../data/cassItemRoles');

const Module = new Augur.Module()

async function grantWishes(roleID, oddsThatThingHappens = 0.3) {
  //determine if anyon gets
  let guildID = "819031079758462998";
  let guild;
  try {
    guild = await Module.client.guilds.fetch(guildID);
  } catch (error) {
    return;
  }
  let ran = Math.random();

  let channelID = "819038025672687617";
  let channel = await Module.client.channels.fetch(channelID);
 
  let role  = await guild.roles.cache.find((r) => (r.id == roleID));
  role.members.map(member => {
    if (ran >= oddsThatThingHappens) { return }
    let item = u.rand(items);
    member.roles.add(item.roleID);
    channel.send(member.displayName + " has been given a " + item.emoji + " for being a member of " + role.name + "!");
  });

}


Module.addCommand({
  name: "use",
  aliases: ["empower"],
  description: "use an item from your inventory.",
  process: async (msg, suffix, params) => {
    u.preCommand(msg);
    let empowered = false;
    if(msg.content.indexOf("empower") > -1 && !suffix.indexOf("empower") > -1 && (msg.member.permissions.has("MANAGE_GUILD") || msg.member.permissions.has("ADMINISTRATOR") || msg.client.config.adminId.includes(msg.author.id))) {
      empowered = true;
    }
    try {
      let member = await msg.guild.members.fetch(msg.author.id);
      let availableItems = [].concat(...(items.filter(i => {
        if (msg.member && (msg.member.permissions.has("MANAGE_GUILD") || msg.member.permissions.has("ADMINISTRATOR") || msg.client.config.adminId.includes(msg.author.id))) {
          return true;
        }
        else return member.roles.cache.has(i.roleID);
      })));
      if(msg.guild.paintBallFight){
        availableItems.push(items[3]);
      }
      let itemRole;
      if (msg.mentions.roles.size > 0) {
        itemRole = msg.mentions.roles.first()
      } else itemRole = await msg.guild.roles.cache.find(element => (suffix.toLowerCase().trim()).indexOf(element.name.toLowerCase()) > -1 && availableItems.map(i => i.roleID).includes(element.id));
      u.log(itemRole);
      if (!itemRole) {
        msg.reply("sorry, that's not an obtainable item on the server. Check `!inventory` to see what you can use.").then(u.clean);
        return;
      }
      let item = availableItems.find(i => i.roleID == itemRole.id);
      u.log(item);
      if (!item) {
        u.clean(msg);
        msg.reply("sorry, that item isn't useable in your inventory. Check `!inventory` to see what items you can use.").then(u.clean);
      } else {
        // The role exists, the member has it, and it's usable
        item.use(msg, member, empowered);
        msg.react("👌");
      }
    } catch (e) { u.errorHandler(e, msg); }
    u.postCommand(msg);
  }
}).addCommand({
  name: "give",
  description: "give an item to someone",
  process: async (msg, suffix) => {
    u.preCommand(msg);
    try {
      let member = await msg.guild.members.fetch(msg.author.id);
      let availableItems = [].concat(...(items.filter(i => {
        if (msg.member && (msg.member.permissions.has("MANAGE_GUILD") || msg.member.permissions.has("ADMINISTRATOR") || msg.client.config.adminId.includes(msg.author.id))) {
          return true;
        }
        else return member.roles.cache.has(i.roleID);
      })));
      let itemRole = msg.mentions.roles.first() || await msg.guild.roles.cache.find(r => r.name.toLowerCase() == suffix.replace(/<+.*>\s*/gm, "").toLowerCase().trim());
      let item = availableItems.find(i => i.roleID == itemRole.id);
      if (!itemRole) {
        u.clean(msg);
        msg.reply("sorry, that's not an obtainable item on the server. Check `!inventory` to see what you can use.").then(u.clean);
      } else if (!item) {
        u.clean(msg);
        msg.reply("sorry, that item isn't useable in your inventory. Check `!inventory` to see what items you can use.").then(u.clean);
      } else {
        // The role exists, the member has it, and it's usable
        if (msg.member && (msg.member.permissions.has("MANAGE_GUILD") || msg.member.permissions.has("ADMINISTRATOR") || msg.client.config.adminId.includes(msg.author.id))) {
          msg.mentions.members.forEach(member => {
            if (!member.roles.cache.has(itemRole.id)) { member.roles.add(itemRole); }
            else {
              msg.reply(`${member.displayName} already has that role`);
            }
          })
        }
        else {
          if (!msg.mentions.members.first().roles.cache.has(itemRole.id)) {
            await msg.member.roles.remove(itemRole);
            await msg.mentions.members.first().roles.add(itemRole);
          }
          else {
            msg.reply(`${msg.mentions.members.first().displayName} already has that role`);
          }
        }
        msg.react("👌");
      }
    } catch (e) { u.errorHandler(e, msg); }
    u.postCommand(msg);
  }
}).addCommand({
  name: "item",
  description: "gets information about an item",
  process: async (msg, suffix) => {
    u.preCommand(msg);
    try {
      let member = await msg.guild.members.fetch(msg.author.id);
      let availableItems = [].concat(...(items.filter(i => {
        if (msg.member && (msg.member.permissions.has("MANAGE_GUILD") || msg.member.permissions.has("ADMINISTRATOR") || msg.client.config.adminId.includes(msg.author.id))) {
          return true;
        }
        else return member.roles.cache.has(i.roleID);
      })));
      if(msg.guild.paintBallFight){
        availableItems.push(items[3]);
      }
      let itemRole;
      if (msg.mentions.roles.size > 0) {
        itemRole = msg.mentions.roles.first()
      } else itemRole = await msg.guild.roles.cache.find(r => r.name.toLowerCase() == suffix.replace(/<+.*>\s*/gm, "").toLowerCase().trim());
      if (!itemRole) {
        u.log(itemRole);
        itemRole = items.some(i  => { i.name.indexOf(suffix.replace(/<+.*>\s*/gm, "").toLowerCase().trim()) > -1 });
        if (itemRole) itemRole = await msg.guild.roles.fetch(items.find(element => element.name.indexOf(suffix.replace(/<+.*>\s*/gm, "").toLowerCase().trim()) > -1).roleID);
        else {u.clean(msg);
        msg.reply("sorry, that's not an obtainable item on the server. Check `!inventory` to see what you can use.").then(u.clean);
        return;}
      }
      let item = availableItems.find(i => i.roleID == itemRole.id);
      if (!item) {
        u.clean(msg);
        msg.reply("sorry, that item isn't useable in your inventory. Check `!inventory` to see what items you can use.").then(u.clean);
      } else {

        // The role exists, the member has it, and it's usable
        let embed = u.embed().setAuthor(member.displayName, member.user.displayAvatarURL({ size: 32 }))
          .setTitle(item.name)
          .setDescription(`${item.emoji} - ${item.description}`);
        if (item.consumable) {
          embed.addField(`Consumable`, "This item has limited uses")
        }
        if (item.passive) {
          embed.addField(`Passive`, "This item is always active");
        }
        msg.channel.send({ embed, disableMentions: "all" })
        msg.react("👌");
      }
    } catch (e) { u.errorHandler(e, msg); }
    u.postCommand(msg);
  }
}).addCommand({
  name: "paintballfight",
  description: "starts a paint ball fight",
  process: async (msg, suffix) => {
    if(!msg.guild.paintBallFight) msg.guild.paintBallFight = true;
    else msg.guild.paintBallFight = false;
    msg.react("🎨");

  },
  permissions:(msg) => (msg.member && (msg.member.permissions.has("MANAGE_GUILD") || msg.member.permissions.has("ADMINISTRATOR") || msg.client.config.adminId.includes(msg.author.id))),
}).setClockwork(async () => {
  if(!Module.client.user.id == "854552593509253150") return;
  try {
    // Every 12 hours Mr.genie club members have a 30% chance a random item.
    return setInterval(grantWishes("819036592173219841", 0.3/12), 1 * 60 * 60 * 1000);
  } catch (e) { u.errorHandler(e, "Item granting clockwork error, Genie Club"); }
}).setClockwork(async () => {
  if(!Module.client.user.id == "854552593509253150") return;
  try {
    // Every 24 hours Thornrose club members have a 10% get a random item.
    return setInterval(() => grantWishes("819036460929384489", 0.1/24), 1 * 60 * 60 * 1000);
  } catch (e) { u.errorHandler(e, "Item granting clockwork error, Thornrose Club"); }
}).setClockwork(async () => {
  if(!Module.client.user.id == "854552593509253150") return;
  try {
    // Every 24 hours Team members have a 50% get a random item.
    return setInterval(() => grantWishes("849748196742004836", 0.5/24), 1 * 60 * 60 * 1000);
  } catch (e) { u.errorHandler(e, "Item granting clockwork error, Team"); }
}).setClockwork(async () => {
  try {
    if(!Module || !Module.client || !Module.client.user || !Module.client.user.id == "854552593509253150") return;
    // Every 24 hours Nobility members have a 1% get a random item.
    return setInterval(() => grantWishes("821557037539917865", 0.01/24), 1 * 60 * 60 * 1000);
  } catch (e) { u.errorHandler(e, "Item granting clockwork error, Nobility"); }
})
module.exports = Module;