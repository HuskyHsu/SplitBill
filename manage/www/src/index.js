const { router, line } = require('bottender/router');

const follow = require('../router/follow');
const inOut = require('../router/inOut');


async function HandleMessage(context) {
  await context.sendText('Welcome to Bottender');
}

module.exports = async function App() {
  return router([
    line.message(HandleMessage),

    ...follow,
    ...inOut
  ]);
}