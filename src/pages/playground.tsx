import {useEffect, type ReactNode} from 'react'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import {InteractiveShowcase} from '../components/interactive-showcase'
import styles from './experience.module.css'

export default function PlaygroundPage(): ReactNode {
  const {i18n} = useDocusaurusContext()
  const isEnglish = i18n.currentLocale === 'en'
  useEffect(() => {
    document.body.classList.add('aivory-experience-page')
    return () => document.body.classList.remove('aivory-experience-page')
  }, [])

  return (
    <Layout title={isEnglish ? 'Interactive lab' : '交互实验室'} description={isEnglish ? 'Experience controllable layers, requests, and tool state in an Aivory workspace.' : '在 Aivory 工作空间中体验可操作的层级、请求与工具状态。'}>
      <main className={`${styles.page} aivory-experience-page aivory-playground-page`}>
        <div className={styles.pageInner}>
          <header className={styles.pageHero} data-aivory-motion="hero">
            <div data-aivory-motion="hero-copy">
              <p className={styles.eyebrow}><i />PLAYGROUND / INTERACTION LAB</p>
              <h1 className={styles.pageTitle}>{isEnglish ? 'Make workflow state ' : '让工作流状态'}<em>{isEnglish ? 'visible.' : '变得可见。'}</em></h1>
              <p className={styles.pageLead}>{isEnglish ? 'Drag a workflow layer, run a request, and observe how models, knowledge, and tools advance continuously within a workspace.' : '拖动一层工作流，运行一次请求，观察模型、知识库和工具如何在工作空间内连续推进。'}</p>
              <div className={styles.pageActions}><Link className={styles.primaryLink} to="/docs/getting-started/first-chat">{isEnglish ? 'Use it in Aivory' : '把它用在 Aivory'} <span aria-hidden="true">↗</span></Link><Link className={styles.textLink} to="/product">{isEnglish ? 'View product model' : '查看产品语义'} <span aria-hidden="true">→</span></Link></div>
            </div>
            <aside className={styles.heroAside} data-aivory-motion="hero-aside"><p>{isEnglish ? 'Manipulate layers and requests directly, then see feedback change with workspace state at every step.' : '直接操控层级与请求，观察每一步反馈如何随着工作空间状态变化。'}</p><dl><div><dt>{isEnglish ? 'ACTION' : '操作'}</dt><dd>{isEnglish ? 'Drag' : '拖动'}</dd></div><div><dt>{isEnglish ? 'PATH' : '路径'}</dt><dd>{isEnglish ? 'Advance' : '推进'}</dd></div><div><dt>{isEnglish ? 'RESULT' : '结果'}</dt><dd>{isEnglish ? 'Visible' : '可见'}</dd></div></dl></aside>
          </header>
        </div>

        <section className={styles.sectionMuted}><div className={styles.pageInner}><div className={styles.section}><div className={styles.sectionHeader} data-aivory-reveal="section-header"><div><p className={styles.eyebrow}><i />INTERACTION LAB</p><h2>{isEnglish ? 'Use your hands to understand the workspace.' : '用手操作，理解工作空间。'}</h2></div><p>{isEnglish ? 'First drag a stacked layer, then run a request path to see models, knowledge, and tools move through the workspace.' : '先拖动堆叠层，再运行一条请求路径，观察模型、知识和工具如何沿着工作空间推进。'}</p></div><InteractiveShowcase isEnglish={isEnglish} /></div></div></section>

        <section className={styles.section}><div className={styles.pageInner}><div className={styles.splitSection}><div className={styles.splitIntro} data-aivory-reveal="split-copy"><p className={styles.eyebrow}><i />WORKSPACE POLICY</p><h2>{isEnglish ? 'Make models and tools follow workspace policy.' : '让模型与工具遵循工作空间策略。'}</h2><p>{isEnglish ? 'Models, knowledge bases, and tools are configured by administrators and follow explicit selection and permission boundaries on every request.' : '模型、知识库与工具均由管理员配置，并在每一次请求中遵循明确的选择与权限边界。'}</p><Link className={styles.textLink} to="/docs/admin/channels-models">{isEnglish ? 'View channel and model configuration' : '查看渠道与模型配置'} <span aria-hidden="true">→</span></Link></div><div className={styles.featureGrid}><article className={styles.featureItem} data-aivory-reveal="feature-item"><h3>{isEnglish ? 'Multi-channel models' : '多渠道模型'}</h3><p>{isEnglish ? 'Model records belong to a channel, so the same model ID can be configured independently across different channels.' : '模型记录属于具体渠道，相同模型 ID 也能在不同渠道独立配置。'}</p></article><article className={styles.featureItem} data-aivory-reveal="feature-item"><h3>{isEnglish ? 'RAG knowledge bases' : 'RAG 知识库'}</h3><p>{isEnglish ? 'Retrieved results and source citations remain in the workspace to serve long-running work.' : '检索结果与来源引用留在工作空间，持续服务于长期任务。'}</p></article><article className={styles.featureItem} data-aivory-reveal="feature-item"><h3>{isEnglish ? 'Tools and MCP' : '工具与 MCP'}</h3><p>{isEnglish ? 'Provider-hosted tools are never added by default. Built-in tools and MCP both require administrator approval.' : '服务商工具不会被默认加入，内置工具和 MCP 都需要管理员允许。'}</p></article></div></div></div></section>

        <div className={styles.pageInner}><div className={styles.footerCta} data-aivory-reveal="footer-cta"><h2>{isEnglish ? 'Move from this interaction to a real deployment.' : '从交互示例回到实际部署。'}</h2><Link className={styles.primaryLink} to="/docs/getting-started/personal">{isEnglish ? 'Open personal edition deployment' : '打开个人版部署'} <span aria-hidden="true">↗</span></Link></div></div>
      </main>
    </Layout>
  )
}
