exports.up = async function (knex) {
    await knex.schema.createTable('travel_places', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('name').notNullable();
        table.string('location_name').notNullable();
        table.specificType('location_point', 'geography(Point, 4326)').notNullable();
        table.string('cover_image');
        table.string('description');
        table.jsonb('tags').defaultTo('[]');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('travel_places');
};
