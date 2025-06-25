exports.up = async function (knex) {
  await knex.schema.createTable('travel_plans', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.uuid('planner_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE');

    table.string('title').notNullable();

    table.string('starting_point_name').notNullable();
    table.specificType('starting_point_location', 'geography(Point, 4326)').notNullable();

    table.string('destination_name').notNullable();
    table.specificType('destination_location', 'geography(Point, 4326)').notNullable();

    table.date('starting_date').notNullable();
    table.date('ending_date').notNullable();

    table.decimal('budget', 10, 2).notNullable();

    table.text('description').notNullable();


    table.enu('status', ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'], {
      useNative: true,
      enumName: 'travel_plan_status',
    }).defaultTo('PENDING');

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('travel_plans');
  await knex.raw('DROP TYPE IF EXISTS travel_plan_status');
};
