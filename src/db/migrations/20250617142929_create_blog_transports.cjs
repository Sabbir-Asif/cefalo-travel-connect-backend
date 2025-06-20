exports.up = async function (knex) {
    await knex.schema.createTable('blog_transports', (table) => {
        table.uuid('blog_id').notNullable();
        table.uuid('transport_id').notNullable();
        table.primary(['blog_id', 'transport_id']);

        table
            .foreign('blog_id')
            .references('id')
            .inTable('blogs')
            .onDelete('CASCADE');

        table
            .foreign('transport_id')
            .references('id')
            .inTable('transports')
            .onDelete('CASCADE');
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('blog_transports');
};
