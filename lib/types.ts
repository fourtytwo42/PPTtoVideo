export type SlideStageStatus = 'idle' | 'queued' | 'generating' | 'ready' | 'failed';
export type JobStatus = 'pending' | 'running' | 'success' | 'failed';
export type PipelineStep = 'ingestion' | 'scripts' | 'audio' | 'video' | 'final';

export interface Slide {
  id: string;
  index: number;
  title: string;
  text: string;
  notes?: string;
  script: string;
  wordCount: number;
  durationSeconds: number;
  statuses: {
    script: SlideStageStatus;
    audio: SlideStageStatus;
    video: SlideStageStatus;
  };
  error?: string;
}

export interface DeckJob {
  id: string;
  step: PipelineStep;
  status: JobStatus;
  progress: number;
  message: string;
  updatedAt: number;
}

export interface Deck {
  id: string;
  name: string;
  fileName: string;
  fileType: 'pptx' | 'pdf';
  sizeMB: number;
  uploadedAt: number;
  slides: Slide[];
  mode: 'review' | 'one-shot';
  status: 'ingesting' | 'ready-for-review' | 'generating-media' | 'complete' | 'failed';
  openAIModel: string;
  ttsModel: string;
  voice: string;
  progress: number;
  durationSeconds: number;
  warnings: string[];
  pipeline: DeckJob[];
  lastRunAt?: number;
}

export interface AdminSettings {
  allowedOpenAIModels: string[];
  allowedVoices: string[];
  allowedTTSModels: string[];
  defaultOpenAIModel: string;
  defaultVoice: string;
  defaultTTSModel: string;
  defaultMode: 'review' | 'one-shot';
  maxFileSizeMB: number;
  maxSlides: number;
  emailVerificationRequired: boolean;
  selfRegistration: boolean;
  concurrencyLimitPerUser: number;
}

export interface HealthState {
  outOfOrder: boolean;
  failingService?: 'openai' | 'elevenlabs';
  message?: string;
  openai: 'online' | 'offline';
  elevenlabs: 'online' | 'offline';
  lastCheckedAt: number;
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'suspended';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  decksOwned: number;
  createdAt: number;
  lastActiveAt: number;
}

export type NotificationTone = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationItem {
  id: string;
  tone: NotificationTone;
  title: string;
  description: string;
  createdAt: number;
  read: boolean;
  deckId?: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  details?: string;
  createdAt: number;
}

export interface JobMetrics {
  queued: number;
  running: number;
  succeededToday: number;
  failedToday: number;
  avgPipelineSeconds: number;
  throughputPerHour: number;
  lastUpdatedAt: number;
}

export interface WorkerNode {
  id: string;
  label: string;
  region: string;
  status: 'online' | 'offline' | 'draining';
  runningJobs: number;
  queuedJobs: number;
  cpuUtilization: number;
  memoryUtilization: number;
  lastHeartbeat: number;
}

export interface AppState {
  decks: Deck[];
  admin: AdminSettings;
  health: HealthState;
  users: UserAccount[];
  notifications: NotificationItem[];
  auditLog: AuditLogEntry[];
  jobMetrics: JobMetrics;
  workers: WorkerNode[];
}
