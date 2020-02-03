const { getDataFromDB, setDataFromDB, logError } = require("../utils");
const { USERS_WITH_SPEC_ROLES } = require("../constants");

const getHelloMessage = user => `Привет, @${user.username}`;

const getNewUser = user => {
  const newUser = {
    ...user,
    ...(USERS_WITH_SPEC_ROLES[user.username] || {
      kingdoms: 0,
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
      const newUsers = [...data.users, getNewUser(chat)];
      const newData = { ...data, users: newUsers };
      setDataFromDB(newData);
    }

    ctx.scene.leave();

    return getHelloMessage(chat);
  } catch (e) {
    return "Возникла ошибка. Попробуйте позже.";
  }
};

module.exports = startHandler;
