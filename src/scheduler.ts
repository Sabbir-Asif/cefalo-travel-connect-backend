import cron from "node-cron";
import { cleanExpiredPasswordResets, cleanExpiredVerifications } from "./jobs/clean-expired-verifications";

cron.schedule("0 * * * *", async () => {
  await cleanExpiredVerifications();
  await cleanExpiredPasswordResets();
});
