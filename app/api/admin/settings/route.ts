import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

const ADMIN_KEYS = [
  "defaultOpenAIModel",
  "defaultTTSModel",
  "defaultVoice",
  "maxFileSizeMB",
  "maxSlides",
  "concurrencyLimitPerUser",
  "defaultMode",
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const settings = await prisma.systemSetting.findMany({ where: { key: { startsWith: "admin:" } } });
  const map = Object.fromEntries(settings.map((setting) => [setting.key.replace("admin:", ""), setting.value]));
  return NextResponse.json(map);
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = await request.json();
  const changes: Record<string, unknown> = {};
  for (const key of ADMIN_KEYS) {
    if (key in data) {
      await prisma.systemSetting.upsert({
        where: { key: `admin:${key}` },
        update: { value: data[key] },
        create: { key: `admin:${key}`, value: data[key] },
      });
      changes[key] = data[key];
    }
  }
  if (Object.keys(changes).length > 0) {
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "update_settings",
        entityType: "SystemSetting",
        entityId: "admin",
        metadata: changes,
      },
    });
  }
  return NextResponse.json({ ok: true });
}
