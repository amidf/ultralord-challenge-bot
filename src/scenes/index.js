const Stage = require("telegraf/stage");

const createChallenge = require("./createChallenge");
const joinChallenge = require("./joinChallenge");
const closeChallenge = require("./closeChallenge");

const stage = new Stage();

stage.command("cancel", Stage.leave());

stage.register(createChallenge);
stage.register(joinChallenge);
stage.register(closeChallenge);

module.exports = stage;
