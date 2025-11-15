import { ProcessingMode } from '@prisma/client';
import { prisma } from './prisma';

export type ElevenLabsVoice = {
  id: string;
  name: string;
  category?: string;
  previewUrl?: string;
  labels?: Record<string, string>;
  settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speaker_boost?: boolean;
  };
};

async function getRawAdminSetting(key: string) {
  const record = await prisma.systemSetting.findUnique({ where: { key: `admin:${key}` } });
  return record?.value ?? undefined;
}

async function getAdminJsonSetting<T>(key: string) {
  const value = await getRawAdminSetting(key);
  return value as T | undefined;
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

async function getAdminStringArraySetting(key: string) {
  const value = await getRawAdminSetting(key);
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry)).filter((entry) => entry.trim().length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }
  return [];
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

export async function getOpenAIModelAllowlist() {
  const allowed = await getAdminStringArraySetting('openaiModelAllowlist');
  const fallback = await getDefaultOpenAIModel();
  const list = allowed.length ? allowed : [fallback];
  return Array.from(new Set(list));
}

export async function getOpenAIApiKey() {
  return (await getAdminStringSetting('openaiApiKey')) ?? process.env.OPENAI_API_KEY ?? '';
}

export async function getOpenAISystemPrompt() {
  return (
    (await getAdminStringSetting('openaiSystemPrompt')) ??
    'You are a narration specialist. Rewrite the slide content into a concise, engaging spoken script that preserves every important detail.'
  );
}

export async function getElevenLabsApiKey() {
  return (await getAdminStringSetting('elevenlabsApiKey')) ?? process.env.ELEVENLABS_API_KEY ?? '';
}

export async function getElevenLabsModelAllowlist() {
  const allowed = await getAdminStringArraySetting('elevenlabsModelAllowlist');
  const fallback = (await getAdminStringSetting('defaultTTSModel')) ?? 'eleven_flash_v2_5';
  const list = allowed.length ? allowed : [fallback];
  return Array.from(new Set(list));
}

export async function getElevenLabsVoices(): Promise<ElevenLabsVoice[]> {
  const raw = await getAdminJsonSetting<unknown>('elevenlabsVoices');
  if (!Array.isArray(raw)) return [];
  return raw.reduce<ElevenLabsVoice[]>((list, entry) => {
    if (!entry || typeof entry !== 'object') return list;
    const voice = entry as Record<string, unknown>;
    const id =
      typeof voice.id === 'string'
        ? voice.id
        : typeof voice.voice_id === 'string'
        ? (voice.voice_id as string)
        : undefined;
    const name = typeof voice.name === 'string' ? (voice.name as string) : undefined;
    if (!id || !name) return list;
    list.push({
      id,
      name,
      category: typeof voice.category === 'string' ? (voice.category as string) : undefined,
      previewUrl:
        typeof voice.previewUrl === 'string'
          ? (voice.previewUrl as string)
          : typeof voice.preview_url === 'string'
          ? (voice.preview_url as string)
          : undefined,
      labels: typeof voice.labels === 'object' ? (voice.labels as Record<string, string>) : undefined,
      settings: typeof voice.settings === 'object' ? (voice.settings as ElevenLabsVoice['settings']) : undefined,
    });
    return list;
  }, []);
}

export async function getDefaultTTSModel() {
  const allowlist = await getElevenLabsModelAllowlist();
  const desired = (await getAdminStringSetting('defaultTTSModel')) ?? 'eleven_flash_v2_5';
  if (allowlist.includes(desired)) return desired;
  return allowlist[0] ?? desired;
}

export async function getDefaultVoiceSelection() {
  const voices = await getElevenLabsVoices();
  const defaultVoiceId = await getAdminStringSetting('defaultVoiceId');
  if (defaultVoiceId) {
    const found = voices.find((voice) => voice.id === defaultVoiceId);
    if (found) return found;
  }
  return voices[0] ?? { id: 'default', name: 'Default Voice' };
}

export async function findVoiceById(voiceId: string) {
  const voices = await getElevenLabsVoices();
  return voices.find((voice) => voice.id === voiceId);
}
