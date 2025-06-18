import { UUID } from "crypto";
import { db } from "../../configs/db";
import { CreateLodge, Lodge, UpdateLodge } from "../../interfaces/lodge";
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

        return {
            ...newLodge,
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

        return lodges.map((lodge) => ({
            ...lodge,
            location_point: {
                lat: lodge.lat,
                long: lodge.long
            },
            created_at: new Date(lodge.created_at),
            updated_at: new Date(lodge.updated_at)
        }))
    }

    async getById(id: UUID): Promise<Lodge | null> {
        const lodge = await db(this.tableName).select(
            '*',
            db.raw(`ST_X(location_point::geometry) as long`),
            db.raw(`ST_Y(location_point::geometry) as lat`)
        )
            .where({ id })
            .first();

        return lodge ? {
            ...lodge,
            location_point: {
                lat: lodge.lat,
                long: lodge.long
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

        return {
            ...updatedLodge,
            location_point: {
                lat: updatedLodge.lat,
                long: updatedLodge.long
            },
            created_at: new Date(updatedLodge.created_at),
            updated_at: new Date(updatedLodge.updated_at)
        }
    }

    async delete(id: UUID) : Promise<void> {
        const rows = await db(this.tableName).where({ id }).del();
    }
}
