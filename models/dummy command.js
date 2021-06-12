const Augur = require("augurbot");
const u = require('../utils/utils');
const Module = new Augur.Module();
const path = require("path");
const config = require('../config/config.json');
const { Message, MessageEmbed } = require("discord.js");
const fs = require("fs");
const axios = require("axios").default;

Module
    .addCommand({
        name: "dummycommand", // required, must be one word, all lower case
        description: "Describe your command", // recommended
        permissions: (msg) => true, // optional, command will onnly run if this evaluate to true
        process: async (msg, suffix) => {
            u.preCommand(msg)
            //Your code here

            //end your code
            u.postCommand(msg);
        }, // required
    });
module.exports = Module;