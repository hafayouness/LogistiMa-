import { Worker } from "bullmq";
import QueueService from "../services/QueueService.js";

export const createRouteWorker = () => {
  const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  };

  return new Worker(
    "route-calculation",
    async (job) => {
      console.log(
        `🚗 Processing route calculation for delivery ${job.data.deliveryId}`
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const { pickupLocation, deliveryLocation } = job.data;

      const R = 6371;
      const dLat =
        ((deliveryLocation.lat - pickupLocation.lat) * Math.PI) / 180;
      const dLon =
        ((deliveryLocation.lng - pickupLocation.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pickupLocation.lat * Math.PI) / 180) *
          Math.cos((deliveryLocation.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      const estimatedTime = (distance / 30) * 60; // 30 km/h en ville

      console.log(
        `✅ Route calculated: ${distance.toFixed(2)}km, ~${Math.round(
          estimatedTime
        )}min`
      );

      return {
        deliveryId: job.data.deliveryId,
        distance: distance.toFixed(2),
        estimatedTime: Math.round(estimatedTime),
        route: [pickupLocation, deliveryLocation],
      };
    },
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );
};

export const createReceiptWorker = () => {
  const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  };

  return new Worker(
    "receipt-generation",
    async (job) => {
      console.log(
        `📄 Generating receipt for delivery ${job.data.trackingNumber}`
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      const receipt = {
        deliveryId: job.data.deliveryId,
        trackingNumber: job.data.trackingNumber,
        customerName: job.data.customerName,
        driverId: job.data.driverId,
        generatedAt: new Date().toISOString(),
        receiptUrl: `https://logistima.ma/receipts/${job.data.deliveryId}.pdf`,
      };

      console.log(`✅ Receipt generated: ${receipt.receiptUrl}`);

      console.log(`📧 Notification sent to ${job.data.customerName}`);

      return receipt;
    },
    {
      connection,
      concurrency: 10,
      limiter: {
        max: 20,
        duration: 1000,
      },
    }
  );
};

// Gestion des événements des workers
export const setupWorkerEvents = (worker, name) => {
  worker.on("completed", (job) => {
    console.log(`✅ ${name} job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ ${name} job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error(`❌ ${name} worker error:`, err);
  });

  worker.on("stalled", (jobId) => {
    console.warn(`⚠️  ${name} job ${jobId} stalled`);
  });
};
