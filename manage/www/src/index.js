const { router, line } = require('bottender/router');
const userModel = require('../models/users');
const crowdModel = require('../models/crowds');

var rp = require('request-promise');

async function HandleMessage(context) {
  await context.sendText('Welcome to Bottender');
}

async function HandleFollow(context) {
  const userId = context.event.follow.userId;

  context.getUserProfile(userId)
    .then(member => {
      member.active = true;

      userModel.getUser(userId)
        .then((user) => {
          return user == null ? userModel.createUser(member) : userModel.updateUser(userId, member)
        })
        .then((users) => {
          console.log(users[0]);
        })
    })
}

async function HandleUnfollow(context) {
  const userId = context.event.unfollow.userId;

  userModel.updateUser(userId, {active: false})
    .then((users) => {
      console.log(users[0]);
    })
}

async function HandleJoin(context) {
  const type = context.event.join.type;
  const id = type === 'group' ? context.event.join.groupId : context.event.join.roomId;
  console.log(type, id);
  rp({url: `https://api.line.me/v2/bot/${type}/${id}/summary`, headers: {'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`}})
    .then(function (info) {
      console.log(info);
      return crowdModel.create({
        id:id,
        type: type,
        groupName: info.groupName,
        pictureUrl: info.pictureUrl,
        active: true
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

module.exports = async function App() {
  return router([
    line.message(HandleMessage),

    line.follow(HandleFollow),
    line.unfollow(HandleUnfollow),

    line.join(HandleJoin),
    line.leave(HandleLeave),
  ]);
}