exports.up = async function (knex) {
    await knex.schema.createTable('refresh_tokens', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');

        table.uuid('token').notNullable().unique(); // secure random string or uuid
        table.timestamp('expires_at').notNullable();
        table.boolean('revoked').notNullable().defaultTo(false);

        table.uuid('replaced_by').nullable()
            .references('id').inTable('refresh_tokens')
            .onDelete('SET NULL'); // link to newer token if rotated

        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

exports.down = async function (knex) {
    await knex.schema.dropTable('refresh_tokens');
}
