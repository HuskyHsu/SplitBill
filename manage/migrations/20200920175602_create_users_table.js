
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.string('userId').primary();
        table.string('displayName').notNullable();
        table.string('pictureUrl').notNullable();
        table.string('statusMessage');
        table.string('language');
        table.boolean('active');
        
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('crowds', function(table) {
        table.string('id').primary();
        table.enu('type', ['group', 'room']);
        table.string('groupName');
        table.string('pictureUrl');
        table.boolean('active');
        
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('userJoin', function(table) {
        table.string('userId').notNullable().references('users.userId');
        table.string('crowdId').notNullable().references('crowds.id');

        table.unique(['userId', 'crowdId'])
      })
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
