import cron from "node-cron";
import prisma from "../prisma";
import { AUTH_CONFIG } from "../config/authConfig";

const CLEAN_INTERVAL = "0 3 * * *"; 
// Every day at 3:00 AM

cron.schedule(CLEAN_INTERVAL, async () => {
  console.log("[CRON] Running cleanup tasks...");

  const now = new Date();

  // 1. Delete expired verification tokens
  await prisma.emailVerificationToken.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  // 2. Delete unverified users older than 30 days
  await prisma.user.deleteMany({
    where: {
      isVerified: false,
      createdAt: {
        lt: new Date(Date.now() - AUTH_CONFIG.deleteUnverifiedAfter),
      },
    },
  });

  console.log("[CRON] Cleanup complete");
});
