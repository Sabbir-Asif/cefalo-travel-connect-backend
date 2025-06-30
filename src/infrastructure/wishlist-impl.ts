import { UUID } from "crypto";
import { db } from "../configs/db";
import { CreateWishlist, UpdateWishlist, Wishlist, WishlistWithUser } from "../interfaces/wishlist";
import { IWishlistRepository } from "../repositories/wishlist";
import { UserResponse } from "../interfaces/user";

export class WishlistRepository implements IWishlistRepository {
  private tableName = "wishlists";

  async create(userId: UUID, data: CreateWishlist): Promise<Wishlist> {
    const [newWishlist] = await db(this.tableName)
      .insert({
        ...data,
        user_id: userId,
        location_point: db.raw(
          `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
          [data.location_point.long, data.location_point.lat]
        ),
        tags: JSON.stringify(data.tags ?? []),
      })
      .returning([
        '*',
        db.raw(`ST_X(location_point::geometry) as long`),
        db.raw(`ST_Y(location_point::geometry) as lat`),
      ]);

    return this.toModel(newWishlist);
  }

  async getAll(): Promise<WishlistWithUser[]> {
    const rows = await db
      .select(
        'wishlists.*',
        db.raw(`ST_X(location_point::geometry) as long`),
        db.raw(`ST_Y(location_point::geometry) as lat`),
        db.raw(`row_to_json(users.*) as user`)
      )
      .from('wishlists')
      .leftJoin('users', 'wishlists.user_id', 'users.id');

    return rows.map(this.toModelWithUser);
  }

  async getById(id: UUID): Promise<WishlistWithUser | null> {
    const row = await db
      .select(
        'wishlists.*',
        db.raw(`ST_X(location_point::geometry) as long`),
        db.raw(`ST_Y(location_point::geometry) as lat`),
        db.raw(`row_to_json(users.*) as user`)
      )
      .from('wishlists')
      .leftJoin('users', 'wishlists.user_id', 'users.id')
      .where('wishlists.id', id)
      .first();

    return row ? this.toModelWithUser(row) : null;
  }

  async getByUserId(userId: UUID): Promise<Wishlist[]> {
    const rows = await db(this.tableName)
      .select(
        '*',
        db.raw(`ST_X(location_point::geometry) as long`),
        db.raw(`ST_Y(location_point::geometry) as lat`)
      )
      .where('user_id', userId);

    return rows.map(this.toModel);
  }

  async update(id: UUID, data: UpdateWishlist): Promise<Wishlist> {
    const updateData: any = {
      ...data,
      updated_at: new Date(),
    };

    if (data.location_point) {
      updateData.location_point = db.raw(
        `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
        [data.location_point.long, data.location_point.lat]
      );
    }

    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }

    const [updatedWishlist] = await db(this.tableName)
      .where({ id })
      .update(updateData)
      .returning([
        '*',
        db.raw(`ST_X(location_point::geometry) as long`),
        db.raw(`ST_Y(location_point::geometry) as lat`)
      ]);

    return this.toModel(updatedWishlist);
  }

  async delete(id: UUID): Promise<void> {
    await db(this.tableName).where({ id }).del();
  }

  async search(params: Record<string, any>): Promise<WishlistWithUser[]> {
    const { title, location_name, tag, status, sortBy, order = 'desc' } = params;

    const query = db
      .select(
        'wishlists.*',
        db.raw(`ST_X(location_point::geometry) as long`),
        db.raw(`ST_Y(location_point::geometry) as lat`),
        db.raw(`row_to_json(users.*) as user`)
      )
      .from('wishlists')
      .leftJoin('users', 'wishlists.user_id', 'users.id');

    if (title) query.whereILike('wishlists.title', `%${title}%`);
    if (location_name) query.whereILike('wishlists.location_name', `%${location_name}%`);
    if (tag) query.whereRaw(`wishlists.tags @> ?::jsonb`, [JSON.stringify([tag])]);
    if (status) query.where('wishlists.status', status);
    if (sortBy) query.orderBy(`wishlists.${sortBy}`, order);
    else query.orderBy('wishlists.created_at', order);

    const rows = await query;
    return rows.map(this.toModelWithUser);
  }

  private toModel = (row: any): Wishlist => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    location_name: row.location_name,
    location_point: {
      lat: parseFloat(row.lat),
      long: parseFloat(row.long),
    },
    travel_date: new Date(row.travel_date),
    tags: row.tags,
    note: row.note,
    blog_id: row.blog_id,
    travel_place_id: row.travel_place_id,
    cover_image: row.cover_image,
    status: row.status,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  });

  private toModelWithUser = (row: any): WishlistWithUser => ({
    id: row.id,
    user_id: row.user_id,
    user: row.user as UserResponse,
    title: row.title,
    location_name: row.location_name,
    location_point: {
      lat: parseFloat(row.lat),
      long: parseFloat(row.long),
    },
    travel_date: new Date(row.travel_date),
    tags: row.tags,
    note: row.note,
    blog_id: row.blog_id,
    travel_place_id: row.travel_place_id,
    cover_image: row.cover_image,
    status: row.status,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  });
}
