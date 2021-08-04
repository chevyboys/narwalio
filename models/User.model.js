var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    discordId: String,
    discordUsername: String,
    aliases: [String],
    concernScore: Number,
    concernScoreLastHour: Number,
    wantsGoodMorningMessage: {
        type: Boolean,
        default: false
    },
    lastGoodMorning: String,
    birthday: String,
    XP: {
        type: Number,
        default: 0
    },
    posts: {
        type: Number,
        default: 0
    },
    stars: {
        type: Number,
        default: 0
    },
    isGloballyBlacklisted: {
        type: Boolean,
        default: false
    },
    excludeXP: {
        type: Boolean,
        default: false
    },
    roles: [String],
});

module.exports = mongoose.model("User", UserSchema);