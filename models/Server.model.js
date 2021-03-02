var mongoose = require('mongoose'),
    config = require('../config/config.json'),
    Schema = mongoose.Schema;


var ServerSchema = new Schema({
    serverName: String,
    serverId: {
        type: String,
        required: true
    },
    badWords: {
        enabled: {
            type: Boolean,
            default: false,
        },
        ignoredWords: [String],
    },
    channels: {
        botspam: String,
        announcement: String,
        welcome: String,
        disciplinary: String,
        jokeMute: String,
        botLogs: String,
        modLogs: String,
        blacklist: [String],
    },
    commands: {
        blacklist: [String],
    },
    prefix: {
        type: String,
        default: config.prefix
    },
    roles: {
        admin: String,
        trusted: String,
        muted: String,
        blinded: String,
        blacklist: [String],
    },
});

module.exports = mongoose.model('Server', ServerSchema);
