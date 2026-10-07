import { redisClient } from "../configs/redis.config";

export const cacheMiddleware = (key) => {
  return async (req, res, next) => {
    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        console.log("Cache taken (hit):", key);
        return res.json(JSON.parse(cachedData));
      }

      console.log("Cache not found (Miss):", key);
      next();
    } catch (error) {
      next(error);
    }
  };
};
