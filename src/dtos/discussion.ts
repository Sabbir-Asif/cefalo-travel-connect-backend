import { UUID } from "crypto";
import { Discussion, DiscussionWithSender, CreateDiscussion } from "../interfaces/discussion";

export class CreateDiscussionDto {
  travel_plan_id: string;
  content: string;

  constructor(data: CreateDiscussion) {
    this.travel_plan_id = data.travel_plan_id;
    this.content = data.content;
  }
}

export class DiscussionResponseDto {
  id: UUID;
  travel_plan_id: string;
  sender_id: string;
  content: string;
  created_at: Date;

  constructor(data: Discussion) {
    this.id = data.id;
    this.travel_plan_id = data.travel_plan_id;
    this.sender_id = data.sender_id;
    this.content = data.content;
    this.created_at = new Date(data.created_at);
  }
}

export class DiscussionWithSenderResponseDto extends DiscussionResponseDto {
  sender: {
    id: string;
    name: string;
    email: string;
    displayPicture: string | null;
  };

  constructor(data: DiscussionWithSender) {
    super(data);
    this.sender = data.sender;
  }
}
