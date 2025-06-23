exports.up = async function (knex) {
    await knex.schema.alterTable("users", (table) => {
      table.boolean("is_verified").notNullable().defaultTo(false);
    });
  
    await knex.schema.createTable("email_verifications", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
      table.string("token").notNullable();
      table.timestamp("expires_at").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  };
  
  exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("email_verifications");
  
    await knex.schema.alterTable("users", (table) => {
      table.dropColumn("is_verified");
    });
  };
  