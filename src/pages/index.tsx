import {useRef, type ReactNode} from 'react'
import {useGSAP} from '@gsap/react'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import ProductBook from '../components/product-book'
import WorkspaceJourney from '../components/workspace-journey'
import DataOwnership from '../components/data-ownership'
import ExperienceNav from '../components/experience-nav'
import experience from './experience.module.css'
import styles from './index.module.css'

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger)

function Arrow({ external = false }: { external?: boolean }): ReactNode {
  return (
    <span className={styles.arrow} aria-hidden="true">
      {external ? '↗' : '→'}
    </span>
  )
}

export default function Home(): ReactNode {
  const { i18n } = useDocusaurusContext()
  const en = i18n.currentLocale === 'en'
  const home = useRef<HTMLElement>(null)
  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(min-width: 997px) and (prefers-reduced-motion: no-preference)', () => {
      const hero = home.current!.querySelector('[data-aivory-motion="hero"]')
      const preview = hero!.querySelector('[data-aivory-depth="hero-book"]')
      gsap.to(preview, {y: -90, rotationY: -12, rotationX: 5, scale: 1.045, ease: 'none', scrollTrigger: {trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5}})
    })
    return () => media.revert()
  }, {scope: home, dependencies: [en], revertOnUpdate: true})
  const groups = [
    {
      title: en ? 'Configure your workspace' : '配置你的工作空间',
      description: en
        ? 'Connect models, bring in your team, and make knowledge available.'
        : '接入模型、邀请成员，让知识与工具各就其位。',
      links: [
        {
          title: en ? 'Models and channels' : '模型与渠道',
          detail: en
            ? 'Providers, routing, and model policy'
            : '服务商接入、路由与模型策略',
          to: '/docs/admin/channels-models'
        },
        {
          title: en ? 'Domains and members' : '域管理与成员权限',
          detail: en
            ? 'Automatic enrollment and personal-space access'
            : '邮箱域自动入组与个人空间权限',
          to: '/docs/admin/domain-management'
        },
        {
          title: en ? 'Knowledge and retrieval' : '知识库与检索',
          detail: en
            ? 'Documents, vectors, and cited answers'
            : '文档解析、向量检索与来源引用',
          to: '/docs/admin/knowledge-rag'
        },
        {
          title: en ? 'Tools and Python sandbox' : '工具与 Python 沙箱',
          detail: en
            ? 'MCP, execution, and administrator controls'
            : 'MCP、执行环境与管理员控制',
          to: '/docs/admin/tools-sandbox'
        }
      ]
    },
    {
      title: en ? 'Keep your instance running' : '维护你的实例',
      description: en
        ? 'Understand the data, tune your deployment, and upgrade with confidence.'
        : '理解数据结构，调整部署配置，做好升级与恢复。',
      links: [
        {
          title: en ? 'Database reference' : '数据库与表结构',
          detail: en
            ? 'SQLite, PostgreSQL, tables, and migrations'
            : 'SQLite、PostgreSQL、数据表与迁移',
          to: '/docs/reference/database/overview'
        },
        {
          title: en ? 'Environment variables' : '环境变量',
          detail: en
            ? 'Application, storage, and service configuration'
            : '应用、存储与外部服务配置',
          to: '/docs/deployment/environment'
        },
        {
          title: en ? 'Upgrades and backups' : '升级、备份与恢复',
          detail: en
            ? 'Backup scope and a complete recovery path'
            : '备份范围与完整恢复流程',
          to: '/docs/deployment/upgrade-backup'
        },
        {
          title: en ? 'Troubleshooting' : '故障排查',
          detail: en
            ? 'Common deployment and runtime issues'
            : '定位常见部署与运行问题',
          to: '/docs/troubleshooting/common-issues'
        }
      ]
    }
  ]

  return (
    <Layout
      title={en ? 'Documentation' : '文档'}
      description={
        en
          ? 'Deploy, configure, and operate your Aivory AI workspace. Guides for models, knowledge, teams, databases, and backups.'
          : '部署、配置与维护你的 Aivory AI 工作空间。查阅模型、知识库、团队、数据库与备份指南。'
      }
    >
      <main ref={home} className={`${experience.page} ${styles.home} aivory-home-page aivory-experience-page`} data-aivory-page="home">
        <div className={styles.container}>
          <section className={styles.hero} aria-labelledby="hero-title" data-aivory-motion="hero">
            <div className={styles.heroCopy} data-aivory-motion="hero-copy">
              <p className={styles.label}>
                {en ? 'Aivory documentation' : 'Aivory 文档中心'}
              </p>
              <h1 id="hero-title">
                {en ? 'Your workspace.' : '你的工作空间。'}
                <br />
                <span>{en ? 'Your possibilities.' : '从这里开始。'}</span>
              </h1>
              <p className={styles.intro}>
                {en
                  ? 'A place for your projects, models, knowledge, and tools. Start with a conversation, carry it through to a result, and build a workspace your whole team can make their own.'
                  : '让项目、模型、知识与工具，在同一个空间里协同。从一段对话，到一份可以交付的成果，再到整个团队的日常工作。把 AI 放进自己的工作方式里，也把数据留在自己的掌控之中。'}
              </p>
              <div className={styles.actions}>
                <Link
                  className={styles.primary}
                  to="/docs/getting-started/personal"
                >
                  {en ? 'Start deploying' : '开始部署'}
                  <Arrow />
                </Link>
                <Link className={styles.secondary} to="/product">
                  {en ? 'Read the introduction' : '了解 Aivory'}
                  <Arrow />
                </Link>
              </div>
              <p className={styles.heroNote}>
                {en
                  ? 'Self-hosted · Multi-model · Built for teams'
                  : '自主部署 · 多模型接入 · 团队协作'}
              </p>
            </div>
            <div className={styles.preview} data-aivory-depth="hero-book">
              <div className={styles.previewTop}>
                <span className={styles.previewDot} aria-hidden="true" />
                {en ? 'A closer look inside' : '走近你的工作空间'}
                <a href="https://demo.aivorygo.com" target="_blank" rel="noreferrer">{en ? 'Live demo' : '在线体验'} <Arrow external /></a>
              </div>
              <ProductBook compact isEnglish={en} />
            </div>
          </section>

          <a className={styles.journeyInvitation} href="#workspace-journey"><span>{en ? 'A workspace, in five chapters' : '五个章节，走进完整工作空间'}</span><span aria-hidden="true">{en ? 'Scroll to explore' : '向下探索'} ↓</span></a>
          <WorkspaceJourney isEnglish={en} />
          <DataOwnership isEnglish={en} />

          <section className={styles.deployment} aria-labelledby="deploy-title">
            <div className={styles.sectionHeading}>
              <div>
                <h2 id="deploy-title">
                  {en
                    ? 'Start with your deployment.'
                    : '选择适合你的部署方式。'}
                </h2>
                <p>
                  {en
                    ? 'Two editions. One workspace, with room to grow.'
                    : '两种部署形态，同样完整的工作空间。'}
                </p>
              </div>
              <Link to="/docs/deployment/choose-edition">
                {en ? 'Compare editions' : '对比部署版本'}
                <Arrow />
              </Link>
            </div>
            <div className={styles.editions} data-aivory-list>
              <Link
                className={styles.edition}
                to="/docs/getting-started/personal"
              >
                <div className={styles.editionHeading}>
                  <h3>{en ? 'Personal edition' : '个人版'}</h3>
                  <span>{en ? 'A lightweight start' : '轻量起步'}</span>
                </div>
                <p>
                  {en
                    ? 'A single application container for your own workspace. Keep setup simple with an embedded database and vector search.'
                    : '一个应用容器即可开始。内置数据库与向量检索，适合个人使用和小规模体验。'}
                </p>
                <div className={styles.editionBottom}>
                  <span>SQLite · {en ? 'Embedded vectors' : '内嵌向量'}</span>
                  <Arrow />
                </div>
              </Link>
              <Link
                className={`${styles.edition} ${styles.fullEdition}`}
                to="/docs/getting-started/full"
              >
                <div className={styles.editionHeading}>
                  <h3>{en ? 'Full edition' : '完整版'}</h3>
                  <span>{en ? 'For your team' : '面向团队'}</span>
                </div>
                <p>
                  {en
                    ? 'A dedicated data stack for a shared instance. Configure external storage, queues, and the built-in sandbox for team workloads.'
                    : '为共享实例配置独立的数据服务、队列与内置沙箱，满足团队协作和持续运营的需要。'}
                </p>
                <div className={styles.editionBottom}>
                  <span>PostgreSQL · Redis · Qdrant</span>
                  <Arrow />
                </div>
              </Link>
            </div>
          </section>

          <section
            className={styles.guideSection}
            aria-label={en ? 'Browse guides by task' : '按任务查阅指南'}
          >
            {groups.map((group) => (
              <div className={styles.guideGroup} key={group.title}>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
                <ul className={styles.guideList} data-aivory-list>
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to}>
                        <div>
                          <h3>{link.title}</h3>
                          <p>{link.detail}</p>
                        </div>
                        <Arrow />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section
            className={styles.keepExploring}
            aria-labelledby="explore-title"
          >
            <div>
              <h2 id="explore-title">
                {en ? 'Get to know Aivory.' : '继续探索 Aivory。'}
              </h2>
              <p>
                {en
                  ? 'See how it works, follow new releases, or explore the source.'
                  : '了解产品如何运转，跟进新版本，或直接阅读源码。'}
              </p>
            </div>
            <div className={styles.exploreLinks}>
              <Link to="/product">
                {en ? 'Product tour' : '产品导览'}
                <Arrow />
              </Link>
              <Link to="/docs/reference/changelog">
                {en ? 'Changelog' : '更新日志'}
                <Arrow />
              </Link>
              <a
                href="https://github.com/hjxwz123/Aivory"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
                <Arrow external />
              </a>
            </div>
          </section>
          <ExperienceNav current="home" isEnglish={en} />
        </div>
      </main>
    </Layout>
  )
}
