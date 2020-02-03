const TelegrafInlineMenu = require("telegraf-inline-menu");

const profileMenu = require("./profile");
const challengesMenu = require("./challenges");

const mainMenu = new TelegrafInlineMenu("Главное меню");

mainMenu.setCommand("menu");

mainMenu.submenu("Профиль", "profile", profileMenu);
mainMenu.submenu("Споры", "challenges", challengesMenu);

module.exports = mainMenu;
