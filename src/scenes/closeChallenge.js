const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

const { getDataFromDB, setDataFromDB, isBetValid } = require("../utils");

const defaultInlineKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton("выйти...", "leaveScene")
]).extra();

const creatorChoiceInlineKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton("Да", "selectYes"),
  Markup.callbackButton("Нет", "selectNo"),
  Markup.callbackButton("Ничья", "selectNeutral"),
  Markup.callbackButton("выйти...", "leaveScene")
]).extra();

const closeChallenge = new Scene("closeChallenge");

closeChallenge.enter(async ctx => {
  const chat = await ctx.getChat();
  const { users } = getDataFromDB();
  const currentUser = users.find(user => user.id === chat.id);

  ctx.scene.state = {
    closeChallenge: { result: null, isClosed: false },
    currentUser
  };

  return ctx.reply(`Выберите исход спора:`, creatorChoiceInlineKeyboard);
});

closeChallenge.action("selectYes", ctx => {
  ctx.scene.state.closeChallenge.result = "yes";
  ctx.scene.state.closeChallenge.isClosed = true;
  ctx.answerCbQuery('Выбрано "Да"');

  return ctx.scene.leave();
});

closeChallenge.action("selectNo", ctx => {
  ctx.scene.state.closeChallenge.result = "no";
  ctx.scene.state.newChallenge.isClosed = true;
  ctx.answerCbQuery('Выбрано "Нет"');

  return ctx.scene.leave();
});

closeChallenge.action("selectNeutral", ctx => {
  ctx.scene.state.joinChallenge.result = "neutral";
  ctx.scene.state.newChallenge.isClosed = true;
  ctx.answerCbQuery('Выбрано "Ничья"');

  return ctx.scene.leave();
});

closeChallenge.leave(ctx => {
  if (!ctx.scene.state.closeChallenge.isClosed) {
    ctx.scene.state = {};

    return ctx.reply("Введите /menu, чтобы вывести главное меню.");
  }

  const { closeChallenge } = ctx.scene.state;
  const currentActiveChallenge = ctx.session.selectedChallenge;
  const { activeChallenges, closedChallenges, users } = getDataFromDB();

  const newClosedChallenge = {
    ...currentActiveChallenge,
    isFinished: true,
    result: closeChallenge.result
  };

  const newActiveChallenges = activeChallenges.filter(
    challenge => challenge.id !== newClosedChallenge.id
  );
  const newClosedChallenges = [...closedChallenges, newClosedChallenge];

  const newUsers = users.map(user => {
    const winCurrentUser = newClosedChallenge.sides.yes.find(
      u => u.id === user.id
    );
    const loseCurrentUser = newClosedChallenge.sides.no.find(
      u => u.id === user.id
    );

    if (
      (winCurrentUser || loseCurrentUser) &&
      newClosedChallenge.result === "neutral"
    ) {
      ctx.telegram.sendMessage(
        winCurrentUser ? winCurrentUser.id : loseCurrentUser.id,
        `Спор "${newClosedChallenge.name} закончился ничьей."`
      );

      return {
        ...user,
        loses: user.loses + 1
      };
    }

    if (winCurrentUser) {
      ctx.telegram.sendMessage(
        winCurrentUser.id,
        `Вы победили в споре "${
          newClosedChallenge.name
        }". Вы получаете ${winCurrentUser.bet * 2} царств.`
      );

      return {
        ...user,
        kingdoms:
          newClosedChallenge.result === "yes"
            ? user.kingdoms + winCurrentUser.bet * 2
            : user.kingdoms,
        wins: newClosedChallenge.result === "yes" ? user.wins + 1 : user.wins,
        loses: newClosedChallenge.result === "yes" ? user.loses : user.loses + 1
      };
    }

    if (loseCurrentUser) {
      ctx.telegram.sendMessage(
        winCurrentUser.id,
        `Вы проиграли в споре "${
          newClosedChallenge.name
        }". Вы получаете ${winCurrentUser.bet * 2} царств.`
      );

      return {
        ...user,
        kingdoms:
          newClosedChallenge.result === "no"
            ? user.kingdoms + winCurrentUser.bet * 2
            : user.kingdoms,
        wins: newClosedChallenge.result === "no" ? user.wins + 1 : user.wins,
        loses: newClosedChallenge.result === "no" ? user.loses : user.loses + 1
      };
    }

    return user;
  });

  const newData = {
    users: newUsers,
    activeChallenges: newActiveChallenges,
    closedChallenges: newClosedChallenges
  };

  setDataFromDB(newData);

  ctx.session.selectedChallenge = null;
  ctx.scene.state = {};

  return ctx.reply(
    "Вы закрыли спор. Введите /menu, чтобы вывести главное меню."
  );
});

module.exports = closeChallenge;
