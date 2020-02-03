const Telegraf = require("telegraf");
const session = require("telegraf/session");

const { ACCESS_TOKEN, PORT, URL, IS_PRODUCTION } = require("./constants");
const mainMenu = require("./menus/main");
const startHandler = require("./controllers/startHandler");
const stage = require("./scenes");

const bot = new Telegraf(ACCESS_TOKEN);

if (IS_PRODUCTION) {
  bot.telegram.setWebhook(`${URL}/bot${ACCESS_TOKEN}`);
  bot.startWebhook(`/bot${ACCESS_TOKEN}`, null, PORT);
}

bot.catch((err, ctx) => {
  console.log(`Error: ${ctx.updateType}`, err);
});

bot.use(session());

bot.use(stage.middleware());

bot.action("leaveScene", ctx => {
  ctx.scene.leave();
  return ctx.answerCbQuery();
});

bot.start(startHandler);

bot.use(
  mainMenu.init({
    backButtonText: "назад…",
    mainMenuButtonText: "назад в главное меню…"
  })
);

module.exports = bot;
