const AppError = require("../utils/AppError");
const redisClient = require("../config/redis");

const redisKey = require("../utils/redisKey");

const getPositiveInteger = (value, fallback) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const RATE_LIMIT_WINDOW_MS = getPositiveInteger(
  process.env.RATE_LIMIT_WINDOW_MS,
  60 * 1000
);

const LOGIN_MAX = getPositiveInteger(
  process.env.RATE_LIMIT_LOGIN_MAX,
  10
);

const REGISTER_MAX = getPositiveInteger(
  process.env.RATE_LIMIT_REGISTER_MAX,
  5
);

const ADMIN_REGISTER_MAX = getPositiveInteger(
  process.env.RATE_LIMIT_ADMIN_REGISTER_MAX,
  3
);

const CODE_RUN_MAX = getPositiveInteger(
  process.env.RATE_LIMIT_CODE_RUN_MAX,
  10
);

const CODE_SUBMIT_MAX = getPositiveInteger(
  process.env.RATE_LIMIT_CODE_SUBMIT_MAX,
  5
);

const GENERAL_MAX = getPositiveInteger(
  process.env.RATE_LIMIT_GENERAL_MAX,
  120
);

const ADMIN_WRITE_MAX = getPositiveInteger(
  process.env.RATE_LIMIT_ADMIN_WRITE_MAX,
  20
);

const sanitizeIp = (ip) => {
  if (!ip) {
    return "unknown";
  }

  return String(ip)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:._-]/g, "_");
};

const getIdentity = (req, keyType) => {
  /*
   * Protected routes:
   * use authenticated user ID.
   */
  if (keyType === "user") {
    if (!req.result || !req.result.id) {
      throw new AppError(
        "Authentication required.",
        401,
        "AUTHENTICATION_ERROR"
      );
    }

    return `user:${req.result.id}`;
  }

  /*
   * Admin protected routes:
   * use authenticated admin ID.
   */
  if (keyType === "admin") {
    if (!req.result || !req.result.id) {
      throw new AppError(
        "Authentication required.",
        401,
        "AUTHENTICATION_ERROR"
      );
    }

    return `admin:${req.result.id}`;
  }

  /*
   * Public routes:
   * use Express's resolved request IP.
   *
   * We do not trust X-User-ID or other client-provided
   * identity headers.
   */
  return `ip:${sanitizeIp(req.ip)}`;
};

const rateLimiter = ({
  name,
  max,
  keyType = "ip",
  failClosed = true,
}) => {
  if (!name) {
    throw new Error("Rate limiter name is required.");
  }

  return async (req, res, next) => {
    const windowId = Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS);

    let identity;

    try {
      identity = getIdentity(req, keyType);

      const rateLimitKey = redisKey(`codenova:ratelimit:${name}:${identity}:${windowId}`);

      /*
       * Atomic Redis Lua script:
       *
       * 1. Increment request count
       * 2. Set expiry only on the first request
       * 3. Return current count
       * 4. Return remaining TTL
       *
       * This works across multiple CodeNova backend instances
       * because Redis is the shared source of truth.
       */
      const result = await redisClient.eval(
        `
        local current = redis.call("INCR", KEYS[1])

        if current == 1 then
          redis.call("PEXPIRE", KEYS[1], ARGV[1])
        end

        local ttl = redis.call("PTTL", KEYS[1])

        return { current, ttl }
        `,
        {
          keys: [rateLimitKey],
          arguments: [String(RATE_LIMIT_WINDOW_MS)],
        }
      );

      const currentCount = Number(result[0]);
      const ttlMs = Number(result[1]);

      if (currentCount > max) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil(ttlMs / 1000)
        );

        console.warn("Rate limit exceeded:", {
          limiter: name,
          identity,
          retryAfterSeconds,
        });

        res.setHeader("Retry-After", String(retryAfterSeconds));

        return next(
          new AppError(
            "Too many requests. Please try again later.",
            429,
            "RATE_LIMIT_EXCEEDED"
          )
        );
      }

      /*
       * Useful standard rate-limit headers.
       */
      res.setHeader("X-RateLimit-Limit", String(max));

      res.setHeader(
        "X-RateLimit-Remaining",
        String(Math.max(0, max - currentCount))
      );

      res.setHeader(
        "X-RateLimit-Reset",
        String(
          Math.ceil((Date.now() + Math.max(0, ttlMs)) / 1000)
        )
      );

      next();
    } catch (error) {
      /*
       * AppError means the request itself is invalid.
       */
      if (error instanceof AppError) {
        return next(error);
      }

      /*
       * Redis outage policy:
       *
       * failClosed=true
       *   → protected/abuse-sensitive endpoints return 503
       *
       * failClosed=false
       *   → normal endpoints continue operating
       */
      console.error("Rate limiter Redis error:", {
        limiter: name,
        identity: identity || "unknown",
        message: error.message,
      });

      if (failClosed) {
        return next(
          new AppError(
            "Rate limiting service is temporarily unavailable. Please try again later.",
            503,
            "RATE_LIMIT_SERVICE_UNAVAILABLE"
          )
        );
      }

      next();
    }
  };
};

const loginRateLimiter = rateLimiter({
  name: "login",
  max: LOGIN_MAX,
  keyType: "ip",
  failClosed: true,
});

const registerRateLimiter = rateLimiter({
  name: "register",
  max: REGISTER_MAX,
  keyType: "ip",
  failClosed: true,
});

const adminRegisterRateLimiter = rateLimiter({
  name: "admin-register",
  max: ADMIN_REGISTER_MAX,
  keyType: "admin",
  failClosed: true,
});

const codeRunRateLimiter = rateLimiter({
  name: "code-run",
  max: CODE_RUN_MAX,
  keyType: "user",
  failClosed: true,
});

const codeSubmitRateLimiter = rateLimiter({
  name: "code-submit",
  max: CODE_SUBMIT_MAX,
  keyType: "user",
  failClosed: true,
});

const generalRateLimiter = rateLimiter({
  name: "general",
  max: GENERAL_MAX,
  keyType: "user",
  failClosed: false,
});

const adminWriteRateLimiter = rateLimiter({
  name: "admin-write",
  max: ADMIN_WRITE_MAX,
  keyType: "admin",
  failClosed: false,
});

module.exports = {
  rateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  adminRegisterRateLimiter,
  codeRunRateLimiter,
  codeSubmitRateLimiter,
  generalRateLimiter,
  adminWriteRateLimiter,
};