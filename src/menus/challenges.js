const TelegrafInlineMenu = require("telegraf-inline-menu");

const challengesListMenu = require("./challengesList");
const myChallengesMenu = require("./myChallenges");

const challengesMenu = new TelegrafInlineMenu("Выберите действие");

challengesMenu.simpleButton("Создать спор", "createChallenge", {
  doFunc: ctx => {
    ctx.scene.enter("createChallenge");
    return ctx.answerCbQuery();
  }
});

challengesMenu.submenu(
  "Присоединиться к спору",
  "challengesList",
  challengesListMenu
);

challengesMenu.submenu("Мои споры", "myChallenges", myChallengesMenu);

module.exports = challengesMenu;
