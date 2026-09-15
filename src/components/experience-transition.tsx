import {useEffect, useRef} from 'react'
import {useHistory} from '@docusaurus/router'

function chapter(pathname: string) {
  const match = pathname.match(/^\/(zh-Hans\/)?(product|architecture)?\/?$/)
  if (!match) return null
  const page = match[2] || 'home'
  return {page, locale: match[1] || 'en', order: ['home', 'product', 'architecture'].indexOf(page)}
}

type TransitionJob = {animations: Animation[]; stopWaiting?: () => void}

// A real DOM curtain makes the chapter transition visible in all modern
// browsers. It does not depend on document.startViewTransition support.
export default function ExperienceTransition() {
  const history = useHistory()
  const curtain = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const overlay = curtain.current!
    if (!overlay.animate) return
    const panels = Array.from(overlay.querySelectorAll<HTMLElement>('[data-transition-sheet]'))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let active: TransitionJob | null = null

    const cancel = () => {
      const previous = active
      active = null
      previous?.stopWaiting?.()
      previous?.animations.forEach(animation => animation.cancel())
      delete overlay.dataset.active
    }
    const waitForPage = (page: string, job: TransitionJob) => new Promise<void>(resolve => {
      let frame = 0
      const finish = () => {
        observer.disconnect()
        clearTimeout(timeout)
        cancelAnimationFrame(frame)
        job.stopWaiting = undefined
        resolve()
      }
      const check = () => {
        if (document.querySelector(`main[data-aivory-page="${page}"]`)) {
          observer.disconnect()
          frame = requestAnimationFrame(finish)
        }
      }
      const observer = new MutationObserver(check)
      const timeout = window.setTimeout(finish, 1800)
      job.stopWaiting = finish
      observer.observe(document.body, {childList: true, subtree: true})
      check()
    })
    const animatePanels = (job: TransitionJob, direction: number, entering: boolean) => {
      const animations = panels.map((panel, index) => panel.animate(
        entering
          ? [{transform: 'translateY(0)'}, {transform: `translateY(${-direction * 110}%)`}]
          : [{transform: `translateY(${direction * 110}%)`}, {transform: 'translateY(0)'}],
        {duration: entering ? 520 : 340, delay: index * 55, easing: entering ? 'cubic-bezier(0.76, 0, 0.24, 1)' : 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards'},
      ))
      job.animations.push(...animations)
      return Promise.all(animations.map(animation => animation.finished))
    }
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target instanceof Element ? event.target.closest('a') : null
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return
      const target = new URL(anchor.href, window.location.href)
      const from = chapter(window.location.pathname)
      const to = chapter(target.pathname)
      if (active) cancel()
      if (reduced.matches || target.origin !== window.location.origin || !from || !to || from.locale !== to.locale || from.page === to.page) return
      event.preventDefault()
      const job: TransitionJob = {animations: []}
      active = job
      const direction = to.order > from.order ? 1 : -1
      label.current!.textContent = `${String(to.order + 1).padStart(2, '0')} / ${to.locale === 'en' ? ['BEGIN HERE', 'INSIDE AIVORY', 'THE ARCHITECTURE'][to.order] : ['从这里开始', '走进 Aivory', '理解内部架构'][to.order]}`
      overlay.dataset.active = 'true'
      const run = async () => {
        try {
          await animatePanels(job, direction, false)
          if (active !== job) return
          const waiting = waitForPage(to.page, job)
          history.push(`${target.pathname}${target.search}${target.hash}`)
          await waiting
          if (active !== job) return
          await animatePanels(job, direction, true)
          if (active === job) cancel()
        } catch {
          // Cancelling an Animation rejects its finished promise. It is an
          // ordinary interruption (another link, Back, or reduced motion).
          if (active === job) cancel()
        }
      }
      void run()
    }
    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', cancel)
    reduced.addEventListener('change', cancel)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', cancel)
      reduced.removeEventListener('change', cancel)
      cancel()
    }
  }, [history])

  return <div ref={curtain} className="aivory-transition-curtain" aria-hidden="true" inert>
    <div data-transition-sheet /><div data-transition-sheet /><div data-transition-sheet />
    <div className="aivory-transition-title"><span>Aivory.</span><span ref={label} /></div>
  </div>
}
