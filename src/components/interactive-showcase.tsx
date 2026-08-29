import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react'
import clsx from 'clsx'

import styles from './interactive-showcase.module.css'

type StackCard = {
  id: string
  label: string
  title: string
  description: string
  tone: 'violet' | 'sage' | 'ink'
}

const initialCards = (isEnglish: boolean): StackCard[] => isEnglish ? [
  {id: 'context', label: 'Knowledge context', title: 'Retrieve relevant context', description: 'RAG knowledge returns cited passages so answers remain traceable.', tone: 'sage'},
  {id: 'tools', label: 'Tool policy', title: 'Call only allowed tools', description: 'Search, MCP, and the built-in sandbox run within administrator boundaries.', tone: 'ink'},
  {id: 'execution', label: 'Execution environment', title: 'Complete work in a persistent sandbox', description: 'Continuous Python sessions, files, and policies remain in the workspace.', tone: 'violet'},
  {id: 'model', label: 'Model routing', title: 'Choose the right model', description: 'Connect multiple channels and switch within one workspace.', tone: 'ink'},
] : [
  {id: 'context', label: '知识上下文', title: '检索相关上下文', description: 'RAG 知识库返回有来源的片段，保持回答可追溯。', tone: 'sage'},
  {id: 'tools', label: '工具策略', title: '调用你允许的工具', description: '搜索、MCP 和内置沙盒都在管理员边界内运行。', tone: 'ink'},
  {id: 'execution', label: '执行环境', title: '在持久沙箱中完成', description: '连续的 Python 会话、文件和策略留在工作空间。', tone: 'violet'},
  {id: 'model', label: '模型路由', title: '选择合适的模型', description: '连接多个渠道，在同一个工作空间里切换。', tone: 'ink'},
]

type PipelineStep = {
  id: string
  label: string
  detail: string
}

const pipelineSteps = (isEnglish: boolean): PipelineStep[] => isEnglish ? [
  {id: 'model', label: 'Model', detail: 'Preparing the request'},
  {id: 'context', label: 'Context', detail: 'Retrieving relevant passages'},
  {id: 'tools', label: 'Tools', detail: 'Waiting for the call policy'},
  {id: 'answer', label: 'Answer', detail: 'Assembling the final result'},
] : [
  {id: 'model', label: '模型', detail: '正在准备请求'},
  {id: 'context', label: '上下文', detail: '检索相关片段'},
  {id: 'tools', label: '工具', detail: '等待调用策略'},
  {id: 'answer', label: '回复', detail: '整理最终结果'},
]

const sampleCode = (isEnglish: boolean) => `${isEnglish ? '// Configure channels and tools in the Admin Console first.' : '// 先在管理员后台配置渠道与工具。'}
const request = {
  model: 'gpt-5',
  knowledge_base_ids: ['kb_product_notes'],
  selected_tool_ids: ['builtin:aivory_web_search'],
}

${isEnglish ? '// Send this request through an authenticated Aivory session.' : '// 通过已登录的 Aivory 会话发送此请求。'}`

