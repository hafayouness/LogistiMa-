import Redis from "ioredis";

class QueueService {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "redis",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.redis.on("connect", () => {
      console.log("✅ Connected to Redis");
    });

    this.redis.on("error", (err) => {
      console.error("❌ Redis error:", err);
    });
  }

  async addJob(queueName, jobData) {
    const job = {
      id: Date.now().toString(),
      data: jobData,
      createdAt: new Date().toISOString(),
    };

    await this.redis.lpush(queueName, JSON.stringify(job));
    console.log(`✅ Job added to queue: ${queueName}`);
    return job;
  }

  async getJob(queueName) {
    const jobString = await this.redis.rpop(queueName);
    if (!jobString) return null;

    return JSON.parse(jobString);
  }

  async close() {
    await this.redis.quit();
  }
}

export default new QueueService();
