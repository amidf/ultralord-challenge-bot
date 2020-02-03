const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const uuid = require("uuid");

const { getDataFromDB, setDataFromDB, isBetValid } = require("../utils");

const defaultInlineKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton("выйти из меню создания...", "leaveScene")
]).extra();

const creatorChoiceInlineKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton("Да", "selectYes"),
  Markup.callbackButton("Нет", "selectNo"),
  Markup.callbackButton("выйти из меню создания...", "leaveScene")
]).extra();

const createChallenge = new Scene("createChallenge");

createChallenge.enter(async ctx => {
  const chat = await ctx.getChat();
  const { users } = getDataFromDB();
  const currentUser = users.find(user => user.id === chat.id);

  ctx.scene.state = {
    currentUser,
    newChallenge: {
      name: null,
      sides: {
        yes: [],
        no: []
      },
      creatorBet: null,
      isCreated: false
    }
  };

  return ctx.reply(
    `О чём спор? Например, Ника пойдёт завтра в колледж. Лучше, чтобы на название можно было однозначно ответить либо "да", либо "нет"`,
    defaultInlineKeyboard
  );
});

createChallenge.on("text", ctx => {
  const { newChallenge, currentUser } = ctx.scene.state;

  if (newChallenge.name === null) {
    ctx.scene.state.newChallenge.name = ctx.update.message.text;

    return ctx.reply(
      `Введите, сколько царств из ${currentUser.kingdoms} вы готовы поставить?`,
      defaultInlineKeyboard
    );
  }

  if (newChallenge.creatorBet === null) {
    const value = ctx.update.message.text;

    if (isBetValid(value, ctx)) {
      ctx.scene.state.newChallenge.creatorBet = Math.ceil(+value);

      return ctx.reply(
        "Теперь выберите свою сторону в этом споре.",
        creatorChoiceInlineKeyboard
      );
    }

    return ctx.reply("Введите корректное значение!", defaultInlineKeyboard);
  }
});

createChallenge.action("selectYes", ctx => {
  const { currentUser, newChallenge } = ctx.scene.state;

  ctx.scene.state.newChallenge.sides.yes = [
    {
      id: currentUser.id,
      username: currentUser.username,
      bet: newChallenge.creatorBet
    }
  ];
  ctx.scene.state.newChallenge.isCreated = true;
  ctx.answerCbQuery('Выбрано "Да"');

  return ctx.scene.leave();
});

createChallenge.action("selectNo", ctx => {
  const { currentUser, newChallenge } = ctx.scene.state;

  ctx.scene.state.newChallenge.sides.no = [
    {
      id: currentUser.id,
      username: currentUser.username,
      bet: newChallenge.creatorBet
    }
  ];
  ctx.scene.state.newChallenge.isCreated = true;
  ctx.answerCbQuery('Выбрано "Нет"');

  return ctx.scene.leave();
});

createChallenge.leave(ctx => {
  if (!ctx.scene.state.newChallenge.isCreated) {
    ctx.scene.state = {};

    return ctx.reply(
      "Отмена создания спора. Введите /menu, чтобы вывести главное меню."
    );
  }

  const { currentUser } = ctx.scene.state;
  const data = getDataFromDB();
  const newChallenge = {
    id: uuid().slice(0, 8),
    name: ctx.scene.state.newChallenge.name,
    sides: ctx.scene.state.newChallenge.sides,
    creatorId: currentUser.id,
    createdTime: new Date().toISOString()
  };
  const newUsers = data.users.map(user =>
    currentUser.id === user.id
      ? {
          ...user,
          kingdoms: user.kingdoms - ctx.scene.state.newChallenge.creatorBet
        }
      : user
  );

  const newActiveChallenges = [...data.activeChallenges, newChallenge];
  const newData = { users: newUsers, activeChallenges: newActiveChallenges };

  setDataFromDB(newData);

  return ctx.reply(`
Вы создали спор: ${newChallenge.name}.

Сторона "Да":
${newChallenge.sides.yes.map(user => `@${user.username}`).join("\n")}

Сторона "Нет":
${newChallenge.sides.no.map(user => `@${user.username}`).join("\n")}

За победу вы получите ${ctx.scene.state.newChallenge.creatorBet * 2} царств.
`);
});

module.exports = createChallenge;
