const { getDataFromDB, setDataFromDB, logError } = require("../utils");
const { USERS_WITH_SPEC_ROLES, ROLES } = require("../constants");

const getHelloMessage = user =>
  `Привет, @${user.username}. Введи /menu, чтобы открыть главное меню.`;

const getNewUser = user => {
  const newUser = {
    ...user,
    ...(USERS_WITH_SPEC_ROLES[user.username] || {
      kingdoms: 10,
      role: ROLES.USER
    }),
    wins: 0,
    loses: 0
  };

  return newUser;
};

const startHandler = async ctx => {
  try {
    const chat = await ctx.getChat();
    const data = getDataFromDB();
    const currentUser = data.users.find(user => user.id === chat.id);

    if (!currentUser) {
      const newUser = getNewUser(chat);

      const newUsers = [...data.users, newUser];
      const newData = { ...data, users: newUsers };
      setDataFromDB(newData);

      ctx.session.currentUser = newUser;
    } else {
      ctx.session.currentUser = currentUser;
    }

    ctx.scene.leave();

    return ctx.reply(getHelloMessage(chat));
  } catch (e) {
    logError(e, ctx);
  }
};

module.exports = startHandler;
