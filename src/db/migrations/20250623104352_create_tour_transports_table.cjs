exports.up = async function (knex) {
  await knex.schema.createTable("tour_transports", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("travelplan_id").notNullable().references("id").inTable("travel_plans").onDelete("CASCADE");
    table.uuid("transport_id").notNullable().references("id").inTable("transports").onDelete("CASCADE");
    table.timestamp("departure_time").notNullable();
    table.string("contact_number").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("tour_transports");
};
