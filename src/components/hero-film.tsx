import {useEffect, useRef, useState, type ReactNode} from 'react'
import useBaseUrl from '@docusaurus/useBaseUrl'
import {useGSAP} from '@gsap/react'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import styles from './hero-film.module.css'

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger)

const chapters = (en: boolean) => [
  {at: 0, label: en ? 'One prompt' : '一句话开始'},
  {at: 6.2, label: en ? 'It gets to work' : '自主执行'},
  {at: 14, label: en ? 'Real deliverables' : '交付成品'},
  {at: 21.6, label: en ? 'Every model' : '多模型'},
  {at: 28.2, label: en ? 'Cited answers' : '有据可查'},
  {at: 34.4, label: en ? 'One workspace' : '一个工作空间'},
]

function PlayIcon({playing}: {playing: boolean}): ReactNode {
  return playing
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="3.6" height="14" rx="1.2" /><rect x="13.9" y="5" width="3.6" height="14" rx="1.2" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10-6.4a1 1 0 0 0 0-1.8l-10-6.4C8.9 4.3 8 4.8 8 5.6Z" /></svg>
}
function SoundIcon({muted}: {muted: boolean}): ReactNode {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4z" />
    {muted ? <><path d="m22 9-6 6" /><path d="m16 9 6 6" /></> : <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>}
  </svg>
}

/**
 * The product film. It autoplays muted only while in view (and never under
 * reduced motion), unfolds from a tilted frame as the page scrolls, and offers
 * chapter markers that seek within the loop.
 */
export default function HeroFilm({isEnglish: en}: {isEnglish: boolean}): ReactNode {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const userPaused = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [chapter, setChapter] = useState(0)
  const base = useBaseUrl('/video/')
  const film = `${base}${en ? 'aivory-hero-en' : 'aivory-hero'}`
  const marks = chapters(en)

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const stage = root.current!.querySelector('[data-film-stage]')
      const frame = root.current!.querySelector('[data-film-frame]')
      gsap.fromTo(frame, {rotationX: 24, scale: 0.84, yPercent: 4}, {
        rotationX: 0, scale: 1, yPercent: 0, ease: 'none',
        scrollTrigger: {trigger: stage, start: 'top bottom', end: 'center 56%', scrub: 0.6},
      })
      gsap.fromTo(root.current!.querySelectorAll('[data-film-reveal]'), {y: 34, autoAlpha: 0, filter: 'blur(10px)'}, {
        y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1, stagger: 0.1, ease: 'power3.out', clearProps: 'filter',
        scrollTrigger: {trigger: root.current, start: 'top 78%', once: true},
      })
    })
    return () => media.revert()
  }, {scope: root, dependencies: [en], revertOnUpdate: true})

  useEffect(() => {
    const v = video.current
    const section = root.current
    if (!v || !section) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    const sync = () => {
      if (visible && !userPaused.current && !reduced.matches) void v.play().catch(() => {})
      else if (!v.paused) v.pause()
    }
    const observer = new IntersectionObserver(([entry]) => {visible = entry.intersectionRatio >= 0.35; sync()}, {threshold: [0, 0.35, 0.6]})
    observer.observe(v)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => {
      section.style.setProperty('--film-progress', String(v.duration ? v.currentTime / v.duration : 0))
      const index = marks.reduce((found, mark, n) => (v.currentTime >= mark.at ? n : found), 0)
      setChapter(index)
    }
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('timeupdate', onTime)
    reduced.addEventListener('change', sync)
    return () => {
      observer.disconnect()
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('timeupdate', onTime)
      reduced.removeEventListener('change', sync)
    }
  }, [en])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) {userPaused.current = false; void v.play().catch(() => {})}
    else {userPaused.current = true; v.pause()}
  }
  const toggleSound = () => {
    const v = video.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (!v.muted && v.paused) {userPaused.current = false; void v.play().catch(() => {})}
  }
  const seek = (at: number) => {
    const v = video.current
    if (!v) return
    v.currentTime = at
    userPaused.current = false
    void v.play().catch(() => {})
  }

  return <section ref={root} className={styles.film} aria-labelledby="film-title" data-playing={playing}>
    <div className={styles.head}>
      <p className={styles.eyebrow} data-film-reveal>AIVORY · {en ? 'THE FILM' : '产品影片'} · 0:50</p>
      <h2 id="film-title" data-film-reveal>{en ? 'One minute. ' : '一分钟，'}<em>{en ? 'The whole workflow.' : '看见完整的工作流。'}</em></h2>
      <p data-film-reveal>{en
        ? 'Start with one sentence. Watch it search, run code, and deliver files, then follow the citations, the models, and the team space around it.'
        : '从一句话开始：联网搜索、运行代码、交付文件，再到原文引用、多模型与团队空间。'}</p>
    </div>
    <div className={styles.stage} data-film-stage>
      <div className={styles.frame} data-film-frame>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.edge} aria-hidden="true" />
        <div className={styles.screen}>
          <video ref={video} muted loop playsInline preload="metadata" poster={`${film}-poster.jpg`} aria-label={en ? 'Aivory product film, 50 seconds' : 'Aivory 产品影片，时长 50 秒'}>
            <source src={`${film}-720p.mp4`} type="video/mp4" media="(max-width: 768px)" />
            <source src={`${film}-1080p.webm`} type="video/webm" />
            <source src={`${film}-1080p.mp4`} type="video/mp4" />
          </video>
          <button type="button" className={styles.bigPlay} onClick={toggle} aria-label={en ? 'Play the film' : '播放影片'} tabIndex={playing ? -1 : 0}><PlayIcon playing={false} /></button>
          <div className={styles.controls}>
            <button type="button" onClick={toggle} aria-label={playing ? (en ? 'Pause' : '暂停') : (en ? 'Play' : '播放')}><PlayIcon playing={playing} /></button>
            <div className={styles.progress} aria-hidden="true"><span /></div>
            <button type="button" onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? (en ? 'Turn sound on' : '开启声音') : (en ? 'Mute' : '静音')}><SoundIcon muted={muted} /></button>
          </div>
        </div>
      </div>
      <div className={styles.floor} aria-hidden="true" />
    </div>
    <ol className={styles.marks} aria-label={en ? 'Film chapters' : '影片章节'}>
      {marks.map((mark, index) => <li key={mark.at}>
        <button type="button" onClick={() => seek(mark.at)} aria-current={chapter === index ? 'step' : undefined}>
          <span>{`0:${String(Math.floor(mark.at)).padStart(2, '0')}`}</span>{mark.label}<i aria-hidden="true" />
        </button>
      </li>)}
    </ol>
  </section>
}
