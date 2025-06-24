import { UUID } from "crypto";
import { TravelRequest, TravelRequestWithUsers, TravelRequestStatus, CreateTravelRequest, UpdateTravelRequest } from "../interfaces/travel-request";
import { UserResponse } from "../interfaces/user";

export class CreateTravelRequestDto {
  travel_plan_id: UUID;
  user_to: UUID;
  title: string;
  message?: string;

  constructor(data: CreateTravelRequest) {
    this.travel_plan_id = data.travel_plan_id;
    this.user_to = data.user_to;
    this.title = data.title;
    this.message = data.message;
  }
}

export class UpdateTravelRequestDto {
  title?: string;
  message?: string;
  status?: TravelRequestStatus;

  constructor(data: UpdateTravelRequest) {
    this.title = data.title;
    this.message = data.message;
    this.status = data.status;
  }
}

export class TravelRequestResponseDto {
  id: UUID;
  travel_plan_id: UUID;
  user_from: UUID;
  user_to: UUID;
  title: string;
  message?: string;
  status: TravelRequestStatus;
  created_at: Date;
  updated_at: Date;

  constructor(data: TravelRequest) {
    this.id = data.id;
    this.travel_plan_id = data.travel_plan_id;
    this.user_from = data.user_from;
    this.user_to = data.user_to;
    this.title = data.title;
    this.message = data.message;
    this.status = data.status;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
  }
}

export class TravelRequestWithUsersResponseDto {
  id: UUID;
  travel_plan_id: UUID;
  user_from: UUID;
  user_to: UUID;
  title: string;
  message?: string;
  status: TravelRequestStatus;
  created_at: Date;
  updated_at: Date;
  from_user: UserResponse;
  to_user: UserResponse;

  constructor(data: TravelRequestWithUsers) {
    this.id = data.id;
    this.travel_plan_id = data.travel_plan_id;
    this.user_from = data.user_from;
    this.user_to = data.user_to;
    this.title = data.title;
    this.message = data.message;
    this.status = data.status;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
    this.from_user = data.from_user;
    this.to_user = data.to_user;
  }
}
