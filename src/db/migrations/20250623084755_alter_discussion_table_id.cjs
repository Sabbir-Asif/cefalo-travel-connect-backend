exports.up = async function (knex) {
  await knex.schema.alterTable("discussions", async (table) => {
    table.dropPrimary();
    table.renameColumn("id", "old_id");
  });

  await knex.schema.alterTable("discussions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
  });

  await knex.schema.alterTable("discussions", (table) => {
    table.dropColumn("old_id");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("discussions", async (table) => {
    table.dropPrimary();
    table.renameColumn("id", "uuid_id");
  });

  await knex.schema.alterTable("discussions", (table) => {
    table.increments("id").primary();
  });

  await knex.schema.alterTable("discussions", (table) => {
    table.dropColumn("uuid_id");
  });
};
