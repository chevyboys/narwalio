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
  LevelRewards:{
    Serf:{
      base: "821550399068438589",
      colors: "830186517561081877",
      seasonalColors: "840400688877404190",
    },
    Commoner:{
      base: "821550724331995147",
      colors: "830186630874660864",
      seasonalColors: "840400689514676234",
    },
    Apprentice:{
      base: "821552048121446421",
      colors: "830186949192319006",
      seasonalColors: "840400690537955348",
    },
    Journeyman:{
      base: "821552774638206986",
      colors: "830187184551362611",
      seasonalColors: "840400691168149506",
    },
    Tradesman:{
      base: "821552923082227712",
      colors: "830187302772801626",
      seasonalColors: "840400691860209675",
    },
    Noble:{
      base: "821557037539917865",
      colors: "830187385739280445",
      seasonalColors: "840400693058863184",
    },
    Baron:{
      base: "821553387878613012",
      colors: "830187463565508693",
      seasonalColors: "840400693771894825",
    },
    Viscount:{
      base: "821553717777530920",
      colors: "830187534452785182",
      seasonalColors: "840400695311204362",
    },
    Earl:{
      base: "821554000208855050",
      colors: "830187629509083156",
      seasonalColors: "840400696423088138",
    },
    Duke:{
      base: "821554647600332850",
      colors: "830187703248093255",
      seasonalColors: "840400697291571270",
    },
    Prince:{
      base: "821554790697664533",
      colors: "830187798928556123",
      seasonalColors: "840400697912852520",
    },

  }
}
const inventory = new Collection([//base / color / seasonal
  ["828822226333073468", ["802367780942643251"]], // Founder
  ["686804730453819404",  ["828812391131119656"]], // Admin
  ["823300415389958186", ["828813985952038962"]], // Emporer
  ["828814290491670548",  ["817540499254411274"]], // Princess
  ["668515977448914965",  ["828847293155377173"]], // Villain
//level up colors
  ["821570582746497074",["828829690730250262","828841754110853130"]],//Duke
  ["821570259915505664",["828829690352762920","828841753494159380"]],//Count
  ["821570024216068136",["828829689522683957","828841752793972736"]],//Earl
  ["821569798588465202",["828829689169575986","828841752285937694"]],//Viscount
  ["821569549887340595",["828829688335040533","828841751729012746"]],//Baron
  ["821569352758329405",["828829686892331029","828841751144955954"]],//Merchant
  ["821569084189048912",["828829686079160340","828841750214082592"]],//Craftsmen
  ["821568876398903297",["828829685243969596","828841749727150081"]],//Journey Man
  ["821568660002177024",["828829684333936640","828841749166030879"]],//Apprentice colors
  ["821568249073500161",["828829683750666281","828841748532035634"]],//Serf Colors
  //Cass Kingdom
    //Staff
    [Cass.Staff.Author.base, [Cass.Staff.Author.colors]],
    [Cass.Staff.DiscordHead.base, [Cass.Staff.DiscordHead.colors]],
    [Cass.Staff.Admin.base, [Cass.Staff.Admin.colors]],
    [Cass.Staff.Moderator.base, [Cass.Staff.Moderator.colors]],
    [Cass.Staff.Team.base, [Cass.Staff.Team.colors]],
    [Cass.Staff.CasstMember.base, [Cass.Staff.CasstMember.colors]],

    //Patreon / rewards
    [Cass.Patreon.MrGenieClub.base, [Cass.Patreon.FifionahClub.colors, Cass.Patreon.ThornroseClub.colors, Cass.Patreon.MrGenieClub.colors]],   // Mr. Genie Club!
    [Cass.Patreon.ThornroseClub.base, [Cass.Patreon.FifionahClub.colors, Cass.Patreon.ThornroseClub.colors]],   // Thornrose Club!
    [Cass.Patreon.FifionahClub.base, [Cass.Patreon.FifionahClub.colors]],  // Fifionah Club!
    [Cass.Patreon.ServerBooster.base, [Cass.Patreon.ServerBooster.colors]],   //Server Booster
    [Cass.Patreon.FeaturedFanArtist.base, [Cass.Patreon.FeaturedFanArtist.colors]],  //Featured Fan Artist
    [Cass.Patreon.FanArtist.base, [Cass.Patreon.FanArtist.colors]],  //fan artist
    //Level Up
   [Cass.LevelRewards.Serf.base, [Cass.LevelRewards.Serf.colors, Cass.LevelRewards.Serf.seasonalColors]],
   [Cass.LevelRewards.Commoner.base, [Cass.LevelRewards.Serf.colors, Cass.LevelRewards.Commoner.colors, Cass.LevelRewards.Serf.seasonalColors, Cass.LevelRewards.Commoner.seasonalColors]],
   [Cass.LevelRewards.Apprentice.base, [Cass.LevelRewards.Serf.colors, Cass.LevelRewards.Commoner.colors, Cass.LevelRewards.Apprentice.colors, Cass.LevelRewards.Serf.seasonalColors, Cass.LevelRewards.Commoner.seasonalColors, Cass.LevelRewards.Apprentice.seasonalColors]],
   [Cass.LevelRewards.Journeyman.base, [Cass.LevelRewards.Serf.colors, Cass.LevelRewards.Commoner.colors, Cass.LevelRewards.Apprentice.colors,  Cass.LevelRewards.Journeyman.colors,Cass.LevelRewards.Serf.seasonalColors, Cass.LevelRewards.Commoner.seasonalColors, Cass.LevelRewards.Apprentice.seasonalColors, Cass.LevelRewards.Journeyman.seasonalColors]],
   [Cass.LevelRewards.Tradesman.base, [Cass.LevelRewards.Serf.colors, Cass.LevelRewards.Commoner.colors, Cass.LevelRewards.Apprentice.colors,  Cass.LevelRewards.Journeyman.colors, Cass.LevelRewards.Tradesman.colors, Cass.LevelRewards.Serf.seasonalColors, Cass.LevelRewards.Commoner.seasonalColors, Cass.LevelRewards.Apprentice.seasonalColors, Cass.LevelRewards.Journeyman.seasonalColors, Cass.LevelRewards.Tradesman.seasonalColors]],
   [Cass.LevelRewards.Noble.base, [Cass.LevelRewards.Serf.colors, Cass.LevelRewards.Commoner.colors, Cass.LevelRewards.Apprentice.colors,  Cass.LevelRewards.Journeyman.colors, Cass.LevelRewards.Tradesman.colors, Cass.LevelRewards.Noble.colors, Cass.LevelRewards.Serf.seasonalColors, Cass.LevelRewards.Commoner.seasonalColors, Cass.LevelRewards.Apprentice.seasonalColors, Cass.LevelRewards.Journeyman.seasonalColors, Cass.LevelRewards.Tradesman.seasonalColors, Cass.LevelRewards.Noble.seasonalColors,]], 
   [Cass.LevelRewards.Baron.base, [Cass.LevelRewards.Serf.colors, Cass.LevelRewards.Commoner.colors, Cass.LevelRewards.Apprentice.colors,  Cass.LevelRewards.Journeyman.colors, Cass.LevelRewards.Tradesman.colors, Cass.LevelRewards.Noble.colors,  Cass.LevelRewards.Baron.colors, Cass.LevelRewards.Serf.seasonalColors, Cass.LevelRewards.Commoner.seasonalColors, Cass.LevelRewards.Apprentice.seasonalColors, Cass.LevelRewards.Journeyman.seasonalColors, Cass.LevelRewards.Tradesman.seasonalColors, Cass.LevelRewards.Noble.seasonalColors, Cass.LevelRewards.Baron.seasonalColors]],
   [Cass.LevelRewards.Viscount.base,  [Cass.LevelRewards.Serf.colors, Cass.LevelRewards.Commoner.colors, Cass.LevelRewards.Apprentice.colors,  Cass.LevelRewards.Journeyman.colors, Cass.LevelRewards.Tradesman.colors, Cass.LevelRewards.Noble.colors,  Cass.LevelRewards.Baron.colors,  Cass.LevelRewards.Viscount.colors, Cass.LevelRewards.Serf.seasonalColors, Cass.LevelRewards.Commoner.seasonalColors, Cass.LevelRewards.Apprentice.seasonalColors, Cass.LevelRewards.Journeyman.seasonalColors, Cass.LevelRewards.Tradesman.seasonalColors, Cass.LevelRewards.Noble.seasonalColors, Cass.LevelRewards.Baron.seasonalColors,  Cass.LevelRewards.Viscount.seasonalColors]],
   [Cass.LevelRewards.Earl.base, [Cass.LevelRewards.Serf.colors, Cass.LevelRewards.Commoner.colors, Cass.LevelRewards.Apprentice.colors,  Cass.LevelRewards.Journeyman.colors, Cass.LevelRewards.Tradesman.colors, Cass.LevelRewards.Noble.colors,  Cass.LevelRewards.Baron.colors,  Cass.LevelRewards.Viscount.colors, Cass.LevelRewards.Earl.colors, Cass.LevelRewards.Serf.seasonalColors, Cass.LevelRewards.Commoner.seasonalColors, Cass.LevelRewards.Apprentice.seasonalColors, Cass.LevelRewards.Journeyman.seasonalColors, Cass.LevelRewards.Tradesman.seasonalColors, Cass.LevelRewards.Noble.seasonalColors, Cass.LevelRewards.Baron.seasonalColors,  Cass.LevelRewards.Viscount.seasonalColors,  Cass.LevelRewards.Earl.seasonalColors]],
   [Cass.LevelRewards.Duke.base, [Cass.LevelRewards.Serf.colors, Cass.LevelRewards.Commoner.colors, Cass.LevelRewards.Apprentice.colors,  Cass.LevelRewards.Journeyman.colors, Cass.LevelRewards.Tradesman.colors, Cass.LevelRewards.Noble.colors,  Cass.LevelRewards.Baron.colors,  Cass.LevelRewards.Viscount.colors, Cass.LevelRewards.Earl.colors, Cass.LevelRewards.Duke.colors, Cass.LevelRewards.Serf.seasonalColors, Cass.LevelRewards.Commoner.seasonalColors, Cass.LevelRewards.Apprentice.seasonalColors, Cass.LevelRewards.Journeyman.seasonalColors, Cass.LevelRewards.Tradesman.seasonalColors, Cass.LevelRewards.Noble.seasonalColors, Cass.LevelRewards.Baron.seasonalColors,  Cass.LevelRewards.Viscount.seasonalColors,  Cass.LevelRewards.Earl.seasonalColors, Cass.LevelRewards.Duke.seasonalColors]],
   [Cass.LevelRewards.Prince.base, [Cass.LevelRewards.Serf.colors, Cass.LevelRewards.Commoner.colors, Cass.LevelRewards.Apprentice.colors,  Cass.LevelRewards.Journeyman.colors, Cass.LevelRewards.Tradesman.colors, Cass.LevelRewards.Noble.colors,  Cass.LevelRewards.Baron.colors,  Cass.LevelRewards.Viscount.colors, Cass.LevelRewards.Earl.colors, Cass.LevelRewards.Duke.colors, Cass.LevelRewards.Prince.colors, Cass.LevelRewards.Serf.seasonalColors, Cass.LevelRewards.Commoner.seasonalColors, Cass.LevelRewards.Apprentice.seasonalColors, Cass.LevelRewards.Journeyman.seasonalColors, Cass.LevelRewards.Tradesman.seasonalColors, Cass.LevelRewards.Noble.seasonalColors, Cass.LevelRewards.Baron.seasonalColors,  Cass.LevelRewards.Viscount.seasonalColors,  Cass.LevelRewards.Earl.seasonalColors, Cass.LevelRewards.Duke.seasonalColors, Cass.LevelRewards.Prince.seasonalColors]],
]);

module.exports = inventory;