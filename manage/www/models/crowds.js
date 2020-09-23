// bot join or leave
// add group or room


// member join or leave
// add member of group or room

const knex = require('../models/db')

const TABLE_NAME = 'crowds'

let columns = null
knex(TABLE_NAME).columnInfo().then((cols) => {
    columns = Object.keys(cols)
})

create = (join) => {
    return knex(TABLE_NAME).insert(join).returning(columns)
}

get = (id, attri = columns) => {
    return knex.select(attri).from(TABLE_NAME).where({id: id}).first()
}

update = (id, updateObj) => {
    updateObj.updated_at = new Date();
    return knex(TABLE_NAME).where({id: id}).update(updateObj).returning(columns)
}

module.exports = {
    create: create,
    get: get,
    update: update,
}