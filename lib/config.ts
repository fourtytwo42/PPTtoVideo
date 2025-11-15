import path from "node:path";

const requiredEnv = ["DATABASE_URL", "REDIS_URL", "FILE_STORAGE_ROOT"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable ${key}`);
  }
}

export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL!,
  storageRoot: path.resolve(process.env.FILE_STORAGE_ROOT!),
  openAiApiKey: process.env.OPENAI_API_KEY,
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  emailFrom: process.env.EMAIL_FROM,
  smtpUrl: process.env.SMTP_URL,
};
