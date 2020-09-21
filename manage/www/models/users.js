// const {databaseConfig} = require("../config/config")
const knex = require('knex')({
  client: 'pg',
  connection: "postgresql://postgres:pass@localhost:5432/my_db"
});

const TABLE_NAME = 'users'

let columns = null
knex(TABLE_NAME).columnInfo().then((cols) => {
    columns = Object.keys(cols)
})

createUser = (member) => {
    return knex(TABLE_NAME).insert(member).returning(columns)
}

getUser = (userId, attri = columns) => {
    return knex.select(attri).from(TABLE_NAME).where({userId: userId}).first()
}

updateUser = (userId, updateObj) => {
    return knex(TABLE_NAME).where({userId: userId}).update(updateObj).returning(columns)
}

module.exports = {
    getUser: getUser,
    createUser: createUser,
    updateUser: updateUser,
}