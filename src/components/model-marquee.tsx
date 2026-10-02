import type {ReactNode} from 'react'
import styles from './model-marquee.module.css'

const models = ['Claude', 'GPT', 'Gemini', 'DeepSeek', 'Grok', 'GLM', 'Doubao', 'Nano Banana']

/** Two counter-moving rows: the models you connect, and what they can reach. */
export default function ModelMarquee({isEnglish: en}: {isEnglish: boolean}): ReactNode {
  const capabilities = en
    ? ['Web search', 'Python sandbox', 'MCP services', 'Skills', 'Knowledge bases', 'Cited answers', 'AI presentations', 'Team workspaces', 'Usage & credits', 'OpenAI-compatible endpoints']
    : ['联网搜索', 'Python 沙盒', 'MCP 服务', 'Skills', '知识库', '原文引用', 'AI PPT', '团队空间', '用量与积分', 'OpenAI 兼容接口']
  const row = (items: string[], key: string) => [0, 1].map(copy => <div className={styles.track} key={`${key}-${copy}`} aria-hidden={copy === 1 ? true : undefined}>
    {items.map(item => <span key={item}>{item}<i aria-hidden="true" /></span>)}
  </div>)
  return <section className={styles.marquee} aria-label={en ? 'Models and capabilities' : '模型与能力'}>
    <div className={styles.row} data-row="models">{row(models, 'm')}</div>
    <div className={styles.row} data-row="capabilities">{row(capabilities, 'c')}</div>
  </section>
}
