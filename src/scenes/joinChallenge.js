const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

const { getDataFromDB, setDataFromDB, isBetValid } = require("../utils");

const defaultInlineKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton("выйти...", "leaveScene")
]).extra();

const creatorChoiceInlineKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton("Да", "selectYes"),
  Markup.callbackButton("Нет", "selectNo"),
  Markup.callbackButton("выйти...", "leaveScene")
]).extra();

const joinChallenge = new Scene("joinChallenge");

joinChallenge.enter(async ctx => {
  const chat = await ctx.getChat();
  const { users } = getDataFromDB();
  const currentUser = users.find(user => user.id === chat.id);

  ctx.scene.state = {
    joinChallenge: { bet: null, choice: null, isJoined: false },
    currentUser
  };

  return ctx.reply(
    `Введите сколько из ${currentUser.kingdoms} царств вы готовы поставить.`,
    defaultInlineKeyboard
  );
});

joinChallenge.on("text", ctx => {
  if (ctx.scene.state.joinChallenge.bet === null) {
    const value = ctx.update.message.text;

    if (isBetValid(value, ctx)) {
      ctx.scene.state.joinChallenge.bet = Math.ceil(+value);

      return ctx.reply(
        "Теперь выберите свою сторону в этом споре.",
        creatorChoiceInlineKeyboard
      );
    }

    return ctx.reply("Введите корректное значение?", defaultInlineKeyboard);
  }
});

joinChallenge.action("selectYes", ctx => {
  ctx.scene.state.joinChallenge.choice = "yes";
  ctx.scene.state.joinChallenge.isJoined = true;
  ctx.answerCbQuery('Выбрано "Да"');

  return ctx.scene.leave();
});

joinChallenge.action("selectNo", ctx => {
  ctx.scene.state.joinChallenge.choice = "no";
  ctx.scene.state.newChallenge.isJoined = true;
  ctx.answerCbQuery('Выбрано "Нет"');

  return ctx.scene.leave();
});

joinChallenge.leave(ctx => {
  if (!ctx.scene.state.joinChallenge.isJoined) {
    ctx.scene.state = {};

    return ctx.reply(
      "Отмена присоединения к спору. Введите /menu, чтобы вывести главное меню."
    );
  }

  const { joinChallenge, currentUser } = ctx.scene.state;
  const currentActiveChallenge = ctx.session.selectedChallenge;
  const { activeChallenges, users } = getDataFromDB();

  const newActiveChallenge = {
    ...currentActiveChallenge,
    sides: {
      ...currentActiveChallenge.sides,
      [joinChallenge.choice]: [
        ...currentActiveChallenge.sides[joinChallenge.choice],
        {
          id: currentUser.id,
          username: currentUser.username,
          bet: joinChallenge.bet
        }
      ]
    }
  };

  const newActiveChallenges = activeChallenges.map(challenge =>
    challenge.id === newActiveChallenge.id ? newActiveChallenge : challenge
  );

  const newUsers = users.map(user =>
    user.id === currentUser.id
      ? { ...user, kingdoms: user.kingdoms - joinChallenge.bet }
      : user
  );

  const newData = { users: newUsers, activeChallenges: newActiveChallenges };

  setDataFromDB(newData);

  ctx.session.selectedChallenge = null;
  ctx.scene.state = {};

  return ctx.reply(
    "Вы присоединились к спору. Введите /menu, чтобы вывести главное меню."
  );
});

module.exports = joinChallenge;
