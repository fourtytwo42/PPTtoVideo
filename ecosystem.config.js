const sharedEnv = {
  NODE_ENV: "production",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://deckforge:deckforge@localhost:5432/deckforge",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  FILE_STORAGE_ROOT: process.env.FILE_STORAGE_ROOT || `${__dirname}/storage`,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "dev-secret",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
};

module.exports = {
  apps: [
    {
      name: "deckforge-web",
      script: "npm",
      args: "run start",
      cwd: __dirname,
      env: sharedEnv,
      watch: false,
      autorestart: true,
    },
    {
      name: "deckforge-worker",
      script: "npm",
      args: "run worker:prod",
      cwd: __dirname,
      env: sharedEnv,
      watch: false,
      autorestart: true,
    },
  ],
};

