const Telegraf = require("telegraf");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const session = require("telegraf/session");

const { ACCESS_TOKEN, PORT, URL, IS_PRODUCTION } = require("./constants");
const logHandler = require("./controllers/logHandler");
const mainMenu = require("./menus/main");
const stage = require("./scenes");

const bot = new Telegraf(ACCESS_TOKEN);

if (IS_PRODUCTION) {
  bot.telegram.setWebhook(`${URL}/bot${ACCESS_TOKEN}`);
  bot.startWebhook(`/bot${ACCESS_TOKEN}`, null, PORT);
}

bot.use(logHandler);

bot.use(session());

bot.use(stage.middleware());

bot.action("leaveScene", ctx => {
  ctx.scene.leave();
  return ctx.answerCbQuery();
});

bot.use(
  mainMenu.init({
    backButtonText: "назад…",
    mainMenuButtonText: "назад в главное меню…"
  })
);

module.exports = bot;
