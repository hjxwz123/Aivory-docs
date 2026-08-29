import {useEffect, useState, type ReactNode} from 'react'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import {PipelineDemo, StackedCards} from '../components/interactive-showcase'
import styles from './experience.module.css'

const capabilities = (isEnglish: boolean) => isEnglish ? [
  {number: '01', title: 'Chat is an entry point, not a boundary', description: 'Switch models, continue context, and retain visible state for every turn inside the same workspace.'},
  {number: '02', title: 'Knowledge and files retain their sources', description: 'Document parsing, vector retrieval, and citations can be inspected, so answers do not become an opaque black box.'},
  {number: '03', title: 'Tools obey your policy', description: 'Search, MCP, and the sandbox are explicitly configured by administrators, with clear permissions and execution boundaries.'},
] : [
  {number: '01', title: '对话是入口，不是边界', description: '在同一个工作区里切换模型、继续上下文，并保留每一轮的可见状态。'},
  {number: '02', title: '知识与文件有来源', description: '文档解析、向量检索和引用都能被检查，回答不会变成不可追溯的黑盒。'},
  {number: '03', title: '工具服从你的策略', description: '搜索、MCP 和沙盒由管理员显式配置，权限和运行边界清晰可见。'},
]

const deploymentModes = (isEnglish: boolean) => isEnglish ? {
  personal: {label: 'Personal edition', intro: 'Start with one server, suited to a personal workspace or demonstration.', rows: [['Application data', 'SQLite'], ['Vectors', 'Embedded SQLite'], ['Dependencies', 'One app container']]},
  full: {label: 'Full edition', intro: 'Prepared for teams and continuous operation, with each boundary split by service.', rows: [['Application data', 'PostgreSQL'], ['Vectors', 'Qdrant'], ['Dependencies', 'Redis + sandbox']]},
} : {
  personal: {
    label: '个人版',
    intro: '一台服务器即可开始，适合个人工作区与演示站。',
    rows: [['业务数据', 'SQLite'], ['向量', 'SQLite 内嵌'], ['依赖', '单 app 容器']],
  },
  full: {
    label: '完整版',
    intro: '为团队和长期运行准备，按服务拆开每个边界。',
    rows: [['业务数据', 'PostgreSQL'], ['向量', 'Qdrant'], ['依赖', 'Redis + 沙盒']],
  },
} as const

export default function ProductPage(): ReactNode {
  const {i18n} = useDocusaurusContext()
  const isEnglish = i18n.currentLocale === 'en'
  const modes = deploymentModes(isEnglish)
  const [mode, setMode] = useState<keyof typeof modes>('personal')
  const current = modes[mode]

  useEffect(() => {
    document.body.classList.add('aivory-experience-page')
    return () => document.body.classList.remove('aivory-experience-page')
  }, [])

  return (
    <Layout title={isEnglish ? 'Product workspace' : '产品工作区'} description={isEnglish ? 'See how Aivory organizes models, context, tools, and runtime into an AI workspace you can own.' : '了解 Aivory 如何把模型、上下文、工具和运行时组织成一个可拥有的 AI 工作区。'}>
      <main className={`${styles.page} aivory-experience-page`}>
        <div className={styles.pageInner}>
          <header className={styles.pageHero} data-aivory-motion="hero">
            <div data-aivory-motion="hero-copy">
              <p className={styles.eyebrow}><i />PRODUCT / WORKSPACE</p>
              <h1 className={styles.pageTitle}>{isEnglish ? 'One workspace, ' : '一个工作区，'}<em>{isEnglish ? 'full control.' : '完整掌控。'}</em></h1>
              <p className={styles.pageLead}>{isEnglish ? 'Aivory places multi-model chat, knowledge, tool calling, and deployment policy on one observable path. Begin with one machine, then split into a full stack when you are ready.' : 'Aivory 把多模型对话、知识库、工具调用和部署策略放在同一条可观察的路径上。你可以从一台机器开始，也可以逐步拆分到完整栈。'}</p>
              <div className={styles.pageActions}>
                <Link className={styles.primaryLink} to="/docs/getting-started/personal">{isEnglish ? 'Start deploying' : '开始部署'} <span aria-hidden="true">↗</span></Link>
                <Link className={styles.textLink} to="/architecture">{isEnglish ? 'View architecture' : '查看架构'} <span aria-hidden="true">→</span></Link>
              </div>
            </div>
            <aside className={styles.heroAside} data-aivory-motion="hero-aside">
              <p>{isEnglish ? 'This is not an API key behind another UI. Every phase of a request can be understood, configured, and recovered.' : '不是把 API Key 换个界面，而是让一轮请求的每个阶段都能被理解、配置和恢复。'}</p>
              <dl><div><dt>01</dt><dd>{isEnglish ? 'Multi-model' : '多模型'}</dd></div><div><dt>02</dt><dd>{isEnglish ? 'Traceable' : '可追溯'}</dd></div><div><dt>03</dt><dd>{isEnglish ? 'Self-hosted' : '自托管'}</dd></div></dl>
            </aside>
          </header>
        </div>

        <section className={styles.sectionMuted}>
          <div className={styles.pageInner}>
            <div className={styles.section}>
              <div className={styles.sectionHeader} data-aivory-reveal="section-header"><div><p className={styles.eyebrow}><i />THE WORKSPACE MODEL</p><h2>{isEnglish ? 'Let complex capabilities work along one path.' : '让复杂能力沿着一条路径协作。'}</h2></div><p>{isEnglish ? 'From model selection to the final answer, every layer maps to a real configuration and state.' : '从模型选择到最终回复，每一层都对应真实的配置和状态。'}</p></div>
              <div className={styles.featureGrid}>{capabilities(isEnglish).map((item) => <article className={styles.featureItem} data-aivory-reveal="feature-item" key={item.number}><span className={styles.featureNumber}>{item.number}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.pageInner}>
            <div className={styles.splitSection}>
              <div className={styles.splitIntro} data-aivory-reveal="deployment-copy"><p className={styles.eyebrow}><i />DEPLOYMENT / CHOOSE YOUR EDGE</p><h2>{isEnglish ? 'Start lean, upgrade whenever you need.' : '从轻量开始，随时升级。'}</h2><p>{current.intro}</p><div className={styles.modeSwitch} role="group" aria-label={isEnglish ? 'Choose a deployment edition' : '选择部署模式'}><button type="button" aria-pressed={mode === 'personal'} onClick={() => setMode('personal')}>{modes.personal.label}</button><button type="button" aria-pressed={mode === 'full'} onClick={() => setMode('full')}>{modes.full.label}</button></div><div className={styles.modeSummary}>{current.rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div>
              <StackedCards compact isEnglish={isEnglish} />
            </div>
          </div>
        </section>

        <section className={styles.sectionMuted}>
          <div className={styles.pageInner}><div className={styles.section}><PipelineDemo isEnglish={isEnglish} /></div></div>
        </section>

        <div className={styles.pageInner}><div className={styles.footerCta} data-aivory-reveal="footer-cta"><h2>{isEnglish ? 'Run your first usable request.' : '把第一条可用的请求跑起来。'}</h2><Link className={styles.primaryLink} to="/docs/getting-started/first-chat">{isEnglish ? 'Open quick start' : '打开快速开始'} <span aria-hidden="true">↗</span></Link></div></div>
      </main>
    </Layout>
  )
}
