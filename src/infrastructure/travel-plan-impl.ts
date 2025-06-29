import { UUID } from "crypto";
import { db } from "../configs/db";
import { CreateTravelPlan, TravelPlan, UpdateTravelPlan } from "../interfaces/travel-plan";
import { ITravelPlanRepository } from "../repositories/travel-plan";

export class TravelPlanRepository implements ITravelPlanRepository {
  private tableName = "travel_plans";

  async create(userId: UUID, data: CreateTravelPlan): Promise<TravelPlan> {
    const [newPlan] = await db(this.tableName)
      .insert({
        ...data,
        planner_id: userId,
        starting_point_location: db.raw(
          `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
          [data.starting_point_location.long, data.starting_point_location.lat]
        ),
        destination_location: db.raw(
          `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
          [data.destination_location.long, data.destination_location.lat]
        )
      })
      .returning([
        '*',
        db.raw(`ST_X(starting_point_location::geometry) as start_long`),
        db.raw(`ST_Y(starting_point_location::geometry) as start_lat`),
        db.raw(`ST_X(destination_location::geometry) as dest_long`),
        db.raw(`ST_Y(destination_location::geometry) as dest_lat`),
      ]);

    return this.toModel(newPlan);
  }

  async getAll(): Promise<TravelPlan[]> {
    const plans = await db(this.tableName)
      .select(
        '*',
        db.raw(`ST_X(starting_point_location::geometry) as start_long`),
        db.raw(`ST_Y(starting_point_location::geometry) as start_lat`),
        db.raw(`ST_X(destination_location::geometry) as dest_long`),
        db.raw(`ST_Y(destination_location::geometry) as dest_lat`),
      );

    return plans.map(this.toModel);
  }

  async getById(id: UUID): Promise<TravelPlan | null> {
    const plan = await db(this.tableName)
      .where({ id })
      .first(
        '*',
        db.raw(`ST_X(starting_point_location::geometry) as start_long`),
        db.raw(`ST_Y(starting_point_location::geometry) as start_lat`),
        db.raw(`ST_X(destination_location::geometry) as dest_long`),
        db.raw(`ST_Y(destination_location::geometry) as dest_lat`),
      );

    return plan ? this.toModel(plan) : null;
  }

  async update(id: UUID, data: UpdateTravelPlan): Promise<TravelPlan> {
    const updateData: any = {
      ...data,
      updated_at: new Date(),
    };

    if (data.starting_point_location) {
      updateData.starting_point_location = db.raw(
        `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
        [data.starting_point_location.long, data.starting_point_location.lat]
      );
    }

    if (data.destination_location) {
      updateData.destination_location = db.raw(
        `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
        [data.destination_location.long, data.destination_location.lat]
      );
    }

    const [updatedPlan] = await db(this.tableName)
      .where({ id })
      .update(updateData)
      .returning([
        '*',
        db.raw(`ST_X(starting_point_location::geometry) as start_long`),
        db.raw(`ST_Y(starting_point_location::geometry) as start_lat`),
        db.raw(`ST_X(destination_location::geometry) as dest_long`),
        db.raw(`ST_Y(destination_location::geometry) as dest_lat`),
      ]);

    return this.toModel(updatedPlan);
  }

  async delete(id: UUID): Promise<void> {
    await db(this.tableName).where({ id }).del();
  }

  async search(params: Record<string, any>): Promise<TravelPlan[]> {
    const { title, status, sortBy, order = "desc" } = params;

    const query = db(this.tableName)
      .select(
        '*',
        db.raw(`ST_X(starting_point_location::geometry) as start_long`),
        db.raw(`ST_Y(starting_point_location::geometry) as start_lat`),
        db.raw(`ST_X(destination_location::geometry) as dest_long`),
        db.raw(`ST_Y(destination_location::geometry) as dest_lat`),
      );

    if (title) query.whereILike("title", `%${title}%`);
    if (status) query.where("status", status);
    if (sortBy) query.orderBy(sortBy, order);
    else query.orderBy("created_at", order);

    const results = await query;
    return results.map(this.toModel);
  }

  private toModel = (row: any): TravelPlan => ({
    id: row.id,
    planner_id: row.planner_id,
    title: row.title,
    starting_point_name: row.starting_point_name,
    starting_point_location: {
      lat: parseFloat(row.start_lat),
      long: parseFloat(row.start_long),
    },
    destination_name: row.destination_name,
    destination_location: {
      lat: parseFloat(row.dest_lat),
      long: parseFloat(row.dest_long),
    },
    starting_date: new Date(row.starting_date),
    ending_date: new Date(row.ending_date),
    budget: parseFloat(row.budget),
    description: row.description,
    status: row.status,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  });
}
