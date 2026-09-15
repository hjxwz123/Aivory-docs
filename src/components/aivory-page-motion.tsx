import type {RefObject} from 'react'
import {useLocation} from '@docusaurus/router'
import {useGSAP} from '@gsap/react'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function AivoryPageMotion({scopeRef}: {scopeRef: RefObject<HTMLDivElement | null>}) {
  const {pathname} = useLocation()

  useGSAP(() => {
    const main = scopeRef.current?.querySelector<HTMLElement>('main.aivory-experience-page')
    if (!main) return
    const media = gsap.matchMedia()
    let frame = 0

    media.add({motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 997px)'}, (context) => {
      if (!context.conditions?.motion) return

      // Keep text visible. Only sibling groups receive a short arrival rhythm;
      // no section needs an animation or a scroll event to become readable.
      const groups = main.querySelectorAll<HTMLElement>('[data-aivory-list], [class*="featureGrid"]')
      groups.forEach((group) => {
        if (group.getBoundingClientRect().top < window.innerHeight * 0.9) return
        gsap.from(group.children, {
          y: 20, duration: 0.6, stagger: 0.06, ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: {trigger: group, start: 'top 90%', once: true},
        })
      })

      if (context.conditions.wide) {
        const heroBook = main.querySelector('[data-aivory-depth="hero-book"]')
        if (heroBook) gsap.to(heroBook, {
          y: -36, rotationY: -3, rotationX: 2, ease: 'none',
          scrollTrigger: {trigger: heroBook, start: 'top top+=160', end: 'bottom top', scrub: 0.65},
        })
        const productBook = main.querySelector('[data-aivory-depth="product-book"]')
        if (productBook) gsap.fromTo(productBook, {rotationX: 5, y: 28, scale: 0.965}, {
          rotationX: 0, y: 0, scale: 1, ease: 'none',
          scrollTrigger: {trigger: productBook, start: 'top bottom', end: 'top 25%', scrub: 0.6},
        })
      }
      frame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
    })
    return () => {
      window.cancelAnimationFrame(frame)
      media.revert()
    }
  }, {scope: scopeRef, dependencies: [pathname], revertOnUpdate: true})
  return null
}
