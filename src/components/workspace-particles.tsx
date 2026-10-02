import {useEffect, useRef, type RefObject} from 'react'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {createParticleRenderer, type ParticleFrame} from './workspace-particle-renderer'
import {createParticleFormations, FORMATION_NAMES} from './workspace-particle-formations'
import styles from './workspace-particles.module.css'

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (value: number) => {const t = clamp(value); return t * t * (3 - 2 * t)}
type Pose = {x: number; y: number; scale: number; visible: number}

// Stage names used by `data-particle-slot`. `identity` is the brand mark.
const FORMATION_INDEX: Record<string, number> = {identity: 0, ...Object.fromEntries(FORMATION_NAMES.map((name, index) => [name, index]))}

/**
 * Slot-driven choreography. Every formation lives inside an element that the
 * page layout reserves for it (`[data-particle-slot]`), so points never sit on
 * top of copy, screenshots, or the film. The fixed canvas follows the active
 * slot while the page scrolls; inside the pinned journey the morph is driven
 * by the scrubbed timeline, elsewhere by the slot nearest the reading line.
 * Hidden slots (display: none on small screens) simply hide the formation.
 */
export default function WorkspaceParticles({scopeRef}: {scopeRef: RefObject<HTMLElement | null>}) {
  const scene = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = scopeRef.current
    const surface = canvas.current
    const layer = scene.current
    if (!root || !surface || !layer) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = window.matchMedia('(max-width: 599px)')
    const finePointer = window.matchMedia('(pointer: fine)')
    const count = 2800
    const shapes = createParticleFormations(count)
    const slots = Array.from(root.querySelectorAll<HTMLElement>('[data-particle-slot]'))
    if (!slots.length) return
    const formations = slots.map(slot => shapes[FORMATION_INDEX[slot.dataset.particleSlot ?? 'identity'] ?? 0])
    const journeySlots = slots.map(slot => Boolean(slot.closest('[data-journey-panel]')))
    const firstJourney = journeySlots.indexOf(true)
    let renderer: ReturnType<typeof createParticleRenderer> = null
    let frameId = 0
    let lastTime = 0
    let elapsed = 0
    let disposed = false
    let contextLost = false
    let position = -1
    let target = 0
    let previousStage = ''
    let pointerX = 0
    let pointerY = 0
    const pointer = {x: 0, y: 0}
    let maskTargets: {element: HTMLElement; text: Text[]}[] = []
    let needsMeasure = true
    const layout = {width: 0, height: 0, offset: 64}
    const state: ParticleFrame = {from: 0, to: 0, morph: 0, time: 0, width: 1, height: 1, x: 0, y: 0, scale: 1, opacity: 0, pointerX: 0, pointerY: 0, dpr: 1, pointCount: count, masks: new Float32Array(64)}

    const pose = (index: number): Pose => {
      const rect = slots[index].getBoundingClientRect()
      if (!rect.width || !rect.height) return {x: 0, y: 0, scale: 0, visible: 0}
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2 - layout.offset
      const scale = Math.min(rect.width, rect.height) / 2.8
      // Fade as the slot leaves the canvas so a formation never drifts over a neighbour.
      const margin = Math.max(40, scale)
      const visible = clamp((y + margin) / (margin * 2)) * clamp((layout.height - y + margin) / (margin * 2))
      return {x, y, scale, visible}
    }
    const measure = () => {
      const bounds = layer.getBoundingClientRect()
      layout.width = bounds.width
      layout.height = bounds.height
      layout.offset = bounds.top
      maskTargets = Array.from(root.querySelectorAll<HTMLElement>('h1, h2, h3, p, li, a, button, figcaption, img, video'), element => {
        const text: Text[] = []
        if (!element.matches('img, video')) {
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
          while (walker.nextNode()) {
            const node = walker.currentNode as Text
            if (node.textContent?.trim() && !node.parentElement?.closest('[aria-hidden="true"]')) text.push(node)
          }
        }
        return {element, text}
      })
      needsMeasure = false
    }
    // Text masks are a safety net: points that ever cross copy dim to 10%.
    let lastMaskTime = -Infinity
    const updateMasks = () => {
      state.masks.fill(0)
      const bounds = {left: state.x - state.scale * 1.5, right: state.x + state.scale * 1.5, top: state.y - state.scale * 1.5 + layout.offset, bottom: state.y + state.scale * 1.5 + layout.offset}
      let index = 0
      const range = document.createRange()
      const addMask = (r: DOMRect) => {
        if (index === 16 || !r.width || !r.height || r.bottom < bounds.top || r.top > bounds.bottom || r.right < bounds.left || r.left > bounds.right) return
        state.masks.set([r.left + r.width / 2, r.top + r.height / 2 - layout.offset, r.width / 2 + 2, r.height / 2 + 2], index++ * 4)
      }
      for (const {element: el, text} of maskTargets) {
        if (index === 16) break
        if (el.closest('[aria-hidden="true"], [inert]')) continue
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height || r.bottom < bounds.top || r.top > bounds.bottom || r.right < bounds.left || r.left > bounds.right) continue
        if (!text.length) addMask(r)
        else for (const node of text) {
          range.selectNodeContents(node)
          for (const line of range.getClientRects()) addMask(line)
        }
      }
    }
    const storyTarget = () => {
      const journey = ScrollTrigger.getById('workspace-journey')
      const y = window.scrollY
      if (journey && firstJourney >= 0 && y >= journey.start && y <= journey.end) {
        // Read the scrubbed timeline so the points turn with the stacked cards.
        const progress = (journey.animation?.progress() ?? journey.progress) * 5
        for (let chapter = 0; chapter < 4; chapter++) {
          if (progress < chapter + .58) return firstJourney + chapter
          if (progress < chapter + 1) return firstJourney + chapter + smooth((progress - chapter - .58) / .42)
        }
        return firstJourney + 4
      }
      // Elsewhere: the visible slot nearest the reading line wins.
      const focus = layout.height * .48
      let best = -1
      let distance = Infinity
      slots.forEach((slot, index) => {
        if (journeySlots[index] && journey) return
        const p = pose(index)
        if (p.visible < .2) return
        const d = Math.abs(p.y - focus)
        if (d < distance) {distance = d; best = index}
      })
      return best < 0 ? target : best
    }
    const paint = (time: number) => {
      frameId = 0
      if (disposed || contextLost || document.hidden) return
      if (needsMeasure) measure()
      if (!reduced.matches && mobile.matches && lastTime && time - lastTime < 30) {
        frameId = requestAnimationFrame(paint)
        return
      }
      const dt = lastTime ? Math.min((time - lastTime) / 1000, .05) : 1 / 60
      lastTime = time
      if (!reduced.matches) elapsed += dt
      target = storyTarget()
      if (position < 0 || reduced.matches) position = target
      else position += (target - position) * (1 - Math.exp(-dt * 9))
      if (Math.abs(position - target) < .0005) position = target
      const index = Math.min(slots.length - 2, Math.floor(position))
      const fraction = position - index
      const a = pose(index)
      const b = pose(index + 1)
      const blend = smooth(fraction)
      const pick = fraction < .5 ? a : b
      const scale = a.scale && b.scale ? a.scale + (b.scale - a.scale) * blend : (pick.scale || a.scale || b.scale)
      const x = a.scale && b.scale ? a.x + (b.x - a.x) * blend : pick.x
      const y = a.scale && b.scale ? a.y + (b.y - a.y) * blend : pick.y
      // Long jumps between distant slots read as a dissolve rather than a flight.
      const travel = Math.hypot(b.x - a.x, b.y - a.y)
      const dissolve = travel > 260 ? 1 - .9 * Math.sin(Math.PI * blend) : 1
      const visible = a.visible + (b.visible - a.visible) * blend
      const follow = 1 - Math.exp(-dt * 6)
      pointerX += ((reduced.matches ? 0 : pointer.x) - pointerX) * follow
      pointerY += ((reduced.matches ? 0 : pointer.y) - pointerY) * follow
      state.from = index
      state.to = index + 1
      state.morph = fraction
      state.time = reduced.matches ? 0 : elapsed
      state.width = layout.width
      state.height = layout.height
      state.x = x
      state.y = y
      state.scale = Math.max(1, scale)
      state.opacity = (mobile.matches ? .55 : .78) * visible * dissolve
      state.pointerX = pointerX
      state.pointerY = pointerY
      state.dpr = Math.min(window.devicePixelRatio || 1, mobile.matches ? 1.5 : 2)
      state.pointCount = mobile.matches ? 1100 : count
      if (time - lastMaskTime > 80 || reduced.matches) {updateMasks(); lastMaskTime = time}
      renderer?.draw(state)
      layer.style.setProperty('--particle-x', `${x}px`)
      layer.style.setProperty('--particle-y', `${y}px`)
      layer.style.setProperty('--particle-size', `${Math.max(1, scale) * 2}px`)
      layer.style.setProperty('--particle-opacity', String(state.opacity))
      const stage = slots[Math.round(position)]?.dataset.particleSlot ?? 'identity'
      if (stage !== previousStage) {layer.dataset.formation = stage; previousStage = stage}
      layer.dataset.motion = reduced.matches ? 'reduced' : 'scroll'
      // Keep animating while morphing or while a formation is on screen.
      if (renderer && !reduced.matches && (state.opacity > 0.002 || position !== target)) frameId = requestAnimationFrame(paint)
    }
    const schedule = () => {
      if (!frameId && !disposed && !contextLost && !document.hidden) frameId = requestAnimationFrame(paint)
    }
    const onScroll = () => {
      if (reduced.matches) lastMaskTime = -Infinity
      schedule()
    }
    const onResize = () => {needsMeasure = true; schedule()}
    const onPointer = (event: PointerEvent) => {
      if (!finePointer.matches || reduced.matches) return
      pointer.x = clamp(event.clientX / window.innerWidth) * 2 - 1
      pointer.y = clamp(event.clientY / window.innerHeight) * 2 - 1
      schedule()
    }
    const onPointerLeave = () => {pointer.x = 0; pointer.y = 0}
    const onVisibility = () => {
      cancelAnimationFrame(frameId)
      frameId = 0
      lastTime = 0
      if (!document.hidden) schedule()
    }
    const onPreference = () => {
      position = -1
      elapsed = 0
      lastTime = 0
      needsMeasure = true
      schedule()
    }
    const setup = () => {
      try {renderer = createParticleRenderer(surface, formations)} catch {renderer = null}
      layer.dataset.ready = String(Boolean(renderer))
      schedule()
    }
    const onContextLost = (event: Event) => {
      event.preventDefault()
      contextLost = true
      cancelAnimationFrame(frameId)
      frameId = 0
      layer.dataset.ready = 'false'
    }
    const onContextRestored = () => {
      contextLost = false
      renderer?.dispose()
      lastTime = 0
      needsMeasure = true
      setup()
    }
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(root)
    window.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('resize', onResize, {passive: true})
    window.addEventListener('pointermove', onPointer, {passive: true})
    window.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)
    reduced.addEventListener('change', onPreference)
    mobile.addEventListener('change', onResize)
    ScrollTrigger.addEventListener('refresh', onResize)
    surface.addEventListener('webglcontextlost', onContextLost)
    surface.addEventListener('webglcontextrestored', onContextRestored)
    setup()
    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', onPreference)
      mobile.removeEventListener('change', onResize)
      ScrollTrigger.removeEventListener('refresh', onResize)
      surface.removeEventListener('webglcontextlost', onContextLost)
      surface.removeEventListener('webglcontextrestored', onContextRestored)
      renderer?.dispose()
    }
  }, [scopeRef])

  return <div ref={scene} className={styles.scene} aria-hidden="true" data-workspace-particles>
    <canvas ref={canvas} className={styles.canvas} />
    <svg className={styles.fallback} viewBox="0 0 32 32" fill="none" focusable="false">
      <path d="M16 5 27 27H5Z" stroke="currentColor" strokeWidth=".7" strokeDasharray=".1 1.1" strokeLinecap="round" />
      <circle cx="16" cy="21" r="1" fill="currentColor" />
    </svg>
  </div>
}
