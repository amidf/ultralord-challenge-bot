const ACCESS_TOKEN = "911918404:AAFIc-oTTDF5-OrK_UqdQ5sRGnxnYovy7N0";
const PORT = process.env.PORT || 3000;
const URL = "https://ultralord-challange-bot.herokuapp.com/";

const ROLES = {
  ULTRALORD: "ultralord",
  DEVELOPER: "developer",
  USER: "user"
};

const USERS_WITH_SPEC_ROLES = {
  quqpe: {
    kingdoms: 1000000,
    role: ROLES.ULTRALORD
  },
  fedinamid: {
    kingdoms: 10,
    role: ROLES.DEVELOPER
  }
};

const IS_PRODUCTION = process.argv[2] === "--production";

module.exports = {
  ACCESS_TOKEN,
  PORT,
  URL,
  ROLES,
  USERS_WITH_SPEC_ROLES,
  IS_PRODUCTION
};
