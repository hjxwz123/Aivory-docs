import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import styles from './experience.module.css'

type ArchNode = {
  id: string
  label: string
  detail: string
  left: string
  top: string
  tone: 'violet' | 'sage' | 'porcelain'
}

const nodes = (isEnglish: boolean): ArchNode[] => isEnglish ? [
  {id: 'browser', label: 'Browser', detail: 'Same-origin Web + API', left: '13%', top: '27%', tone: 'porcelain'},
  {id: 'app', label: 'Aivory app', detail: 'Control plane and orchestration', left: '50%', top: '27%', tone: 'violet'},
  {id: 'provider', label: 'Model channels', detail: 'OpenAI / Claude / Gemini', left: '87%', top: '27%', tone: 'sage'},
  {id: 'context', label: 'Knowledge and files', detail: 'SQLite / Qdrant', left: '25%', top: '61%', tone: 'sage'},
  {id: 'tools', label: 'Tools and sandbox', detail: 'MCP / Python', left: '50%', top: '76%', tone: 'porcelain'},
  {id: 'data', label: 'Persistence boundary', detail: 'Postgres / Redis', left: '75%', top: '61%', tone: 'violet'},
] : [
  {id: 'browser', label: '浏览器', detail: '同源 Web + API', left: '13%', top: '27%', tone: 'porcelain'},
  {id: 'app', label: 'Aivory app', detail: '控制面与编排', left: '50%', top: '27%', tone: 'violet'},
  {id: 'provider', label: '模型渠道', detail: 'OpenAI / Claude / Gemini', left: '87%', top: '27%', tone: 'sage'},
  {id: 'context', label: '知识与文件', detail: 'SQLite / Qdrant', left: '25%', top: '61%', tone: 'sage'},
  {id: 'tools', label: '工具与沙盒', detail: 'MCP / Python', left: '50%', top: '76%', tone: 'porcelain'},
  {id: 'data', label: '持久化边界', detail: 'Postgres / Redis', left: '75%', top: '61%', tone: 'violet'},
]

const edges: Array<[string, string]> = [
  ['browser', 'app'],
  ['app', 'provider'],
  ['app', 'context'],
  ['app', 'tools'],
  ['app', 'data'],
]

const requestPath = ['browser', 'app', 'context', 'tools', 'provider']

