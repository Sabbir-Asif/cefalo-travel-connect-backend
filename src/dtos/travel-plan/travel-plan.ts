import { UUID } from "crypto";
import { CreateTravelPlan, TravelPlan, TravelPlanStatus, UpdateTravelPlan } from "../../interfaces/travel-plan";

export class CreateTravelPlanDto {
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
    starting_date: Date;
    ending_date: Date;
    budget: number;
    description: string;
    status: TravelPlanStatus;

    constructor(data: CreateTravelPlan) {
        this.title = data.title;
        this.starting_point_name = data.starting_point_name;
        this.starting_point_location = {
            lat: data.starting_point_location.lat,
            long: data.starting_point_location.long,
        };
        this.destination_name = data.destination_name;
        this.destination_location = {
            lat: data.destination_location.lat,
            long: data.destination_location.long,
        };
        this.starting_date = new Date(data.starting_date);
        this.ending_date = new Date(data.ending_date);
        this.budget = data.budget;
        this.description = data.description;
        this.status = data.status ?? TravelPlanStatus.PENDING;
    }
}

export class UpdateTravelPlanDto {
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
    starting_date?: Date;
    ending_date?: Date;
    budget?: number;
    description?: string;
    status?: TravelPlanStatus;

    constructor(data: UpdateTravelPlan) {
        this.title = data.title;

        if (data.starting_point_location) {
            this.starting_point_location = {
                lat: data.starting_point_location.lat,
                long: data.starting_point_location.long,
            };
        }

        this.starting_point_name = data.starting_point_name;

        if (data.destination_location) {
            this.destination_location = {
                lat: data.destination_location.lat,
                long: data.destination_location.long,
            };
        }

        this.destination_name = data.destination_name;

        this.starting_date = data.starting_date ? new Date(data.starting_date) : undefined;
        this.ending_date = data.ending_date ? new Date(data.ending_date) : undefined;

        this.budget = data.budget;
        this.description = data.description;
        this.status = data.status;
    }
}

export class TravelPlanResponseDto {
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
    };

    starting_date: Date;
    ending_date: Date;

    budget: number;
    description: string;
    status: TravelPlanStatus;

    created_at: Date;
    updated_at: Date;

    constructor(data: TravelPlan) {
        this.id = data.id;
        this.planner_id = data.planner_id;
        this.title = data.title;

        this.starting_point_name = data.starting_point_name;
        this.starting_point_location = {
            lat: data.starting_point_location.lat,
            long: data.starting_point_location.long,
        };

        this.destination_name = data.destination_name;
        this.destination_location = {
            lat: data.destination_location.lat,
            long: data.destination_location.long,
        };

        this.starting_date = new Date(data.starting_date);
        this.ending_date = new Date(data.ending_date);
        this.budget = data.budget;
        this.description = data.description;
        this.status = data.status;

        this.created_at = new Date(data.created_at);
        this.updated_at = new Date(data.updated_at);
    }
}
