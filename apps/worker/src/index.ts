import Redis from "ioredis";

const url = process.env.REDIS_URL || "redis://redis:6379";
const redis = new Redis(url);

async function main() {
  const pong = await redis.ping();
  // eslint-disable-next-line no-console
  console.log(`Worker connected to Redis: ${pong}`);
  setInterval(() => {
    // keep process alive and visible in logs
  }, 60_000);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
