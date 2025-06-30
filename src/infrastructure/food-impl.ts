import { UUID } from "crypto";
import { db } from "../configs/db";
import { CreateFood, Food, UpdateFood } from "../interfaces/food";
import { IFoodRepository } from "../repositories/food";

export class FoodRepository implements IFoodRepository {
  private tableName = "foods";

  async create(food: CreateFood): Promise<Food> {
    const [newFood] = await db(this.tableName)
      .insert(food)
      .returning("*");

    return {
      ...newFood,
      created_at: new Date(newFood.created_at),
      updated_at: new Date(newFood.updated_at),
    };
  }

  async getAll(): Promise<Food[]> {
    const foods = await db(this.tableName).select("*");

    return foods.map((food) => ({
      ...food,
      created_at: new Date(food.created_at),
      updated_at: new Date(food.updated_at),
    }));
  }

  async getById(id: UUID): Promise<Food | null> {
    const food = await db(this.tableName).where({ id }).first("*");

    return food ? {
          ...food,
          created_at: new Date(food.created_at),
          updated_at: new Date(food.updated_at),
        } : null;
  }

  async update(id: UUID, data: UpdateFood): Promise<Food> {
    const [updatedFood] = await db(this.tableName)
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning("*");

    return {
      ...updatedFood,
      created_at: new Date(updatedFood.created_at),
      updated_at: new Date(updatedFood.updated_at),
    };
  }

  async delete(id: UUID): Promise<void> {
    await db(this.tableName).where({ id }).del();
  }

  async search(params: {
    name?: string;
    category?: string;
    provider?: string;
    location?: string;
    sortBy?: "name" | "category" | "created_at";
    order?: "asc" | "desc";
  }): Promise<Food[]> {
    const {
      name,
      category,
      provider,
      location,
      sortBy,
      order = "asc",
    } = params;

    const query = db(this.tableName).select("*");

    if (name) {
      query.whereILike("name", `%${name}%`);
    }

    if (category) {
      query.whereILike("category", `%${category}%`);
    }

    if (provider) {
      query.whereILike("provider", `%${provider}%`);
    }

    if (location) {
      query.whereILike("location", `%${location}%`);
    }

    if (sortBy) {
      query.orderBy(sortBy, order);
    } else {
      query.orderBy("created_at", "desc");
    }

    const foods = await query;

    return foods.map((food) => ({
      ...food,
      created_at: new Date(food.created_at),
      updated_at: new Date(food.updated_at),
    }));
  }
}
