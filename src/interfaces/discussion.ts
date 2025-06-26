import { UUID } from "crypto";
import { UserResponse } from "./user";

export interface Discussion {
  id: UUID;
  travel_plan_id: UUID;
  sender_id: UUID;
  content: string;
  created_at: Date;
}

export interface CreateDiscussion {
  travel_plan_id: UUID;
  content: string;
}

export interface DiscussionWithSender extends Discussion {
  sender: UserResponse;
}
