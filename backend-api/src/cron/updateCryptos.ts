import { updateTopCryptos } from "../services/cryptoService";

const UPDATE_INTERVAL = 5 * 60 * 1000;
let isUpdating = false;

// Run once on startup
(async function initialUpdate() {
  try {
    console.log("[CRON] Initial crypto update running...");
    await updateTopCryptos();
    console.log("[CRON] Initial update completed.");
  } catch (err) {
    console.error("[CRON] Initial update failed:", err);
  }
})();

// Schedule updates
setInterval(async () => {
  if (isUpdating) {
    console.log("[CRON] Skipping update, previous still running.");
    return;
  }

  isUpdating = true;

  try {
    console.log("[CRON] Scheduled crypto update started...");
    await updateTopCryptos();
    console.log("[CRON] Scheduled crypto update finished.");
  } catch (err) {
    console.error("[CRON] Scheduled update failed:", err);
  } finally {
    isUpdating = false;
  }
}, UPDATE_INTERVAL);

console.log("[CRON] Crypto updater initialized.");
