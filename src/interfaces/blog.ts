// await knex.schema.createTable('blogs', (table) => {
//     table.increments('id').primary();
//     table.string('title').notNullable();
//     table.integer('userId').unsigned().notNullable()
//         .references('id').inTable('users').onDelete('CASCADE');
//     table.string('locationName').notNullable();
//     table.specificType('locationPoints', 'geometry(Point, 4326)').notNullable();
//     table.text('description').notNullable();
//     table.string('cover_image');
//     table.enu('status', ['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
//         useNative: true,
//         enumName: 'Blog_Status',
//     }).notNullable().defaultTo('DRAFT');
//     table.jsonb('tags').defaultTo('[]');
//     table.jsonb('images').defaultTo('[]');
//     table.jsonb('videos').defaultTo('[]');
//     table.timestamp('created_at').defaultTo(knex.fn.now());
//     table.timestamp('updated_at').defaultTo(knex.fn.now());
// });

export enum Blog_Status {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}

export interface BlogResponse {
    id: number;
    title: string;
    userId: number;
    locationName: string;
    locationPoints: {
        type: 'Point';
        coordinates: [number, number];
    };
    description: string;
    cover_image: string | null;
    status: Blog_Status;
    tags: string[];
    images: string[];
    videos: string[];
    created_at: Date;
    updated_at: Date;
}

export interface CreateBlog {
    title: string;
    locationName: string;
    locationPoints: {
        lat: number;
        long: number;
    };
    description: string;
    tags: string[];
}