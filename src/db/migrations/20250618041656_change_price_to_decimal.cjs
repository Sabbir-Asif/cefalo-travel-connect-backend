exports.up = async function (knex) {
  await knex.schema.alterTable('lodges', (table) => {
    table.dropColumn('price');
  });

  await knex.schema.alterTable('lodges', (table) => {
    table.decimal('price', 10, 2).notNullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('lodges', (table) => {
    table.dropColumn('price');
  });

  await knex.schema.alterTable('lodges', (table) => {
    table.string('price').notNullable();
  });
};
