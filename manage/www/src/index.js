const { router, line } = require('bottender/router');

const follow = require('../router/follow');
const inOut = require('../router/inOut');
const userJoinModel = require('../models/userJoin');

async function HandleMessage(context) {
  const {userId, groupId, roomId} = context.event.source
  if (context.event.source.type === 'group') {
    const data = await userJoinModel.get(userId, groupId)
    if (data == null) {
      await userJoinModel.create({
        userId: userId,
        crowdId: context.event.source.groupId
      })
    }
  }

  await context.sendText('Welcome to Bottender');
}

module.exports = async function App() {
  return router([
    line.message(HandleMessage),

    ...follow,
    ...inOut
  ]);
}