const DURATION_PATTERN = /^(\d+)([smhd])$/;

const MULTIPLIERS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function parseDuration(duration: string): number {
  const match = DURATION_PATTERN.exec(duration);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2];
  const multiplier = MULTIPLIERS[unit];

  if (multiplier === undefined) {
    throw new Error(`Invalid duration unit: ${unit}`);
  }

  return value * multiplier;
}
