const path = require("path");
const fs = require("fs");
const Moment = require("moment");

const DB_PATH = path.resolve("db/index.json");

const getDataFromDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");

    return JSON.parse(data);
  } catch (e) {
    throw new Error(e.message);
  }
};

const setDataFromDB = payload => {
  try {
    const data = getDataFromDB();
    const newData = { ...data, ...payload };

    fs.writeFileSync(DB_PATH, JSON.stringify(newData, null, 2));

    return newData;
  } catch (e) {
    throw new Error(e.message);
  }
};

const logError = (e, ctx) => {
  console.error(e);
  ctx.reply("К сожалению, возникла ошибка. Попробуй ещё раз или позже.");
  ctx.scene.leave();
};

const isBetValid = (value, currentUser) => {
  const numericValue = Number(value);

  if (
    !numericValue ||
    numericValue <= 0 ||
    numericValue > currentUser.kingdoms
  ) {
    return false;
  }

  return true;
};

const formatChallengeInfo = (challenge, index) => {
  const { users } = getDataFromDB();
  const author = users.find(user => user.id === challenge.creatorId);

  return `
#${index}: ${challenge.name} (${challenge.sides.yes.length +
    challenge.sides.no.length} человек)
Создал @${author.username} ${Moment(challenge.createdTime).format(
    "DD/MM/YYYY HH:mm"
  )}
  `;
};

const formatDetailChallengeInfo = challenge => {
  const { users } = getDataFromDB();

  return `
Информация о споре "${challenge.name}"

Создал @${users.find(user => user.id === challenge.creatorId).username}
Дата создания: ${Moment(challenge.createdTime).format("DD/MM/YYYY HH:mm")}

Сторона "Да":
${challenge.sides.yes.map(user => `@${user.username}`).join("\n")}
  
Сторона "Нет":
${challenge.sides.no.map(user => `@${user.username}`).join("\n")}
  `;
};

const getCurrentUser = chat => {
  try {
    const { users } = getDataFromDB();
    const currentUser = users.find(user => user.id === chat.id);

    return currentUser;
  } catch (e) {
    throw new Error("Не удалось получить пользователя.");
  }
};

module.exports = {
  getDataFromDB,
  setDataFromDB,
  logError,
  isBetValid,
  formatChallengeInfo,
  formatDetailChallengeInfo,
  getCurrentUser
};
