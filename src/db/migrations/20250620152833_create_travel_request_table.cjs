exports.up = async function (knex) {

    await knex.schema.createTable('travel_requests', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

        table.uuid('travel_plan_id').notNullable()
            .references('id').inTable('travel_plans')
            .onDelete('CASCADE');

        table.uuid('user_from').notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');

        table.uuid('user_to').notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');

        table.string('title').notNullable();
        table.string('message');

        table.enu('status', ['PENDING', 'ACCEPTED', 'REJECTED'], {
            useNative: true,
            enumName: 'travel_request_status',
        }).defaultTo('PENDING');

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('travel_requests');
    await knex.raw('DROP TYPE IF EXISTS travel_request_status');
};
