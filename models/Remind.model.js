var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RemindSchema = new Schema({
    discordId: String,
    reminder: String,
    timestamp: Date,
    commandToExecute: String
});

module.exports = mongoose.model("Remind", RemindSchema);