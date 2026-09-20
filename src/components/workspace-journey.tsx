import {useRef, useState, type MouseEvent} from 'react'
import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'
import useBrokenLinks from '@docusaurus/useBrokenLinks'
import {useGSAP} from '@gsap/react'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import styles from './workspace-journey.module.css'

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger)

// Each interval includes a reading hold followed by the transition into the
// next chapter. The same semantic articles provide the static/mobile version.
const chapters = (en: boolean) => [
  {
    id: 'conversations', start: 0, end: 0.2, label: en ? 'Conversations' : '持续对话', tone: 'violet',
    title: en ? 'Every conversation has a next chapter.' : '一段对话，\n只是工作的开始。',
    lead: en ? 'An idea becomes a project. A question becomes a thread you can return to. Keep the work together as it grows.' : '一个想法可以展开成项目，一次提问可以延续成长期任务。把对话、文件与模型放进同一个工作空间，让每次打开都有迹可循。',
    detail: en ? 'Choose a model for the task, bring in relevant files, and continue from the context you already built. Your workspace gives that work a place to live.' : '根据任务选择模型，带入相关文件，再沿着已有上下文继续。研究、写作、分析，都可以从上次停下的地方接着向前。',
    facts: en ? ['Projects organize the work', 'Models fit the task', 'Files stay in context'] : ['以项目组织任务', '按需选择不同模型', '让文件留在上下文中'],
    image: 'chat-conversation.png', alt: en ? 'An Aivory conversation with project navigation and the model workspace' : 'Aivory 对话界面，展示项目导航、模型与持续对话',
    caption: en ? 'A workspace that remembers where you were.' : '保留思路，也保留工作过程。', to: '/docs/user-guide/conversations-files', link: en ? 'Explore conversations and files' : '了解对话与文件',
  },
  {
    id: 'knowledge', start: 0.2, end: 0.4, label: en ? 'Knowledge' : '知识检索', tone: 'sage',
    title: en ? 'Your knowledge. Within reach.' : '让每次回答，\n更靠近你的知识。',
    lead: en ? 'Bring your own documents into the conversation. Relevant passages become part of the answer, with sources you can follow.' : '把散落的文档带入知识库，让检索找到与问题相关的片段。模型可以参考你的资料作答，你也能沿着来源引用继续核对。',
    detail: en ? 'Parsing, indexing, and retrieval form a visible path. Configure how knowledge enters the workspace and how it is used, from a personal library to shared team material.' : '从文档解析到向量索引，再到检索与引用，每一步都有对应配置。个人资料和团队知识，都能在清晰的管理边界内参与工作。',
    facts: en ? ['Import your documents', 'Retrieve relevant passages', 'Follow the sources'] : ['导入与解析文档', '检索相关知识片段', '追溯回答的资料来源'],
    image: 'admin-documents-rag.png', alt: en ? 'Aivory document and RAG knowledge configuration' : 'Aivory 文档与 RAG 知识库管理界面',
    caption: en ? 'From stored documents to working knowledge.' : '从存放资料，到让知识参与工作。', to: '/docs/admin/knowledge-rag', link: en ? 'Understand knowledge retrieval' : '了解知识库与检索',
  },
  {
    id: 'execution', start: 0.4, end: 0.6, label: en ? 'Execution' : '工具执行', tone: 'violet',
    title: en ? 'Give an idea the tools to happen.' : '让想法，\n拥有执行的能力。',
    lead: en ? 'Search for information, call an MCP service, or run Python in the sandbox. Move from discussing a task to working through it.' : '检索信息、调用 MCP 服务、在 Python 沙箱里处理数据。把讨论中的任务继续往前推进，让模型可以调用你允许的工具。',
    detail: en ? 'Tool calls and execution results remain part of the conversation. Administrators configure what is available, while runtime boundaries make the path easier to inspect.' : '工具调用与执行结果留在对话中。管理员决定哪些能力可以使用，工作空间则保留可观察的执行路径，让每一步发生了什么都更清楚。',
    facts: en ? ['Search and MCP services', 'A Python execution environment', 'Explicit administrator policy'] : ['搜索与 MCP 服务', 'Python 沙箱执行环境', '管理员显式配置策略'],
    image: 'chat-tool-calls-reasoning.jpg', alt: en ? 'Reasoning, tool calls, and execution results in an Aivory conversation' : 'Aivory 对话中的推理、工具调用与执行结果',
    caption: en ? 'A visible path from request to result.' : '从提出请求，到看见执行结果。', to: '/docs/admin/tools-sandbox', link: en ? 'Explore tools and the sandbox' : '了解工具与沙箱',
  },
  {
    id: 'teams', start: 0.6, end: 0.8, label: en ? 'Team boundaries' : '团队与权限', tone: 'sage',
    title: en ? 'A shared space. Clear boundaries.' : '让团队协作，\n也让边界清晰。',
    lead: en ? 'Give your team a shared workspace with defined membership and administration. Bring people in through invitations or an email-domain enrollment policy.' : '为团队建立共享工作空间，明确成员与管理员。通过邀请或邮箱域规则，让合适的人进入合适的空间。',
    detail: en ? 'Domain policies can enroll new users automatically and restrict personal-space access when required. Workspace administrators are selected from existing members, so ownership remains explicit.' : '邮箱域规则可以自动加入指定工作空间，并按需要限制个人空间访问。工作空间管理员从现有成员中指定，成员入口与管理责任都有明确归属。',
    facts: en ? ['Automatic domain enrollment', 'Workspace member roles', 'Controlled personal-space access'] : ['邮箱域自动加入工作空间', '明确成员与管理员角色', '按策略控制个人空间访问'],
    image: 'admin-users.png', alt: en ? 'Aivory administrator user management interface' : 'Aivory 管理员用户管理界面',
    caption: en ? 'User administration, with policy behind it.' : '用户管理背后，是明确的访问策略。', to: '/docs/admin/domain-management', link: en ? 'Read about domain policies' : '了解域管理与权限',
  },
  {
    id: 'outcomes', start: 0.8, end: 1, label: en ? 'Outcomes' : '工作成果', tone: 'violet',
    title: en ? 'The answer is a new beginning.' : '把答案，\n变成下一步的起点。',
    lead: en ? 'A conversation can produce an analysis, a file, or an interactive artifact. Review the result alongside the process that created it.' : '一段对话可以产出分析、文件与交互式成果。把结果和产生它的过程放在一起，检查、调整，再继续下一轮工作。',
    detail: en ? 'Preview generated content in the workspace and take useful files into the next task. The value stays with the work you can carry forward.' : '在工作空间中预览生成内容，把有用的文件带入下一项任务。让一次对话的价值，延续到可以使用、可以继续完善的成果中。',
    facts: en ? ['Preview generated artifacts', 'Keep useful output files', 'Continue the next iteration'] : ['预览生成的工作成果', '保留有用的输出文件', '带着上下文继续迭代'],
    image: 'chat-artifact-dashboard.jpg', alt: en ? 'A generated dashboard displayed alongside an Aivory conversation' : 'Aivory 对话旁展示的生成式数据看板',
    caption: en ? 'The work continues beyond the conversation.' : '让工作的价值，延续到对话之外。', to: '/docs/user-guide/conversations-files', link: en ? 'Explore files and artifacts' : '了解文件与成果',
  },
]

