import { UUID } from "crypto";

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
  sender: {
    id: UUID;
    name: string;
    email: string;
    displayPicture: string | null;
  };
}
