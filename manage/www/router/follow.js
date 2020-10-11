const { line } = require('bottender/router');
const userModel = require('../models/users');

async function HandleFollow(context) {
  const userId = context.event.follow.userId;

  return context.getUserProfile(userId)
    .then(member => {
      member.active = true;

      userModel.get(userId)
        .then((user) => {
          return user == null ? userModel.create(member) : userModel.update(userId, member)
        })
        .then((users) => {
          console.log(users[0]);
        })
    })
}
  
async function HandleUnfollow(context) {
  const userId = context.event.unfollow.userId;

  return userModel.update(userId, {active: false})
    .then((users) => {
      console.log(users[0]);
    })
}

module.exports = [
  line.follow(HandleFollow),
  line.unfollow(HandleUnfollow)
]

