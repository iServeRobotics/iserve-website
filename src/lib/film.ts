/** Web films are trimmed past the blank opening so playback starts on the route. */
export const FRAME_FPS = 6;
export const FRAME_COUNT = 41;
/** First decoded picture sits slightly after 0. Seeking to 0 shows the poster instead. */
export const SCRUB_LEAD = 0.15;

export function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/** 0–0.30 route, 0.30–0.64 site structure, 0.64–1 daylight. */
export function beatIndex(progress: number): 0 | 1 | 2 {
  const p = clamp01(progress);
  if (p < 0.3) return 0;
  if (p < 0.64) return 1;
  return 2;
}

export function progressToTime(progress: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return SCRUB_LEAD;
  const p = clamp01(progress);
  const end = Math.max(SCRUB_LEAD, duration - 0.04);
  return SCRUB_LEAD + p * (end - SCRUB_LEAD);
}

/** 1-based frame file number for the extracted still sequence. */
export function frameNumber(
  time: number,
  fps = FRAME_FPS,
  count = FRAME_COUNT,
): number {
  const index = Math.round(Math.max(0, time) * fps);
  return Math.min(count, Math.max(1, index + 1));
}

export function frameUrl(
  base: string,
  time: number,
  fps = FRAME_FPS,
  count = FRAME_COUNT,
): string {
  return `${base}${String(frameNumber(time, fps, count)).padStart(2, "0")}.webp`;
}
