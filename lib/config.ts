import path from "node:path";

type RequiredEnvKey = "DATABASE_URL" | "REDIS_URL" | "FILE_STORAGE_ROOT";

const envCache: Partial<Record<RequiredEnvKey, string>> = {};

function getRequiredEnv(key: RequiredEnvKey) {
  if (envCache[key]) {
    return envCache[key]!;
  }
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable ${key}`);
  }
  envCache[key] = value;
  return value;
}

export const config = {
  get databaseUrl() {
    return getRequiredEnv("DATABASE_URL");
  },
  get redisUrl() {
    return getRequiredEnv("REDIS_URL");
  },
  get storageRoot() {
    return path.resolve(getRequiredEnv("FILE_STORAGE_ROOT"));
  },
  get openAiApiKey() {
    return process.env.OPENAI_API_KEY;
  },
  get elevenLabsApiKey() {
    return process.env.ELEVENLABS_API_KEY;
  },
  get emailFrom() {
    return process.env.EMAIL_FROM;
  },
  get smtpUrl() {
    return process.env.SMTP_URL;
  },
};
