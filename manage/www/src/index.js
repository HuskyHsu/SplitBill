const { router, line } = require('bottender/router');
const userModel = require('../models/users');

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

module.exports = async function App() {
  return router([
    line.message(HandleMessage),

    line.follow(HandleFollow),
    line.unfollow(HandleUnfollow),
  ]);
}