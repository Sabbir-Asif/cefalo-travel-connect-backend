import { UUID } from "crypto";
import { CreateTravelPlace, TravelPlace } from "../../interfaces/travel-place";
import { ITravelPlaceRepository } from "../travel-place";
import { db } from "../../configs/db";

export class TravelPlaceRepository implements ITravelPlaceRepository {
    private tableName = 'travel_places';

    async create(userId: UUID, travelPlace: CreateTravelPlace): Promise<TravelPlace> {
        const [newTravelPlace] = await db(this.tableName).insert({
            ...travelPlace,
            user_id: userId,
            location_point: db.raw(
                `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
                [travelPlace.location_point.long, travelPlace.location_point.lat]
            ),
            tags: JSON.stringify(travelPlace.tags)
        }).returning([
            '*',
            db.raw(`ST_X(location_point::geometry) as long`),
            db.raw(`ST_Y(location_point::geometry) as lat`)
        ]);

        return {
            ...newTravelPlace,
            location_point: {
                lat: parseFloat(newTravelPlace.lat),
                long: parseFloat(newTravelPlace.long)
            },
            created_at: new Date(newTravelPlace.created_at),
            updated_at: new Date(newTravelPlace.updated_at)
        }
    }

    async getAll(): Promise<TravelPlace[]> {
        const travelPlaces = await db(this.tableName)
            .select(
                '*',
                db.raw(`ST_X(location_point::geometry) as long`),
                db.raw(`ST_Y(location_point::geometry) as lat`)
            );

        return travelPlaces.map((travelPlace) => ({
            ...travelPlace,
            location_point: {
                lat: parseFloat(travelPlace.lat),
                long: parseFloat(travelPlace.long)
            },
            created_at: new Date(travelPlace.created_at),
            updated_at: new Date(travelPlace.updated_at)
        }));
    }

    async getById(id: UUID): Promise<TravelPlace | null> {
        const travelPlace = await db(this.tableName)
            .where({ id })
            .first(
                '*',
                db.raw(`ST_X(location_point::geometry) as long`),
                db.raw(`ST_Y(location_point::geometry) as lat`)
            );


        return {
            ...travelPlace,
            location_point: {
                lat: parseFloat(travelPlace.lat),
                long: parseFloat(travelPlace.long)
            },
            created_at: new Date(travelPlace.created_at),
            updated_at: new Date(travelPlace.updated_at)
        };
    }

}