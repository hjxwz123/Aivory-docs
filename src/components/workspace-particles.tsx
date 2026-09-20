import {useEffect, useRef, type RefObject} from 'react'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {createParticleRenderer, type ParticleFrame} from './workspace-particle-renderer'
import {createParticleFormations} from './workspace-particle-formations'
import styles from './workspace-particles.module.css'

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (value: number) => {const t = clamp(value); return t * t * (3 - 2 * t)}
const stages = ['identity', 'conversations', 'knowledge', 'execution', 'teams', 'outcomes', 'ownership', 'deployment', 'identity']
type Pose = {x: number; y: number; scale: number}

/**
 * Choreography: mark → conversation → knowledge → execution → team → artifact
 * → ownership → deployment → mark. A single point pool disperses/reassembles
 * during the existing chapter turns, with a reading hold between each turn.
 * The camera stays fixed; only the formation and its shallow particle depth move.
 * Violet/sage, small soft points, no bloom pass. 2,800 desktop / 900 mobile points.
 * Reduced motion holds the original brand mark in one frame with no render loop.
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
    const compact = window.matchMedia('(max-width: 1199px)')
    const mobile = window.matchMedia('(max-width: 599px)')
    const finePointer = window.matchMedia('(pointer: fine)')
    const count = 2800
    const shapes = createParticleFormations(count)
    const formations = [...shapes, shapes[0]]
    let renderer: ReturnType<typeof createParticleRenderer> = null
    let frameId = 0
    let lastTime = 0
    let elapsed = 0
    let disposed = false
    let contextLost = false
    let measured = false
    let needsMeasure = true
    let position = 0
    let previousStage = ''
    let pointerX = 0
    let pointerY = 0
    const pointer = {x: 0, y: 0}
    const chapterPoses: Pose[] = []
    let maskTargets: {element: HTMLElement; text: Text[]}[] = []
    const layout = {width: 0, height: 0, offset: 64, rootBottom: 0, intro: 0, ownership: 0, deployment: 0, explore: 0, panels: [] as number[]}
    const state: ParticleFrame = {from: 0, to: 0, morph: 0, time: 0, width: 1, height: 1, x: 0, y: 0, scale: 1, opacity: 0, pointerX: 0, pointerY: 0, dpr: 1, pointCount: count, masks: new Float32Array(64)}
    const top = (selector: string, fallback: number) => {
      const el = root.querySelector<HTMLElement>(selector)
      return el ? el.getBoundingClientRect().top + window.scrollY : fallback
    }
    const pose = (stage: number) => {
      if (stage >= 1 && stage <= 5 && chapterPoses[stage - 1]) {
        const chapter = chapterPoses[stage - 1]
        return {...chapter, y: chapter.y - (ScrollTrigger.getById('workspace-journey') ? 0 : window.scrollY + layout.offset)}
      }
      // One continuous background composition, contained inside the viewport.
      // Bias toward the lower space between copy and imagery; do not reserve UI.
      const shift = [.02, -.02, .015, .03, -.025, .025, .05, 0, .02][stage]
      return compact.matches
        ? {x: layout.width * .64, y: layout.height * .78, scale: mobile.matches ? 70 : 142}
        : {x: layout.width * (.53 + shift), y: layout.height * .67, scale: Math.min(218, layout.width * .17, layout.height * .27)}
    }
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
    const measure = () => {
      const bounds = layer.getBoundingClientRect()
      layout.width = bounds.width
      layout.height = bounds.height
      layout.offset = bounds.top
      layout.rootBottom = root.getBoundingClientRect().bottom + window.scrollY
      layout.intro = top('#workspace-journey', window.innerHeight)
      layout.ownership = top('[aria-labelledby="ownership-title"]', layout.rootBottom)
      layout.deployment = top('[aria-labelledby="deploy-title"]', layout.rootBottom)
      layout.explore = top('[aria-labelledby="explore-title"]', layout.rootBottom)
      layout.panels = Array.from(root.querySelectorAll('[data-journey-panel]'), el => el.getBoundingClientRect().top + window.scrollY)
      const pinned = Boolean(ScrollTrigger.getById('workspace-journey'))
      const viewport = root.querySelector<HTMLElement>('[data-journey-viewport]')
      chapterPoses.length = 0
      root.querySelectorAll<HTMLElement>('[data-journey-panel]').forEach(panel => {
        const copy = panel.querySelector<HTMLElement>('[data-journey-copy]')!
        const detail = panel.querySelector<HTMLElement>('[data-journey-detail]')!
        const link = copy.querySelector<HTMLElement>('a')!
        const visual = panel.querySelector<HTMLElement>('[data-journey-visual]')!
        // Offset geometry is unaffected by the existing 3D page turns. Use the
        // space beside the facts/link, below the prose, inside the left column.
        const occupiedRight = Math.max(link.offsetLeft + link.offsetWidth, ...Array.from(copy.querySelectorAll<HTMLElement>('[data-journey-fact]'), el => el.offsetLeft + el.offsetWidth))
        const left = occupiedRight + 20
        const right = copy.offsetWidth - 10
        const top = detail.offsetTop + detail.offsetHeight + 18
        const bottom = pinned
          ? panel.offsetHeight - copy.offsetTop - 18
          : Math.max(copy.offsetHeight, top + 160)
        const scale = Math.max(28, Math.min(110, (right - left) / 2.7, (bottom - top) / 2.7))
        const panelLeft = viewport?.getBoundingClientRect().left ?? 0
        const panelTop = pinned ? panel.offsetTop + (panel.parentElement?.offsetTop ?? 0) : layout.panels[chapterPoses.length]
        // Stacked layouts keep the mark beside the final lines of copy, before
        // the screenshot. Never reserve another row or move the content.
        const y = Math.min(top + scale * 1.35, visual.offsetTop > copy.offsetTop ? visual.offsetTop - copy.offsetTop - scale * 1.35 - 12 : Infinity)
        chapterPoses.push({x: panelLeft + copy.offsetLeft + right - scale * 1.35, y: panelTop + copy.offsetTop + y, scale})
      })
      maskTargets = Array.from(root.querySelectorAll<HTMLElement>('h1, h2, h3, p, li, a, button, figcaption, img, [data-data-diagram] text'), element => {
        const text: Text[] = []
        // Transparent cards/controls and diagram nodes only mask their text.
        // Keep the opaque product screenshot itself protected as an image.
        if (!element.matches('img, text')) {
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
    const storyPosition = () => {
      const y = window.scrollY
      const focus = y + window.innerHeight * .46
      const journey = ScrollTrigger.getById('workspace-journey')
      if (journey && y >= journey.start && y <= journey.end) {
        // Read the already-scrubbed timeline, so the points turn with the pages.
        const progress = journey.animation?.progress() ?? journey.progress
        const position = progress * 5
        for (let chapter = 0; chapter < 4; chapter++) {
          if (position < chapter + .64) return chapter + 1
          if (position < chapter + 1.2) return chapter + 1 + smooth((position - chapter - .64) / .56)
        }
        return 5
      }
      const firstChapter = journey?.start ?? layout.panels[0]
      if (y < firstChapter - window.innerHeight * .35) {
        return smooth((focus - layout.intro * .65) / Math.max(1, firstChapter - layout.intro * .65))
      }
      if (!journey) {
        for (let i = 0; i < layout.panels.length - 1; i++) {
          if (focus < layout.panels[i + 1]) {
            return i + 1 + smooth((focus - layout.panels[i + 1] + window.innerHeight * .35) / (window.innerHeight * .35))
          }
        }
      } else if (y < journey.start) return 1
      if (focus < layout.ownership) return 5
      if (focus < layout.deployment) return 5 + smooth((focus - layout.ownership) / (window.innerHeight * .5))
      if (focus < layout.explore) return 6 + smooth((focus - layout.deployment) / (window.innerHeight * .5))
      return 7 + smooth((focus - layout.explore) / (window.innerHeight * .3))
    }
    const paint = (time: number) => {
      frameId = 0
      if (disposed || contextLost || document.hidden) return
      if (needsMeasure) measure()
      // Mobile paints at 30fps while the desktop keeps the browser's native rate.
      if (!reduced.matches && mobile.matches && lastTime && time - lastTime < 30) {
        frameId = requestAnimationFrame(paint)
        return
      }
      const dt = lastTime ? Math.min((time - lastTime) / 1000, .05) : 1 / 60
      lastTime = time
      if (!reduced.matches) elapsed += dt
      const target = reduced.matches ? 0 : storyPosition()
      // Avoid playing every previous chapter on hash navigation / restored scroll.
      if (!measured) {position = target; measured = true}
      position = reduced.matches ? 0 : position + (target - position) * (1 - Math.exp(-dt * 13))
      if (Math.abs(position - target) < .0001) position = target
      const index = Math.min(stages.length - 2, Math.floor(position))
      const fraction = position - index
      const small = compact.matches
      const a = pose(index)
      const b = pose(index + 1)
      const blend = smooth(fraction)
      const desiredScale = a.scale + (b.scale - a.scale) * blend
      const scale = Math.max(1, Math.min(desiredScale, (layout.width - 24) / 2.8, (layout.height - 24) / 2.8))
      const safeEdge = scale * 1.4 + 12
      const x = Math.max(safeEdge, Math.min(layout.width - safeEdge, a.x + (b.x - a.x) * blend))
      const y = Math.max(safeEdge, Math.min(layout.height - safeEdge, a.y + (b.y - a.y) * blend))
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
      state.scale = scale
      state.opacity = (small ? .42 : .7) * clamp((layout.rootBottom - window.scrollY - layout.offset) / Math.max(1, layout.height * .35))
      state.pointerX = pointerX
      state.pointerY = pointerY
      state.dpr = Math.min(window.devicePixelRatio || 1, mobile.matches ? 1.5 : 2)
      state.pointCount = mobile.matches ? 900 : count
      if (time - lastMaskTime > 80 || reduced.matches) {updateMasks(); lastMaskTime = time}
      renderer?.draw(state)
      // The static fallback occupies the same composition if WebGL is lost.
      if (Math.abs(x - Number(layer.dataset.x || 0)) > .5 || Math.abs(y - Number(layer.dataset.y || 0)) > .5 || Math.abs(scale - Number(layer.dataset.scale || 0)) > .5) {
        layer.style.setProperty('--particle-x', `${x}px`)
        layer.style.setProperty('--particle-y', `${y}px`)
        layer.style.setProperty('--particle-size', `${scale * 2}px`)
        layer.dataset.x = String(x)
        layer.dataset.y = String(y)
        layer.dataset.scale = String(scale)
      }
      const stage = stages[Math.min(8, Math.round(position))]
      if (stage !== previousStage) {layer.dataset.formation = stage; previousStage = stage}
      layer.dataset.motion = reduced.matches ? 'reduced' : 'scroll'
      if (renderer && !reduced.matches && state.opacity > 0) frameId = requestAnimationFrame(paint)
    }
    const schedule = () => {
      if (!frameId && !disposed && !contextLost && !document.hidden) frameId = requestAnimationFrame(paint)
    }
    const onScroll = () => {
      // Keep the static formation's text masks aligned as the document moves.
      // Reduced motion still draws just one frame and never starts a loop.
      if (reduced.matches) lastMaskTime = -Infinity
      schedule()
    }
    const onResize = () => {needsMeasure = true; schedule()}
    const onRefresh = () => {needsMeasure = true; schedule()}
    const onPointer = (event: PointerEvent) => {
      if (!finePointer.matches || reduced.matches) return
      pointer.x = clamp(event.clientX / window.innerWidth) * 2 - 1
      pointer.y = clamp(event.clientY / window.innerHeight) * 2 - 1
    }
    const onPointerLeave = () => {pointer.x = 0; pointer.y = 0}
    const onVisibility = () => {
      cancelAnimationFrame(frameId)
      frameId = 0
      lastTime = 0
      if (!document.hidden) schedule()
    }
    const onPreference = () => {
      position = 0
      measured = false
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
    compact.addEventListener('change', onResize)
    mobile.addEventListener('change', onResize)
    ScrollTrigger.addEventListener('refresh', onRefresh)
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
      compact.removeEventListener('change', onResize)
      mobile.removeEventListener('change', onResize)
      ScrollTrigger.removeEventListener('refresh', onRefresh)
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
