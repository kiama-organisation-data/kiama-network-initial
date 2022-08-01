/**
 * Redis is used as a secondary database as well as caching database.
 * Will be used to store temp data so as to reduce the db query
 */
import { createClient } from "redis";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

class RedisConfig {
  constructor() {}
  async connect() {
    const client = createClient({
      url: REDIS_URL,
    });
    await client.connect().catch((err) => {
      console.error(`redis error ====> ${err}`);
    });
    return client;
  }
  async addToRedis(key: string, value: any, expiresIn: any = 60 * 60 * 24) {
    const redisClient = await this.connect();
    try {
      return await redisClient.set(key, value, expiresIn);
    } catch (e) {
      throw new Error("error");
    }
  }

  async removeFromRedis(key: string) {
    const redisClient = await this.connect();
    try {
      await redisClient.del(key);
      return true;
    } catch (e) {
      throw new Error("error");
    }
  }

  async getValueFromRedis(key: string) {
    const redisClient = await this.connect();
    try {
      const data = await redisClient.get(key);
      return data;
    } catch (e) {
      throw new Error("error");
    }
  }
}

const redisConfig = new RedisConfig();

export default redisConfig;