export default function ArchitecturePage(): ReactNode {
  const {i18n} = useDocusaurusContext()
  const isEnglish = i18n.currentLocale === 'en'
  const architectureNodes = nodes(isEnglish)
  const nodeById = Object.fromEntries(architectureNodes.map((node) => [node.id, node])) as Record<string, ArchNode>
  const [active, setActive] = useState('app')
  const [isPlaying, setIsPlaying] = useState(false)
  const playbackRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    document.body.classList.add('aivory-experience-page')
    return () => {
      document.body.classList.remove('aivory-experience-page')
      if (playbackRef.current) clearInterval(playbackRef.current)
    }
  }, [])

  const stopPlayback = () => {
    if (playbackRef.current) clearInterval(playbackRef.current)
    playbackRef.current = null
    setIsPlaying(false)
  }

  const playPath = () => {
    if (isPlaying) {
      stopPlayback()
      return
    }
    let index = 0
    setIsPlaying(true)
    setActive(requestPath[0])
    playbackRef.current = setInterval(() => {
      index += 1
      if (index >= requestPath.length) {
        stopPlayback()
        return
      }
      setActive(requestPath[index])
    }, 760)
  }

  const selected = nodeById[active] ?? nodeById.app
  const activeEdge = (from: string, to: string) => {
    const currentIndex = requestPath.indexOf(active)
    return requestPath.includes(from) && requestPath.includes(to) && Math.abs(requestPath.indexOf(from) - requestPath.indexOf(to)) === 1 && currentIndex >= Math.max(requestPath.indexOf(from), requestPath.indexOf(to))
  }

  return (
    <Layout title={isEnglish ? 'Architecture path' : '架构路径'} description={isEnglish ? 'Follow an Aivory request from the browser through models, knowledge, tools, and persistence boundaries.' : '查看 Aivory 从浏览器到模型、知识库、工具和持久化边界的请求路径。'}>
      <main className={`${styles.page} aivory-experience-page`}>
        <div className={styles.pageInner}>
          <header className={styles.pageHero} data-aivory-motion="hero">
            <div data-aivory-motion="hero-copy">
              <p className={styles.eyebrow}><i />ARCHITECTURE / REQUEST PATH</p>
              <h1 className={styles.pageTitle}>{isEnglish ? 'Every request has ' : '每一条请求，'}<em>{isEnglish ? 'a boundary.' : '都有边界。'}</em></h1>
              <p className={styles.pageLead}>{isEnglish ? 'Aivory separates the frontend, orchestration, model channels, context, tools, and persistence into inspectable connections. Select a node to view its responsibility, then run the path to see one request move through the workspace.' : 'Aivory 把前端、编排、模型渠道、上下文、工具和持久化拆成可以检查的连接。点击节点查看职责，运行路径观察一次请求如何穿过工作区。'}</p>
              <div className={styles.pageActions}><Link className={styles.primaryLink} to="/docs/deployment/environment">{isEnglish ? 'View environment variables' : '查看环境变量'} <span aria-hidden="true">↗</span></Link><Link className={styles.textLink} to="/product">{isEnglish ? 'Back to product overview' : '回到产品介绍'} <span aria-hidden="true">→</span></Link></div>
            </div>
            <aside className={styles.heroAside} data-aivory-motion="hero-aside"><p>{isEnglish ? 'The personal and full editions share one workspace model. They differ only in the deployment boundaries for persistence, caching, vectors, and the sandbox.' : '个人版和完整版共享同一套工作区语义，差别只在持久化、缓存、向量和沙盒的部署边界。'}</p><dl><div><dt>PATH</dt><dd>5 stages</dd></div><div><dt>STATE</dt><dd>{isEnglish ? 'Observable' : '可观察'}</dd></div><div><dt>MODE</dt><dd>{isEnglish ? 'Self-hosted' : '自托管'}</dd></div></dl></aside>
          </header>
        </div>

        <section className={styles.sectionMuted}>
          <div className={styles.pageInner}><div className={styles.section}>
            <div className={styles.sectionHeader} data-aivory-reveal="section-header"><div><p className={styles.eyebrow}><i />INTERACTIVE MAP</p><h2>{isEnglish ? 'Walk the real request path.' : '沿着真实的请求路径走一遍。'}</h2></div><p>{isEnglish ? 'Nodes are selectable and the path is playable. The diagram shows relationships; the documentation carries the details.' : '节点是可选择的，路径是可播放的。图形只表达关系，细节仍然来自文档。'}</p></div>
            <div className={styles.architectureStage} data-aivory-reveal="architecture-stage">
              <svg className={styles.architectureLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {edges.map(([from, to]) => {
                  const source = nodeById[from]
                  const target = nodeById[to]
                  return <line key={`${from}-${to}`} x1={parseFloat(source.left)} y1={parseFloat(source.top)} x2={parseFloat(target.left)} y2={parseFloat(target.top)} data-active={activeEdge(from, to)} />
                })}
              </svg>
              {architectureNodes.map((node) => <button key={node.id} type="button" className={styles.archNode} style={{'--node-left': node.left, '--node-top': node.top} as CSSProperties} data-tone={node.tone} aria-pressed={active === node.id} onClick={() => { stopPlayback(); setActive(node.id) }}><span className={styles.archNodeDot} aria-hidden="true" /><strong>{node.label}</strong><small>{node.detail}</small></button>)}
              <div className={styles.architectureDetails}><p><strong>{selected.label}</strong>{selected.detail}</p><button type="button" onClick={playPath}>{isPlaying ? (isEnglish ? 'Pause path' : '暂停路径') : (isEnglish ? 'Play request path' : '播放请求路径')} <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span></button></div>
            </div>
          </div></div>
        </section>

        <section className={styles.section}><div className={styles.pageInner}><div className={styles.splitSection}><div className={styles.splitIntro} data-aivory-reveal="split-copy"><p className={styles.eyebrow}><i />BOUNDARIES / BY DESIGN</p><h2>{isEnglish ? 'Deployment scale changes dependencies, not how you work.' : '部署规模改变依赖，不改变使用方式。'}</h2><p>{isEnglish ? 'The personal edition starts quickly with SQLite and in-process capability. The full edition distributes the same path across PostgreSQL, Redis, Qdrant, and the sandbox.' : '个人版用 SQLite 与进程内能力快速启动；完整版把同一条路径拆到 PostgreSQL、Redis、Qdrant 和沙盒。'}</p><Link className={styles.textLink} to="/docs/getting-started/personal">{isEnglish ? 'Read the deployment comparison' : '阅读部署对比'} <span aria-hidden="true">→</span></Link></div><div className={styles.featureGrid}><article className={styles.featureItem} data-aivory-reveal="feature-item"><span className={styles.featureNumber}>A</span><h3>{isEnglish ? 'Same-origin API' : '同源 API'}</h3><p>{isEnglish ? 'The application container serves the web UI and /api; the proxy needs to handle only one origin.' : '网页和 /api 由应用容器提供，代理层只需处理一个 origin。'}</p></article><article className={styles.featureItem} data-aivory-reveal="feature-item"><span className={styles.featureNumber}>B</span><h3>{isEnglish ? 'Explicit tools' : '显式工具'}</h3><p>{isEnglish ? 'Search, MCP, and the sandbox are configured by administrators. Models cannot cross the execution boundary.' : '搜索、MCP 与沙盒由管理员配置，模型不能越过运行边界。'}</p></article><article className={styles.featureItem} data-aivory-reveal="feature-item"><span className={styles.featureNumber}>C</span><h3>{isEnglish ? 'Recoverable state' : '可恢复状态'}</h3><p>{isEnglish ? 'Sessions, files, and indexes persist independently, with a clear backup path for upgrades and migration.' : '会话、文件和索引各自持久化，升级与迁移有清晰的备份路径。'}</p></article></div></div></div></section>

        <div className={styles.pageInner}><div className={styles.footerCta} data-aivory-reveal="footer-cta"><h2>{isEnglish ? 'Ready to run your workspace?' : '准备好把工作区跑起来了吗？'}</h2><Link className={styles.primaryLink} to="/docs/getting-started/first-chat">{isEnglish ? 'Start your first conversation' : '开始第一次对话'} <span aria-hidden="true">↗</span></Link></div></div>
      </main>
    </Layout>
  )
}
