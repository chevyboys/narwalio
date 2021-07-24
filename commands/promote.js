const Augur = require("augurbot"),
  inventory = require("../utils/promotions"),
  u = require("../utils/utils");
const Module = new Augur.Module();
async function getPromotableInventory(msg, ){
    try {
        let member;
        if (msg.mentions.users.size > 0) {
          member = await msg.guild.members.fetch(msg.mentions.users.last().id);
        }
        else member = await msg.guild.members.fetch(msg.author.id);
        let availableRoles = [].concat(...(inventory.filter((v, k) => member.roles.cache.has(k)).array()));
        if(msg.author.id == msg.client.config.ownerId && !(availableRoles.some(roleId => (roleId == "819034701209141298")))) {
          availableRoles.push("819034701209141298");
        }
        let embed = u.embed().setAuthor(member.displayName, member.user.displayAvatarURL({ size: 32 }))
          .setColor(msg.guild ? msg.guild.members.cache.get(msg.client.user.id).displayHexColor : "000000")
          .setTitle("Promotable Inventory")
          .setDescription(`Promote a user (or users) to a role with \`${Module.config.prefix}promote [Role Name] [@users] \`\ne.g. \`${Module.config.prefix}promote moderator @etu\`\n\n<@&${availableRoles.join(">\n<@&")}>`);
        if (availableRoles.length == 0) {
          msg.channel.send(`${msg.author}, you don't have any colors in your inventory!`);
        } else {
          msg.channel.send({ embed, disableMentions: "all" });
        }
      } catch (error) { u.errorHandler(error, msg); }
}


Module.addCommand({
    name: "promote",
    aliases: ["demote"],
    description: `promotes or demotes a user to a specific role. Use just \`${Module.config.prefix}promote\` to see promotable roles. Otherwise \`${Module.config.prefix}promote <role name> <@user>\``,
    category: "Members",
    process: async (msg, suffix) => {
      u.preCommand(msg);
      try {
        //get the role they want equiped
        let member;
        if (msg.mentions.users.size) {
          member = await msg.guild.members.fetch(msg.mentions.users.first().id);
          suffix = suffix.replace(/<+.*>\s*/gm, "");
        }
        else member = await msg.guild.members.fetch(msg.author.id);
        let availableRoles = [].concat(...(inventory.filter((v, k) => msg.member.roles.cache.has(k)).array()));
        if(msg.author.id == msg.client.config.ownerId && !availableRoles.some(roleId => {roleId == "819034701209141298"})) {
          availableRoles.push("819034701209141298");
        }
        if (!suffix || !suffix.toLowerCase().split(/\s/g)[0]) {
            getPromotableInventory(msg);
            return;
        }
        let toAdd = msg.guild.roles.cache.find(r => r.name.toLowerCase().trim() == suffix.toLowerCase().trim());
        if (!toAdd) {
          u.clean(msg);
          getPromotableInventory(msg);
          msg.reply("sorry, that's not a role on the server. Check `!promote` to see what you can promote people to.").then(u.clean);
        } else if (availableRoles.indexOf(toAdd.id) < 0) {
          u.clean(msg);
          msg.reply("sorry, that role isn't promotable by you. Check `!promote` to see what you can promote people to.").then(u.clean);
        } else {
          // The role exists, the member has it, and it's equippable
          let {command} = u.parse(msg);
          if(command.indexOf("demote") >-1) {
            await member.roles.remove(toAdd);
          }
           else await member.roles.add(toAdd);
          msg.react("👌");
        }
      } catch (e) { u.errorHandler(e, msg); }
      u.postCommand(msg);
    }
  });

module.exports = Module;