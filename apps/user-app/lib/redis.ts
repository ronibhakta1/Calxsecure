import Redis from "ioredis";

type IORedisClient = InstanceType<typeof Redis>;

let redis: IORedisClient | null = null;

function createRedis(): IORedisClient {
  if (redis) return redis;

  // create Redis instance and cast to the instance type
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Don't retry
    enableOfflineQueue: false,
    enableReadyCheck: false,
  }) as IORedisClient;

  // Suppress all Redis errors during build/runtime
  redis.on("error", () => {
    // Silently handle errors
  });

  return redis;
}

// Proxy that wraps all Redis operations with error handling
const redisProxy = new Proxy({} as IORedisClient, {
  get(_target, prop: string) {
    const client = createRedis();
    const original = (client as any)[prop];

    if (typeof original === "function") {
      return async (...args: any[]) => {
        try {
          // Only connect if not already connected
          if (redis && (redis as any).status === "wait") {
            await (redis as any).connect().catch(() => {});
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