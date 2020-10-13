const { text, line } = require('bottender/router');
const shareEventsModel = require('../models/shareEvents');
const client = require('../models/line');

async function addEvent(context, {
    match: {
      groups: {price, splitType},
    },
  }
  ) {
  const {userId, groupId, roomId} = context.event.source;
  const crowdId = groupId || roomId;
  if (context.event.source.type === 'user') {
    return await context.sendText('失敗');
  }

  shareEvent = await shareEventsModel.create({
    crowdId,
    price,
    splitType
  })

  return await context.sendText('成功');
}

module.exports = [
  text(new RegExp(`(?<price>[0-9]+) (?<splitType>${Object.values(shareEventsModel.splitTypeEnum).join('|')})`, 'u'), addEvent),
]
