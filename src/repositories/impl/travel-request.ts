import { UUID } from "crypto";
import { db } from "../../configs/db";
import { TravelRequest, CreateTravelRequest, UpdateTravelRequest, TravelRequestWithUsers } from "../../interfaces/travel-request";
import { ITravelRequestRepository } from "../travel-request";
import { UserResponseDto } from "../../dtos/user";

export class TravelRequestRepository implements ITravelRequestRepository {
  search(params: Record<string, any>): Promise<TravelRequestWithUsers[]> {
    throw new Error("Method not implemented.");
  }
  private tableName = "travel_requests";

  async create(userFrom: UUID, data: CreateTravelRequest): Promise<TravelRequest> {
    const [created] = await db(this.tableName)
      .insert({
        ...data,
        user_from: userFrom,
      })
      .returning("*");

    return this.toModel(created);
  }

  async getAll(): Promise<TravelRequestWithUsers[]> {
    const rows = await db
      .select(
        "travel_requests.*",
        db.raw("row_to_json(from_user.*) as from_user"),
        db.raw("row_to_json(to_user.*) as to_user")
      )
      .from("travel_requests")
      .leftJoin("users as from_user", "travel_requests.user_from", "from_user.id")
      .leftJoin("users as to_user", "travel_requests.user_to", "to_user.id");

    return rows.map(this.toModelWithUsers);
  }

  async getById(id: UUID): Promise<TravelRequestWithUsers | null> {
    const row = await db
      .select(
        "travel_requests.*",
        db.raw("row_to_json(from_user.*) as from_user"),
        db.raw("row_to_json(to_user.*) as to_user")
      )
      .from("travel_requests")
      .leftJoin("users as from_user", "travel_requests.user_from", "from_user.id")
      .leftJoin("users as to_user", "travel_requests.user_to", "to_user.id")
      .where("travel_requests.id", id)
      .first();

    return row ? this.toModelWithUsers(row) : null;
  }

  async getByTravelPlanId(travelPlanId: UUID): Promise<TravelRequestWithUsers[]> {
    const rows = await db
      .select(
        "travel_requests.*",
        db.raw("row_to_json(from_user.*) as from_user"),
        db.raw("row_to_json(to_user.*) as to_user")
      )
      .from("travel_requests")
      .leftJoin("users as from_user", "travel_requests.user_from", "from_user.id")
      .leftJoin("users as to_user", "travel_requests.user_to", "to_user.id")
      .where("travel_requests.travel_plan_id", travelPlanId);

    return rows.map(this.toModelWithUsers);
  }

  async update(id: UUID, data: UpdateTravelRequest): Promise<TravelRequest> {
    const [updated] = await db(this.tableName)
      .where({ id })
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning("*");

    return this.toModel(updated);
  }

  async delete(id: UUID): Promise<void> {
    await db(this.tableName).where({ id }).del();
  }

  private toModel = (row: any): TravelRequest => ({
    id: row.id,
    travel_plan_id: row.travel_plan_id,
    user_from: row.user_from,
    user_to: row.user_to,
    title: row.title,
    message: row.message,
    status: row.status,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  });

  private toModelWithUsers = (row: any): TravelRequestWithUsers => ({
    ...this.toModel(row),
    from_user: new UserResponseDto(row.from_user),
    to_user: new UserResponseDto(row.to_user),
  });
}
