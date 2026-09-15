import {useRef, useState, type ReactNode} from 'react'
import {useGSAP} from '@gsap/react'
import {gsap} from 'gsap'
import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'
import clsx from 'clsx'

import styles from './product-book.module.css'

const chapters = (en: boolean) => [
  {title: en ? 'A place for every idea.' : '让每个想法，有处安放。', label: en ? 'Conversations' : '多模型对话', description: en ? 'Keep projects, models, and the next question together. Pick up exactly where you left off.' : '项目、模型与下一次提问，在同一个工作空间里。随时接着上一次的思路继续。', image: 'chat-home-welcome.png', alt: en ? 'Aivory workspace, with project navigation and model selection' : 'Aivory 工作空间，包含项目导航与模型选择', to: '/docs/getting-started/first-chat', detail: en ? 'Context that stays with you' : '上下文，持续陪伴'},
  {title: en ? 'Answers with a source.' : '每一个回答，都有出处。', label: en ? 'Knowledge' : '知识与检索', description: en ? 'Bring your documents into the workspace. Retrieve relevant passages and follow the sources behind an answer.' : '把文档带入工作空间，检索相关片段。沿着来源引用，理解回答背后的依据。', image: 'admin-documents-rag.png', alt: en ? 'Document management and knowledge retrieval configuration in Aivory' : 'Aivory 文档管理与知识库检索配置', to: '/docs/admin/knowledge-rag', detail: en ? 'Your documents, connected' : '让你的知识，彼此连接'},
  {title: en ? 'From thinking to doing.' : '从思考，走向执行。', label: en ? 'Tools & execution' : '工具与执行', description: en ? 'Let models search, call MCP services, and execute Python within the boundaries you configure.' : '让模型调用搜索、MCP 服务与 Python 沙箱，在你设定的边界内完成工作。', image: 'chat-tool-calls-reasoning.jpg', alt: en ? 'A conversation showing reasoning and tool execution steps' : '展示推理过程与工具执行步骤的对话', to: '/docs/admin/tools-sandbox', detail: en ? 'Every step is observable' : '每一步，都清晰可见'},
  {title: en ? 'Work you can take further.' : '让成果，继续生长。', label: en ? 'Artifacts' : '成果与协作', description: en ? 'Turn a conversation into a chart, a file, or an analysis. Keep the result alongside the work that produced it.' : '把对话变成图表、文件与分析报告。保留成果，也保留产生它的工作过程。', image: 'chat-artifact-dashboard.jpg', alt: en ? 'A dashboard generated in the Aivory conversation workspace' : '在 Aivory 对话工作空间中生成的数据看板', to: '/docs/getting-started/first-chat', detail: en ? 'More than a conversation' : '不止于一次对话'},
]

type Turn = {from: number; direction: number}

