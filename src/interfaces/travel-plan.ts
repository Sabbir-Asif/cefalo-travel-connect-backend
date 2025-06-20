import { UUID } from "crypto";

export enum TravelPlanStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
}

export interface TravelPlan {
    id: UUID;
    planner_id: UUID;
    title: string;
    starting_point_name: string;
    starting_point_location: {
        lat: number;
        long: number;
    };
    destination_name: string;
    destination_location: {
        lat: number;
        long: number;
    }
    starting_date: Date;
    ending_date: Date;
    budget: number;
    description: string;
    status: TravelPlanStatus;
    created_at: Date;
    updated_at: Date;
}

export interface CreateTravelPlan {
    title: string;
    starting_point_name: string;
    starting_point_location: {
        lat: number;
        long: number;
    };
    destination_name: string;
    destination_location: {
        lat: number;
        long: number;
    };
    starting_date: Date | string;
    ending_date: Date | string;
    budget: number;
    description: string;
    status?: TravelPlanStatus;
}

export interface UpdateTravelPlan {
    title?: string;
    starting_point_name?: string;
    starting_point_location?: {
        lat: number;
        long: number;
    };
    destination_name?: string;
    destination_location?: {
        lat: number;
        long: number;
    };
    starting_date?: Date | string;
    ending_date?: Date | string;
    budget?: number;
    description?: string;
    status?: TravelPlanStatus;
}
