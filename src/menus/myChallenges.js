const TelegrafInlineMenu = require("telegraf-inline-menu");

const {
  getDataFromDB,
  formatChallengeInfo,
  formatDetailChallengeInfo,
  logError,
  getCurrentUser
} = require("../utils");

const filterActiveChallenges = (activeChallenges, currentUser) =>
  activeChallenges.filter(
    ({ sides }) =>
      sides.yes.find(({ id }) => id === currentUser.id) ||
      sides.no.find(({ id }) => id === currentUser.id)
  );

const myChallengesMenu = new TelegrafInlineMenu(async ctx => {
  try {
    const { activeChallenges } = getDataFromDB();
    const chat = await ctx.getChat();
    const currentUser = getCurrentUser(chat);

    const filteredActiveChallenges = filterActiveChallenges(
      activeChallenges,
      currentUser
    );

    ctx.session.selectedChallenge = null;

    return filteredActiveChallenges.length === 0
      ? "На данный момент вы ни с кем не спорите."
      : `
Список споров:
${filteredActiveChallenges
  .map((activeChallenge, i) => formatChallengeInfo(activeChallenge, i + 1))
  .join("\n")}
  `;
  } catch (e) {
    logError(e, ctx);

    return "ОшибОЧКА.";
  }
});

const challengeMenu = new TelegrafInlineMenu(ctx => {
  try {
    const { activeChallenges } = getDataFromDB();
    const currentActiveChallenge = activeChallenges.find(
      ({ id }) => ctx.match[1] === id
    );

    if (!currentActiveChallenge) {
      return "К сожалению, этого спора больше нет.";
    }

    ctx.session.selectedChallenge = currentActiveChallenge;

    return formatDetailChallengeInfo(currentActiveChallenge);
  } catch (e) {
    logError(e, ctx);

    return "ОшибОЧКА.";
  }
});

challengeMenu.simpleButton("Закрыть спор", "closeChallenge", {
  doFunc: ctx => {
    ctx.scene.enter("closeChallenge");
    return ctx.answerCbQuery();
  }
});

myChallengesMenu.selectSubmenu(
  "challenge",
  async ctx => {
    const { activeChallenges } = getDataFromDB();
    const chat = await ctx.getChat();
    const currentUser = getCurrentUser(chat);

    const filteredActiveChallenges = filterActiveChallenges(
      activeChallenges,
      currentUser
    );

    return filteredActiveChallenges.map(challenge => challenge.id);
  },
  challengeMenu,
  {
    textFunc: (ctx, key) => {
      const { activeChallenges } = getDataFromDB();

      const index =
        activeChallenges.indexOf(
          activeChallenges.find(({ id }) => key === id)
        ) + 1;

      return `#${index}`;
    },
    columns: 2
  }
);

module.exports = myChallengesMenu;
