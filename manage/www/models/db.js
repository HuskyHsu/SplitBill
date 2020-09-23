
const {DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_HOST} = process.env

const knex = require('knex')({
  client: 'pg',
  connection: `postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`
});

module.exports = knex