export default function WorkspaceJourney({isEnglish: en}: {isEnglish: boolean}) {
  const root = useRef<HTMLElement>(null)
  const trigger = useRef<ScrollTrigger | null>(null)
  const [active, setActive] = useState(0)
  const imageRoot = useBaseUrl('/img/')
  const pages = chapters(en)
  const brokenLinks = useBrokenLinks()
  brokenLinks.collectAnchor('workspace-journey')
  pages.forEach(page => brokenLinks.collectAnchor(`journey-${page.id}`))

  useGSAP(() => {
    const section = root.current!
    const viewport = section.querySelector<HTMLElement>('[data-journey-viewport]')!
    const panels = Array.from(section.querySelectorAll<HTMLElement>('[data-journey-panel]'))
    const progress = section.querySelector<HTMLElement>('[data-journey-progress]')!
    const media = gsap.matchMedia()
    let frame = 0
    let selected = -1
    let initialHashApplied = false
    const setChapter = (index: number) => {
      if (selected === index) return
      selected = index
      setActive(index)
      panels.forEach((panel, n) => {
        panel.inert = n !== index
        panel.setAttribute('aria-hidden', String(n !== index))
      })
    }

    media.add({motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 900px) and (min-height: 680px)'}, context => {
      if (!context.conditions?.motion) return
      if (context.conditions.wide) {
        section.dataset.enhanced = 'true'
        gsap.set(panels, {transformPerspective: 1600, transformOrigin: '0% 50%', zIndex: index => panels.length - index})
        gsap.set(panels.slice(1), {autoAlpha: 0, xPercent: 9, rotationY: 12, scale: 0.94})
        setChapter(0)
        const timeline = gsap.timeline({defaults: {ease: 'none'}, scrollTrigger: {
          id: 'workspace-journey', trigger: viewport, start: 'top top+=64',
          end: () => `+=${window.innerHeight * 5.2}`, pin: true, scrub: 0.35,
          anticipatePin: 1, invalidateOnRefresh: true,
        }})
        const selectFromProgress = () => {
          const position = timeline.progress()
          setChapter(Math.min(4, Math.floor(position * 5 + 0.2)))
        }
        timeline.eventCallback('onUpdate', selectFromProgress)
        timeline.to(progress, {scaleX: 1, duration: 5}, 0)
        panels.slice(0, -1).forEach((panel, n) => {
          // Hold each composition for reading; turn during the final third.
          const at = n + 0.64
          timeline.to(panel, {xPercent: -17, rotationY: 78, scale: 0.92, duration: 0.48, ease: 'power2.inOut'}, at)
          timeline.to(panel, {autoAlpha: 0, duration: 0.12}, at + 0.38)
          timeline.to(panels[n + 1], {xPercent: 0, rotationY: 0, scale: 1, autoAlpha: 1, duration: 0.56, ease: 'power2.out'}, at)
          timeline.fromTo(panels[n + 1].querySelector('[data-journey-visual]'), {x: 65, clipPath: 'inset(0 0 0 18%)'}, {x: 0, clipPath: 'inset(0)', duration: 0.62, ease: 'power2.out'}, at + 0.08)
        })
        trigger.current = timeline.scrollTrigger!
        const syncPosition = () => {
          const current = trigger.current
          if (!current) return
          const position = gsap.utils.clamp(0, 1, (current.scroll() - current.start) / (current.end - current.start))
          timeline.progress(position)
          selectFromProgress()
        }
        const openHash = () => {
          const index = pages.findIndex(page => window.location.hash === `#journey-${page.id}`)
          if (index >= 0 && trigger.current) {
            window.scrollTo({top: trigger.current.start + (index + 0.3) / 5 * (trigger.current.end - trigger.current.start), behavior: 'instant'})
          }
          syncPosition()
        }
        // On reload, native anchor restoration runs as the document finishes
        // loading. Resolve the chapter after that restoration and pin layout.
        const afterLoad = () => {
          frame = requestAnimationFrame(() => {
            frame = requestAnimationFrame(() => {
              ScrollTrigger.refresh()
              if (!initialHashApplied) {openHash(); initialHashApplied = true}
              else syncPosition()
            })
          })
        }
        if (document.readyState === 'complete') afterLoad()
        else window.addEventListener('load', afterLoad, {once: true})
        window.addEventListener('hashchange', openHash)
        return () => {
          cancelAnimationFrame(frame)
          window.removeEventListener('hashchange', openHash)
          window.removeEventListener('load', afterLoad)
          trigger.current = null
          delete section.dataset.enhanced
          panels.forEach(panel => {panel.inert = false; panel.removeAttribute('aria-hidden')})
          selected = -1
        }
      }
      panels.forEach(panel => {
        const visual = panel.querySelector('[data-journey-visual]')
        gsap.fromTo(visual, {y: 45, scale: 0.94, clipPath: 'inset(0 12% 0 0)'}, {
          y: 0, scale: 1, clipPath: 'inset(0)', ease: 'power2.out',
          scrollTrigger: {trigger: visual, start: 'top 95%', end: 'top 45%', scrub: 0.25},
        })
      })
      frame = requestAnimationFrame(() => ScrollTrigger.refresh())
      return () => cancelAnimationFrame(frame)
    })
    return () => {media.revert(); trigger.current = null}
  }, {scope: root, dependencies: [en], revertOnUpdate: true})

  const jump = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (!trigger.current || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    window.history.replaceState(window.history.state, '', `#journey-${pages[index].id}`)
    const target = trigger.current.start + (index + 0.3) / 5 * (trigger.current.end - trigger.current.start)
    window.scrollTo({top: target, behavior: 'smooth'})
  }

  return <section className={styles.journey} ref={root} id="workspace-journey" aria-labelledby="journey-heading">
    <header className={styles.introduction}>
      <div><p className={styles.eyebrow}>THE WORKSPACE / FIVE CHAPTERS</p><h2 id="journey-heading">{en ? 'Good work has' : '让一次灵感，'}<br /><em>{en ? 'a place to grow.' : '走过完整的旅程。'}</em></h2></div>
      <div className={styles.introductionCopy}><p>{en ? 'Follow an idea through Aivory: give it context, connect your knowledge, put tools to work, bring in your team, and keep what you create.' : '沿着一个想法，走进 Aivory：延续上下文、连接知识、调用工具、邀请团队，再把成果带向下一步。'}</p><a href="#journey-conversations" onClick={event => jump(event, 0)}>{en ? 'Scroll to turn the chapters' : '向下滚动，逐章翻开'} <span aria-hidden="true">↓</span></a></div>
    </header>
    <div className={styles.viewport} data-journey-viewport>
      <div className={styles.chapterRail}>
        <span className={styles.railTitle}>AIVORY <span>/ {en ? 'THE WORKSPACE' : '工作空间'}</span></span>
        <span className={styles.railCount} aria-hidden="true">0{active + 1}<span> / 05</span></span>
        <div className={styles.progressTrack} aria-hidden="true"><span data-journey-progress /></div>
      </div>
      <div className={styles.pages}>
        {pages.map((page, index) => <article key={page.id} className={styles.panel} id={`journey-${page.id}`} data-journey-panel data-tone={page.tone} aria-labelledby={`journey-title-${page.id}`}>
          <div className={styles.panelCopy} data-journey-copy>
            <p className={styles.chapterLabel}><span>0{index + 1}</span> / {page.label}</p>
            <h3 id={`journey-title-${page.id}`}>{page.title}</h3>
            <p className={styles.lead}>{page.lead}</p>
            <p className={styles.detail} data-journey-detail>{page.detail}</p>
            <ul>{page.facts.map(fact => <li key={fact}><span aria-hidden="true">↗</span><span data-journey-fact>{fact}</span></li>)}</ul>
            <Link to={page.to} className={styles.chapterLink}>{page.link}<span aria-hidden="true">→</span></Link>
          </div>
          <figure className={styles.visual} data-journey-visual>
            <div className={styles.imageFrame}><div className={styles.windowBar}><span aria-hidden="true">● ● ●</span><span>Aivory / {page.label}</span></div><img src={`${imageRoot}${page.image}`} alt={page.alt} width="2160" height="1350" loading="lazy" /></div>
            <figcaption><span>{page.caption}</span><span aria-hidden="true">0{index + 1}</span></figcaption>
            <div className={styles.pageEdge} aria-hidden="true" />
          </figure>
          <span className={styles.watermark} aria-hidden="true">0{index + 1}</span>
        </article>)}
      </div>
      <nav className={styles.chapterTabs} aria-label={en ? 'Workspace story chapters' : '工作空间故事章节'}>
        {pages.map((page, index) => <a key={page.id} href={`#journey-${page.id}`} onClick={event => jump(event, index)} aria-current={active === index ? 'step' : undefined}><span>0{index + 1}</span>{page.label}<i aria-hidden="true" /></a>)}
      </nav>
    </div>
  </section>
}
