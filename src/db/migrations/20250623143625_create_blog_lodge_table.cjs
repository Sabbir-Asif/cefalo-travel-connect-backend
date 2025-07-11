exports.up = async function (knex) {
    await knex.schema.createTable('blog_lodges', (table) => {
        table.uuid('blog_id').notNullable();
        table.uuid('lodge_id').notNullable();
        table.primary(['blog_id', 'lodge_id']);

        table
            .foreign('blog_id')
            .references('id')
            .inTable('blogs')
            .onDelete('CASCADE');

        table
            .foreign('lodge_id')
            .references('id')
            .inTable('lodges')
            .onDelete('CASCADE');
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('blog_lodges');
};