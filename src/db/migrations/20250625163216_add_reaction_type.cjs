exports.up = async function (knex) {
    await knex.raw(`
      CREATE TYPE "Blog_Reaction" AS ENUM (
        'inspired',
        'amazed',
        'useful',
        'curious'
      );
    `);
  
    await knex.schema.alterTable('liked_blogs', (table) => {
      table
        .specificType('reaction_name', '"Blog_Reaction"')
        .notNullable()
        .defaultTo('inspired');
    });
  
  };
  
  exports.down = async function (knex) {
    await knex.schema.alterTable('liked_blogs', (table) => {
      table.dropColumn('reaction_name');
    });
    await knex.raw(`DROP TYPE IF EXISTS "Blog_Reaction"`);
  };
  