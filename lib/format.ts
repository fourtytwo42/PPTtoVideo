export const formatDuration = (seconds: number) => {
  const totalSeconds = Number.isFinite(seconds) ? Math.round(seconds) : 0;
  if (!totalSeconds) return '—';
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const parts = [] as string[];
  if (hours) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  parts.push(`${secs.toString().padStart(2, '0')}s`);
  return parts.join(' ');
};

export const formatRelativeTime = (timestamp: number) => {
  const delta = Date.now() - timestamp;
  const minutes = Math.floor(delta / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const formatFileSize = (sizeMB: number) => `${sizeMB.toFixed(1)} MB`;
