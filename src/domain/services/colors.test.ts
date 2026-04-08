import { describe, it, expect } from 'vitest'
import { getMemberColor } from './colors'

describe('getMemberColor', () => {
  it('returns palette colors for the first 10 indices', () => {
    const palette = [
      '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
      '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#06b6d4',
    ]
    for (let i = 0; i < palette.length; i++) {
      expect(getMemberColor(i)).toBe(palette[i])
    }
  })

  it('returns an HSL color for index 10 and beyond', () => {
    const color11 = getMemberColor(10)
    const color12 = getMemberColor(11)
    expect(color11).toMatch(/^hsl\(\d+, 65%, 50%\)$/)
    expect(color12).toMatch(/^hsl\(\d+, 65%, 50%\)$/)
  })

  it('generates distinct colors for indices beyond the palette', () => {
    const colors = Array.from({ length: 20 }, (_, i) => getMemberColor(i + 10))
    const unique = new Set(colors)
    expect(unique.size).toBe(colors.length)
  })

  it('is deterministic — same index always returns same color', () => {
    expect(getMemberColor(15)).toBe(getMemberColor(15))
    expect(getMemberColor(25)).toBe(getMemberColor(25))
  })
})
