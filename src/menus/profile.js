const TelegrafInlineMenu = require("telegraf-inline-menu");
const Extra = require("telegraf/extra");

const { getDataFromDB, logError } = require("../utils");
const { ROLES } = require("../constants");

const ROLE_MSG = {
  [ROLES.USER]: "К сожалению, ты обычный смертный.",
  [ROLES.DEVELOPER]: "Ты похоже один из разработчиков бота. Похвально.",
  [ROLES.ULTRALORD]: "Ника ты единственная в своём роде."
};

const profileMenu = new TelegrafInlineMenu(async ctx => {
  try {
    const chat = await ctx.getChat();
    const { users } = getDataFromDB();
    const currentUser = users.find(user => user.id === chat.id);

    if (!currentUser) {
      throw new Error("Пользователя не существует.");
    }

    return `
В общем, вот информация о тебе:

*Тебя зовут:* @${currentUser.username};
👑 *Царства:* ${currentUser.kingdoms};
⚔ *Победы:* ${currentUser.wins};
⚔ *Поражения:* ${currentUser.loses};

${ROLE_MSG[currentUser.role]}
    `;
  } catch (e) {
    logError(e, ctx);

    return e.message;
  }
});

module.exports = profileMenu;
