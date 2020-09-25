// bot join or leave
// add group or room


// member join or leave
// add member of group or room
let _ = require('lodash');
const knex = require('../models/db')

const TABLE_NAME = 'crowds'

let columns = null
knex(TABLE_NAME).columnInfo().then((cols) => {
    columns = Object.keys(cols)
})

create = (join) => {
    return knex(TABLE_NAME).insert(_.pick(join, columns)).returning(columns)
}

get = (id, attri = columns) => {
    return knex.select(attri).from(TABLE_NAME).where({id: id}).first()
}

update = (id, updateObj) => {
    updateObj.updated_at = new Date();
    const _updateObj = _.pick(updateObj, columns.filter((field) => field !== 'id'))
    return knex(TABLE_NAME).where({id: id}).update(_updateObj).returning(columns)
}

module.exports = {
    create: create,
    get: get,
    update: update,
}