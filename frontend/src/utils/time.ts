export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const centis = Math.floor((seconds - Math.floor(seconds)) * 100);
  
  const m = mins.toString().padStart(2, '0');
  const s = secs.toString().padStart(2, '0');
  const c = centis.toString().padStart(2, '0');
  return `${m}:${s}.${c}`;
}

export function formatTimeShort(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const s = secs.toString().padStart(2, '0');
  return `${mins}:${s}`;
}
