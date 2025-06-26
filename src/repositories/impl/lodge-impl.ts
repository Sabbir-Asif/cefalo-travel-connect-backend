import { UUID } from "crypto";
import { db } from "../../configs/db";
import { CreateLodge, Lodge, LodgeLocation, UpdateLodge } from "../../interfaces/lodge";
import { ILodgeRepositiry } from "../lodge";

export class LodgeRepository implements ILodgeRepositiry {
    private tableName = 'lodges';

    async create(lodge: CreateLodge): Promise<Lodge> {
        const [newLodge] = await db(this.tableName).insert({
            ...lodge,
            location_point: db.raw(
                `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
                [lodge.location_point.long, lodge.location_point.lat]
            )
        }).returning([
            '*',
            db.raw(`ST_X(location_point::geometry) as long`),
            db.raw(`ST_Y(location_point::geometry) as lat`)
        ]);

        const { long, lat, ...newLodgeWithoutCords } = newLodge;

        return {
            ...newLodgeWithoutCords,
            location_point: {
                lat: parseFloat(newLodge.lat),
                long: parseFloat(newLodge.long)
            },
            created_at: new Date(newLodge.created_at),
            updated_at: new Date(newLodge.updated_at)
        }
    }

    async getAll(): Promise<Lodge[]> {
        const lodges = await db(this.tableName).select(
            '*',
            db.raw(`ST_X(location_point::geometry) as long`),
            db.raw(`ST_Y(location_point::geometry) as lat`)
        )

        return lodges.map((lodge) => {
            const { long, lat, ...lodgeWithoutCords } = lodge;
            return {
                ...lodgeWithoutCords,
                location_point: {
                    lat: parseFloat(lodge.lat),
                    long: parseFloat(lodge.long)
                },
                created_at: new Date(lodge.created_at),
                updated_at: new Date(lodge.updated_at)
            }
        })
    }

    async getById(id: UUID): Promise<Lodge | null> {
        const lodge = await db(this.tableName).select(
            '*',
            db.raw(`ST_X(location_point::geometry) as long`),
            db.raw(`ST_Y(location_point::geometry) as lat`)
        )
            .where({ id })
            .first();


        const { long, lat, ...lodgeWithoutCords } = lodge;

        return lodge ? {
            ...lodgeWithoutCords,
            location_point: {
                lat: parseFloat(lodge.lat),
                long: parseFloat(lodge.long)
            },
            created_at: new Date(lodge.created_at),
            updated_at: new Date(lodge.updated_at)
        } : null;
    }

    async update(id: UUID, data: UpdateLodge): Promise<Lodge> {
        const updatedData: any = {
            ...data,
            updated_at: new Date()
        };

        if (data.location_point) {
            updatedData.location_point = db.raw(
                `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
                [data.location_point.long, data.location_point.lat]
            );
        }

        const [updatedLodge] = await db(this.tableName)
            .where({ id })
            .update(updatedData)
            .returning([
                '*',
                db.raw(`ST_X(location_point::geometry) as long`),
                db.raw(`ST_Y(location_point::geometry) as lat`)
            ]);

        const { long, lat, ...lodgeWithoutCords } = updatedLodge;

        return {
            ...lodgeWithoutCords,
            location_point: {
                lat: parseFloat(updatedLodge.lat),
                long: parseFloat(updatedLodge.long)
            },
            created_at: new Date(updatedLodge.created_at),
            updated_at: new Date(updatedLodge.updated_at)
        }
    }

    async delete(id: UUID): Promise<void> {
        const rows = await db(this.tableName).where({ id }).del();
    }

    async allLocations(): Promise<LodgeLocation[]> {
        const rows = await db(this.tableName)
            .distinct('location_name as name')
            .select(
                db.raw(`ST_X(location_point::geometry) as long`),
                db.raw(`ST_Y(location_point::geometry) as lat`)
            );

        return rows.map((row) => ({
            name: row.name,
            location_point: {
                lat: parseFloat(row.lat),
                long: parseFloat(row.long)
            }
        }))
    }

    async search(params: {
        name?: string;
        location_name?: string;
        priceMin?: number;
        priceMax?: number;
        description?: string;
        coverImage?: string;
        sortBy?: 'price' | 'name';
        order?: 'asc' | 'desc';
    }): Promise<Lodge[]> {
        const {
            name,
            location_name,
            priceMin,
            priceMax,
            description,
            coverImage,
            sortBy,
            order = 'asc'
        } = params;

        const query = db(this.tableName)
            .select(
                '*',
                db.raw(`ST_X(location_point::geometry) as long`),
                db.raw(`ST_Y(location_point::geometry) as lat`)
            );

        if (name) {
            query.whereILike('name', `%${name}%`);
        }

        if (location_name) {
            query.whereILike('location_name', `%${location_name}%`);
        }

        if (priceMin !== undefined) {
            query.where('price', '>=', priceMin);
        }

        if (priceMax !== undefined) {
            query.where('price', '<=', priceMax);
        }

        if (description) {
            query.whereILike('description', `%${description}%`);
        }

        if (sortBy === 'price') {
            query.orderBy('price', order);
        } else if (sortBy === 'name') {
            query.orderBy('name', order);
        } else {
            query.orderBy('created_at', 'desc');
        }

        const lodges = await query;

        return lodges.map((lodge) => ({
            ...lodge,
            location_point: {
                lat: parseFloat(lodge.lat),
                long: parseFloat(lodge.long)
            },
            created_at: new Date(lodge.created_at),
            updated_at: new Date(lodge.updated_at)
        }));
    }
}
