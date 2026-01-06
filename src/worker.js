import dotenv from "dotenv";
import { testConnection } from "./config/database.js";
import { initRedis } from "../src/config/Redis.js";
import {
  createRouteWorker,
  createReceiptWorker,
  setupWorkerEvents,
} from "./workers/deliveryWorker.js";

dotenv.config();

const startWorker = async () => {
  try {
    console.log("🚀 Starting LogistiMa Worker...");

    await testConnection();
    await initRedis();

    const routeWorker = createRouteWorker();
    const receiptWorker = createReceiptWorker();

    setupWorkerEvents(routeWorker, "Route Calculation");
    setupWorkerEvents(receiptWorker, "Receipt Generation");

    console.log("✅ Workers started successfully");
    console.log("📊 Listening for jobs...");

    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️  Received ${signal}, closing workers...`);

      try {
        await routeWorker.close();
        await receiptWorker.close();
        console.log("✅ Workers closed successfully");
        process.exit(0);
      } catch (error) {
        console.error("❌ Error closing workers:", error);
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start worker:", error);
    process.exit(1);
  }
};

startWorker();
