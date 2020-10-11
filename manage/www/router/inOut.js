const { text, line } = require('bottender/router');
const crowdModel = require('../models/crowds');
const joinMapModel = require('../models/joinMap');
const client = require('../models/line');

async function HandleJoin(context) {
  const type = context.event.join.type;
  const crowdId = type === 'group' ? context.event.join.groupId : context.event.join.roomId;

  let info = {
    crowdId: crowdId,
    type: type,
    active: true
  }

  if (type === 'group') {
    const summary = await client.getGroupSummary(crowdId);
    info = {...info, ...summary}
  }

  return crowdModel.get(crowdId)
    .then((crowd) => {
      if (crowd == null) {
        return crowdModel.create(info)
      }
      return crowdModel.update(crowdId, info)
    })
    .then((result) => {
      console.log(result[0]);
    })
    .catch(function (err) {
      console.error(err);
    });
}
  
async function HandleLeave(context) {
  const type = context.event.leave.type;
  const crowdId = type === 'group' ? context.event.leave.groupId : context.event.leave.roomId;

  return crowdModel.update(crowdId, {active: false})
    .then((result) => {
      console.log(result[0]);
    })
}

async function addCrowd(context) {
  const {userId, groupId, roomId} = context.event.source;
  const crowdId = groupId || roomId;
  if (['group', 'room'].includes(context.event.source.type)) {
    const data = await joinMapModel.get(userId, crowdId)
    if (data != null) {
      return await context.sendText('已加入過');
    }
    await joinMapModel.create({
      userId,
      crowdId
    })

    await context.sendText('加入成功');
  }
}

async function HandleMemberJoined(context) {
  const {groupId, roomId} = context.event.joined.source;
  const crowdId = groupId || roomId;
}

async function HandleMemberLeft(context) {
  const {groupId, roomId} = context.event.left.source;
  const crowdId = groupId || roomId;
}

module.exports = [
  text('[加入]', addCrowd),
  line.join(HandleJoin),
  line.leave(HandleLeave),

  line.memberJoined(HandleMemberJoined),
  line.memberLeft(HandleMemberLeft),
]
