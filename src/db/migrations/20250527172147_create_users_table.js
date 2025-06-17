
exports.up = async function (knex) {
    await knex.raw(`CREATE TYPE "Role" AS ENUM ('ADMIN', 'TRAVELER', 'EXPLORER')`);
    
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.enu('role', ['ADMIN', 'TRAVELER', 'EXPLORER'], {
            useNative: true,
            enumName: 'Role',
        }).notNullable().defaultTo('EXPLORER');
        table.string('displayPicture');
        table.string('bio');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
};

exports.down = async function (knex) {
    await knex.schema.dropTable('users');
    await knex.raw('DROP TYPE "Role"');
};
