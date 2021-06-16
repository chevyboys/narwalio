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
            u.preCommand(msg)
                msg.channel.send(makeRoles(msg, suffix).toString());
            u.postCommand(msg);
        }, // required
    }).addEvent("message", (msg) => {
        if (msg.guild.id != "819031079104151573" || msg.author.bot) return;
        let postFix;
        let isStaff = false;
        if (msg.member.roles.cache.has("819031079298138187")){
            postFix = ` | Admin`;
            isStaff = true;
        } else if (msg.member.roles.cache.has("819035372390449193")){
            postFix = ` | Mod`;
            isStaff = true;
        } else if (msg.member.roles.cache.has("849748022786129961")){
            postFix = ` | Team`;
            isStaff = true;
        }

        if(isStaff && msg.member.displayName.indexOf(postFix) < 0){
           
            let newNick = msg.member.displayName;
            if (msg.member.displayName.length + postFix.length > 32) {
                newNick = msg.member.displayName.substr(0, 32 - postFix.length) + postFix;
            } else {
                newNick = msg.member.displayName + postFix;
            }   
            try {
                msg.member.setNickname(newNick);
            } catch (error) {
                console.log(error);
            }
        } else if (msg.member.displayName.indexOf("|") > -1){
            let newNick = msg.member.displayName.substr(0, msg.member.displayName.indexOf("|"));
            try {
                msg.member.setNickname(newNick);
            } catch (error) {
                console.log(error);
            }
        }
    });
module.exports = Module;