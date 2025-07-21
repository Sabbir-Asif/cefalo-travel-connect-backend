exports.up = async function (knex) {
  await knex.schema.alterTable('blogs', (table) => {
    table.renameColumn('locationPoints', 'location_points');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('blogs', (table) => {
    table.renameColumn('location_points', 'locationPoints');
  });
};
