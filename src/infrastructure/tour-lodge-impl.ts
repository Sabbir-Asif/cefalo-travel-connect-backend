import { UUID } from "crypto";
import { db } from "../configs/db";
import { ITourLodgeRepository } from "../repositories/tour-lodge";
import { TourLodge } from "../interfaces/tour-lodge";
import { Lodge } from "../interfaces/lodge";

export class TourLodgeRepository implements ITourLodgeRepository {
    private tableName = "tour_lodges";

    async create(travelplanId: UUID, lodgeId: UUID): Promise<TourLodge> {
        const [record] = await db(this.tableName)
            .insert({ travelplan_id: travelplanId, lodge_id: lodgeId })
            .returning("*");

        return {
            travelplan_id: record.travelplan_id,
            lodge_id: record.lodge_id
        };
    }

    async delete(travelplanId: UUID, lodgeId: UUID): Promise<number> {
        return await db(this.tableName)
            .where({ travelplan_id: travelplanId, lodge_id: lodgeId })
            .del();
    }

    async lodgesForTravelPlan(travelplanId: UUID): Promise<Lodge[]> {
        const lodges = await db(this.tableName)
            .join("lodges", "tour_lodges.lodge_id", "lodges.id")
            .where("tour_lodges.travelplan_id", travelplanId)
            .select(
                "lodges.*",
                db.raw(`ST_X(lodges.location_point::geometry) as long`),
                db.raw(`ST_Y(lodges.location_point::geometry) as lat`)
            );

        return lodges.map(lodge => ({
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
