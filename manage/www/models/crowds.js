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
    return knex.select(attri).from(TABLE_NAME).where({crowdId: id}).first()
}

update = (id, updateObj) => {
    updateObj.updated_at = new Date();
    const _updateObj = _.pick(updateObj, columns.filter((field) => field !== 'crowdId'))
    return knex(TABLE_NAME).where({crowdId: id}).update(_updateObj).returning(columns)
}

module.exports = {
    create: create,
    get: get,
    update: update,
}