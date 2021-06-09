const Augur = require("augurbot"),
  inventory = require("../utils/roleColors"),
  u = require("../utils/utils");

const roles = new Map();

const Module = new Augur.Module()
.addCommand({name: "equip",
  description: "Equip a color from your inventory.",
  category: "Members",
  process: async (msg, suffix) => {
    try {
        //get the role they want equiped
        let member;
        if(msg.mentions.users.size && (msg.member.roles.cache.some(r => r.name.toLowerCase() === "admin") || msg.member.roles.cache.some(r => r.name.toLowerCase() === "moderator")))  {
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
    } catch(e) { u.errorHandler(e, msg); }
  }
})
.addCommand({name: "unequip",
  description: "Unequip all colors from your inventory.",
  category: "Members",
  process: async (msg) => {
    try {
      let member = await msg.guild.members.fetch(msg.author.id);
      await member.roles.remove(Array.from(inventory.values()));
      msg.react("👌");
    } catch(error) { u.errorHandler(error, msg); }
  }
})
.addCommand({name: "inventory",
  description: "Check your color inventory.",
  category: "Members",
  aliases: ["flex", "inv"],
  permissions: (msg) => true,
  process: async (msg) => {
    try {
      let member;
        if(msg.mentions.users.size > 0)  {
           member = await msg.guild.members.fetch(msg.mentions.users.last().id);
        }
        else member = await msg.guild.members.fetch(msg.author.id); 
      let availableRoles = [].concat(...(inventory.filter((v, k) => member.roles.cache.has(k)).array()));
      let embed = u.embed().setAuthor(member.displayName, member.user.displayAvatarURL({size: 32}))
        .setTitle("Equippable Color Inventory")
        .setDescription(`Equip a color role with \`${Module.config.prefix}equip Role Name\`\ne.g. \`${Module.config.prefix}equip serf\`\n\n<@&${availableRoles.join(">\n<@&")}>`);

      if (availableRoles.length == 0) {
        msg.channel.send(`${msg.author}, you don't have any colors in your inventory!`);
      } else {
        msg.channel.send({embed, disableMentions: "all"});
      }
    } catch(error) { u.errorHandler(error, msg); }
  }
})
.addCommand({name: "remove",
  description: "Remove an opt-in role",
  syntax: Object.keys(roles).join(" | "),
  aliases: ["removechannel", "removerole"],
  category: "Members",
  process: async (msg, suffix) => {
    try {
      if (roles.has(suffix.toLowerCase())) {
        let role = msg.guild.roles.cache.get(roles.get(suffix.toLowerCase()));

        let member = await ldsg.members.fetch(msg.author);
        if (member) await member.roles.remove(role);
        msg.react("👌");
        //modLogs.send(`ℹ️ **${member.displayName}** removed the ${role.name} role.`);
      } else {
        msg.reply("you didn't give me a valid role to remove.")
        .then(u.clean);
      }
    } catch(error) { u.errorHandler(error, msg); }
  }
})
.addCommand({name: "role",
  description: "See who has a role.",
  syntax: "<role name>",
  aliases: ["hasrole"],
  category: "Members",
  process: (msg, suffix) => {
    if (suffix) {
      let role = msg.guild.roles.cache.find(r => r.name.toLowerCase() == suffix.toLowerCase());
      if (role && role.members.size > 0) msg.channel.send(`Members with the ${role.name} role:\n\`\`\`\n${role.members.map(m => m.displayName).sort().join("\n")}\n\`\`\``, {split: {prepend: "```\n", append: "\n```"}});
      else msg.channel.send("I couldn't find any members with that role. :shrug:");
    } else {
      msg.reply("you need to tell me a role to find!")
        .then(u.clean);
    }
  },
  permissions: (msg) => msg.guild
})
.addCommand({name: "roleid",
  description: "Get a role ID",
  syntax: "<role name>",
  category: "Admin",
  hidden: true,
  process: (msg, suffix) => {
    if (!suffix) msg.reply("you need to tell me a role name!").then(u.clean);
    else {
      let role = msg.guild.roles.cache.find(r => r.name.toLowerCase() == suffix.toLowerCase());
      if (!role) msg.reply(`I couldn't find a role named ${suffix}.`);
      else msg.channel.send(`${role.name}: ${role.id}`, {code: true});
    }
  },
  permissions: (msg) => msg.guild
})

module.exports = Module;