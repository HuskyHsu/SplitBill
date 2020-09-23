const { line } = require('bottender/router');
const crowdModel = require('../models/crowds');
var rp = require('request-promise');

async function HandleJoin(context) {
  const type = context.event.join.type;
  const id = type === 'group' ? context.event.join.groupId : context.event.join.roomId;

  rp({url: `https://api.line.me/v2/bot/${type}/${id}/summary`, headers: {'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`}})
    .then((info) => {
      return crowdModel.get(id)
        .then((crowd) => {
          if (crowd == null) {
            return crowdModel.create({
              id:id,
              type: type,
              groupName: info.groupName,
              pictureUrl: info.pictureUrl,
              active: true
            })
          } else {
            return crowdModel.update(id, {
              type: type,
              groupName: info.groupName,
              pictureUrl: info.pictureUrl,
              active: true
            })
          }
        })
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

  return crowdModel.update(id, {active: false}).then((result) => {
    console.log(result[0]);
  })
}

module.exports = [
  line.join(HandleJoin),
  line.leave(HandleLeave),
]
