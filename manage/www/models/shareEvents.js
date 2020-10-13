let _ = require('lodash');
const knex = require('./db');

const TABLE_NAME = 'share_event'

let columns = null
knex(TABLE_NAME).columnInfo().then((cols) => {
    columns = Object.keys(cols)
})

splitTypeEnum = {
    AVG: 'AVG',
    EXTRA: 'EXTRA',
    PERCENT: 'PERCENT',
    WEIGHTS: 'WEIGHTS',
    SINGLE: 'SINGLE'
}

create = (event) => {
    return knex(TABLE_NAME).insert(_.pick(event, columns)).returning(columns)
}

get = (userId, attri = columns) => {
    return knex.select(attri).from(TABLE_NAME).where({userId: userId}).first()
}

update = (userId, updateObj) => {
    updateObj.updated_at = new Date();
    return knex(TABLE_NAME).where({userId: userId}).update(updateObj).returning(columns)
}

module.exports = {
    get,
    create,
    update,
    splitTypeEnum
}