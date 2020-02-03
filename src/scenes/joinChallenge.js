const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

const {
  getDataFromDB,
  setDataFromDB,
  isBetValid,
  logError,
  getCurrentUser
} = require("../utils");

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
  try {
    const chat = await ctx.getChat();
    const currentUser = getCurrentUser(chat);

    ctx.scene.state = {
      joinChallenge: { bet: null, choice: null, isJoined: false }
    };

    return ctx.reply(
      `Введите сколько из ${currentUser.kingdoms} царств вы готовы поставить.`,
      defaultInlineKeyboard
    );
  } catch (e) {
    logError(e, ctx);
  }
});

joinChallenge.on("text", async ctx => {
  try {
    const chat = await ctx.getChat();
    const currentUser = getCurrentUser(chat);

    if (ctx.scene.state.joinChallenge.bet === null) {
      const value = ctx.update.message.text;

      if (isBetValid(value, currentUser)) {
        ctx.scene.state.joinChallenge.bet = Math.ceil(+value);

        return ctx.reply(
          "Теперь выберите свою сторону в этом споре.",
          creatorChoiceInlineKeyboard
        );
      }

      return ctx.reply("Введите корректное значение?", defaultInlineKeyboard);
    }
  } catch (e) {
    logError(e, ctx);
  }
});

joinChallenge.action("selectYes", ctx => {
  try {
    ctx.scene.state.joinChallenge.choice = "yes";
    ctx.scene.state.joinChallenge.isJoined = true;
    ctx.answerCbQuery('Выбрано "Да"');
  } catch (e) {
    logError(e, ctx);
  }

  return ctx.scene.leave();
});

joinChallenge.action("selectNo", ctx => {
  try {
    ctx.scene.state.joinChallenge.choice = "no";
    ctx.scene.state.newChallenge.isJoined = true;
    ctx.answerCbQuery('Выбрано "Нет"');
  } catch (e) {
    logError(e, ctx);
  }

  return ctx.scene.leave();
});

joinChallenge.leave(async ctx => {
  try {
    if (!ctx.scene.state.joinChallenge.isJoined) {
      return ctx.reply(
        "Отмена присоединения к спору. Введите /menu, чтобы вывести главное меню."
      );
    }

    const { joinChallenge } = ctx.scene.state;
    const chat = await ctx.getChat();
    const currentUser = getCurrentUser(chat);
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

    return ctx.reply(
      "Вы присоединились к спору. Введите /menu, чтобы вывести главное меню."
    );
  } catch (e) {
    logError(e, ctx);
  }
});

module.exports = joinChallenge;
