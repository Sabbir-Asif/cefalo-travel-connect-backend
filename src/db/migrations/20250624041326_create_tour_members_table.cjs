exports.up = async function (knex) {
    await knex.schema.createTable('tour_members', (table) => {
        table.uuid('travelplan_id').notNullable();
        table.uuid('user_id').notNullable();
        table.primary(['travelplan_id', 'user_id']);

        table
            .foreign('travelplan_id')
            .references('id')
            .inTable('travel_plans')
            .onDelete('CASCADE');

        table
            .foreign('user_id')
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('tour_members');
};
