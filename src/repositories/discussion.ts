import { UUID } from "crypto";
import { CreateDiscussion, Discussion, DiscussionWithSender } from "../interfaces/discussion";

export interface IDiscussionRepository {
  create(senderId: UUID, data: CreateDiscussion): Promise<Discussion>;
  getByTravelPlanId(travelPlanId: UUID): Promise<DiscussionWithSender[]>;
  getById(id: UUID): Promise<DiscussionWithSender | null>;
  delete(id: UUID): Promise<void>;
  search(params: Record<string, any>): Promise<DiscussionWithSender[]>;
}
