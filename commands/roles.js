const Augur = require("augurbot"),
  inventory = require("../utils/roleColors"),
  u = require("../utils/utils"),
  items = require('../data/cassItemRoles');

const roles = new Map();

const Module = new Augur.Module()
  .addCommand({
    name: "equip",
    description: "Equip a color from your inventory.",
    category: "Members",
    process: async (msg, suffix) => {
      u.preCommand(msg);
      try {
        //get the role they want equiped
        let member;
        if (msg.mentions.users.size && (msg.member.roles.cache.some(r => r.name.toLowerCase() === "admin") || msg.member.roles.cache.some(r => r.name.toLowerCase() === "moderator"))) {
          member = await msg.guild.members.fetch(msg.mentions.users.first().id);
          suffix = suffix.replace(/<+.*>\s*/gm, "");
        }
        else member = await msg.guild.members.fetch(msg.author.id);
        let availableRoles = [].concat(...(inventory.filter((v, k) => member.roles.cache.has(k)).array()));
        let role = msg.guild.roles.cache.find(r => r.name.toLowerCase() == suffix.toLowerCase().replace(" colors", "").replace(" seasonal", "").trim());

        let toAdd = msg.guild.roles.cache.find(r => r.name.toLowerCase() == `${suffix.toLowerCase().replace(" colors", "")} colors`);
        if (!toAdd) {
          u.clean(msg);
          msg.reply("sorry, that's not a role on the server. Check `!inventory` to see what you can equip.").then(u.clean);
        } else if (availableRoles.indexOf(toAdd.id) < 0) {
          u.clean(msg);
          msg.reply("sorry, that role isn't equippable in your inventory. Check `!inventory` to see what you can equip.").then(u.clean);
        } else {
          // The role exists, the member has it, and it's equippable
          await member.roles.remove(availableRoles);
          await member.roles.add(toAdd);
          msg.react("👌");
        }
      } catch (e) { u.errorHandler(e, msg); }
      u.postCommand(msg);
    }
  })
  .addCommand({
    name: "unequip",
    description: "Unequip all colors from your inventory.",
    category: "Members",
    process: async (msg) => {
      u.preCommand(msg);
      try {
        let member = await msg.guild.members.fetch(msg.author.id);
        await member.roles.remove(Array.from(inventory.values()));
        msg.react("👌");
      } catch (error) { u.errorHandler(error, msg); }
      u.postCommand(msg);
    }
  })
  .addCommand({
    name: "inventory",
    description: "Check your color inventory.",
    category: "Members",
    aliases: ["flex", "inv"],
    permissions: (msg) => true,
    process: async (msg) => {
      u.preCommand(msg);
      try {
        let member;
        if (msg.mentions.users.size > 0) {
          member = await msg.guild.members.fetch(msg.mentions.users.last().id);
        }
        else member = await msg.guild.members.fetch(msg.author.id);
        let availableRoles = [].concat(...(inventory.filter((v, k) => member.roles.cache.has(k)).array()));
        let embed = u.embed().setAuthor(member.displayName, member.user.displayAvatarURL({ size: 32 }))
          .setTitle("Equippable Color Inventory")
          .setDescription(`Equip a color role with \`${Module.config.prefix}equip Role Name\`\ne.g. \`${Module.config.prefix}equip serf\`\n\n<@&${availableRoles.join(">\n<@&")}>`);
        if (msg.guild.id == "819031079104151573") {
          //cass items
          let availableItems = [].concat(...(items.filter(i => {
            if (msg.member && (msg.member.permissions.has("MANAGE_GUILD") || msg.member.permissions.has("ADMINISTRATOR") || msg.client.config.adminId.includes(msg.author.id))) {
              return true;
            }
            else return member.roles.cache.has(i.roleID);
          })));
          if (availableItems.length > 0) {
            embed.addField("Current items:", `Use an item with \`${Module.config.prefix}use [Item Icon]\`\ne.g. \`${Module.config.prefix}use 🔨 \`\n\n<@&${availableItems.map(i => i.roleID).join(">\n<@&")}>`)
          }
        }
        if (availableRoles.length == 0) {
          msg.channel.send(`${msg.author}, you don't have any colors in your inventory!`);
        } else {
          msg.channel.send({ embed, disableMentions: "all" });
        }
      } catch (error) { u.errorHandler(error, msg); }
      u.postCommand(msg);
    }
  })
  .addCommand({
    name: "role",
    description: "See who has a role.",
    syntax: "<role name>",
    aliases: ["hasrole"],
    category: "Members",
    process: (msg, suffix) => {
      u.preCommand(msg);
      if (suffix) {
        let role = msg.guild.roles.cache.find(r => r.name.toLowerCase() == suffix.toLowerCase());
        if (role && role.members.size > 0) msg.channel.send(`Members with the ${role.name} role:\n\`\`\`\n${role.members.map(m => m.displayName).sort().join("\n")}\n\`\`\``, { split: { prepend: "```\n", append: "\n```" } });
        else msg.channel.send("I couldn't find any members with that role. :shrug:");
      } else {
        msg.reply("you need to tell me a role to find!")
          .then(u.clean);
      }
      u.postCommand(msg);
    },
    permissions: (msg) => msg.member && (msg.member.permissions.has("MANAGE_GUILD") || msg.member.permissions.has("ADMINISTRATOR") || Module.config.adminId.includes(msg.author.id))
  })
  .addCommand({
    name: "roleid",
    description: "Get a role ID",
    syntax: "<role name>",
    category: "Admin",
    hidden: true,
    process: (msg, suffix) => {
      u.preCommand(msg);
      if (!suffix) msg.reply("you need to tell me a role name!").then(u.clean);
      else {
        let role = msg.guild.roles.cache.find(r => r.name.toLowerCase() == suffix.toLowerCase());
        if (!role) msg.reply(`I couldn't find a role named ${suffix}.`);
        else msg.channel.send(`${role.name}: ${role.id}`, { code: true });
      }
      u.postCommand(msg);
    },
    permissions: (msg) => msg.member && (msg.member.permissions.has("MANAGE_GUILD") || msg.member.permissions.has("ADMINISTRATOR") || Module.config.adminId.includes(msg.author.id))
  })

module.exports = Module;