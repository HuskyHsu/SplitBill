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
    await context.sendText('失敗');
  }

  console.log(price, splitType)

  // shareEventsModel.create({
    
  // })
}

module.exports = [
  text(new RegExp(`(?<price>\d+),(?<splitType>${Object.values(shareEventsModel.splitTypeEnum).join('|')})`, 'i'), addEvent),
]
