exports.up = async function (knex) {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
  await knex.raw(`ALTER TABLE transports DROP CONSTRAINT transports_pkey`);
  await knex.schema.alterTable('transports', (table) => {
    table.dropColumn('id');
  });

  await knex.schema.alterTable('transports', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
  });
};

exports.down = async function (knex) {

  await knex.raw(`ALTER TABLE transports DROP CONSTRAINT transports_pkey`);
  await knex.schema.alterTable('transports', (table) => {
    table.dropColumn('id');
  });

  await knex.schema.alterTable('transports', (table) => {
    table.increments('id').primary();
  });
};
