import {useRef} from 'react'
import Link from '@docusaurus/Link'
import {gsap} from 'gsap'
import {useGSAP} from '@gsap/react'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import styles from './data-ownership.module.css'

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function DataOwnership({isEnglish: en}: {isEnglish: boolean}) {
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lines = root.current!.querySelectorAll<SVGPathElement>('[data-data-path]')
      lines.forEach(line => {
        const length = line.getTotalLength()
        gsap.fromTo(line, {strokeDasharray: length, strokeDashoffset: length}, {
          strokeDashoffset: 0, ease: 'none',
          scrollTrigger: {trigger: root.current, start: 'top 70%', end: 'center 40%', scrub: 0.4},
        })
      })
      gsap.fromTo(root.current!.querySelector('[data-data-diagram]'), {rotationX: 14, y: 70, scale: 0.9}, {
        rotationX: 0, y: 0, scale: 1, ease: 'none',
        scrollTrigger: {trigger: root.current, start: 'top 90%', end: 'center 55%', scrub: 0.4},
      })
    })
    return () => media.revert()
  }, {scope: root, dependencies: [en], revertOnUpdate: true})

  return <section className={styles.ownership} ref={root} aria-labelledby="ownership-title">
    <div className={styles.copy}>
      <p className={styles.eyebrow}>YOUR WORKSPACE / YOUR DATA</p>
      <h2 id="ownership-title">{en ? 'Your data has a home.' : '你的数据，'}<br /><em>{en ? 'You hold the keys.' : '有明确的归属。'}</em></h2>
      <p className={styles.lead}>{en ? 'The interface is only one part of your workspace. Understand where conversations, files, and indexes live—and how to look after them.' : '工作空间不只有眼前的界面。对话、文件、知识索引各自存在哪里，如何维护与恢复，都应该清晰可查。'}</p>
      <p>{en ? 'Start with SQLite and embedded vectors, or operate a full stack with PostgreSQL, Redis, and Qdrant. The documentation follows the actual services, database tables, and recovery steps.' : '你可以从 SQLite 与内嵌向量开始，也可以使用 PostgreSQL、Redis 与 Qdrant 组成完整数据栈。文档会带你理解实际服务、数据库表结构和恢复步骤。'}</p>
      <Link to="/docs/reference/database/overview">{en ? 'Open the database reference' : '打开数据库参考'} <span aria-hidden="true">↗</span></Link>
    </div>
    <div className={styles.diagram} data-data-diagram>
      <p className={styles.diagramLabel}>{en ? 'A clear map of what you own' : '看清工作空间的数据边界'}</p>
      <svg viewBox="0 0 600 400" role="img" aria-label={en ? 'Aivory connects application data, uploaded files, and knowledge indexes' : 'Aivory 连接业务数据、上传文件与知识索引'}>
        <g className={styles.connections} fill="none"><path d="M300 102 V162 H105 V212" data-data-path /><path d="M300 102 V212" data-data-path /><path d="M300 102 V162 H495 V212" data-data-path /><path d="M105 298 V345 H495 V298" data-data-path /><path d="M300 298 V345" data-data-path /></g>
        <rect x="205" y="24" width="190" height="78" rx="10" className={styles.appBox} /><text x="300" y="70" className={styles.appLabel}>Aivory</text>
        {[{x:20, label:en?'Application data':'业务数据', detail:'SQLite / PostgreSQL'}, {x:215,label:en?'Uploaded files':'上传文件',detail:en?'Files & attachments':'文件与附件'}, {x:410,label:en?'Knowledge indexes':'知识索引',detail:en?'Embedded / Qdrant':'内嵌向量 / Qdrant'}].map(item => <g key={item.x}><rect x={item.x} y="212" width="170" height="86" rx="9" className={styles.dataBox} /><circle cx={item.x+20} cy="234" r="3" /><text x={item.x+85} y="252" className={styles.nodeTitle}>{item.label}</text><text x={item.x+85} y="277" className={styles.nodeDetail}>{item.detail}</text></g>)}
        <circle cx="300" cy="345" r="5" className={styles.endPoint} />
        <text x="300" y="382" className={styles.nodeDetail}>{en ? 'Know the scope. Plan the recovery.' : '理解备份范围，规划恢复路径。'}</text>
      </svg>
      <div className={styles.mobileDataMap}>
        <strong>Aivory</strong>
        <dl><div><dt>{en ? 'Application data' : '业务数据'}</dt><dd>SQLite / PostgreSQL</dd></div><div><dt>{en ? 'Uploaded files' : '上传文件'}</dt><dd>{en ? 'Files & attachments' : '文件与附件'}</dd></div><div><dt>{en ? 'Knowledge indexes' : '知识索引'}</dt><dd>{en ? 'Embedded / Qdrant' : '内嵌向量 / Qdrant'}</dd></div></dl>
      </div>
      <div className={styles.diagramFooter}><span>{en ? 'An operational map, in the docs.' : '在文档中，找到完整的维护路径。'}</span><span aria-hidden="true">↗</span></div>
    </div>
    <div className={styles.principles}>
      <Link to="/docs/reference/database/overview"><span>01 / {en ? 'UNDERSTAND' : '理解数据'}</span><h3>{en ? 'Read the structure.' : '看清数据结构。'}</h3><p>{en ? 'Trace users, workspaces, conversations, and files through the database reference.' : '从用户、工作空间到对话与文件，沿着数据库参考理解表结构与关联。'}</p><i aria-hidden="true">↗</i></Link>
      <Link to="/docs/deployment/upgrade-backup"><span>02 / {en ? 'PROTECT' : '备份恢复'}</span><h3>{en ? 'Know what to restore.' : '明确恢复范围。'}</h3><p>{en ? 'Review backup coverage and prepare database, files, and dependent services for recovery.' : '核对备份覆盖范围，为数据库、文件和依赖服务准备对应的恢复流程。'}</p><i aria-hidden="true">↗</i></Link>
      <Link to="/docs/deployment/environment"><span>03 / {en ? 'OPERATE' : '持续维护'}</span><h3>{en ? 'Configure with context.' : '带着依据配置。'}</h3><p>{en ? 'Find environment variables and service boundaries before changing a deployment.' : '调整部署前，查阅环境变量、服务职责与运行边界，让每项改动都有依据。'}</p><i aria-hidden="true">↗</i></Link>
    </div>
  </section>
}
