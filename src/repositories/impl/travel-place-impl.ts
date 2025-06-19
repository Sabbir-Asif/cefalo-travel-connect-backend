import { UUID } from "crypto";
import { CreateTravelPlace, TravelPlace, UpdateTravelPlace } from "../../interfaces/travel-place";
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


        return travelPlace ? {
            ...travelPlace,
            location_point: {
                lat: parseFloat(travelPlace.lat),
                long: parseFloat(travelPlace.long)
            },
            created_at: new Date(travelPlace.created_at),
            updated_at: new Date(travelPlace.updated_at)
        } : null;
    }

    async update(id: UUID, data: UpdateTravelPlace): Promise<TravelPlace> {
        const updateData: any = {
            ...data,
            updated_at: new Date()
        }

        if (data.location_point) {
            updateData.location_point = db.raw(
                `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
                [data.location_point.long, data.location_point.lat]
            );
        }
        if (data.tags) updateData.tags = JSON.stringify(data.tags);

        const [updatedTravelPlace

        ] = await db(this.tableName)
            .where({ id })
            .update(updateData)
            .returning([
                '*',
                db.raw(`ST_X(location_point::geometry) as long`),
                db.raw(`ST_Y(location_point::geometry) as lat`)
            ]);

        return {
            ...updatedTravelPlace,
            location_point: {
                lat: parseFloat(updatedTravelPlace.lat),
                long: parseFloat(updatedTravelPlace.long)
            },
            created_at: new Date(updatedTravelPlace.created_at),
            updated_at: new Date(updatedTravelPlace.updated_at)
        };
    }

    async delete(id: UUID): Promise<void> {
        const rows = await db(this.tableName).where({ id }).del();
    }

    async search(params: {
        name?: string;
        location_name?: string;
        description?: string;
        tag?: string;
        sortBy?: 'name' | 'location_name' | 'created_at';
        order?: 'asc' | 'desc';
    }): Promise<TravelPlace[]> {
        const {
            name,
            location_name,
            description,
            tag,
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

        if (description) {
            query.whereILike('description', `%${description}%`);
        }

        if (tag) {
            query.whereRaw(`tags @> ?::jsonb`, [JSON.stringify([tag])])
        }

        if (sortBy === 'name' || sortBy === 'location_name' || sortBy === 'created_at') {
            query.orderBy(sortBy, order);
        } else {
            query.orderBy('created_at', 'desc');
        }

        const results = await query;

        return results.map(place => ({
            ...place,
            location_point: {
                lat: parseFloat(place.lat),
                long: parseFloat(place.long)
            },
            created_at: new Date(place.created_at),
            updated_at: new Date(place.updated_at)
        }));
    }


}