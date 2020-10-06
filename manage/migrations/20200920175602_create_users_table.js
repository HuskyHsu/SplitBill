
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('id');
        table.string('userId');
        table.string('displayName').notNullable();
        table.string('pictureUrl').notNullable();
        table.string('statusMessage');
        table.string('language');
        table.boolean('active');
        
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.unique(['userId']);
      })
      .createTable('crowds', function(table) {
        table.increments('id');
        table.string('crowdId')
        table.enu('type', ['group', 'room']);
        table.string('groupName');
        table.string('pictureUrl');
        table.boolean('active');
        
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.unique(['crowdId']);
      })
      .createTable('join_map', function(table) {
        table.string('userId').notNullable().references('users.userId');
        table.string('crowdId').notNullable().references('crowds.crowdId');

        table.unique(['userId', 'crowdId'])
      })
      .createTable('share_event', function(table) {
        table.increments('id');
        table.string('crowdId').notNullable().references('crowds.crowdId');
        table.integer('price');
        table.enu('splitType', ['AVG', 'EXTRA', 'PERCENT', 'WEIGHTS', 'SINGLE']);
        table.string('status');
        table.string('remark');

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('payer', function(table) {
        table.increments('id');
        table.string('userId').notNullable().references('users.userId');
        table.integer('value');
        table.integer('share_event_id').notNullable().references('share_event.id');
      })
      .createTable('debtor', function(table) {
        table.increments('id');
        table.string('userId').notNullable().references('users.userId');
        table.integer('value');
        table.integer('share_event_id').notNullable().references('share_event.id');
      })
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
