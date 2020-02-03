const path = require("path");
const fs = require("fs");

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
};

const isBetValid = (value, ctx) => {
  if (
    !Number(value) ||
    Number(value) <= 0 ||
    Number(value) > ctx.scene.state.currentUser.kingdoms
  ) {
    return false;
  }

  return true;
};

module.exports = {
  getDataFromDB,
  setDataFromDB,
  logError,
  isBetValid
};
