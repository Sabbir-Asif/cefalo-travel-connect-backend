import cron from "node-cron";
import { cleanExpiredVerifications } from "./jobs/clean-expired-verifications";

cron.schedule("0 * * * *", async () => {
  await cleanExpiredVerifications();
});
