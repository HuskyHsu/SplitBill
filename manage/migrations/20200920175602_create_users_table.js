
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments();
        table.string('userId').notNullable();
        table.string('displayName').notNullable();
        table.string('language').notNullable();
        table.string('pictureUrl').notNullable();
        table.string('statusMessage');
        table.boolean('active').defaultTo(true);
        
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.unique('userId');
      })
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
