Infraction = require("../models/Infraction.model"),
    Remind = require("../models/Remind.model"),
    Server = require("../models/Server.model"),
    Star = require("../models/Star.model"),
    Tag = require("../models/Tag.model"),
    User = require("../models/User.model"),
    config = require("../config/config.json"),
    mongoose = require("mongoose"),
    u = require("./utils");


const serverSettings = new Map(),
    { Collection } = require("discord.js");

mongoose.connect(config.db.db, config.db.settings);

const models = {
    infraction: {
        getSummary: (userId, time = 28) => {
            return new Promise((fulfill, reject) => {
                let since = new Date(Date.now() - (time * 24 * 60 * 60 * 1000));
                Infraction.find({ discordId: userId, timestamp: { $gte: since } }, (err, records) => {
                    if (err) {
                        reject(err);
                    } else {
                        fulfill({
                            userId: userId,
                            count: records.length,
                            points: records.reduce((c, r) => c + r.value, 0),
                            time: time,
                            detail: records
                        });
                    }
                });
            });
        },
        getByFlag: (flag) => {
            return new Promise((fulfill, reject) => {
                if (typeof flag !== "string") flag = flag.id;
                Infraction.findOne({ flag }, (err, inf) => {
                    if (err) reject(err);
                    else fulfill(inf);
                });
            });
        },
        save: (data) => {
            return new Promise((fulfill, reject) => {
                let record = new Infraction({
                    discordId: (data.discordId || data.userId),
                    channel: data.channel,
                    message: data.message,
                    flag: data.flag,
                    value: data.value,
                    description: data.description,
                    mod: data.mod,
                    rolesRemovedByDiscipline: data.rolesRemovedByDiscipline,
                    rolesAddedByDiscipline: data.rolesAddedByDiscipline,

                });

                record.save((err, inf) => {
                    if (err) reject(err);
                    else fulfill(inf);
                });
            });
        },
        retract: (flag, mod) => {
            return new Promise((fulfill, reject) => {
                if (typeof mod != "string") mod = mod.id;
                if (typeof flag != "string") flag = flag.id;
                Infraction.findOne({ flag, mod }, (err, inf) => {
                    if (err) reject(err);
                    else if (inf) {
                        Infraction.findOneAndDelete({ flag, mod }, (err, doc) => {
                            if (err) reject(err);
                            else fulfill(inf);
                        });
                    } else fulfill(inf);
                });
            });
        },
        update: (id, data) => {
            return new Promise((fulfill, reject) => {
                Infraction.findByIdAndUpdate(id, data, { new: true }, (err, doc) => {
                    if (err) reject(err);
                    else fulfill(doc);
                });
            });
        }
    },
    reminder: {
        complete: (reminder) => {
            return new Promise((fulfill, reject) => {
                Remind.findOneAndRemove({ _id: reminder._id }, (err) => {
                    if (err) reject(err);
                    else fulfill();
                });
            });
        },
        fetchReminders: () => {
            return new Promise((fulfill, reject) => {
                Remind.find({ timestamp: { $lte: new Date() } }, (error, docs) => {
                    if (error) reject(error);
                    else fulfill(docs);
                });
            });
        },
        setReminder: (data) => {
            return new Promise((fulfill, reject) => {
                let reminder = new Remind(data);
                reminder.save((err, doc) => {
                    if (err) reject(err);
                    else fulfill(doc);
                });
            });
        }
    },
    server: {
        addServer: async (guild) => {
            return new Promise((fulfill, reject) => {
                let newServer = new Server({
                    serverId: guild.id,
                    serverName: guild.name
                });
                Server.findOneAndUpdate(
                    { serverId: guild.id },
                    {
                        $set: {
                            channels: {
                                botspam: newServer.channels.botspam || null,
                                announcement: newServer.channels.announcement || null,
                                welcome: newServer.channels.welcome || null,
                                disciplinary: newServer.channels.disciplinary || null,
                                jokeMute: newServer.channels.jokeMute || null,
                                botLogs: newServer.channels.botLogs || null,
                                modLogs: newServer.channels.modLogs || null,
                                blacklist: newServer.channels.blacklist || null,
                            },
                            commands: {
                                blacklist: newServer.commands.blacklist || null,
                            },
                            prefix: newServer.prefix,
                            roles: {
                                admin: newServer.roles.admin || null,
                                trusted: newServer.roles.trusted || null,
                                muted: newServer.roles.muted || null,
                                blinded: newServer.roles.blinded || null,
                                blacklist: newServer.roles.blacklist || null,
                            }
                        }
                    },
                    { upsert: true, new: true },
                    function (err, server) {
                        if (err) reject(err);
                        else {
                            serverSettings.set(server.serverId, server);
                            fulfill(server)
                        };
                    }
                );
            });
        },
        getSetting: (guild, setting) => {
            if (serverSettings.has(guild.id)) return serverSettings.get(guild.id)[setting];
            else {
                models.server.addServer(guild);
                return null;
            }
        },
        saveSetting: (guild, setting, value) => {
            return new Promise((fulfill, reject) => {
                let updateOptions = {};
                updateOptions[setting] = value;
                Server.findOneAndUpdate(
                    { serverId: guild.id },
                    { $set: updateOptions },
                    { upsert: true, new: true },
                    (err, server) => {
                        if (err) reject(err);
                        else {
                            serverSettings.set(server.serverId, server);
                            fulfill(server)
                        };
                    }
                );
            });
        }
    },
    starboard: {
        denyStar: (starId) => {
            return new Promise((fulfill, reject) => {
                Star.findOneAndUpdate({ starId }, { $set: { deny: true } }, (err, doc) => {
                    if (err) reject(err);
                    else fulfill(doc);
                });
            });
        },
        fetchStar: (starId) => {
            return new Promise((fulfill, reject) => {
                Star.findOne({ starId }, (error, star) => {
                    if (error) reject(error);
                    else fulfill(star);
                });
            });
        },
        fetchMessage: (messageId) => {
            return new Promise((fulfill, reject) => {
                Star.findOne({ messageId }, (e, star) => {
                    if (e) reject(e);
                    else fulfill(star);
                });
            });
        },
        saveStar: (message, starpost) => {
            return new Promise((fulfill, reject) => {
                let newStar = new Star({
                    author: message.author.id,
                    messageId: message.id,
                    channelId: message.channel.id,
                    boardId: starpost.channel.id,
                    starId: starpost.id,
                    deny: false,
                    timestamp: message.createdAt
                });
                newStar.save((e, star) => {
                    if (e) reject(e);
                    else fulfill(star);
                });
            });
        },
        approveStar: (star1, star2) => {
            return new Promise((fulfill, reject) => {
                Star.findOneAndUpdate(
                    { starId: star1.id },
                    { $set: { starId: star2.id } },
                    (error, doc) => {
                        if (error) reject(error);
                        else fulfill(doc);
                    }
                );
            });
        }
    },
    tags: {
        addTag: (data) => {
            return new Promise((fulfill, reject) => {
                Tag.findOneAndUpdate(
                    { serverId: data.serverId, tag: data.tag },
                    { $set: { serverName: data.serverName, response: data.response, attachment: data.attachment } },
                    { upsert: true, new: true },
                    function (err, cmd) {
                        if (err) reject(err);
                        else {
                            if (cmd.attachment) {
                                let fs = require("fs");
                                let request = require("request");
                                request(data.url).pipe(fs.createWriteStream(process.cwd() + "/storage/" + cmd._id));
                            }
                            fulfill(cmd);
                        }
                    }
                );
            });
        },
        fetchTags: (data = {}) => {
            return new Promise((fulfill, reject) => {
                Tag.find(data, function (err, cmds) {
                    if (err) reject(err);
                    else fulfill(cmds);
                });
            });
        },
        removeTag: (guild, tag) => {
            return new Promise((fulfill, reject) => {
                Tag.findOneAndRemove(
                    { serverId: guild.id, tag: tag },
                    function (err, cmd) {
                        if (err) reject(err);
                        else fulfill(cmd);
                    }
                );
            });
        }
    },
    user: {
        addStars: (stars) => {
            return new Promise((fulfill, reject) => {
                let updates = [];
                for (var x in stars) {
                    updates.push(new Promise((f, r) => {
                        User.findOneAndUpdate(
                            { discordId: x },
                            { $inc: { stars: stars[x] } },
                            { new: true },
                            (err, newUser) => {
                                if (err) r(err);
                                else f(newUser);
                            }
                        );
                    }));
                }

                Promise.all(updates).then(responses => {
                    fulfill(true);
                }).catch(reject);
            });
        },
        addXp: (users) => {
            users = Array.from(users.values());
            let response = { users: [], xp: 0 };
            if (users.length == 0) return Promise.resolve(response);
            else return new Promise((fulfill, reject) => {
                let xp = Math.floor(Math.random() * 11) + 15;
                response.xp = xp;
                User.updateMany(
                    { discordId: { $in: users } },
                    { $inc: { posts: 1 } },
                    { new: true, upsert: true },
                    (err, allUsersMod) => {
                        if (err) reject(err);
                        else {
                            User.updateMany(
                                { discordId: { $in: users }, excludeXP: false },
                                { $inc: { XP: xp } },
                                { new: true, upsert: false },
                                (err, rankUsersMod) => {
                                    if (err) reject(err);
                                    else {
                                        User.find(
                                            { discordId: { $in: users } },
                                            (error, userDocs) => {
                                                if (error) reject(error);
                                                else {
                                                    response.users = userDocs;
                                                    fulfill(response);
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    }
                );
            });
        },
        fetchRankings: (limit = 50, page = 1) => {
            return new Promise((fulfill, reject) => {
                User.find({ excludeXP: false })
                    .sort({ XP: -1 })
                    .skip(limit * (page - 1))
                    .limit(limit)
                    .exec((err, docs) => {
                        if (err && (Object.keys(err).length > 0)) reject(err);
                        else fulfill(docs);
                    });
            });
        },
        fetchStarRankings: (limit = 50, page = 1) => {
            return new Promise((fulfill, reject) => {
                User.find({ stars: { $gt: 0 }, posts: { $gt: 0 } })
                    .sort({ XP: -1 })
                    .exec((err, docs) => {
                        if (err && (Object.keys(err).length > 0)) reject(err);
                        else {
                            docs = docs.map(u => { u.quality = Math.floor(1000 * u.stars / u.posts); return u; }).sort((a, b) => { return ((b.stars / b.posts) - (a.stars / a.posts)); });
                            fulfill(docs);
                        }
                    });
            });
        },
        fetchUser: (user) => {
            return new Promise((fulfill, reject) => {
                if ((typeof user) != "string") user = user.id;

                User.findOne({ discordId: user }, (error, userDoc) => {
                    if (error) reject(error);
                    else fulfill(userDoc);
                });
            });
        },
        findLifetimeRank: (user) => {
            return new Promise((fulfill, reject) => {
                if ((typeof user) != "string") user = user.id;

                User.findOne({ discordId: user }, (error, userDoc) => {
                    if (error) reject(error);
                    else {
                        User.countDocuments({ XP: { "$gt": userDoc.XP } }, (e, userRank) => {
                            if (e) reject(e);
                            else {
                                userDoc.rank = userRank + 1;
                                fulfill(userDoc);
                            }
                        });
                    }
                });
            });
        },
        getUsers: (options) => {
            return new Promise((fulfill, reject) => {
                User.find(options, (error, userDocs) => {
                    if (error) reject(error);
                    else fulfill(userDocs);
                });
            });
        },
        newUser: (user) => {
            if ((typeof user) != "string") user = user.id;
            User.findOne({ discordId: user }, (err, doc) => {
                if (err) console.error(err);
                else if (!doc) {
                    let newMember = new User({
                        discordId: user,
                        concernScore: 0,
                        concernScoreLastHour: 0,
                        aliases: null,
                        lastGoodMorning: null,
                        wantsGoodMorningMessages: false,
                        birthday: null,
                        XP: 0,
                        posts: 0,
                        stars: 0,
                        isGloballyBlacklisted: false,
                        excludeXP: false,
                        roles: [],
                        items: []
                    });
                    newMember.save((err, doc) => {
                        if (err) console.error(err);
                        else u.log("New Member Saved: " + doc.discordId);
                    });
                }
            });
        },
        resetXP: () => {
            return new Promise((fulfill, reject) => {
                User.updateMany(
                    {},
                    { XP: 0 },
                    { new: true, upsert: true },
                    (err, users) => {
                        if (err) reject(err);
                        else fulfill(users);
                    }
                );
            });
        },
        update: (member, options) => {
            return new Promise((fulfill, reject) => {
                if ((typeof user) != "string") member = member.id;

                User.findOne({ discordId: member }, (err, user) => {
                    if (err) reject(err);
                    else if (user) {
                        user.set(options);
                        user.save((err, newUser) => {
                            if (err) reject(err);
                            else fulfill(newUser);
                        });
                    } else fulfill(null);
                });
            });
        },
        updateRoles: (member) => {
            return new Promise((fulfill, reject) => {
                User.findOne({ discordId: member.id }, (err, user) => {
                    if (user && member && member.roles && member.roles.cache) {
                        user.set({ roles: Array.from(member.roles.cache.keys()) });
                        user.save((err, newUser) => {
                            if (err) reject(err);
                            else fulfill(newUser);
                        });
                    }
                });
            });
        }
    },
    init: (bot) => {
        bot.guilds.cache.forEach((guild) => {
            Server.findOne({ serverId: guild.id }, (e, server) => {
                if (!e && server) {
                    serverSettings.set(server.serverId, server);
                } else {
                    models.server.addServer(guild).then(server => {
                        serverSettings.set(server.serverId, server);
                    });
                }
            });
        });
        bot.users.cache.forEach((cachedUser) => {
            User.findOne({ discordId: cachedUser.id }, (err, user) => {
                if (!err && user) {
                    models.user.update(user, cachedUser)
                } else {
                    models.user.newUser(cachedUser);
                }
            })
        })
    }
};

module.exports = models;