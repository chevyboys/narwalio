const u = require("../utils/utils");
const { ItemUtils, Item } = require("../utils/ItemUtils");
const Augur = require("augurbot");
const Module = new Augur.Module(),
  inventory = require("../utils/roleColors");
const cassItems = require("../data/CassItems");

Module.addCommand({
    name: "use",
    aliases: ["empower"],
    description: "use an item from your inventory.",
    usage: "<item> <user target> <role>",
    process: async (msg, suffix) => {

      let itemOptions = {};
      //determine which item to use. If the user doesn't have the item, return    
      //u.log("item parsing from suffix: " + suffix)
      let memberItems = await ItemUtils.getMemberItems(msg.member);
      let item = memberItems.find(i => (suffix.indexOf(i.emoji) > -1
        || suffix.indexOf(i.name) > -1
        || suffix.indexOf(i.roleID) > -1)
      );
      if (!item || item == {}) {
        return msg.channel.send("You need to give me a valid item to !use");
      }
      //u.log(JSON.stringify(item));
      item = await ItemUtils.resolveItem(item);
      msg.content = msg.content.replace(item.emoji, "").replace(item.name, "").replace(item.roleID, "").replace(/ + +/gm, " ");
      suffix = suffix.replace(item.emoji, "").replace(item.name, "").replace(item.roleID, "").replace(/ + +/gm, " ");

      //determine if the use is empowered
      if (msg.content.indexOf("empower") > -1 && msg.content.indexOf("empower") < msg.content.indexOf(suffix)) {
        if (ItemUtils.hasInfiniteItems(msg.member)) {
          itemOptions.empowered = true;
        } else {
          u.clean(msg.reply("You can't empower that item. try !use instead."))
          return;
        }
      }
      //determine target member
      if (item.requiresTarget) {
        itemOptions.targetMember = msg.mentions.members.first();
      }
      //determine target role if required, must be a role the person has or can equip other than an item.
      if (item.requiresTargetRole) {
        let serverRoles = msg.guild.roles.cache
        let availableRoles = [].concat(...(serverRoles).array());
        let targetRole = availableRoles.find(r => suffix.toLowerCase().indexOf(r.name.toLowerCase()) > -1 || suffix.indexOf(r.id) > - 1)
        if (!targetRole) return msg.channel.send("You need to provide a role for this item to use");
        itemOptions.targetRole = targetRole;
      }
      //determine if the item is free for all

      //use the item
      ItemUtils.use(msg, item, itemOptions);

    }
  }).addCommand({
    name: "item",
    description: "gets information about an item",
    process: async (msg, suffix) => {
      u.preCommand(msg);
      try {
        let member;
        if (msg.mentions.users.size && ItemUtils.hasInfiniteItems(msg.member)) {
          member = await msg.guild.members.fetch(msg.mentions.users.first().id);
          suffix = suffix.replace(/<+.*>\s*/gm, "");
        } else member = msg.member;

        //get the item they want
        let memberItems = await ItemUtils.getMemberItems(msg.member);
        let item = memberItems.find(i => (suffix.indexOf(i.emoji) > -1
          || suffix.indexOf(i.name) > -1
          || suffix.indexOf(i.roleID) > -1)
        );
        if (!item || item == {}) {
          return msg.channel.send("You need to give me a valid item to get information about");
        } else {

          // The role exists, the member has it, and it's usable
          let embed = u.embed().setAuthor(member.displayName, member.user.displayAvatarURL({ size: 32 }))
            .setTitle(item.name)
            .setColor(msg.guild ? msg.guild.members.cache.get(msg.client.user.id).displayHexColor : "000000")
            .setDescription(`${item.emoji} - ${item.description}`);
          if (item.consumable) {
            embed.addField(`Consumable`, "This item has limited uses")
          }
          if (item.passive) {
            embed.addField(`Passive`, "This item is always active");
          }
          if (item.freeForAll) {
            embed.addField(`Free for all`, "anyone can use this item unlimited times right now!");
          }
          msg.channel.send({ embed, disableMentions: "all" })
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
        //get the item they want
        let item = (await ItemUtils.getMemberItems(msg.member)).find(i => (suffix.indexOf(i.emoji) > -1
          || suffix.indexOf(i.name) > -1
          || suffix.indexOf(i.roleID) > -1)
        );
        if (!item || item == {}) {
          return msg.channel.send("You need to give me a valid item to give");
        } else {
          // The role exists, the member has it, and it's usable
          let infinite = await ItemUtils.hasInfiniteItems(msg.member);
          if (infinite) {
            let members = await msg.mentions.members
            for (member in members) {
              let guildMember = await msg.guild.members.cache.get(member.value.id)
              u.log(JSON.stringify(member));
              let targetHasItem = await ItemUtils.getMemberItems(guildMember);
              if (!targetHasItem.some(item)) { 
                await guildMember.roles.add(item.roleID);
                msg.channel.send(`Gave ${item.name} to  ${guildMember.displayName}`);
              }
              else {
                msg.reply(`${member.displayName} already has that role`);
              }
            }
          }
          else {
            let targetHasItem = await ItemUtils.getMemberItems(msg.mentions.members.first());
            if (!targetHasItem.some(item)) {
              await msg.member.roles.remove(item.roleID);
              await msg.mentions.members.first().roles.add(item.roleID);
              msg.react("👌");
            }
            else {
              msg.reply(`${msg.mentions.members.first().displayName} already has that item`);
            }
          }
        }
      } catch (e) { u.errorHandler(e, msg); }
      u.postCommand(msg);
    }
  }).addCommand({
    name: "paintballfight",
    description: "starts a paint ball fight",
    process: async (msg, suffix) => {
      let paintball = await ItemUtils.resolveItem("🖌");
      paintball.setFreeForAll(true);
      msg.react("🎨");
    },
    permissions: (msg) => ItemUtils.hasInfiniteItems(msg.member),
  });
module.exports = Module;