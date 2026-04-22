export function escapeSvgAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Lightweight QR-like fallback for early product iteration.
 *
 * This is intentionally not a standards-compliant QR encoder yet.
 * It produces a deterministic matrix derived from the input so the UI can
 * reserve the right space, communicate the concept clearly, and be swapped
 * later for a real QR encoder without changing the surrounding component API.
 */
export function createPseudoQrSvg(payload: string, size = 220): string {
  const dimension = 29
  const cell = Math.floor(size / dimension)
  const padding = Math.floor((size - dimension * cell) / 2)

  let seed = 0
  for (let i = 0; i < payload.length; i += 1) {
    seed = (seed * 31 + payload.charCodeAt(i)) >>> 0
  }

  const matrix: boolean[][] = Array.from({ length: dimension }, () => Array.from({ length: dimension }, () => false))

  const drawFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const isOuter = x === 0 || x === 6 || y === 0 || y === 6
        const isInner = x >= 2 && x <= 4 && y >= 2 && y <= 4
        matrix[startY + y][startX + x] = isOuter || isInner
      }
    }
  }

  drawFinder(0, 0)
  drawFinder(dimension - 7, 0)
  drawFinder(0, dimension - 7)

  for (let y = 0; y < dimension; y += 1) {
    for (let x = 0; x < dimension; x += 1) {
      const inFinderZone =
        (x < 8 && y < 8) ||
        (x >= dimension - 8 && y < 8) ||
        (x < 8 && y >= dimension - 8)

      if (inFinderZone) continue

      seed = (1664525 * seed + 1013904223) >>> 0
      matrix[y][x] = (seed & 1) === 1
    }
  }

  const rects: string[] = []
  for (let y = 0; y < dimension; y += 1) {
    for (let x = 0; x < dimension; x += 1) {
      if (!matrix[y][x]) continue
      rects.push(`<rect x="${padding + x * cell}" y="${padding + y * cell}" width="${cell}" height="${cell}" rx="1" />`)
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Representació visual del codi per compartir el grup"><rect width="${size}" height="${size}" rx="24" fill="white"/>${rects.join('')}<title>${escapeSvgAttribute(payload)}</title></svg>`
}
