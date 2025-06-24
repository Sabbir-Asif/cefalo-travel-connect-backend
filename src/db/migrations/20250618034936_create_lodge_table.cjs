
exports.up = async function (knex) {
    await knex.schema.createTable('lodges', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('name').notNullable();
        table.string('location_name').notNullable();
        table.specificType('location_point', 'geography(Point, 4326)').notNullable();
        table.string('price').notNullable();
        table.string('description');
        table.string('cover_image');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('lodges');
};