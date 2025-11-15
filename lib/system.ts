import { prisma } from "./prisma";

type ExternalService = "openai" | "elevenlabs";

const OUT_OF_ORDER_KEY = "system:out_of_order";

function nowIso() {
  return new Date().toISOString();
}

export async function setOutOfOrder(service: ExternalService, message: string) {
  await prisma.systemSetting.upsert({
    where: { key: OUT_OF_ORDER_KEY },
    update: {
      value: {
        active: true,
        service,
        message,
        since: nowIso(),
      },
    },
    create: {
      key: OUT_OF_ORDER_KEY,
      value: {
        active: true,
        service,
        message,
        since: nowIso(),
      },
    },
  });
}

export async function clearOutOfOrder(service: ExternalService) {
  const existing = await prisma.systemSetting.findUnique({ where: { key: OUT_OF_ORDER_KEY } });
  const value = existing?.value as { active?: boolean; service?: string } | undefined;

  if (value?.active && value.service && value.service !== service) {
    // Another service has flagged the system; do not clear it inadvertently.
    return;
  }

  await prisma.systemSetting.upsert({
    where: { key: OUT_OF_ORDER_KEY },
    update: {
      value: {
        active: false,
        service: null,
        clearedAt: nowIso(),
      },
    },
    create: {
      key: OUT_OF_ORDER_KEY,
      value: {
        active: false,
        service: null,
        clearedAt: nowIso(),
      },
    },
  });
}
