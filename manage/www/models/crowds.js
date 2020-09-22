// bot join or leave
// add group or room


// member join or leave
// add member of group or room

// const {databaseConfig} = require("../config/config")
const knex = require('knex')({
  client: 'pg',
  connection: "postgresql://postgres:pass@localhost:5432/my_db"
});

const TABLE_NAME = 'crowds'

let columns = null
knex(TABLE_NAME).columnInfo().then((cols) => {
    columns = Object.keys(cols)
})

create = (join) => {
    return knex(TABLE_NAME).insert(join).returning(columns)
}

update = (id, updateObj) => {
    return knex(TABLE_NAME).where({id: id}).update(updateObj).returning(columns)
}

module.exports = {
    create: create,
    update: update
}