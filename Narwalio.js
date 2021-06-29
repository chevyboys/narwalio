const { AugurClient } = require("augurbot");
const config = require("./config/config.json");
u = require("./utils/utils");
const colors = require('colors');

const client = new AugurClient(config, {
    clientOptions: {
        disableMentions: "everyone",
        partials: ["REACTION", "MESSAGE"],
        parse: u.parse,
    },
    commands: "./commands",
    errorHandler: u.errorHandler,
});


client.once('ready', () => {
    const onStart = require("./utils/on start");
    onStart.onStart(client);
    client.categories = config.categories;
    //prevent accidental name capitalization from breaking things.
    client.commands.forEach(element => {
        element.name = element.name.toLowerCase();
    });
});


client.login();
// LAST DITCH ERROR HANDLING
process.on("unhandledRejection", (error, p) => p.catch(e => u.errorHandler(e, "Unhandled Rejection")));
process.on("uncaughtException", (error) => u.errorHandler(error, "Uncaught Exception"));

module.exports = client;