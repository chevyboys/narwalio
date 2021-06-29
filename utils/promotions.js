const {Collection} = require("discord.js");

const Cass = {
  Staff: {
    Author: {
      base: "819035057679368232",
      colors: "830197401683623966",
    },
    DiscordHead: {
      base: "819034701209141298",
      colors: "830197320191705128",
    },
    Admin: {
      base: "819031079298138187",
      colors: "830197226444947456",
    },
    Moderator: {
      base: "819035372390449193",
      colors: "830197032207253581",
    },
    Team: {
      base: "849748022786129961",
      colors: "849748196742004836",
      MinecraftTeam: {
          lead: "858906278549520384",
          member: "858917608857927704",
      },
    },
    CasstMember: {
      base: "819037285231755265",
      colors: "830195058694160384",
    },
  },
  Patreon: {
    MrGenieClub: {
      base: "819036592173219841",
      colors: "830195229231153173",
    },
    ThornroseClub: {
      base: "819036460929384489",
      colors: "830195590171983883",
    },
    FifionahClub: {
      base: "819035956254474240",
      colors: "830195427411492894",
    },
    ServerBooster: {
      base: "833852680581152828",
      colors: "833853524101955595",
    },
    FeaturedFanArtist: {
      base: "839869129682059316",
      colors: "839869290504126476",
    },
    FanArtist: {
      base: "839876210803867658",
      colors: "839876367599534091",
    },
  },
}
const inventory = new Collection([//base / color / seasonal
  //Cass Kingdom roles
    //Staff
    [Cass.Staff.Author.base, [Cass.Staff.DiscordHead.base, Cass.Staff.Admin.base]],
    [Cass.Staff.DiscordHead.base, [Cass.Staff.DiscordHead.base, Cass.Staff.Admin.base]],
    [Cass.Staff.Admin.base, [Cass.Staff.Moderator.base, Cass.Staff.Team.base, Cass.Staff.Team.MinecraftTeam.lead, Cass.Staff.Team.MinecraftTeam.member, Cass.Staff.CasstMember.base, Cass.Patreon.FeaturedFanArtist.base, Cass.Patreon.FanArtist.base]],
    [Cass.Staff.Team.MinecraftTeam.lead, [Cass.Staff.Team.MinecraftTeam.member]],
]);

module.exports = inventory;