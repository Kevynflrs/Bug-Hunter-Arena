import mongoose from "mongoose";
import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

// MongoDB Connection
export const connectMongoDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI!);
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }
};

// Redis Connection
export const connectRedis = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      redisClient.on("error", (err: any) => {
        console.error("Redis Client Error:", err);
      });

      await redisClient.connect();
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      throw error;
    }
  }

  return redisClient;
};

// Disconnect Redis
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.disconnect();
    console.log("Disconnected from Redis");
  }
};