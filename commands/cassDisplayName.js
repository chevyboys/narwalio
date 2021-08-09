const Augur = require("augurbot"),
  moment = require("moment"),
  u = require("../utils/utils");
const Module = new Augur.Module();


const cassKingdom = "819031079104151573";
const suffixRoles = [
 ["819031079298138187", "Admin"],
 ["819035372390449193", "Mod"],
 ["849748022786129961", "Team"],
]
const birbCursedRole = "867524884350238780";
const crownRole = "";
const birthdayPeepRole = "874365292808110140";

const indicatorSymbols = [
	{ emoji: "🍰",
		qualifies: (member) => {
			if(member.roles.cache.has(birthdayPeepRole)) return true;
			return false;
		}
	},
  { emoji: "▲",
		qualifies: (member) => {
			if(member.roles.cache.has(birbCursedRole)) return true;
			return false;
		}
	},

	{ emoji: "👑",
		qualifies: (member) => {
			if(crownRole != "" && member.roles.cache.has(crownRole)) return true;
			return false;
		}
	},
]

let isCKMember = (member) => {
  if(!member.guild || member.guild.id != cassKingdom) return false;
  return true;
}
let CKnick = {
  getMemberTitle: (member) => {
    if(!isCKMember(member)) return null;
    for (const role of staffRoles) {
      if (member.roles.cache.has(role[0])) {
       return ` | ${role[1]}`;
      }
    }
		return "";
  },
  getMemberSymbol: (member) => {
		if(!isCKMember(member)) return null;
    for (const symbol of indicatorSymbols) {
      if (symbol.qualifies(member)) {
       return symbol.emoji;
      }
     }
    	return "";
  },
  getMemberBaseName: (member) => {
		if(!isCKMember(member)) return null;
    let baseName = member.displayName.trim();
		if (baseName.indexOf("|") > -1) {
        baseName = member.displayName.substr(0, member.displayName.indexOf("|"));
    }
		for (const symbol of indicatorSymbols) {
      if(baseName.indexOf(symbol.emoji) > -1) {
					baseName = baseName.replaceAll(symbol.emoji, "");
				}
     }
		return baseName.trim();
  },
	getCorrectNickName: (member) => {
  	if(!isCKMember(member)) return null;
		let maxBaseNameLength = 32;
		let namePrefix = `${CKnick.getMemberSymbol(member)}`;
    let nameSuffix = `${CKnick.getMemberSymbol(member)}${CKnick.getMemberTitle(member)}`;
		maxBaseNameLength -= (namePrefix.length + nameSuffix.length);
		let baseName = CKnick.getMemberBaseName(member);
		if(baseName.length > maxBaseNameLength){
    	baseName = baseName.subStr(0, maxBaseNameLength);
		}
		return `${namePrefix}${baseName}${nameSuffix}`;
	},
};

Module.addEvent("guildMemberUpdate", (oldMember, newMember) => {
	if(!isCKMember(newMember) || newMember.user.bot || !newMember.manageable || !newMember.displayName) return;
  if(newMember.displayName == CKnick.getCorrectNickName(newMember)) return;
  try {
    newMember.setNickname(CKnick.getCorrectNickName(newMember));
  } catch (error) {
    console.log(error);
  }
});
module.exports = Module;
