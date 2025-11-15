import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import IORedis from "ioredis";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { config } from "@/lib/config";
import { getOpenAIApiKey, getElevenLabsApiKey } from "@/lib/settings";

const execFileAsync = promisify(execFile);

type CheckStatus = "ok" | "warning" | "error";

interface HealthCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail?: string;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

async function checkDatabase(): Promise<HealthCheck> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { id: "database", label: "Database", status: "ok", detail: "Connected to PostgreSQL" };
  } catch (error) {
    return { id: "database", label: "Database", status: "error", detail: `Cannot reach database: ${String(error)}` };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const redis = new IORedis(config.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
  try {
    await redis.connect();
    await redis.ping();
    return { id: "redis", label: "Redis / BullMQ", status: "ok", detail: "Ping successful" };
  } catch (error) {
    return { id: "redis", label: "Redis / BullMQ", status: "error", detail: `Redis unavailable: ${String(error)}` };
  } finally {
    redis.disconnect();
  }
}

async function checkStorage(): Promise<HealthCheck> {
  const tempFile = path.join(config.storageRoot, `.health-${Date.now()}.tmp`);
  try {
    await fs.mkdir(config.storageRoot, { recursive: true });
    await fs.writeFile(tempFile, "deckforge");
    await fs.rm(tempFile, { force: true });
    return { id: "storage", label: "File storage", status: "ok", detail: config.storageRoot };
  } catch (error) {
    return {
      id: "storage",
      label: "File storage",
      status: "error",
      detail: `Cannot write to storage root (${config.storageRoot}): ${String(error)}`,
    };
  }
}

async function checkBinary(id: string, label: string, command: string, args: string[]): Promise<HealthCheck> {
  try {
    await execFileAsync(command, args);
    return { id, label, status: "ok" };
  } catch (error) {
    return { id, label, status: "warning", detail: `${command} unavailable: ${String(error)}` };
  }
}

async function checkApiKey(id: string, label: string, provider: () => Promise<string>, docHint: string) {
  const key = await provider();
  if (key) {
    return { id, label, status: "ok" } satisfies HealthCheck;
  }
  return {
    id,
    label,
    status: "warning",
    detail: `No ${label} configured. ${docHint}`,
  } satisfies HealthCheck;
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const checks = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkStorage(),
    checkBinary("ffmpeg", "FFmpeg", process.env.FFMPEG_PATH ?? "ffmpeg", ["-version"]),
    checkBinary("ffprobe", "FFprobe", process.env.FFPROBE_PATH ?? "ffprobe", ["-version"]),
    checkBinary("libreoffice", "LibreOffice", process.env.LIBREOFFICE_PATH ?? "soffice", ["--version"]),
    checkBinary("pdftoppm", "pdftoppm", process.env.PDFTOPNG_PATH ?? "pdftoppm", ["-v"]),
    checkApiKey("openai", "OpenAI API key", getOpenAIApiKey, "Set one in admin: default OpenAI config."),
    checkApiKey("elevenlabs", "ElevenLabs API key", getElevenLabsApiKey, "Add your ElevenLabs key in admin settings."),
  ]);

  return NextResponse.json({ checks });
}

