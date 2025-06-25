exports.up = async function (knex) {
    await knex.schema.createTable('blog_foods', (table) => {
        table.uuid('blog_id').notNullable();
        table.uuid('food_id').notNullable();
        table.primary(['blog_id', 'food_id']);

        table
            .foreign('blog_id')
            .references('id')
            .inTable('blogs')
            .onDelete('CASCADE');

        table
            .foreign('food_id')
            .references('id')
            .inTable('foods')
            .onDelete('CASCADE');
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('blog_foods');
};