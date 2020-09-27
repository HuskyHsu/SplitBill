const { router, line } = require('bottender/router');

const follow = require('../router/follow');
const inOut = require('../router/inOut');
const userJoinModel = require('../models/userJoin');

async function HandleMessage(context) {
  const {userId, groupId, roomId} = context.event.source
  const crowdId = groupId || roomId
  if (['group', 'room'].includes(context.event.source.type)) {
    const data = await userJoinModel.get(userId, crowdId)
    if (data == null) {
      await userJoinModel.create({
        userId,
        crowdId
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