exports.up = async function (knex) {
  await knex.raw(`ALTER TABLE blogs DROP CONSTRAINT blogs_pkey`);
  await knex.schema.alterTable('blogs', (table) => {
    table.dropColumn('id');
  });

  await knex.schema.alterTable('blogs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
  });
};

exports.down = async function (knex) {

  await knex.raw(`ALTER TABLE blogs DROP CONSTRAINT blogs_pkey`);
  await knex.schema.alterTable('blogs', (table) => {
    table.dropColumn('id');
  });

  await knex.schema.alterTable('blogs', (table) => {
    table.increments('id').primary();
  });
};