export default function ProductBook({isEnglish = false, compact = false}: {isEnglish?: boolean; compact?: boolean}): ReactNode {
  const pages = chapters(isEnglish)
  const [index, setIndex] = useState(0)
  const [turn, setTurn] = useState<Turn | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const pointer = useRef<{x: number; y: number} | null>(null)
  const imageRoot = useBaseUrl('/img/')
  const id = compact ? 'home-tour' : 'product-tour-pages'

  useGSAP(() => {
    if (!turn || !root.current) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const leaf = root.current!.querySelector('[data-turning-leaf]')
      const current = root.current!.querySelector('[data-current-page]')
      gsap.timeline({onComplete: () => setTurn(null)})
        .fromTo(current, {x: turn.direction * 22, scale: 0.985}, {x: 0, scale: 1, duration: 0.72, ease: 'power3.out'}, 0)
        .fromTo(leaf, {rotationY: 0, opacity: 1}, {rotationY: -turn.direction * 105, opacity: 0, transformOrigin: turn.direction > 0 ? '0% 50%' : '100% 50%', duration: 0.7, ease: 'power3.inOut'}, 0)
    })
    media.add('(prefers-reduced-motion: reduce)', () => setTurn(null))
    return () => media.revert()
  }, {scope: root, dependencies: [turn], revertOnUpdate: true})

  const go = (next: number) => {
    if (turn || next === index || next < 0 || next >= pages.length) return
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTurn({from: index, direction: next > index ? 1 : -1})
    setIndex(next)
  }

  const renderPage = (pageIndex: number, ghost = false) => {
    const page = pages[pageIndex]
    return <div className={styles.sheet}>
      <div className={styles.copyStack}>
        {pages.map((copy, n) => <div key={copy.label} className={clsx(styles.sheetCopy, n !== pageIndex && styles.copyHidden)} aria-hidden={n !== pageIndex || ghost ? true : undefined} inert={n !== pageIndex || ghost}>
          <span className={styles.chapterLabel}>{copy.label}</span>
          {compact ? <h2>{copy.title}</h2> : <h3>{copy.title}</h3>}
          <p>{copy.description}</p>
          {!compact && <Link to={copy.to} className={styles.readLink}>{isEnglish ? 'Explore this capability' : '了解这项能力'} <span aria-hidden="true">↗</span></Link>}
          <span className={styles.pageNumber} aria-hidden="true">{String(n + 1).padStart(2, '0')}</span>
        </div>)}
      </div>
      <figure className={styles.visual}>
        <div className={styles.windowBar}><span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span><span>Aivory / {page.label}</span><span className={styles.liveDot} aria-hidden="true" /></div>
        <img src={`${imageRoot}${page.image}`} alt={ghost ? '' : page.alt} width="2160" height="1350" loading={compact && pageIndex === 0 ? 'eager' : 'lazy'} fetchPriority={compact && pageIndex === 0 ? 'high' : 'auto'} draggable={false} />
        <figcaption><span>{page.detail}</span><span aria-hidden="true">↗</span></figcaption>
      </figure>
    </div>
  }

  return <div ref={root} className={clsx(styles.book, compact && styles.compact)} role="region" aria-roledescription={isEnglish ? 'carousel' : '轮播图'} aria-label={isEnglish ? 'Explore the Aivory workspace' : '探索 Aivory 工作空间'} onKeyDown={(event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      go(index + (event.key === 'ArrowRight' ? 1 : -1))
    }
  }}>
    <div className={styles.stage} id={id} role="group" tabIndex={0} aria-label={isEnglish ? 'Product pages. Use left and right arrow keys to turn.' : '产品图册，可使用左右方向键翻页。'} onPointerDown={(event) => {
      if (!event.isPrimary || event.button !== 0 || (event.target as Element).closest('a, button')) return
      pointer.current = {x: event.clientX, y: event.clientY}
      event.currentTarget.setPointerCapture(event.pointerId)
    }} onPointerCancel={() => {pointer.current = null}} onPointerUp={(event) => {
      if (!pointer.current) return
      const dx = event.clientX - pointer.current.x
      const dy = event.clientY - pointer.current.y
      pointer.current = null
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1))
    }}>
      <div className={styles.currentPage} data-current-page role="group" aria-roledescription={isEnglish ? 'slide' : '幻灯片'} aria-label={`${index + 1} / ${pages.length}`}>{renderPage(index)}</div>
      {turn && <div className={styles.turningLeaf} data-turning-leaf aria-hidden="true" inert>{renderPage(turn.from, true)}</div>}
      <span className={styles.fold} aria-hidden="true" />
    </div>
    <div className={styles.bookFooter}>
      <div className={styles.chapterButtons} role="group" aria-label={isEnglish ? 'Choose a chapter' : '选择章节'}>{pages.map((page, n) => <button key={page.label} type="button" aria-pressed={index === n} aria-controls={id} aria-label={`${String(n + 1).padStart(2, '0')} ${page.label}`} aria-disabled={Boolean(turn)} onClick={() => go(n)}><span>{String(n + 1).padStart(2, '0')}</span><span>{page.label}</span></button>)}</div>
      <div className={styles.turnControls}>
        <button type="button" disabled={index === 0} aria-disabled={index === 0 || Boolean(turn)} onClick={() => go(index - 1)} aria-label={isEnglish ? 'Previous page' : '上一页'} aria-controls={id}>←</button>
        <span aria-live="polite" aria-atomic="true">{String(index + 1).padStart(2, '0')} <span>/ 04</span></span>
        <button type="button" disabled={index === pages.length - 1} aria-disabled={index === pages.length - 1 || Boolean(turn)} onClick={() => go(index + 1)} aria-label={isEnglish ? 'Next page' : '下一页'} aria-controls={id}>→</button>
      </div>
    </div>
    <p className={styles.hint}>{isEnglish ? 'Turn a page. Take a closer look.' : '翻过一页，走近一点。'} <span>{isEnglish ? 'Use the arrows or swipe' : '点击箭头 · 也可左右滑动'}</span></p>
  </div>
}
