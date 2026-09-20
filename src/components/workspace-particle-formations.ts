export const FORMATION_NAMES = [
  'brand', 'conversations', 'knowledge', 'execution',
  'teams', 'outcomes', 'ownership', 'deployment',
] as const

type Point = readonly [number, number]
type Stroke = readonly Point[]
type Segment = {from: Point; to: Point; length: number; end: number}

const TAU = Math.PI * 2

function arc(x: number, y: number, radius: number, start = 0, end = TAU, steps = 40): Point[] {
  return Array.from({length: steps + 1}, (_, index) => {
    const angle = start + (end - start) * index / steps
    return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]
  })
}

function curve(from: Point, first: Point, second: Point, to: Point, steps = 18): Point[] {
  return Array.from({length: steps + 1}, (_, index) => {
    const t = index / steps
    const u = 1 - t
    return [
      u ** 3 * from[0] + 3 * u * u * t * first[0] + 3 * u * t * t * second[0] + t ** 3 * to[0],
      u ** 3 * from[1] + 3 * u * u * t * first[1] + 3 * u * t * t * second[1] + t ** 3 * to[1],
    ]
  })
}

function roundedRect(left: number, bottom: number, right: number, top: number, radius = 0.09): Point[] {
  return [
    ...arc(right - radius, top - radius, radius, 0, Math.PI / 2, 8),
    ...arc(left + radius, top - radius, radius, Math.PI / 2, Math.PI, 8),
    ...arc(left + radius, bottom + radius, radius, Math.PI, Math.PI * 1.5, 8),
    ...arc(right - radius, bottom + radius, radius, Math.PI * 1.5, TAU, 8),
    [right, top - radius],
  ]
}

function brand(): Stroke[] {
  // The same rounded triangle and central dot as the existing LogoMark SVG.
  // SVG coordinates are converted to a centered, upward-facing coordinate space.
  const outer: Point[] = [
    ...curve([16, 4.5], [14.95, 4.5], [13.99, 5.11], [13.55, 6.06]),
    [4.78, 24.5],
    ...curve([4.78, 24.5], [4.08, 26], [5.18, 27.7], [6.83, 27.7]),
    [25.17, 27.7],
    ...curve([25.17, 27.7], [26.82, 27.7], [27.92, 26], [27.22, 24.5]),
    [18.45, 6.06],
    ...curve([18.45, 6.06], [18.01, 5.11], [17.05, 4.5], [16, 4.5]),
  ]
  const inner: Point[] = [[16, 9.05], [23.15, 24.2], [8.85, 24.2], [16, 9.05]]
  const middle: Point[] = [[16, 6.95], [25.3, 25.85], [6.7, 25.85], [16, 6.95]]
  return [outer, middle, inner, arc(16, 20.9, 1.4), arc(16, 20.9, 0.8), arc(16, 20.9, 0.25)]
    .map(stroke => stroke.map(([x, y]): Point => [(x - 16) / 13, (16.1 - y) / 13]))
}

function conversations(): Stroke[] {
  return [
    // The rear reply emerges from behind the main conversation bubble.
    [[0.43, 0.22], [0.81, 0.22], [0.9, 0.13], [0.9, -0.49], [0.81, -0.58], [0.67, -0.58], [0.67, -0.83], [0.36, -0.58], [-0.12, -0.58], [-0.21, -0.49], [-0.21, -0.29]],
    [[-0.8, 0.76], [0.34, 0.76], [0.43, 0.67], [0.43, -0.13], [0.34, -0.22], [-0.31, -0.22], [-0.62, -0.47], [-0.62, -0.22], [-0.8, -0.22], [-0.89, -0.13], [-0.89, 0.67], [-0.8, 0.76]],
    arc(-0.48, 0.27, 0.045), arc(-0.22, 0.27, 0.045), arc(0.04, 0.27, 0.045),
    [[0.08, -0.36], [0.61, -0.36]],
  ]
}

function knowledge(): Stroke[] {
  const leftTop = curve([-0.87, 0.67], [-0.52, 0.77], [-0.22, 0.7], [0, 0.5])
  const rightTop = curve([0, 0.5], [0.22, 0.7], [0.52, 0.77], [0.87, 0.67])
  const bottom = curve([-0.87, -0.62], [-0.49, -0.48], [-0.21, -0.5], [0, -0.71])
  return [
    [...leftTop, ...rightTop, [0.87, -0.62], ...curve([0.87, -0.62], [0.49, -0.48], [0.21, -0.5], [0, -0.71]), ...bottom.slice().reverse(), [-0.87, 0.67]],
    [[0, 0.5], [0, -0.71]],
    curve([-0.66, 0.36], [-0.46, 0.4], [-0.29, 0.34], [-0.17, 0.25]),
    curve([-0.66, 0.08], [-0.46, 0.12], [-0.29, 0.06], [-0.17, -0.03]),
    curve([-0.66, -0.2], [-0.46, -0.16], [-0.29, -0.22], [-0.17, -0.31]),
    // A retrieval lens distinguishes working knowledge from a generic file.
    arc(0.4, 0.17, 0.2), [[0.54, 0.03], [0.73, -0.23]],
  ]
}

