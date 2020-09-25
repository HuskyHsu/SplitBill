const { line } = require('bottender/router');
const crowdModel = require('../models/crowds');
const client = require('../models/line');

async function HandleJoin(context) {
  const type = context.event.join.type;
  const crowdId = type === 'group' ? context.event.join.groupId : context.event.join.roomId;

  let info = {
    id: crowdId,
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
  const id = type === 'group' ? context.event.leave.groupId : context.event.leave.roomId;

  return crowdModel.update(id, {active: false})
    .then((result) => {
      console.log(result[0]);
    })
}

module.exports = [
  line.join(HandleJoin),
  line.leave(HandleLeave),
]
