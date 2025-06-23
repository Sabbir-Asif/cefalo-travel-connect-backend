import { UUID } from "crypto";
import { db } from "../../configs/db";
import { TravelRequest, CreateTravelRequest, UpdateTravelRequest,TravelRequestWithUsers } from "../../interfaces/travel-request";
import { ITravelRequestRepository } from "../travel-request";
import { UserResponseDto } from "../../dtos/user";

export class TravelRequestRepository implements ITravelRequestRepository {
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
    const results = await db
      .select(
        "travel_requests.*",
        db.raw("row_to_json(from_user.*) as from_user"),
        db.raw("row_to_json(to_user.*) as to_user")
      )
      .from("travel_requests")
      .leftJoin("users as from_user", "travel_requests.user_from", "from_user.id")
      .leftJoin("users as to_user", "travel_requests.user_to", "to_user.id");

    return results.map(this.toModelWithUsers);
  }

  async getById(id: UUID): Promise<TravelRequestWithUsers | null> {
    const result = await db
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

    return result ? this.toModelWithUsers(result) : null;
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

  async search(params: Record<string, any>): Promise<TravelRequestWithUsers[]> {
    const {
      travel_plan_id,
      user_from,
      user_to,
      status,
      title,
      sortBy = "created_at",
      order = "desc"
    } = params;

    const query = db
      .select(
        "travel_requests.*",
        db.raw("row_to_json(from_user.*) as from_user"),
        db.raw("row_to_json(to_user.*) as to_user")
      )
      .from("travel_requests")
      .leftJoin("users as from_user", "travel_requests.user_from", "from_user.id")
      .leftJoin("users as to_user", "travel_requests.user_to", "to_user.id");

    if (travel_plan_id) query.where("travel_requests.travel_plan_id", travel_plan_id);
    if (user_from) query.where("travel_requests.user_from", user_from);
    if (user_to) query.where("travel_requests.user_to", user_to);
    if (status) query.where("travel_requests.status", status);
    if (title) query.whereILike("travel_requests.title", `%${title}%`);

    query.orderBy(`travel_requests.${sortBy}`, order);

    const results = await query;
    return results.map(this.toModelWithUsers);
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
