const Augur = require("augurbot"),
  moment = require("moment"),
  u = require("../utils/utils");
  const Module = new Augur.Module()

async function celebrate() {
  if (Module.client.user.id != "854552593509253150"){
    return;
  }
  let guild = await Module.client.guilds.cache.get("819031079104151573")
  if (moment().hours() == 15) {
    testBirthdays(guild).catch(error => u.errorHandler(error, "Test Birthdays"));
    testCakeDays(guild).catch(error => u.errorHandler(error, "Test Cake Days"));
  }
}

async function testBirthdays(guild) {
  try {
    let ldsg = guild;
    if(!guild || guild == undefined) ldsg = await Module.client.guilds.fetch("819031079104151573")
    const curDate = moment();

    // Birthday Blast
    const birthdayLangs = require("../data/birthday.json");
    const flair = [
      ":tada: ",
      ":confetti_ball: ",
      ":birthday: ",
      ":gift: ",
      ":cake: "
    ];

    let birthdayPeeps = (await Module.db.user.getUsers()).filter(user => user.birthday != null);
    for (let birthdayPeep of birthdayPeeps) {
      try { 
        let date = moment(birthdayPeep.birthday);
        if (date && date.month() == curDate.month() && date.date() == curDate.date()) {
          let member = await ldsg.members.fetch(birthdayPeep.discordId);  
          await ldsg.channels.cache.get("821494049663221820").send(`:birthday: :confetti_ball: :tada: Happy Birthday, ${member}! :tada: :confetti_ball: :birthday:`);
          let msgs = birthdayLangs.map(lang => member.send(u.rand(flair) + " " + lang));
          Promise.all(msgs).then(() => {
            member.send(":birthday: :confetti_ball: :tada: A very happy birthday to you, from " + guild.name + "! :tada: :confetti_ball: :birthday:").catch(u.noop);
          }).catch(u.noop);
        }
      } catch (e) { u.errorHandler(e, "Birthay Send"); continue; }
    }
  } catch (e) { u.errorHandler(e, "Birthday Error"); }
}

async function testCakeDays(guild) {
  try {
    let ldsg = guild;
    const curDate = moment();
    if(!guild || guild == undefined) ldsg = await Module.client.guilds.fetch("819031079104151573");
    // LDSG Cake Day

  const members = await ldsg.members.fetch();
    let offsets = await Module.db.user.getUsers({ discordId: { $in: members.keyArray() } });

    for (let [key, member] of members.filter(m => m.roles.cache.has(Module.config.roles.trusted))) {
      try {

        let offset = offsets.find(o => o.discordId == key);
        let join = moment(member.joinedAt).subtract(0, "days");
        if (join && (join.month() == curDate.month()) && (join.date() == curDate.date()) && (join.year() < curDate.year())) {
          let years = curDate.year() - join.year();
          try {
            if (member.roles.cache.some((r) => { r.name.toLowerCase().indexOf("trusted") > -1 })) {
              ldsg.channels.cache.get(ldsg.id).send(`${member} has been part of the server for ${years} ${(years > 1 ? "years" : "year")}! Glad you're with us!`);
            }
          } catch (e) { u.errorHandler(e, "Announce Cake Day Error"); continue; }
        }
      } catch (e) { u.errorHandler(e, "Fetch Cake Day Error"); }
    }
  } catch (error) { u.errorHandler(error, "Cake Day Error"); }
}

Module.addCommand({
    name: "happybirthday",
    description: "It's your birthday!?",
    syntax: "<@user>", hidden: true,
    process: async (msg) => {
      u.preCommand(msg);
      if (msg.mentions.members && msg.mentions.members.size > 0) {
        let flair = [
          ":tada: ",
          ":confetti_ball: ",
          ":birthday: ",
          ":gift: ",
          ":cake: "
        ];
        for (let [id, member] of msg.mentions.members) {
          try {
            let channel = null;
            channel = "821494049663221820";
            await msg.client.channels.cache.get(channel).send(`:birthday: :confetti_ball: :tada: Happy Birthday, ${member}! :tada: :confetti_ball: :birthday:`);
            let birthdayLangs = require("../data/birthday.json");
            let msgs = birthdayLangs.map(lang => member.send(u.rand(flair) + " " + lang));
            await Promise.all(msgs).catch(u.noop);
            member.send(":birthday: :confetti_ball: :tada: A very happy birthday to you, from " + msg.guild.name + "! :tada: :confetti_ball: :birthday:").catch(u.noop);
          } catch (error) { u.errorHandler(error, msg); }
        }
      } else {
        msg.reply("you need to tell me who to celebrate!");
      }
      u.postCommand(msg);
    },
    permissions: (msg) => Module.config.adminId.includes(msg.author.id) && msg.guild.id == "819031079104151573"
  })
  .addEvent("ready", celebrate)
  .setClockwork(() => {
    try {
      return setInterval(celebrate, 60 * 60 * 1000);
    } catch (e) { u.errorHandler(e, "Birthday Clockwork Error"); }
  }).addCommand({
    name: "birthday",
    description: "Let us know when to celebrate you",
    syntax: "Month/Day", hidden: true,
    process: async (msg, suffix) => {
      u.preCommand(msg);
      suffix = suffix.trim();
      try {
        let bd = new Date(suffix);
        if (bd == 'Invalid Date') {
          msg.reply("I couldn't understand that date. Please use Month Day format (e.g. Apr 1 or 4/1).");
          u.postCommand(msg);
          return;
        } else {
          let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
          suffix = months[bd.getMonth()] + " " + bd.getDate();
        }
      } catch (e) {
        msg.reply("I couldn't understand that date. Please use Month Day format (e.g. Apr 1 or 4/1).");
        u.postCommand(msg);
        return;
      }
      Module.db.user.update(msg.author, {birthday: suffix});
      msg.react("🎂");
      u.postCommand(msg);
    },
    permissions: (msg) =>  msg.guild.id == "819031079104151573"
  })

module.exports = Module;