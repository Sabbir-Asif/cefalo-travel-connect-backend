exports.up = async function (knex) {
  await knex.schema.createTable("discussions", (table) => {
    table.increments("id").primary();
    table.uuid("travel_plan_id").notNullable().references("id").inTable("travel_plans").onDelete("CASCADE");
    table.uuid("sender_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.text("content").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("discussions");
}
