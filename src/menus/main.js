const TelegrafInlineMenu = require("telegraf-inline-menu");

const startHandler = require("../controllers/startHandler");
const profileMenu = require("./profile");
const challengesMenu = require("./challenges");

const mainMenu = new TelegrafInlineMenu(startHandler);

mainMenu.setCommand(["start", "menu"]);

mainMenu.submenu("Профиль", "profile", profileMenu);
mainMenu.submenu("Споры", "challenges", challengesMenu);

module.exports = mainMenu;
