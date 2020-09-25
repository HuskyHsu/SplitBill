let _ = require('lodash');
const knex = require('../models/db')

const TABLE_NAME = 'userJoin'

let columns = null
knex(TABLE_NAME).columnInfo().then((cols) => {
    columns = Object.keys(cols)
})

create = (join) => {
    return knex(TABLE_NAME).insert(_.pick(join, columns)).returning(columns)
}

get = (userId, crowdId, attri = columns) => {
    return knex.select(attri).from(TABLE_NAME).where({userId: userId, crowdId: crowdId}).first()
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