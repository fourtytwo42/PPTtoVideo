import { ProcessingMode } from '@prisma/client';
import { prisma } from './prisma';

async function getRawAdminSetting(key: string) {
  const record = await prisma.systemSetting.findUnique({ where: { key: `admin:${key}` } });
  return record?.value ?? undefined;
}

export async function getAdminStringSetting(key: string) {
  const value = await getRawAdminSetting(key);
  if (typeof value === 'string') return value;
  return value !== undefined ? String(value) : undefined;
}

export async function getAdminNumberSetting(key: string) {
  const value = await getRawAdminSetting(key);
  if (typeof value === 'number') return value;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

export async function getDefaultProcessingMode() {
  const value = await getAdminStringSetting('defaultMode');
  if (value && value in ProcessingMode) {
    return ProcessingMode[value as keyof typeof ProcessingMode];
  }
  return ProcessingMode.REVIEW;
}

export async function getSoftLimits() {
  const [maxSlides, maxFileSizeMB] = await Promise.all([
    getAdminNumberSetting('maxSlides'),
    getAdminNumberSetting('maxFileSizeMB'),
  ]);
  return { maxSlides, maxFileSizeMB };
}

export async function getDefaultOpenAIModel() {
  return (await getAdminStringSetting('defaultOpenAIModel')) ?? 'gpt-4o-mini';
}

export async function getDefaultTTSModel() {
  return (await getAdminStringSetting('defaultTTSModel')) ?? 'eleven_flash_v2_5';
}

export async function getDefaultVoice() {
  return (await getAdminStringSetting('defaultVoice')) ?? 'Rachel';
}
