const Telegraf = require("telegraf");

const ACCESS_TOKEN = "911918404:AAFIc-oTTDF5-OrK_UqdQ5sRGnxnYovy7N0";

const bot = new Telegraf(ACCESS_TOKEN);

bot.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`Response time: ${ms}`);
});

bot.on("text", ctx => ctx.reply("Hello World"));
bot.launch();
