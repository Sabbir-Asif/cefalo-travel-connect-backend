import { UUID } from "crypto";
import { db } from "../../configs/db";
import { CreateTransport, Transport, TransportLocation, UpdateTransport } from "../../interfaces/transport";
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

        const { start_long, start_lat, des_long, des_lat, ...transportWithoutCords } = newTransport;
        return {
            ...transportWithoutCords,
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

        return transports.map((transport) => {
            const { start_long, start_lat, des_long, des_lat, ...transportWithoutCords } = transport;
            return {
                ...transportWithoutCords,
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
            }
        });
    }

    async getById(id: UUID): Promise<Transport | null> {
        const transport = await db(this.tableName).select(
            '*',
            db.raw(`ST_X(starting_point::geometry) as start_long`),
            db.raw(`ST_Y(starting_point::geometry) as start_lat`),
            db.raw(`ST_X(destination_point::geometry) as des_long`),
            db.raw(`ST_Y(destination_point::geometry) as des_lat`)
        )
            .where({ id })
            .first();

        const { start_long, start_lat, des_long, des_lat, ...transportWithoutCords } = transport || {};
        return transport ? {
            ...transportWithoutCords,
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

    async update(id: UUID, data: UpdateTransport): Promise<Transport> {
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

        const { start_long, start_lat, des_long, des_lat, ...transportWithoutCords } = updatedTransport;

        return {
            ...transportWithoutCords,
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

    async delete(id: UUID): Promise<number> {
        const count = await db(this.tableName).where({ id }).del();
        return count;
    }

    async allStratingLocations(): Promise<TransportLocation[]> {
        const rows = await db(this.tableName)
            .distinct('starting_location as name')
            .select(
                db.raw(`ST_Y(starting_point::geometry) as lat`),
                db.raw(`ST_X(starting_point::geometry) as long`)
            );

        return rows.map((row) => ({
            name: row.name,
            location_point: {
                lat: parseFloat(row.lat),
                long: parseFloat(row.long),
            },
        }));
    }

    async allDestinationLocations(): Promise<TransportLocation[]> {
        const rows = await db(this.tableName)
            .distinct('destination as name')
            .select(
                db.raw(`ST_Y(destination_point::geometry) as lat`),
                db.raw(`ST_X(destination_point::geometry) as long`)
            );

        return rows.map((row) => ({
            name: row.name,
            location_point: {
                lat: parseFloat(row.lat),
                long: parseFloat(row.long),
            },
        }));
    }

    async search(params: {
        startingLocationName?: string;
        destinationLocationName?: string;
        type?: string;
        name?: string;
        sortBy?: 'fare';
        order?: 'asc' | 'desc';
    }): Promise<Transport[]> {
        const {
            startingLocationName,
            destinationLocationName,
            type,
            name,
            sortBy,
            order = 'asc'
        } = params;

        const query = db('transports')
            .select(
                '*',
                db.raw(`ST_X(starting_point::geometry) as start_long`),
                db.raw(`ST_Y(starting_point::geometry) as start_lat`),
                db.raw(`ST_X(destination_point::geometry) as des_long`),
                db.raw(`ST_Y(destination_point::geometry) as des_lat`)
            );

        if (startingLocationName) {
            query.whereILike('starting_location', `%${startingLocationName}%`);
        }

        if (destinationLocationName) {
            query.whereILike('destination', `%${destinationLocationName}%`);
        }

        if (type) {
            const upper = type.toUpperCase();
            if (['BUS', 'TRAIN', 'FLIGHT', 'BOAT', 'OTHER'].includes(upper)) {
                query.where('type', upper);
            }
        }

        if (name) {
            query.whereILike('name', `%${name}%`);
        }

        if (sortBy === 'fare') {
            query.orderByRaw(`fare::numeric ${order === 'desc' ? 'desc' : 'asc'}`);
        } else {
            query.orderBy('created_at', 'desc');
        }

        const transports = await query;

        return transports.map(transport => {
            const { start_long, start_lat, des_long, des_lat, ...transportWithoutCords } = transport;
            return {
            ...transportWithoutCords,
            starting_point: { lat: parseFloat(transport.start_lat), long: parseFloat(transport.start_long) },
            destination_point: { lat: parseFloat(transport.des_lat), long: parseFloat(transport.des_long) },
            created_at: new Date(transport.created_at),
            updated_at: new Date(transport.updated_at),
        }});
    }

}