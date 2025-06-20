exports.up = async function (knex) {
  await knex.schema.createTable('wishlists', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.string('title').notNullable();
    table.string('location_name').notNullable();
    table.specificType('location_point', 'geography(Point, 4326)').notNullable();

    table.timestamp('travel_date').notNullable();

    table.jsonb('tags').defaultTo('[]');
    table.string('note');

    table.uuid('user_id').notNullable()
      .references('id').inTable('users')
      .onDelete('CASCADE');

    table.uuid('blog_id').nullable()
      .references('id').inTable('blogs')
      .onDelete('SET NULL');

    table.uuid('travel_place_id').nullable()
      .references('id').inTable('travel_places')
      .onDelete('SET NULL');

    table.string('cover_image');

    table.enu('status', ['PUBLIC', 'PRIVATE'], {
      useNative: true,
      enumName: 'wishlist_status',
    }).defaultTo('PRIVATE');

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('wishlists');
  await knex.raw('DROP TYPE IF EXISTS wishlist_status');
};
