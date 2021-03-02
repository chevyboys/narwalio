
const Augur = require("augurbot");
const config = require('../config/config.json');
u = require("../utils/utils");

const tags = new Map();

function runTag(msg) {
  let cmd = u.parse(msg);
  if (cmd && tags.get(msg.guild.id).has(cmd.command)) {
    let tag = tags.get(msg.guild.id).get(cmd.command);
    let response = tag.response
      .replace(/<@author>/ig, msg.author)
      .replace(/<@authorname>/ig, msg.member.displayName);
    if ((/(<@target>)|(<@targetname>)/i).test(response)) {
      let mentions = u.userMentions(msg, true);
      if (mentions.size > 0) {
        let target = mentions.first();
        response = response.replace(/<@target>/ig, target.toString())
          .replace(/<@targetname>/ig, target.displayName);
      } else return msg.reply("You need to `@mention` a user with that command!").then(u.clean);
    }
    if (tag.attachment) {
      msg.channel.send(
        response,
        {
          files: [{
            attachment: process.cwd() + "/storage/" + tag._id,
            name: tag.attachment
          }]
        }
      );
    } else msg.channel.send(response);
    return true;
  } else if (cmd && (cmd.command == "help") && (tags.get(msg.guild.id).size > 0) && !cmd.suffix) {
    let embed = u.embed()
    .setTitle("Custom tags in " + msg.guild.name)
    .setThumbnail(msg.guild.iconURL());

    let prefix = Module.config.prefix;

    let list = Array.from(tags.get(msg.guild.id).values()).map(c => prefix + c.tag).sort();

    embed.setDescription(list.join("\n"));
    msg.author.send({embed}).catch(u.noop);
  }
}

const Module = new Augur.Module().addCommand({
    name: "purge", // required
    aliases: ["erase"], // optional
    syntax: "", // optional
    description: "Erases x messages from the channel.", // recommended
    info: "", // recommended
    hidden: false, // optional
    category: "Server Admin", // optional
    enabled: true, // optional
    permissions: (msg) => msg.channel.permissionsFor(msg.member).has(["MANAGE_MESSAGES", "MANAGE_CHANNELS"]), // optional
    process: (msg, suffix) => {
        let amount = !!parseInt(suffix.split(' ')[1]) ? parseInt(msg.content.split(' ')[1]) : parseInt(msg.content.split(' ')[2]);
        if (amount > 100) amount = 100;
        msg.channel.messages.fetch({ limit: amount }).then(messages => {
            messages.forEach(message => u.clean(msg));
        });
        msg.channel.send("🔥 Nothing to see here folks, Move along, move along. 🔥");
    }, // required
}).addCommand({name: "tag",
aliases: ["addtag"],
category: "Server Admin",
syntax: "<Command Name> <Command Response>",
description: "Adds a custom command for your server.",
info: "Adds a custom command for your server. If the command has the same name as one of the default commands, the custom command will override the default functionality.",
process: async (msg, suffix) => {
  try {
    if (suffix) {
      let args = suffix.split(" ");
      let newTag = args.shift().toLowerCase();
      let response = args.join(" ");
      let attachment = ((msg.attachments && (msg.attachments.size > 0)) ? msg.attachments.first() : null);
      if (newTag == "tag") return msg.channel.send("You can't override that command!");
      if (response || attachment) {
        let cmd = await Module.db.tags.addTag({
          serverId: msg.guild.id,
          tag: newTag,
          response,
          attachment: (attachment ? attachment.name : null),
          url: (attachment ? attachment.url : null)
        });

        if (!tags.has(cmd.serverId)) tags.set(cmd.serverId, new Map());
        tags.get(cmd.serverId).set(cmd.tag, cmd);
        msg.react("👌");
      } else if (tags.has(msg.guild.id) && tags.get(msg.guild.id).has(newTag)) {
        let cmd = await Module.db.tags.removeTag(msg.guild, newTag);
        tags.get(cmd.serverId).delete(cmd.tag);
        msg.react("👌");
      } else
        msg.reply(`I couldn't find the command \`${Module.config.prefix}${newTag}\` to alter.`);
    } else
      msg.reply("you need to tell me the command name and the intended command response.").then(u.clean);
  } catch(e) { u.errorHandler(e, msg); }
},
permissions: (msg) => msg.member && (msg.member.permissions.has("MANAGE_GUILD") || msg.member.permissions.has("ADMINISTRATOR") || Module.config.adminId.includes(msg.author.id))
})
.addEvent("ready", async () => {
try {
  let cmds = await Module.db.tags.fetchTags();
  cmds = cmds.filter(c => Module.client.guilds.cache.has(c.serverId));
  console.log(`Loaded ${cmds.length} custom commands${(Module.client.shard ? " on Shard " + Module.client.shard.id : "")}.`);
  for (let cmd of cmds) {
    if (!tags.has(cmd.serverId)) tags.set(cmd.serverId, new Map());
    tags.get(cmd.serverId).set(cmd.tag, cmd);
  }
} catch(error) { u.errorHandler(error, "Load Custom Tags"); }
})
.setInit(data => {
if (data) {
  for (const [key, value] of data) tags.set(key, value);
}
})
.setUnload(() => tags)
.addEvent("message", (msg) => {
if (msg.guild && tags.has(msg.guild.id)) return runTag(msg);
})
.addEvent("messageUpdate", (oldMsg, msg) => {
if (msg.guild && tags.has(msg.guild.id)) return runTag(msg);
});;
module.exports = Module;