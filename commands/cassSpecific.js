const Augur = require("augurbot");
const u = require('../utils/utils');
const Module = new Augur.Module();

let baseroles = ["821550399068438589",
"821550724331995147",
"821552048121446421",
"821552774638206986", //journeyman
 "821552923082227712",
 "821557037539917865",
 "821553387878613012", // baron
 "821553717777530920",  // viscount
 "821554000208855050", // earl
 "821554647600332850", // duke
 "821554790697664533",];
let colors = `#04739a
#2875a8
#4776b2
#6675b9
#8473bc
#a16fb9
#bb6bb1
#d267a5
#e56595
#f26782
#fa6e6e`.split("\n");
async function makeRoles(msg, sfx) {
    let returner = [];
    for (const baseRole of baseroles) {
        let roleName = msg.guild.roles.fetch(baseRole);
        roleName.then(roleName => {
            let newRole = msg.guild.roles.create({
                data: {
                    name: `${roleName.name} Seasonal Colors`,
                    color: colors[baseroles.indexOf(baseRole)],
                    permissions: [],
                }
            })
            msg.channel.send(newRole);
        })
    };
    return returner;
} 



Module
    .addCommand({
        name: "mr", // required
        hidden: true, // optional
        permissions: (msg) => config.adminId.includes(msg.author.id) || config.ownerId == msg.author.id, // optional
        process: async (msg, suffix) => {
                msg.channel.send(makeRoles(msg, suffix).toString());
            u.log(msg);
        }, // required
    });
module.exports = Module;