export function StackedCards({compact = false, isEnglish = false}: {compact?: boolean; isEnglish?: boolean}): ReactNode {
  const [cards, setCards] = useState(() => initialCards(isEnglish))
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{id: string; startX: number; offset: number; moved: boolean} | null>(null)
  const suppressClickRef = useRef(false)
  const activeLabel = cards[0]?.title ?? ''

  useEffect(() => {
    setCards(initialCards(isEnglish))
  }, [isEnglish])

  const rotateTop = () => {
    setCards((current) => {
      if (current.length < 2) return current
      return [...current.slice(1), current[0]]
    })
    setDragX(0)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, id: string) => {
    if (id !== cards[0]?.id) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {id, startX: event.clientX, offset: 0, moved: false}
    setIsDragging(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const offset = event.clientX - drag.startX
    drag.offset = offset
    drag.moved = Math.abs(offset) > 6
    setDragX(Math.max(-150, Math.min(150, offset)))
  }

  const handlePointerUp = () => {
    const drag = dragRef.current
    if (!drag) return
    suppressClickRef.current = drag.moved
    if (Math.abs(drag.offset) > 76) rotateTop()
    else setDragX(0)
    dragRef.current = null
    setIsDragging(false)
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 0)
  }

  const bringToFront = (id: string) => {
    if (suppressClickRef.current || id === cards[0]?.id) return
    setCards((current) => {
      const selected = current.find((card) => card.id === id)
      if (!selected) return current
      return [selected, ...current.filter((card) => card.id !== id)]
    })
  }

  return (
    <div className={clsx(styles.stackDemo, compact && styles.stackDemoCompact)} data-aivory-reveal="stack-shell">
      <div className={styles.stackHeader}>
        <div>
          <p className={styles.demoKicker}>STACK / WORKSPACE FLOW</p>
          <h3>{isEnglish ? 'Split a request into observable layers.' : '把一轮请求拆成可观察的层。'}</h3>
        </div>
        <button className={styles.ghostButton} type="button" onClick={rotateTop} aria-label={isEnglish ? 'Show the next layer' : '切换下一层'}>
          <span aria-hidden="true">↻</span> {isEnglish ? 'Next layer' : '下一层'}
        </button>
      </div>
      <div className={styles.stackStage}>
        {cards.map((card, index) => {
          const isTop = index === 0
          const style = {
            '--stack-depth': index,
            '--drag-x': isTop ? `${dragX}px` : '0px',
            '--drag-rotate': isTop ? `${dragX * 0.055}deg` : '0deg',
          } as CSSProperties
          return (
            <button
              className={clsx(styles.stackCard, styles[`stackTone${card.tone[0].toUpperCase()}${card.tone.slice(1)}`], isTop && styles.stackCardTop, isDragging && isTop && styles.stackCardDragging)}
              key={card.id}
              style={style}
              type="button"
              onClick={() => bringToFront(card.id)}
              onPointerDown={(event) => handlePointerDown(event, card.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              aria-label={isEnglish ? `${card.title}, select to bring it forward` : `${card.title}，点击置顶`}
            >
              <span className={styles.stackCardTopline}><span>{card.label}</span><span className={styles.stackCardSignal} /></span>
              <strong>{card.title}</strong>
              <span>{card.description}</span>
              <span className={styles.stackCardFooter}><span>{isEnglish ? 'Workspace capability' : '工作空间能力'}</span><span aria-hidden="true">↗</span></span>
            </button>
          )
        })}
      </div>
      <p className={styles.demoHint}>{isEnglish ? 'Drag the top layer, or select any layer to bring it forward.' : '拖动最上层，或点击任意层将它置顶。'}</p>
      <p className={styles.stackStatus} aria-live="polite">{isEnglish ? 'Current layer: ' : '当前层：'}{activeLabel}</p>
    </div>
  )
}

export function PipelineDemo({isEnglish = false}: {isEnglish?: boolean}): ReactNode {
  const [phase, setPhase] = useState(0)
  const [model, setModel] = useState('Claude Sonnet 5')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setPhase(0)
  }

  const run = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    let next = 1
    setPhase(next)
    const advance = () => {
      next += 1
      setPhase(next)
      if (next < pipelineSteps(isEnglish).length) timerRef.current = setTimeout(advance, 780)
      else timerRef.current = setTimeout(() => { timerRef.current = null }, 900)
    }
    timerRef.current = setTimeout(advance, 780)
  }

  const steps = pipelineSteps(isEnglish)
  const status = phase === 0 ? (isEnglish ? 'Ready to run' : '等待运行') : phase >= steps.length ? (isEnglish ? 'Complete' : '已完成') : `${isEnglish ? 'Processing' : '正在处理'} / ${steps[phase - 1]?.label ?? ''}`

  return (
    <section className={styles.pipelineDemo} data-aivory-reveal="pipeline-shell" aria-labelledby="pipeline-title">
      <div className={styles.pipelineHeader}>
        <div>
          <p className={styles.demoKicker}>WORKSPACE / REQUEST PATH</p>
          <h3 id="pipeline-title">{isEnglish ? 'Run a workspace request path.' : '运行一条工作空间请求路径。'}</h3>
        </div>
        <span className={clsx(styles.pipelineStatus, phase > 0 && phase < steps.length && styles.pipelineStatusRunning)}><i />{status}</span>
      </div>
      <div className={styles.pipelineControls}>
        <label>
          <span>{isEnglish ? 'Model' : '模型'}</span>
          <select value={model} onChange={(event) => setModel(event.target.value)}>
            <option>Claude Sonnet 5</option>
            <option>GPT-5</option>
            <option>Gemini 2.5 Pro</option>
          </select>
        </label>
        <div className={styles.pipelineButtons}>
          <button className={styles.primaryButton} type="button" onClick={run}>{phase > 0 && phase < steps.length ? (isEnglish ? 'Run again' : '重新运行') : (isEnglish ? 'Run once' : '运行一次')} <span aria-hidden="true">→</span></button>
          <button className={styles.ghostButton} type="button" onClick={reset}>{isEnglish ? 'Reset' : '重置'}</button>
        </div>
      </div>
      <ol className={styles.pipelineSteps}>
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const complete = phase >= stepNumber
          const active = phase === stepNumber
          return (
            <li className={clsx(styles.pipelineStep, complete && styles.pipelineStepComplete, active && styles.pipelineStepActive)} key={step.id}>
              <span className={styles.pipelineNode}>{complete ? '✓' : `0${stepNumber}`}</span>
              <span className={styles.pipelineStepCopy}><strong>{step.label}</strong><small>{active ? step.detail : complete ? (isEnglish ? 'Complete' : '已完成') : (isEnglish ? 'Waiting for the prior step' : '等待上一步')}</small></span>
              {index < steps.length - 1 && <span className={styles.pipelineConnector} aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
      <div className={styles.pipelineOutput} aria-live="polite">
        <span className={styles.outputPrompt}>›</span>
        <span>{phase >= steps.length ? (isEnglish ? `A traceable answer returned through ${model}.` : `已通过 ${model} 返回一条可追溯回答。`) : phase === 0 ? (isEnglish ? 'Run it to observe Model → Context → Tools → Answer.' : '点击运行，观察模型 → 上下文 → 工具 → 回复。') : `${isEnglish ? 'Aivory is processing: ' : 'Aivory 正在处理：'}${steps[Math.max(0, phase - 1)]?.detail}`}</span>
      </div>
    </section>
  )
}

export function CopyCode({isEnglish = false}: {isEnglish?: boolean}): ReactNode {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle')

  const copy = async () => {
    try {
      let didCopy = false
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(sampleCode(isEnglish))
          didCopy = true
        } catch {
          // A textarea fallback still works for many non-secure local previews.
        }
      }
      if (!didCopy) {
        const textarea = document.createElement('textarea')
        textarea.value = sampleCode(isEnglish)
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        didCopy = document.execCommand('copy')
        textarea.remove()
      }
      if (!didCopy) throw new Error('clipboard_unavailable')
      setCopyState('success')
      window.setTimeout(() => setCopyState('idle'), 1600)
    } catch {
      setCopyState('error')
      window.setTimeout(() => setCopyState('idle'), 1800)
    }
  }

  return (
    <div className={styles.codeDemo} data-aivory-reveal="code-shell">
      <div className={styles.codeToolbar}><span><i /> {isEnglish ? 'Request example' : '请求示例'}</span><button className={styles.codeCopy} type="button" onClick={copy} aria-label={isEnglish ? 'Copy conceptual request example' : '复制概念请求示例'}>{copyState === 'success' ? (isEnglish ? 'Copied' : '已复制') : copyState === 'error' ? (isEnglish ? 'Copy failed' : '复制失败') : (isEnglish ? 'Copy' : '复制')} <span aria-hidden="true">⧉</span></button></div>
      <pre><code>{sampleCode(isEnglish)}</code></pre>
    </div>
  )
}

export function InteractiveShowcase({isEnglish = false}: {isEnglish?: boolean}): ReactNode {
  return (
    <div className={styles.showcaseGrid}>
      <StackedCards isEnglish={isEnglish} />
      <PipelineDemo isEnglish={isEnglish} />
      <CopyCode isEnglish={isEnglish} />
    </div>
  )
}
