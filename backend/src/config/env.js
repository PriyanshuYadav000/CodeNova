const requiredEnvVariables = [
    "DATABASE_URL",
    "JWT_KEY",
    "CLIENT_URL",
    "REDIS_HOST",
    "REDIS_PORT",
    "REDIS_USER",
    "REDIS_PASS",
    "JUDGE0_KEY"
];

const validateEnvironment = () => {
    const missingVariables = requiredEnvVariables.filter((name) => {
        const value = process.env[name];

        return typeof value !== "string" || value.trim() === "";
    });

    if (missingVariables.length > 0) {
        const message = [
            "Environment validation failed.",
            `Missing required environment variables: ${missingVariables.join(", ")}`
        ].join(" ");

        if (process.env.NODE_ENV === "production") {
            console.error(
                "Environment validation failed. Required configuration is missing."
            );
        } else {
            console.error(message);
        }

        process.exit(1);
    }

    const redisPort = Number(process.env.REDIS_PORT);

    if (!Number.isInteger(redisPort) || redisPort < 1 || redisPort > 65535) {
        console.error(
            "Environment validation failed: REDIS_PORT must be a valid port number."
        );
        process.exit(1);
    }

    if (process.env.CLIENT_URL === "*") {
        console.error(
            "Environment validation failed: CLIENT_URL cannot be '*'."
        );
        process.exit(1);
    }

    const nodeEnvironment = process.env.NODE_ENV || "development";

    if (!["development", "test", "production"].includes(nodeEnvironment)) {
        console.error(
            "Environment validation failed: NODE_ENV must be development, test, or production."
        );
        process.exit(1);
    }

    process.env.NODE_ENV = nodeEnvironment;

    return {
        nodeEnvironment,
        clientUrl: process.env.CLIENT_URL
    };
};

module.exports = validateEnvironment;