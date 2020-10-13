const { router, route, line } = require('bottender/router');

const follow = require('../router/follow');
const inOut = require('../router/inOut');
const share = require('../router/share');

async function HandleMessage(context) {
  await context.sendText(`err: ${context.event.text}`);
}

module.exports = async function App() {
  return router([
    ...follow,
    ...inOut,
    ...share,

    route('*', HandleMessage),
  ]);
}