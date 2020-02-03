const getMsgDate = dateInUnix => new Date(dateInUnix * 1000).toISOString();

const logHandler = async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  // console.log(`
  // Date: ${getMsgDate(ctx.update.message.date)}
  // From: ${ctx.update.message.from.id}
  // Response time: ${ms}
  // `);
};

module.exports = logHandler;
