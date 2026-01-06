import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
};

export const redisClient = new Redis(redisConfig);

export const redisQueue = new Redis(redisConfig);

export const redisLock = new Redis(redisConfig);

export const initRedis = async () => {
  try {
    await redisClient.ping();
    console.log("✅ Redis connection established successfully");
  } catch (error) {
    console.error("❌ Unable to connect to Redis:", error);
    throw error;
  }
};

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("🔌 Redis Client Connected");
});

redisQueue.on("error", (err) => {
  console.error("❌ Redis Queue Error:", err);
});

redisLock.on("error", (err) => {
  console.error("❌ Redis Lock Error:", err);
});

export default redisClient;
