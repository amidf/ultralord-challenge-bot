const TelegrafInlineMenu = require("telegraf-inline-menu");
const Moment = require("moment");

const { getDataFromDB, setDataFromDB } = require("../utils");

const myChallengesMenu = new TelegrafInlineMenu(async ctx => {
  const chat = await ctx.getChat();
  const { users, activeChallenges } = getDataFromDB();
  const currentUser = users.find(user => user.id === chat.id);
  ctx.session.selectedChallenge = null;
  ctx.session.currentUser = currentUser;

  const filteredChallenges = activeChallenges.filter(
    ({ sides }) =>
      sides.yes.find(({ id }) => id === currentUser.id) ||
      sides.yes.find(({ id }) => id === currentUser.id)
  );

  return filteredChallenges.length === 0
    ? "На данный момент вы ни с кем не спорите."
    : `
Список споров:
${filteredChallenges
  .map(({ name, sides, createdTime, creatorId }, i) => {
    const author = users.find(user => user.id === creatorId);

    return `
#${i + 1}: ${name} (${sides.yes.length + sides.no.length} человек)
Создал @${author.username} ${Moment(createdTime).format("DD/MM/YYYY HH:mm")}
  `;
  })
  .join("\n")}
  `;
});

const challengeMenu = new TelegrafInlineMenu(ctx => {
  const { users, activeChallenges } = getDataFromDB();
  const currentActiveChallenge = activeChallenges.find(
    ({ id }) => ctx.match[1] === id
  );

  if (!currentActiveChallenge) {
    return "К сожалению, этого спора больше нет.";
  }

  ctx.session.selectedChallenge = currentActiveChallenge;

  return `
Информация о споре "${currentActiveChallenge.name}"

Создал @${
    users.find(user => user.id === currentActiveChallenge.creatorId).username
  }
Дата создания: ${Moment(currentActiveChallenge.createdTime).format(
    "DD/MM/YYYY HH:mm"
  )}

Сторона "Да":
${currentActiveChallenge.sides.yes.map(user => `@${user.username}`).join("\n")}
  
Сторона "Нет":
${currentActiveChallenge.sides.no.map(user => `@${user.username}`).join("\n")}
  `;
});

challengeMenu.simpleButton("Закрыть спор", "closeChallenge", {
  doFunc: ctx => {
    ctx.scene.enter("closeChallenge");
  }
});

myChallengesMenu.selectSubmenu(
  "challenge",
  ctx => {
    const { activeChallenges } = getDataFromDB();
    const { currentUser } = ctx.session;

    const filteredChallenges = activeChallenges.filter(
      ({ sides }) =>
        sides.yes.find(({ id }) => id === currentUser.id) ||
        sides.yes.find(({ id }) => id === currentUser.id)
    );

    return filteredChallenges.map(challenge => challenge.id);
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
