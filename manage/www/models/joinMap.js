let _ = require('lodash');
const knex = require('./db')

const TABLE_NAME = 'join_map'

let columns = null
knex(TABLE_NAME).columnInfo().then((cols) => {
    columns = Object.keys(cols)
})

create = (data) => {
    if (!Array.isArray(data)) {
        data = [data]
    }

    data = data.map((row) => _.pick(row, columns))
    return knex(TABLE_NAME).insert(data).returning(columns)
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