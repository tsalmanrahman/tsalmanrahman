export interface PortraitMatteResult {
  matteCanvas: HTMLCanvasElement
  matteDataUrl: string
  maskData: Uint8ClampedArray
  width: number
  height: number
}

/**
 * Segment Salman Rahman's genuine studio headshot client-side without altering
 * facial pixels. Uses an exterior-only BFS flood fill seeded from the upper
 * studio backdrop edges so his white shirt collar inside the navy blazer is
 * preserved intact, followed by soft 2-pass edge feathering.
 */
export function buildPortraitMatte(
  image: HTMLImageElement,
  size = 512,
): PortraitMatteResult {
  const width = size
  const height = size
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    throw new Error('Could not acquire 2D context for portrait matte.')
  }

  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(image, 0, 0, width, height)

  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data
  const totalPixels = width * height

  // Sample average studio backdrop color from the four upper corner zones
  const sampleCoords: Array<[number, number]> = [
    [8, 8],
    [width - 9, 8],
    [8, Math.floor(height * 0.24)],
    [width - 9, Math.floor(height * 0.24)],
  ]
  let sumR = 0
  let sumG = 0
  let sumB = 0
  for (const [sx, sy] of sampleCoords) {
    const idx = (sy * width + sx) * 4
    sumR += data[idx]
    sumG += data[idx + 1]
    sumB += data[idx + 2]
  }
  const bgR = sumR / sampleCoords.length
  const bgG = sumG / sampleCoords.length
  const bgB = sumB / sampleCoords.length

  // Exterior BFS flood fill (1 = studio background, 0 = foreground)
  const isBg = new Uint8Array(totalPixels)
  const queue = new Int32Array(totalPixels)
  let head = 0
  let tail = 0

  const matchesStudioBackdrop = (pIdx: number): boolean => {
    const off = pIdx * 4
    const r = data[off]
    const g = data[off + 1]
    const b = data[off + 2]
    const dr = r - bgR
    const dg = g - bgG
    const db = b - bgB
    const distSq = dr * dr + dg * dg + db * db
    const spread = Math.max(r, g, b) - Math.min(r, g, b)
    // Neutral grey studio backdrop has low RGB distance and low chroma spread;
    // skin tones have higher red-blue chroma spread and dark blazer is far darker.
    return distSq < 42 * 42 && spread < 28 && r > 125 && g > 125 && b > 120
  }

  const enqueueIfBg = (x: number, y: number) => {
    const pIdx = y * width + x
    if (isBg[pIdx] === 1) return
    if (matchesStudioBackdrop(pIdx)) {
      isBg[pIdx] = 1
      queue[tail++] = pIdx
    }
  }

  // Seed strictly along top edge and upper left/right margins above blazer shoulders
  for (let x = 0; x < width; x++) {
    enqueueIfBg(x, 0)
  }
  const maxSideSeedY = Math.floor(height * 0.78)
  for (let y = 1; y < maxSideSeedY; y++) {
    enqueueIfBg(0, y)
    enqueueIfBg(width - 1, y)
  }

  while (head < tail) {
    const cur = queue[head++]
    const cx = cur % width
    const cy = (cur - cx) / width

    if (cx > 0) enqueueIfBg(cx - 1, cy)
    if (cx + 1 < width) enqueueIfBg(cx + 1, cy)
    if (cy > 0) enqueueIfBg(cx, cy - 1)
    if (cy + 1 < height) enqueueIfBg(cx, cy + 1)
  }

  // Write initial binary alpha mask
  for (let i = 0; i < totalPixels; i++) {
    data[i * 4 + 3] = isBg[i] === 1 ? 0 : 255
  }

  // Pass 1: Soften 1-2px outer silhouette boundary & slightly de-fringe studio grey
  const alphaCopy = new Uint8ClampedArray(totalPixels)
  for (let i = 0; i < totalPixels; i++) {
    alphaCopy[i] = data[i * 4 + 3]
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pIdx = y * width + x
      if (alphaCopy[pIdx] === 0) continue

      let bgNeighbors = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          if (alphaCopy[(y + dy) * width + (x + dx)] === 0) {
            bgNeighbors++
          }
        }
      }

      if (bgNeighbors > 0) {
        const off = pIdx * 4
        const r = data[off]
        const g = data[off + 1]
        const b = data[off + 2]
        const dist = Math.hypot(r - bgR, g - bgG, b - bgB)
        const edgeStrength = Math.min(1, Math.max(0.28, (dist - 14) / 36))
        const neighborFactor = 1 - (bgNeighbors / 8) * 0.45
        data[off + 3] = Math.round(255 * edgeStrength * neighborFactor)
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)

  const maskData = new Uint8ClampedArray(totalPixels)
  for (let i = 0; i < totalPixels; i++) {
    maskData[i] = data[i * 4 + 3]
  }

  let matteDataUrl = ''
  try {
    matteDataUrl = canvas.toDataURL('image/png')
  } catch {
    matteDataUrl = ''
  }

  return {
    matteCanvas: canvas,
    matteDataUrl,
    maskData,
    width,
    height,
  }
}
