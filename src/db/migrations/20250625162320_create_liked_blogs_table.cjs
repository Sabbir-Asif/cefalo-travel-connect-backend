exports.up = async function (knex) {
    await knex.schema.createTable('liked_blogs', (table) => {
        table.uuid('user_id').notNullable();
        table.uuid('blog_id').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

        table.primary(['user_id', 'blog_id']);

        table
            .foreign('user_id')
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');

        table
            .foreign('blog_id')
            .references('id')
            .inTable('blogs')
            .onDelete('CASCADE');
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('liked_blogs');
};
