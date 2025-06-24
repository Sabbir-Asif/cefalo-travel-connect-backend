import { UUID } from "crypto";
import { db } from "../../configs/db";
import { CreateTourTransport, TourTransportWithTransport, UpdateTourTransport } from "../../interfaces/tour-transport";
import { ITourTransportRepository } from "../tour-transport";

export class TourTransportRepository implements ITourTransportRepository {
    private tableName = "tour_transports";

    async create(data: CreateTourTransport): Promise<TourTransportWithTransport> {
        const [newTourTransport] = await db(this.tableName)
            .insert(data)
            .returning("*");

        const tourtransportWithTransport = await db(this.tableName)
            .select(
                "tour_transports.*",
                db.raw("row_to_json(transports.*) as transport")
            )
            .leftJoin("transports", "tour_transports.transport_id", "transports.id")
            .where("tour_transports.id", newTourTransport.id)
            .first();

        return this.toModelWithTransport(tourtransportWithTransport);
    }

    async getAll(): Promise<TourTransportWithTransport[]> {
        const tourTransports = await db(this.tableName)
            .select(
                "tour_transports.*",
                db.raw("row_to_json(transports.*) as transport")
            )
            .leftJoin("transports", "tour_transports.transport_id", "transports.id")
            .orderBy("tour_transports.created_at", "desc");

        return tourTransports.map(this.toModelWithTransport);
    }

    async getById(id: UUID): Promise<TourTransportWithTransport | null> {
        const row = await db(this.tableName)
            .select(
                "tour_transports.*",
                db.raw("row_to_json(transports.*) as transport")
            )
            .leftJoin("transports", "tour_transports.transport_id", "transports.id")
            .where("tour_transports.id", id)
            .first();

        return row ? this.toModelWithTransport(row) : null;
    }

    async update(id: UUID, data: UpdateTourTransport): Promise<TourTransportWithTransport> {
        const [updatedTourTransport] = await db(this.tableName)
            .update({ ...data, updated_at: new Date() })
            .where({ id })
            .returning("*");

        const tourTransportWithTransport = await db(this.tableName)
            .select(
                "tour_transports.*",
                db.raw("row_to_json(transports.*) as transport")
            )
            .leftJoin("transports", "tour_transports.transport_id", "transports.id")
            .where("tour_transports.id", updatedTourTransport.id)
            .first();

        return this.toModelWithTransport(tourTransportWithTransport);
    }


    async delete(id: UUID): Promise<void> {
        await db(this.tableName).where({ id }).del();
    }

    async search(params: Record<string, any>): Promise<TourTransportWithTransport[]> {
        const {
            travelplan_id,
            transport_id,
            contact_number,
            sortBy = "created_at",
            order = "desc",
        } = params;

        const query = db(this.tableName)
            .select(
                "tour_transports.*",
                db.raw("row_to_json(transports.*) as transport")
            )
            .leftJoin("transports", "tour_transports.transport_id", "transports.id");

        if (travelplan_id) query.where("tour_transports.travelplan_id", travelplan_id);
        if (transport_id) query.where("tour_transports.transport_id", transport_id);
        if (contact_number) query.whereILike("tour_transports.contact_number", `%${contact_number}%`);

        query.orderBy(`tour_transports.${sortBy}`, order);

        const rows = await query;
        return rows.map(this.toModelWithTransport);
    }

    private toModelWithTransport = (row: any): TourTransportWithTransport => ({
        id: row.id,
        travelplan_id: row.travelplan_id,
        transport_id: row.transport_id,
        departure_time: new Date(row.departure_time),
        contact_number: row.contact_number,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        transport: row.transport,
    });
}
