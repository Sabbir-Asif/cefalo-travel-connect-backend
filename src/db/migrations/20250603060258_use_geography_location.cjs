exports.up = async function (knex) {
  await knex.raw(`
    ALTER TABLE blogs
    ALTER COLUMN "locationPoints" TYPE geography(Point, 4326)
    USING ST_SetSRID("locationPoints", 4326)::geography;
  `);
};

exports.down = async function (knex) {
  await knex.raw(`
    ALTER TABLE blogs
    ALTER COLUMN "locationPoints" TYPE geometry(Point, 4326)
    USING "locationPoints"::geometry;
  `);
};
