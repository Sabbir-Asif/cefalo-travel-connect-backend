exports.up = async function (knex) {

  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
  
  await knex.schema.alterTable('users', (table) => {
    table.uuid('uuid_tmp').defaultTo(knex.raw('gen_random_uuid()'));
  });

  await knex.schema.alterTable('blogs', (table) => {
    table.uuid('user_uuid_tmp');
  });

  const users = await knex.select('id', 'uuid_tmp').from('users');
  for (const user of users) {
    await knex('blogs')
      .where('userId', user.id)
      .update({ user_uuid_tmp: user.uuid_tmp });
  }

  await knex.raw(`ALTER TABLE blogs DROP CONSTRAINT blogs_userid_foreign`);
  await knex.raw(`ALTER TABLE users DROP CONSTRAINT users_pkey`);

  await knex.schema.alterTable('blogs', (table) => {
    table.dropColumn('userId');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('id');
  });

  await knex.schema.alterTable('users', (table) => {
    table.renameColumn('uuid_tmp', 'id');
  });

  await knex.schema.alterTable('blogs', (table) => {
    table.renameColumn('user_uuid_tmp', 'userId');
  });

  await knex.raw(`ALTER TABLE users ADD PRIMARY KEY (id)`);

  await knex.schema.alterTable('blogs', (table) => {
    table.foreign('userId').references('users.id').onDelete('CASCADE');
  });
};

exports.down = async function (knex) {

  await knex.schema.alterTable('users', (table) => {
    table.increments('int_tmp');
  });

  await knex.schema.alterTable('blogs', (table) => {
    table.integer('user_int_tmp');
  });

  const users = await knex.select('id', 'int_tmp').from('users');
  for (const user of users) {
    await knex('blogs')
      .where('userId', user.id)
      .update({ user_int_tmp: user.int_tmp });
  }

  await knex.raw(`ALTER TABLE blogs DROP CONSTRAINT blogs_userid_foreign`);
  await knex.raw(`ALTER TABLE users DROP CONSTRAINT users_pkey`);

  await knex.schema.alterTable('blogs', (table) => {
    table.dropColumn('userId');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('id');
  });

  await knex.schema.alterTable('users', (table) => {
    table.renameColumn('int_tmp', 'id');
  });

  await knex.schema.alterTable('blogs', (table) => {
    table.renameColumn('user_int_tmp', 'userId');
  });

  await knex.raw(`ALTER TABLE users ADD PRIMARY KEY (id)`);

  await knex.schema.alterTable('blogs', (table) => {
    table.foreign('userId').references('users.id').onDelete('CASCADE');
  });
};
