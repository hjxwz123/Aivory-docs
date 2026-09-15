import {useRef, type RefObject} from 'react'
import {useLocation} from '@docusaurus/router'
import {useGSAP} from '@gsap/react'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger)
}

type AivoryPageMotionProps = {
  scopeRef: RefObject<HTMLDivElement | null>
}

type RevealStart = {
  autoAlpha: number
  x?: number
  y?: number
  scale?: number
}

// Must stay in sync with the ScrollTrigger `start: 'top 84%'` below.
const revealStartFactor = 0.84

function getRevealStart(kind: string | undefined, wide: boolean): RevealStart {
  const vertical: RevealStart = {autoAlpha: 0, y: 22}

  if (!wide) return vertical

  switch (kind) {
    case 'ordinary-chat':
      return {autoAlpha: 0, x: -34, y: 8, scale: 0.985}
    case 'aivory-workspace':
      return {autoAlpha: 0, x: 34, y: 10, scale: 0.985}
    case 'deployment-copy':
    case 'split-copy':
      return {autoAlpha: 0, x: -26, y: 8}
    case 'stack-shell':
    case 'architecture-stage':
      return {autoAlpha: 0, x: 26, y: 12, scale: 0.988}
    case 'hero-aside':
      return {autoAlpha: 0, x: 22, y: 8}
    default:
      return vertical
  }
}

function getRevealDuration(kind: string | undefined) {
  return kind === 'feature-item' || kind === 'workspace-layer' ? 0.44 : 0.62
}

/** True when the element sits below the reveal trigger line at setup time.
 *  Anything above the line was (or is about to be) painted by the server
 *  render, and content that is visible must never be switched off — that is
 *  what made the previous `fromTo`-inside-`onEnter` pattern blink. */
function belowRevealLine(el: HTMLElement) {
  return el.getBoundingClientRect().top > window.innerHeight * revealStartFactor
}

/** Route-scoped motion that keeps server-rendered content visible by default.

    Invariants (they keep the first paint free of flash):
    1. On the initial post-hydration run the browser has ALREADY painted the
       SSR HTML, so no above-the-fold element may receive a hidden start
       state here. Entrances for the home page and the hero pages live in
       pure-CSS keyframes (index.module.css / experience.module.css) and
       replay naturally when React remounts their DOM on client navigation.
    2. The whole-`main` fade only runs on client-side navigations, where this
       layout effect executes before the new content's first paint.
    3. Scroll reveals pre-hide only targets below the trigger line at setup
       time and animate them with `to()`, so a rise-reveal replaces the old
       hide-then-show blink and refresh-time flashes disappear. */
export default function AivoryPageMotion({scopeRef}: AivoryPageMotionProps) {
  const {pathname} = useLocation()
  // This component is mounted once by theme/Root and never unmounts, so the
  // first callback run is hydration (after first paint) and every later run
  // is a client-side navigation (before the new DOM is painted).
  const isInitialRunRef = useRef(true)

  useGSAP(() => {
    const scope = scopeRef.current
    const main = scope?.querySelector<HTMLElement>('main')
    if (!scope || !main) return

    const isInitialRun = isInitialRunRef.current
    isInitialRunRef.current = false

    // Reading, anchor navigation, search and printing must never wait for an
    // entrance animation. Keep motion scoped to the product showcase routes.
    if (!main.classList.contains('aivory-experience-page')) return

    const media = gsap.matchMedia()
    let refreshFrame = 0

    media.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        wide: '(min-width: 841px)',
      },
      (context) => {
        if (!context.conditions?.motion) return

        const wide = Boolean(context.conditions.wide)
        const isHome = main.classList.contains('aivory-home-page')
        // Hero pages animate their first screen through CSS keyframes.
        const hasCssHeroEntrance = Boolean(main.querySelector('[data-aivory-motion="hero"]'))

        if (!isInitialRun && !isHome && !hasCssHeroEntrance) {
          gsap.fromTo(
            main,
            {autoAlpha: 0, y: 12},
            {autoAlpha: 1, y: 0, duration: 0.46, ease: 'power3.out', clearProps: 'transform,opacity,visibility'},
          )
        }

        const explicitTargets = Array.from(scope.querySelectorAll<HTMLElement>('[data-aivory-reveal]'))
        const revealTargets = explicitTargets

        // Only elements that have not been painted yet (below the trigger
        // line) are pre-hidden; anything in view stays exactly as rendered.
        const pending = revealTargets.filter(belowRevealLine)

        if (pending.length > 0) {
          pending.forEach((element) => {
            gsap.set(element, getRevealStart(element.dataset.aivoryReveal, wide))
          })

          ScrollTrigger.batch(pending, {
            start: 'top 84%',
            once: true,
            interval: 0.08,
            batchMax: 4,
            onEnter: (elements) => {
              elements.forEach((target, index) => {
                const element = target as HTMLElement
                const kind = element.dataset.aivoryReveal
                gsap.to(element, {
                  autoAlpha: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                  duration: getRevealDuration(kind),
                  delay: index * 0.06,
                  ease: 'power3.out',
                  overwrite: 'auto',
                  clearProps: 'transform,opacity,visibility',
                })
              })
            },
          })
        }

        refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
      },
    )

    return () => {
      if (refreshFrame) window.cancelAnimationFrame(refreshFrame)
      media.revert()
    }
  }, {scope: scopeRef, dependencies: [pathname], revertOnUpdate: true})

  return null
}
