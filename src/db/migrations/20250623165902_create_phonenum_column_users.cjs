exports.up = async function (knex) {
    await knex.schema.alterTable('users', (table) => {
      table.string('phone_number').unique().nullable();
    });
  };
  
  exports.down = async function (knex) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('phone_number');
    });
  };
  