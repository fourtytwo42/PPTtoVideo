import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ElevenLabsVoice, getElevenLabsApiKey, getElevenLabsVoices } from "@/lib/settings";

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

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const voices = await getElevenLabsVoices();
  return NextResponse.json({ voices });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({}));
  if (body.action !== "sync") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  const apiKey = await getElevenLabsApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "ElevenLabs API key is not configured" }, { status: 400 });
  }

  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: {
      "xi-api-key": apiKey,
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({ error: `Failed to fetch voices: ${text}` }, { status: 502 });
  }

  const payload = (await response.json()) as { voices?: unknown };
  const voiceEntries = Array.isArray(payload.voices) ? payload.voices : [];
  const normalized = voiceEntries.reduce<ElevenLabsVoice[]>((acc, voiceEntry: unknown) => {
    if (!voiceEntry || typeof voiceEntry !== "object") return acc;
    const record = voiceEntry as Record<string, unknown>;
    const id =
      typeof record.voice_id === "string"
        ? (record.voice_id as string)
        : typeof record.id === "string"
        ? (record.id as string)
        : undefined;
    const name = typeof record.name === "string" ? (record.name as string) : undefined;
    if (!id || !name) return acc;
    acc.push({
      id,
      name,
      category: typeof record.category === "string" ? (record.category as string) : undefined,
      previewUrl:
        typeof record.preview_url === "string"
          ? (record.preview_url as string)
          : typeof record.previewUrl === "string"
          ? (record.previewUrl as string)
          : undefined,
      labels: typeof record.labels === "object" ? (record.labels as Record<string, string>) : undefined,
      settings: typeof record.settings === "object" ? (record.settings as ElevenLabsVoice["settings"]) : undefined,
    });
    return acc;
  }, []);

  const filtered = normalized.filter((voice): voice is ElevenLabsVoice => Boolean(voice));

  await prisma.systemSetting.upsert({
    where: { key: "admin:elevenlabsVoices" },
    update: { value: filtered as Prisma.InputJsonValue },
    create: { key: "admin:elevenlabsVoices", value: filtered as Prisma.InputJsonValue },
  });

  return NextResponse.json({ voices: filtered });
}