function execution(): Stroke[] {
  return [
    roundedRect(-0.9, -0.65, 0.9, 0.7),
    [[-0.9, 0.38], [0.9, 0.38]],
    arc(-0.67, 0.54, 0.025), arc(-0.49, 0.54, 0.025), arc(-0.31, 0.54, 0.025),
    [[-0.35, 0.13], [-0.59, -0.1], [-0.35, -0.33]],
    [[0.35, 0.13], [0.59, -0.1], [0.35, -0.33]],
    [[0.13, 0.19], [-0.13, -0.39]],
  ]
}

function teams(): Stroke[] {
  const centers: Point[] = [[0, 0.67], [-0.71, 0.22], [-0.44, -0.62], [0.44, -0.62], [0.71, 0.22]]
  return [
    arc(0, 0, 0.25),
    ...centers.map(([x, y]) => arc(x, y, 0.17)),
    ...centers.map(([x, y]): Stroke => {
      const length = Math.hypot(x, y)
      return [[x / length * 0.25, y / length * 0.25], [x * (1 - 0.17 / length), y * (1 - 0.17 / length)]]
    }),
    arc(0, 0.045, 0.055),
    arc(0, -0.12, 0.11, 0.12, Math.PI - 0.12, 20),
  ]
}

function outcomes(): Stroke[] {
  return [
    [[-0.62, 0.86], [0.24, 0.86], [0.64, 0.46], [0.64, -0.85], [-0.62, -0.85], [-0.62, 0.86]],
    [[0.24, 0.86], [0.24, 0.46], [0.64, 0.46]],
    [[-0.39, 0.52], [-0.05, 0.52]],
    [[-0.39, 0.29], [0.34, 0.29]],
    [[-0.39, -0.06], [-0.39, -0.58], [0.41, -0.58]],
    [[-0.21, -0.4], [-0.21, -0.27]],
    [[0.02, -0.4], [0.02, -0.12]],
    [[0.25, -0.4], [0.25, 0.03]],
  ]
}

function ownership(): Stroke[] {
  return [
    [[0, 0.88], [0.72, 0.6], [0.7, -0.03], ...curve([0.7, -0.03], [0.63, -0.49], [0.32, -0.7], [0, -0.89]), ...curve([0, -0.89], [-0.32, -0.7], [-0.63, -0.49], [-0.7, -0.03]), [-0.72, 0.6], [0, 0.88]],
    // The open circle joins a narrow stem to form one uninterrupted keyhole.
    [...arc(0, 0.16, 0.2, -Math.PI / 3, Math.PI * 4 / 3), [-0.13, -0.38], [0.13, -0.38], [0.1, -0.0132]],
  ]
}

function deployment(): Stroke[] {
  const rows = [0.57, 0, -0.57]
  return rows.flatMap(y => [
    roundedRect(-0.83, y - 0.2, 0.83, y + 0.2, 0.065),
    arc(-0.6, y, 0.045), arc(-0.4, y, 0.045),
    [[0.13, y], [0.6, y]] as Stroke,
  ])
}

function sample(strokes: Stroke[], count: number): Float32Array {
  const segments: Segment[] = []
  let total = 0
  for (const stroke of strokes) {
    for (let index = 1; index < stroke.length; index++) {
      const from = stroke[index - 1]
      const to = stroke[index]
      const length = Math.hypot(to[0] - from[0], to[1] - from[1])
      if (length <= 0) continue
      total += length
      segments.push({from, to, length, end: total})
    }
  }
  const result = new Float32Array(count * 3)
  for (let index = 0; index < count; index++) {
    // A low-discrepancy sequence gives each particle a stable identity across
    // every formation, without random layouts or dependence on the DOM.
    const distance = ((index * 0.618033988749895 + 0.5) % 1) * total
    let low = 0
    let high = segments.length - 1
    while (low < high) {
      const middle = (low + high) >>> 1
      if (segments[middle].end < distance) low = middle + 1
      else high = middle
    }
    const {from, to, length, end} = segments[low]
    const amount = (distance - (end - length)) / length
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    // A narrow body and sparse satellites read as particles at rest, not a
    // continuous stroked icon. All offsets stay stable when reversing scroll.
    const thickness = Math.sin(index * 2.399963229728653) * (index % 9 === 0 ? 0.15 : 0.052)
    result[index * 3] = from[0] + dx * amount - dy / length * thickness
    result[index * 3 + 1] = from[1] + dy * amount + dx / length * thickness
    result[index * 3 + 2] = Math.sin(index * 1.618033988749895) * 0.095
  }
  return result
}

/** Equal-sized buffers can be interpolated directly throughout the scroll story. */
export function createParticleFormations(count: number): Float32Array[] {
  if (!Number.isSafeInteger(count) || count < 0) throw new RangeError('Particle count must be a non-negative integer.')
  return [brand(), conversations(), knowledge(), execution(), teams(), outcomes(), ownership(), deployment()]
    .map(strokes => sample(strokes, count))
}
