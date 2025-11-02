import Redis from "ioredis";

let redis: Redis | null = null;

function createRedis(): Redis {
  if (redis) return redis;

  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Don't retry
    enableOfflineQueue: false,
    enableReadyCheck: false,
  });

  // Suppress all Redis errors during build/runtime
  redis.on("error", () => {
    // Silently handle errors
  });

  return redis;
}

// Proxy that wraps all Redis operations with error handling
const redisProxy = new Proxy({} as Redis, {
  get(_target, prop: string) {
    const client = createRedis();
    const original = (client as any)[prop];

    if (typeof original === "function") {
      return async (...args: any[]) => {
        try {
          // Only connect if not already connected
          if (redis && redis.status === "wait") {
            await redis.connect().catch(() => {});
          }
          return await original.apply(client, args);
        } catch (error: any) {
          // Return safe defaults for build-time failures
          if (prop === "get") return null;
          if (prop === "incr") return 0;
          // For other methods, return undefined (no-op)
          return undefined;
        }
      };
    }
    return original;
  },
});

export default redisProxy;