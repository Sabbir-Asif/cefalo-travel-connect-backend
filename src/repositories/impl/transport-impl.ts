import { db } from "../../configs/db";
import { CreateTransport, Transport, UpdateTransport } from "../../interfaces/transport";
import { ITransportRepository } from "../transport";

export class TransportRepository implements ITransportRepository {
    private tableName = 'transports';

    async create(transport: CreateTransport): Promise<Transport> {
        const [newTransport] = await db(this.tableName).insert({
            ...transport,
            starting_point: db.raw(
                `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
                [transport.starting_point.long, transport.starting_point.lat]
            ),
            destination_point: db.raw(
                `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
                [transport.destination_point.long, transport.destination_point.lat]
            ),
        }).returning([
            '*',
            db.raw(`ST_X(starting_point::geometry) as start_long`),
            db.raw(`ST_Y(starting_point::geometry) as start_lat`),
            db.raw(`ST_X(destination_point::geometry) as des_long`),
            db.raw(`ST_Y(destination_point::geometry) as des_lat`)
        ]);

        return {
            ...newTransport,
            starting_point: {
                lat: parseFloat(newTransport.start_lat),
                long: parseFloat(newTransport.start_long)
            },
            destination_point: {
                lat: parseFloat(newTransport.des_lat),
                long: parseFloat(newTransport.des_long)
            },
            created_at: new Date(newTransport.created_at),
            updated_at: new Date(newTransport.updated_at)
        }
    }

    async getAll(): Promise<Transport[]> {
        const transports = await db(this.tableName).select(
            '*',
            db.raw(`ST_X(starting_point::geometry) as start_long`),
            db.raw(`ST_Y(starting_point::geometry) as start_lat`),
            db.raw(`ST_X(destination_point::geometry) as des_long`),
            db.raw(`ST_Y(destination_point::geometry) as des_lat`)
        )

        return transports.map((transport) => ({
            ...transport,
            starting_point: {
                lat: parseFloat(transport.start_lat),
                long: parseFloat(transport.start_long)
            },
            destination_point: {
                lat: parseFloat(transport.des_lat),
                long: parseFloat(transport.des_long)
            },
            created_at: new Date(transport.created_at),
            updated_at: new Date(transport.updated_at)
        }));
    }

    async getById(id: number): Promise<Transport | null> {
        const transport = await db(this.tableName).select(
            '*',
            db.raw(`ST_X(starting_point::geometry) as start_long`),
            db.raw(`ST_Y(starting_point::geometry) as start_lat`),
            db.raw(`ST_X(destination_point::geometry) as des_long`),
            db.raw(`ST_Y(destination_point::geometry) as des_lat`)
        )
        .where({id})
        .first();

        return transport ? {
            ...transport,
            starting_point: {
                lat: parseFloat(transport.start_lat),
                long: parseFloat(transport.start_long)
            },
            destination_point: {
                lat: parseFloat(transport.des_lat),
                long: parseFloat(transport.des_long)
            },
            created_at: new Date(transport.created_at),
            updated_at: new Date(transport.updated_at)
        } : null;
    }

    async update(id: number, data: UpdateTransport): Promise<Transport> {
        const updateData: any = {
            ...data,
            updated_at: new Date()
        };

        if (data.starting_point) {
            updateData.starting_point = db.raw(
                `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
                [data.starting_point.long, data.starting_point.lat]
            );
        }

        if (data.destination_point) {
            updateData.destination_point = db.raw(
                `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
                [data.destination_point.long, data.destination_point.lat]
            );
        }

        const [updatedTransport] = await db(this.tableName)
            .where({ id })
            .update(updateData)
            .returning([
                '*',
                db.raw(`ST_X(starting_point::geometry) as start_long`),
                db.raw(`ST_Y(starting_point::geometry) as start_lat`),
                db.raw(`ST_X(destination_point::geometry) as des_long`),
                db.raw(`ST_Y(destination_point::geometry) as des_lat`)
            ]);

        return {
            ...updatedTransport,
            starting_point: {
                lat: parseFloat(updatedTransport.start_lat),
                long: parseFloat(updatedTransport.start_long)
            },
            destination_point: {
                lat: parseFloat(updatedTransport.des_lat),
                long: parseFloat(updatedTransport.des_long)
            },
            created_at: new Date(updatedTransport.created_at),
            updated_at: new Date(updatedTransport.updated_at)
        };
    }

    async delete(id: number): Promise<number> {
        const count = await db(this.tableName).where({ id }).del();
        return count;
    }
}