const { AugurClient } = require("augurbot");
const config = require("./config/config.json");
u = require("./utils/utils");
const colors = require('colors');

let EtuConfig = config;
EtuConfig.token = config.EtuToken;
const EtuClient = new AugurClient(EtuConfig, {
    clientOptions: {
        disableMentions: "everyone",
        partials: ["REACTION", "MESSAGE"],
        parse: u.parse,
    },
    commands: "./commands",
    errorHandler: u.errorHandler,
});

EtuClient.once('ready', () => {
    const onStart = require("./utils/on start");
    onStart.onStart(EtuClient);
    EtuClient.categories = config.categories;
    EtuClient.user.setActivity("from the sky", {type: "WATCHING"});
    EtuClient.user.setStatus("idle");
    //prevent accidental name capitalization from breaking things.
    EtuClient.commands.forEach(element => {
        element.name = element.name.toLowerCase();
    });
});
EtuClient.login();
// LAST DITCH ERROR HANDLING
process.on("unhandledRejection", (error, p) => p.catch(e => u.errorHandler(e, "Unhandled Rejection from Etu")));
process.on("uncaughtException", (error) => u.errorHandler(error, "Uncaught Exception from Etu"));

module.exports = EtuClient;