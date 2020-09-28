const { router, line } = require('bottender/router');

const follow = require('../router/follow');
const inOut = require('../router/inOut');
const userJoinModel = require('../models/userJoin');

async function HandleMessage(context) {
  await context.sendText(context.event.text);
}

module.exports = async function App() {
  return router([
    line.message(HandleMessage),

    ...follow,
    ...inOut
  ]);
}