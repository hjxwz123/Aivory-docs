import {useEffect} from 'react'
import {useHistory} from '@docusaurus/router'

// Only the three story routes share the page-turn transition. Document links,
// anchors, modified clicks and browsers without this API keep native routing.
function chapter(pathname: string) {
  const match = pathname.match(/^\/(zh-Hans\/)?(product|architecture)?\/?$/)
  if (!match) return null
  const page = match[2] || 'home'
  return {page, locale: match[1] || 'en', order: ['home', 'product', 'architecture'].indexOf(page)}
}

export default function ExperienceTransition() {
  const history = useHistory()

  useEffect(() => {
    if (!document.startViewTransition) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let active: ViewTransition | null = null
    let cancelWait: (() => void) | undefined

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target instanceof Element ? event.target.closest('a') : null
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self') || anchor.closest('.navbar-sidebar')) return
      const target = new URL(anchor.href, window.location.href)
      const from = chapter(window.location.pathname)
      const to = chapter(target.pathname)
      if (target.origin !== window.location.origin || !from || !to || from.locale !== to.locale || from.page === to.page) return
      if (reducedMotion.matches) return

      // A second navigation can proceed immediately instead of waiting for a
      // snapshot from a route that the reader has already left.
      if (active) {
        active.skipTransition()
        cancelWait?.()
        return
      }
      event.preventDefault()
      event.stopPropagation()
      document.documentElement.dataset.aivoryTurn = to.order > from.order ? 'forward' : 'backward'

      const transition = document.startViewTransition(() => new Promise<void>((resolve) => {
        let frame = 0
        const finish = () => {
          observer.disconnect()
          window.clearTimeout(timeout)
          window.cancelAnimationFrame(frame)
          cancelWait = undefined
          resolve()
        }
        const check = () => {
          if (document.querySelector(`main[data-aivory-page="${to.page}"]`)) {
            observer.disconnect()
            frame = window.requestAnimationFrame(finish)
          }
        }
        const observer = new MutationObserver(check)
        const timeout = window.setTimeout(finish, 1800)
        cancelWait = finish
        observer.observe(document.body, {childList: true, subtree: true})
        history.push(`${target.pathname}${target.search}${target.hash}`)
        check()
      }))
      active = transition
      // A hidden tab or overlapping browser transition may skip snapshots;
      // neither should turn successful navigation into an unhandled rejection.
      void transition.ready.catch(() => {})
      void transition.finished.catch(() => {}).finally(() => {
        if (active === transition) {
          active = null
          delete document.documentElement.dataset.aivoryTurn
        }
      })
    }
    const skip = () => {
      active?.skipTransition()
      cancelWait?.()
    }
    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', skip)
    reducedMotion.addEventListener('change', skip)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', skip)
      reducedMotion.removeEventListener('change', skip)
      skip()
      delete document.documentElement.dataset.aivoryTurn
    }
  }, [history])

  return null
}
