
exports.up = async function (knex) {
    await knex.schema.createTable('transports', (table) => {
        table.increments('id').primary();
        table.enu('type', ['BUS', 'TRAIN', 'FLIGHT', 'BOAT', 'OTHER'], {
            useNative: true,
            enumName: 'transport_type'
        }).notNullable().defaultTo('OTHER');
        table.string('name').notNullable();
        table.string('starting_location').notNullable();
        table.specificType('starting_point', 'geography(Point, 4326)').notNullable();
        table.string('destination').notNullable();
        table.specificType('destination_point', 'geography(Point, 4326)').notNullable();
        table.timestamp('departure_time').defaultTo(null);
        table.timestamp('arrival_time').defaultTo(null);
        table.string('fare').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('transports');
    await knex.raw('DROP TYPE IF EXISTS transport_type');
};