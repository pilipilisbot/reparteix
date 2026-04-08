/** Curated palette for the first N members. */
const PALETTE = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#06b6d4',
]

/** Golden angle in degrees — maximises hue separation between successive colors. */
const GOLDEN_ANGLE = 137.508
const GENERATED_SATURATION = 65
const GENERATED_LIGHTNESS = 50

/**
 * Returns a member color for a given 0-based index.
 * Uses the curated palette for the first 10 slots, then generates
 * visually distinct HSL colors using golden-angle hue distribution.
 */
export function getMemberColor(index: number): string {
  if (index < PALETTE.length) {
    return PALETTE[index]
  }
  const hue = Math.round(((index - PALETTE.length) * GOLDEN_ANGLE) % 360)
  return `hsl(${hue}, ${GENERATED_SATURATION}%, ${GENERATED_LIGHTNESS}%)`
}
