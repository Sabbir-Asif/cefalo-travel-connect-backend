import { UUID } from "crypto";

export interface BlogTransport {
    blog_id: UUID,
    transport_id: UUID,
}

