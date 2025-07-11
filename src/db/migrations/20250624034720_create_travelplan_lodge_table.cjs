exports.up = async function (knex) {
    await knex.schema.createTable('tour_lodges', (table) => {
        table.uuid('travelplan_id').notNullable();
        table.uuid('lodge_id').notNullable();
        table.primary(['travelplan_id', 'lodge_id']);

        table
            .foreign('travelplan_id')
            .references('id')
            .inTable('travel_plans')
            .onDelete('CASCADE');

        table
            .foreign('lodge_id')
            .references('id')
            .inTable('lodges')
            .onDelete('CASCADE');
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('tour_lodges');
};