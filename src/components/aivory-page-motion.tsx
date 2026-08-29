import type {RefObject} from 'react'
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

const markdownRevealSelector = [
  '.markdown > h2',
  '.markdown > h3',
  '.markdown > p',
  '.markdown > ul',
  '.markdown > ol',
  '.markdown > blockquote',
  '.markdown > .theme-admonition',
].join(', ')

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

/** Route-scoped motion that keeps server-rendered content visible by default. */
export default function AivoryPageMotion({scopeRef}: AivoryPageMotionProps) {
  const {pathname} = useLocation()

  useGSAP(() => {
    const scope = scopeRef.current
    const main = scope?.querySelector<HTMLElement>('main')
    if (!scope || !main) return

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
        const hero = main.querySelector<HTMLElement>('[data-aivory-motion="hero"]')

        if (hero) {
          const heroCopy = hero.querySelector<HTMLElement>('[data-aivory-motion="hero-copy"]') ?? hero
          const heroAside = hero.querySelector<HTMLElement>('[data-aivory-motion="hero-aside"]')
          const timeline = gsap.timeline({defaults: {ease: 'power3.out'}})

          timeline.fromTo(
            heroCopy,
            {autoAlpha: 0, y: 18},
            {autoAlpha: 1, y: 0, duration: 0.56, clearProps: 'transform,opacity,visibility'},
          )

          if (heroAside) {
            timeline.fromTo(
              heroAside,
              getRevealStart('hero-aside', wide),
              {autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.5, clearProps: 'transform,opacity,visibility'},
              '-=0.32',
            )
          }
        } else {
          gsap.fromTo(
            main,
            {autoAlpha: 0, y: 12},
            {autoAlpha: 1, y: 0, duration: 0.46, ease: 'power3.out', clearProps: 'transform,opacity,visibility'},
          )
        }

        const explicitTargets = Array.from(scope.querySelectorAll<HTMLElement>('[data-aivory-reveal]'))
        const markdownTargets = main.classList.contains('aivory-home-page') || main.classList.contains('aivory-experience-page')
          ? []
          : Array.from(main.querySelectorAll<HTMLElement>(markdownRevealSelector))
        const revealTargets = Array.from(new Set([...explicitTargets, ...markdownTargets]))

        if (revealTargets.length > 0) {
          ScrollTrigger.batch(revealTargets, {
            start: 'top 84%',
            once: true,
            interval: 0.08,
            batchMax: 4,
            onEnter: (elements) => {
              elements.forEach((target, index) => {
                const element = target as HTMLElement
                const kind = element.dataset.aivoryReveal
                gsap.fromTo(
                  element,
                  getRevealStart(kind, wide),
                  {
                    autoAlpha: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    duration: getRevealDuration(kind),
                    delay: index * 0.06,
                    ease: 'power3.out',
                    overwrite: 'auto',
                    clearProps: 'transform,opacity,visibility',
                  },
                )
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
