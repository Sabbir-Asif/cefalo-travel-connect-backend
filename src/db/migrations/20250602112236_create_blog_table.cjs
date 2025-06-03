
exports.up = async function (knex) {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis');

    await knex.schema.createTable('blogs', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.integer('userId').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');
        table.string('locationName').notNullable();
        table.specificType('locationPoints', 'geometry(Point, 4326)').notNullable();
        table.text('description').notNullable();
        table.string('cover_image');
        table.enu('status', ['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
            useNative: true,
            enumName: 'Blog_Status',
        }).notNullable().defaultTo('DRAFT');
        table.jsonb('tags').defaultTo('[]');
        table.jsonb('images').defaultTo('[]');
        table.jsonb('videos').defaultTo('[]');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTable('blogs');
    await knex.raw('DROP EXTENSION IF EXISTS postgis');
};
