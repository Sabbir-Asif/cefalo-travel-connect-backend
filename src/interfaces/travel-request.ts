import { UUID } from "crypto";
import { Role, UserResponse } from "./user";

export enum TravelRequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface TravelRequest {
  id: UUID;
  travel_plan_id: UUID;
  user_from: UUID;
  user_to: UUID;
  title: string;
  message?: string;
  status: TravelRequestStatus;
  created_at: Date;
  updated_at: Date;
}

export interface TravelRequestWithUsers extends TravelRequest {
  from_user: UserResponse;
  to_user: UserResponse;
}

export interface CreateTravelRequest {
  travel_plan_id: UUID;
  user_to: UUID;
  title: string;
  message?: string;
}

export interface UpdateTravelRequest {
  title?: string;
  message?: string;
  status?: TravelRequestStatus;
}
