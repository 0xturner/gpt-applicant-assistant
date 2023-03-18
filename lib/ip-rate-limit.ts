import { initRateLimit, CountFn } from "./rate-limit";
import { upstashRest } from "./upstash";

export default function getIP(request: Request) {
  const xff = request.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0] : "127.0.0.1";
}

const LIMIT = process.env.IP_RATE_LIMIT
  ? parseInt(process.env.IP_RATE_LIMIT)
  : 10;

const TIMEFRAME = process.env.IP_RATE_TIMEFRAME
  ? parseInt(process.env.IP_RATE_TIMEFRAME)
  : 60 * 60 * 24; // 1 day

export const ipRateLimit = initRateLimit((request) => ({
  id: `ip:${getIP(request)}`,
  count: increment,
  limit: LIMIT,
  timeframe: TIMEFRAME,
}));

const increment: CountFn = async ({ response, key, timeframe }) => {
  // Latency logging
  const start = Date.now();

  const results = await upstashRest(
    [
      ["INCR", key],
      ["EXPIRE", key, timeframe],
    ],
    { pipeline: true }
  );

  // Temporal logging
  const latency = Date.now() - start;
  response.headers.set("x-upstash-latency", `${latency}`);

  return results[0].result;
};
