import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import {PipelineDemo} from '../components/interactive-showcase'
import styles from './index.module.css'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  phase: number
  depth: number
}

type Ripple = {
  x: number
  y: number
  radius: number
  life: number
}

type EcosystemItem = {
  name: string
  mark: string
  tone: 'violet' | 'sage' | 'porcelain'
}

type OrbitNode = {
  label: string
  detail: string
  left: string
  top: string
  tone: 'violet' | 'sage' | 'porcelain'
}

const AIVORY_MARK_PATH =
  'M16 4.5c-1.05 0-2.01.61-2.45 1.56L4.78 24.5c-.7 1.5.4 3.2 2.05 3.2h18.34c1.65 0 2.75-1.7 2.05-3.2L18.45 6.06A2.7 2.7 0 0 0 16 4.5Zm0 4.55 7.15 15.15H8.85L16 9.05Z'

const ecosystem = (isEnglish: boolean): EcosystemItem[] => isEnglish ? [
  {name: 'Model channels', mark: 'M', tone: 'violet'},
  {name: 'RAG knowledge', mark: 'K', tone: 'sage'},
  {name: 'Persistent Python', mark: 'P', tone: 'porcelain'},
  {name: 'MCP tool calling', mark: 'T', tone: 'violet'},
  {name: 'Built-in sandbox', mark: 'S', tone: 'sage'},
  {name: 'Workspaces', mark: 'W', tone: 'porcelain'},
] : [
  {name: '多渠道模型', mark: 'M', tone: 'violet'},
  {name: 'RAG 知识库', mark: 'K', tone: 'sage'},
  {name: '持久 Python', mark: 'P', tone: 'porcelain'},
  {name: 'MCP 工具调用', mark: 'T', tone: 'violet'},
  {name: '内置沙盒', mark: 'S', tone: 'sage'},
  {name: '工作空间', mark: 'W', tone: 'porcelain'},
]

const orbitNodes = (isEnglish: boolean): OrbitNode[] => isEnglish ? [
  {label: 'Models', detail: 'Multi-channel routing', left: '11%', top: '34%', tone: 'violet'},
  {label: 'Knowledge', detail: 'RAG and citations', left: '76%', top: '22%', tone: 'sage'},
  {label: 'Python', detail: 'Persistent sandbox', left: '79%', top: '72%', tone: 'porcelain'},
  {label: 'MCP and tools', detail: 'Policy-controlled calls', left: '12%', top: '78%', tone: 'sage'},
] : [
  {label: 'Models', detail: '多渠道路由', left: '11%', top: '34%', tone: 'violet'},
  {label: 'Knowledge', detail: 'RAG 与引用', left: '76%', top: '22%', tone: 'sage'},
  {label: 'Python', detail: '持久沙箱', left: '79%', top: '72%', tone: 'porcelain'},
  {label: 'MCP & tools', detail: '受控调用', left: '12%', top: '78%', tone: 'sage'},
]

const docsLinks = (isEnglish: boolean) => isEnglish ? [
  {label: 'Workspaces', description: 'Projects, people, chats, and files within one boundary.', to: '/product'},
  {label: 'Persistent Python sandbox', description: 'Run code in controlled sessions and enable the built-in sandbox when needed.', to: '/docs/admin/tools-sandbox'},
  {label: 'RAG and knowledge', description: 'File parsing, vector retrieval, and traceable citations.', to: '/docs/user-guide/conversations-files'},
] : [
  {
    label: '工作空间',
    description: '项目、成员、对话与文件放在同一个边界。',
    to: '/product',
  },
  {
    label: '持久 Python 沙箱',
    description: '受控会话中运行代码，按需启用内置沙箱。',
    to: '/docs/admin/tools-sandbox',
  },
  {
    label: 'RAG 与知识库',
    description: '文件解析、向量检索和可追溯引用。',
    to: '/docs/user-guide/conversations-files',
  },
]

const ordinaryChatFacts = (isEnglish: boolean) => isEnglish ? [
  'One-off threads do not retain durable project context.',
  'Files and tool results often stop at a single exchange.',
  'Members, usage, and billing must be assembled elsewhere.',
] : [
  '一次性线程难以持续积累项目上下文。',
  '文件与工具结果常停留在某一轮对话中。',
  '成员、用量与收款需要另外拼接。',
]

const workspaceLayers = (isEnglish: boolean) => isEnglish ? [
  {mark: 'Project', title: 'Projects, conversations, and files', description: 'Keep task context, shared files, and durable outputs together.', tone: 'violet'},
  {mark: 'Knowledge', title: 'RAG and knowledge bases', description: 'Document parsing, vector retrieval, and cited sources accumulate over time.', tone: 'sage'},
  {mark: 'Run', title: 'Persistent Python and MCP', description: 'Sandbox sessions and controlled tools follow administrator policy.', tone: 'porcelain'},
  {mark: 'Govern', title: 'Members, roles, and resource policy', description: 'People, knowledge, and tools have clear operational boundaries.', tone: 'violet'},
] : [
  {
    mark: '项目',
    title: '项目、对话与文件',
    description: '任务上下文、共享文件和长期产物一起保留。',
    tone: 'violet',
  },
  {
    mark: '知识',
    title: 'RAG 与知识库',
    description: '文档解析、向量检索与来源引用持续积累。',
    tone: 'sage',
  },
  {
    mark: '执行',
    title: '持久 Python 与 MCP',
    description: '沙箱会话与受控工具调用遵循管理员策略。',
    tone: 'porcelain',
  },
  {
    mark: '治理',
    title: '成员、角色与资源策略',
    description: '协作成员、知识和工具都拥有清晰边界。',
    tone: 'violet',
  },
]

const workspaceOperations = (isEnglish: boolean) => isEnglish
  ? ['Subscriptions and credits', 'Payments and billing', 'Detailed analytics', 'User management']
  : ['订阅与积分', '支付与账单', '详细统计', '用户管理']

const workflowStories = (isEnglish: boolean) => isEnglish ? [
  {signal: '01 / WORKSPACE SURFACE', title: 'Bring people, projects, conversations, and files together.', description: 'Ordinary chat apps start and end with a thread. Aivory starts with a workspace: a controlled boundary for long-running work, collaboration, and shared resources.', details: ['Projects with shared context', 'Members, roles, and resource boundaries'], to: '/product', action: 'Explore workspaces', tone: 'violet'},
  {signal: '02 / KNOWLEDGE SURFACE', title: 'Make RAG a manageable knowledge base.', description: 'Parsing, chunking, vector retrieval, and source citations remain in the workspace. Answers receive relevant context instead of a one-off attachment in the prompt.', details: ['Vector retrieval with citations', 'Knowledge bases per workspace'], to: '/docs/user-guide/conversations-files', action: 'Explore RAG and knowledge', tone: 'sage'},
  {signal: '03 / EXECUTION SURFACE', title: 'Run tools in a persistent execution environment.', description: 'The built-in Python sandbox supports continuous sessions. Search, MCP, and other tools always follow administrator policy and an explicit per-request selection.', details: ['Persistent Python sandbox', 'MCP and powerful tool calling'], to: '/docs/admin/tools-sandbox', action: 'Explore sandbox and MCP', tone: 'porcelain'},
] : [
  {
    signal: '01 / WORKSPACE SURFACE',
    title: '把人、项目、对话和文件放在一起。',
    description: '普通聊天程序通常围绕一段对话展开。Aivory 从工作空间出发，把长期任务、成员协作和共享资源组织在同一个可控边界。',
    details: ['项目与共享上下文', '成员、角色与资源边界'],
    to: '/product',
    action: '了解工作空间',
    tone: 'violet',
  },
  {
    signal: '02 / KNOWLEDGE SURFACE',
    title: '让 RAG 成为可管理的知识库。',
    description: '文件解析、分块、向量检索和来源引用都留在工作空间里。回答拿到的是相关上下文，而不是一次性塞进提示词的附件。',
    details: ['向量检索与来源引用', '知识库按工作空间管理'],
    to: '/docs/user-guide/conversations-files',
    action: '查看 RAG 与知识库',
    tone: 'sage',
  },
  {
    signal: '03 / EXECUTION SURFACE',
    title: '让工具在持久的执行环境中工作。',
    description: '内置 Python 沙箱支持持续会话，搜索、MCP 和其他工具调用则始终遵循管理员策略与本轮精确选择，不把执行权交给不可见的默认配置。',
    details: ['持久 Python 沙箱', 'MCP 与强大工具调用'],
    to: '/docs/admin/tools-sandbox',
    action: '查看沙箱与 MCP',
    tone: 'porcelain',
  },
]

const guideGroups = (isEnglish: boolean) => isEnglish ? [
  {label: 'Personal edition', description: 'SQLite, embedded vectors, and a single application container.', to: '/docs/getting-started/personal', count: '01'},
  {label: 'Full edition', description: 'PostgreSQL, Redis, Qdrant, and the built-in sandbox.', to: '/docs/getting-started/full', count: '02'},
  {label: 'Models and tool control plane', description: 'Channels, MCP, sandbox, and runtime policy.', to: '/docs/admin/channels-models', count: '03'},
  {label: 'Workspace knowledge', description: 'Conversations, files, RAG, and secure sharing.', to: '/docs/user-guide/conversations-files', count: '04'},
] : [
  {label: '个人版部署', description: 'SQLite、内嵌向量与单应用容器。', to: '/docs/getting-started/personal', count: '01'},
  {label: '完整版部署', description: 'PostgreSQL、Redis、Qdrant 与内置沙盒。', to: '/docs/getting-started/full', count: '02'},
  {label: '模型与工具控制面', description: '渠道、MCP、沙箱与运行策略。', to: '/docs/admin/channels-models', count: '03'},
  {label: '工作空间知识', description: '对话、文件、RAG 与安全分享。', to: '/docs/user-guide/conversations-files', count: '04'},
]

type ControlPlaneView = {
  id: 'workspace' | 'intelligence' | 'operations'
  label: string
  title: string
  description: string
  rows: Array<{label: string; description: string; state: string; tone: 'violet' | 'sage' | 'porcelain'}>
}

const controlPlaneViews = (isEnglish: boolean): ControlPlaneView[] => isEnglish ? [
  {id: 'workspace', label: 'Workspace', title: 'Give long-running work its own boundary.', description: 'Projects, sessions, files, knowledge bases, and member relationships are managed together, without carrying context between isolated threads.', rows: [{label: 'Projects and conversations', description: 'Organize durable context and outputs by task.', state: 'Organized', tone: 'violet'}, {label: 'Members and roles', description: 'Define collaboration boundaries in the same workspace.', state: 'Access', tone: 'sage'}, {label: 'Shared resources', description: 'Files, knowledge bases, and tool policy follow the workspace.', state: 'Shared', tone: 'porcelain'}]},
  {id: 'intelligence', label: 'Knowledge and execution', title: 'RAG, Python, and MCP belong somewhere.', description: 'Knowledge retrieval, persistent code sessions, and tool calls are configurable and traceable workspace capabilities, not disconnected plugins.', rows: [{label: 'RAG and knowledge', description: 'Parsing, vectors, and citations run within resource boundaries.', state: 'Knowledge', tone: 'sage'}, {label: 'Persistent Python sandbox', description: 'Run code and file tasks continuously in controlled sessions.', state: 'Run', tone: 'violet'}, {label: 'MCP and tool calling', description: 'Call only methods permitted by administrators and selected for this request.', state: 'Policy', tone: 'porcelain'}]},
  {id: 'operations', label: 'Operations and governance', title: 'More than chat: ready to operate.', description: 'From subscriptions and credits to payments, usage analytics, and user lifecycle, Aivory gives long-running instances a complete control plane.', rows: [{label: 'Subscriptions and credits', description: 'Manage quotas, preflight checks, and available resources.', state: 'Metering', tone: 'violet'}, {label: 'Payments and billing', description: 'Keep subscriptions and payments within a clear product boundary.', state: 'Billing', tone: 'sage'}, {label: 'Detailed analytics', description: 'Inspect models, channels, costs, errors, and fallbacks.', state: 'Analysis', tone: 'porcelain'}, {label: 'User management', description: 'Manage accounts, roles, status, and workspace membership.', state: 'Governance', tone: 'violet'}]},
] : [
  {
    id: 'workspace',
    label: '工作空间',
    title: '让长期工作有自己的边界。',
    description: '项目、会话、文件、知识库和成员关系可以被一起管理，不需要在孤立的聊天线程之间反复搬运上下文。',
    rows: [
      {label: '项目与对话', description: '按任务组织持续上下文与产物。', state: '组织', tone: 'violet'},
      {label: '成员与角色', description: '在同一工作空间里定义协作边界。', state: '权限', tone: 'sage'},
      {label: '共享资源', description: '让文件、知识库和工具策略跟随工作空间。', state: '共享', tone: 'porcelain'},
    ],
  },
  {
    id: 'intelligence',
    label: '知识与执行',
    title: 'RAG、Python 与 MCP 都有归属。',
    description: '知识检索、持久代码会话与工具调用不是彼此分离的插件，而是工作区中可配置、可追溯的能力。',
    rows: [
      {label: 'RAG 与知识库', description: '解析、向量检索和来源引用按资源边界运行。', state: '知识', tone: 'sage'},
      {label: '持久 Python 沙箱', description: '在受控沙箱会话中连续执行代码和文件任务。', state: '执行', tone: 'violet'},
      {label: 'MCP 与工具调用', description: '仅调用管理员允许且本轮选中的方法。', state: '策略', tone: 'porcelain'},
    ],
  },
  {
    id: 'operations',
    label: '运营与治理',
    title: '不止能聊天，也能运营。',
    description: '从订阅和积分到支付、用量统计与用户生命周期，Aivory 为需要持续运营的实例提供完整控制面。',
    rows: [
      {label: '订阅与积分', description: '管理额度、预检与不同用户的可用资源。', state: '计量', tone: 'violet'},
      {label: '支付与账单', description: '把订阅和付款流程放进明确的产品边界。', state: '收款', tone: 'sage'},
      {label: '详细统计', description: '查看模型、渠道、成本、错误和兜底使用情况。', state: '分析', tone: 'porcelain'},
      {label: '用户管理', description: '处理账号、角色、状态与工作空间成员关系。', state: '治理', tone: 'violet'},
    ],
  },
]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Decorative signal field for work moving between Aivory workspace surfaces. */
function SignalField(): ReactNode {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!host || !canvas || !context) return

    let width = 1
    let height = 1
    let ratio = 1
    let frame = 0
    let boundsFrame = 0
    let lastTimestamp = 0
    let inView = true
    let bounds = {left: 0, top: 0, width: 1, height: 1}
    const particles: Particle[] = []
    const ripples: Ripple[] = []
    const pointer = {x: -1000, y: -1000, active: false}
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const interactionTarget = host.parentElement ?? host

    const refreshBounds = () => {
      const next = host.getBoundingClientRect()
      bounds = {left: next.left, top: next.top, width: next.width, height: next.height}
    }

    const scheduleBoundsRefresh = () => {
      if (boundsFrame !== 0) return
      boundsFrame = window.requestAnimationFrame(() => {
        boundsFrame = 0
        refreshBounds()
      })
    }

    const canAnimate = () => !motionQuery.matches && !document.hidden && inView

    const stop = () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    }

    const seedParticles = () => {
      particles.length = 0
      const target = width < 640 ? 48 : clamp(Math.round((width * height) / 11500), 66, 118)
      for (let index = 0; index < target; index += 1) {
        const depth = 0.45 + ((index * 17) % 55) / 100
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.046 * depth,
          vy: (Math.random() - 0.5) * 0.03 * depth,
          radius: 0.7 + Math.random() * 1.3 * depth,
          phase: Math.random() * Math.PI * 2,
          depth,
        })
      }
    }

    const drawStreams = (time: number) => {
      const streamCount = width < 640 ? 3 : 5
      for (let stream = 0; stream < streamCount; stream += 1) {
        const baseY = height * (0.25 + stream * (0.52 / Math.max(1, streamCount - 1)))
        const amplitude = (10 + stream * 2) * (width < 640 ? 0.65 : 1)
        const phase = stream * 1.7
        context.beginPath()
        for (let x = -24; x <= width + 24; x += 24) {
          const normal = x / Math.max(1, width)
          const bend = Math.sin(normal * 8.6 + time * (0.35 + stream * 0.04) + phase) * amplitude
          const pointerBend =
            pointer.active && Math.abs(pointer.y - baseY) < 150
              ? Math.sin((x - pointer.x) * 0.012) * (1 - clamp(Math.abs(pointer.y - baseY) / 150, 0, 1)) * 22
              : 0
          const y = baseY + bend + pointerBend
          if (x === -24) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.lineWidth = stream === 2 ? 1.2 : 0.7
        context.strokeStyle = stream % 2 === 0 ? 'hsla(274, 76%, 74%, 0.17)' : 'hsla(151, 48%, 72%, 0.12)'
        context.stroke()

        const signalX = ((time * (18 + stream * 4) + stream * 125) % (width + 180)) - 90
        const signalY = baseY + Math.sin((signalX / Math.max(1, width)) * 8.6 + time * (0.35 + stream * 0.04) + phase) * amplitude
        context.beginPath()
        context.arc(signalX, signalY, stream === 2 ? 2.5 : 1.8, 0, Math.PI * 2)
        context.fillStyle = stream % 2 === 0 ? 'hsla(275, 92%, 82%, 0.9)' : 'hsla(151, 72%, 78%, 0.8)'
        context.shadowColor = stream % 2 === 0 ? 'hsla(275, 92%, 75%, 0.8)' : 'hsla(151, 72%, 75%, 0.7)'
        context.shadowBlur = 12
        context.fill()
        context.shadowBlur = 0
      }
    }

    const drawParticles = (time: number, delta: number) => {
      for (const particle of particles) {
        if (canAnimate()) {
          const drift = Math.sin(time * 0.38 + particle.phase) * 0.012
          particle.x += (particle.vx + drift) * delta
          particle.y += particle.vy * delta
          if (particle.x < -20) particle.x = width + 20
          if (particle.x > width + 20) particle.x = -20
          if (particle.y < -20) particle.y = height + 20
          if (particle.y > height + 20) particle.y = -20
        }

        const distance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y)
        const proximity = pointer.active ? clamp(1 - distance / 210, 0, 1) : 0
        const pulse = (Math.sin(time * 1.5 + particle.phase) + 1) / 2
        const x = particle.x + Math.sin(time * 0.7 + particle.phase) * 1.5 * particle.depth
        const y = particle.y + Math.cos(time * 0.52 + particle.phase) * 1.2 * particle.depth
        context.beginPath()
        context.arc(x, y, particle.radius + pulse * 0.45 + proximity * 2.4, 0, Math.PI * 2)
        context.fillStyle = proximity > 0.08 ? `hsla(274, 88%, 83%, ${0.16 + pulse * 0.12 + proximity * 0.54})` : `hsla(248, 36%, 78%, ${(0.16 + pulse * 0.12) * 0.72})`
        context.fill()
      }

      for (let first = 0; first < particles.length; first += 1) {
        const a = particles[first]
        for (let second = first + 1; second < particles.length; second += 1) {
          const b = particles[second]
          const distance = Math.hypot(a.x - b.x, a.y - b.y)
          if (distance > 128) continue
          context.beginPath()
          context.moveTo(a.x, a.y)
          context.lineTo(b.x, b.y)
          context.strokeStyle = `hsla(266, 48%, 78%, ${(1 - distance / 128) * 0.11 * Math.min(a.depth, b.depth)})`
          context.lineWidth = 0.55
          context.stroke()
        }
      }
    }

    const drawRipples = (delta: number) => {
      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        const ripple = ripples[index]
        ripple.radius += delta * 0.16
        ripple.life -= delta * 0.0012
        if (ripple.life <= 0) {
          ripples.splice(index, 1)
          continue
        }
        context.beginPath()
        context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        context.strokeStyle = `hsla(275, 90%, 80%, ${ripple.life * 0.38})`
        context.lineWidth = 1.2
        context.stroke()
        context.beginPath()
        context.arc(ripple.x, ripple.y, ripple.radius * 0.46, 0, Math.PI * 2)
        context.strokeStyle = `hsla(151, 72%, 76%, ${ripple.life * 0.22})`
        context.lineWidth = 0.7
        context.stroke()
      }
    }

    const paint = (timestamp: number) => {
      const delta = lastTimestamp === 0 ? 16 : Math.min(42, timestamp - lastTimestamp)
      lastTimestamp = timestamp
      const time = timestamp * 0.001
      context.clearRect(0, 0, width, height)

      const centerGlow = context.createRadialGradient(width * 0.69, height * 0.48, 0, width * 0.69, height * 0.48, Math.max(width, height) * 0.55)
      centerGlow.addColorStop(0, 'hsla(272, 76%, 46%, 0.14)')
      centerGlow.addColorStop(0.48, 'hsla(272, 56%, 34%, 0.045)')
      centerGlow.addColorStop(1, 'hsla(272, 56%, 20%, 0)')
      context.fillStyle = centerGlow
      context.fillRect(0, 0, width, height)
      drawStreams(time)
      drawParticles(time, delta)
      drawRipples(delta)

      if (pointer.active) {
        const spotlight = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 220)
        spotlight.addColorStop(0, 'hsla(274, 92%, 82%, 0.08)')
        spotlight.addColorStop(0.5, 'hsla(274, 92%, 72%, 0.025)')
        spotlight.addColorStop(1, 'hsla(274, 92%, 72%, 0)')
        context.fillStyle = spotlight
        context.fillRect(pointer.x - 220, pointer.y - 220, 440, 440)
      }

      if (canAnimate()) frame = window.requestAnimationFrame(paint)
      else frame = 0
    }

    function start() {
      if (canAnimate() && frame === 0) frame = window.requestAnimationFrame(paint)
    }

    const resize = () => {
      const next = host.getBoundingClientRect()
      width = Math.max(1, next.width)
      height = Math.max(1, next.height)
      ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      refreshBounds()
      seedParticles()
      if (motionQuery.matches) paint(0)
      else start()
    }

    const updatePointer = (event: PointerEvent) => {
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      pointer.x = x
      pointer.y = y
      pointer.active = x >= 0 && x <= bounds.width && y >= 0 && y <= bounds.height
      if (pointer.active) {
        interactionTarget.style.setProperty('--pointer-x', `${x}px`)
        interactionTarget.style.setProperty('--pointer-y', `${y}px`)
      }
    }

    const clearPointer = () => {
      pointer.active = false
      pointer.x = -1000
      pointer.y = -1000
    }

    const addRipple = (event: PointerEvent) => {
      if (motionQuery.matches) return
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return
      ripples.push({x, y, radius: 8, life: 1})
      start()
    }

    const handleVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    const handleMotionChange = () => {
      stop()
      if (motionQuery.matches) {
        lastTimestamp = 0
        paint(0)
      } else start()
    }

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
    const visibilityObserver =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            inView = entry?.isIntersecting ?? true
            if (!inView) stop()
            else if (motionQuery.matches) paint(0)
            else start()
          }, {threshold: 0.02})

    resize()
    resizeObserver?.observe(host)
    visibilityObserver?.observe(host)
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', scheduleBoundsRefresh, {passive: true})
    interactionTarget.addEventListener('pointermove', updatePointer, {passive: true})
    interactionTarget.addEventListener('pointerleave', clearPointer)
    interactionTarget.addEventListener('pointercancel', clearPointer)
    interactionTarget.addEventListener('pointerdown', addRipple, {passive: true})
    window.addEventListener('blur', clearPointer)
    document.addEventListener('visibilitychange', handleVisibility)
    if (typeof motionQuery.addEventListener === 'function') motionQuery.addEventListener('change', handleMotionChange)
    else motionQuery.addListener(handleMotionChange)

    return () => {
      stop()
      if (boundsFrame !== 0) window.cancelAnimationFrame(boundsFrame)
      resizeObserver?.disconnect()
      visibilityObserver?.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', scheduleBoundsRefresh)
      interactionTarget.removeEventListener('pointermove', updatePointer)
      interactionTarget.removeEventListener('pointerleave', clearPointer)
      interactionTarget.removeEventListener('pointercancel', clearPointer)
      interactionTarget.removeEventListener('pointerdown', addRipple)
      window.removeEventListener('blur', clearPointer)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (typeof motionQuery.removeEventListener === 'function') motionQuery.removeEventListener('change', handleMotionChange)
      else motionQuery.removeListener(handleMotionChange)
    }
  }, [])

  return (
    <div ref={hostRef} className={styles.signalField} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}

function OrbitScene({isEnglish}: {isEnglish: boolean}): ReactNode {
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const handleMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect()
      const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1)
      const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1)
      scene.style.setProperty('--scene-x', `${(x - 0.5) * 2}`)
      scene.style.setProperty('--scene-y', `${(y - 0.5) * 2}`)
    }
    const reset = () => {
      scene.style.setProperty('--scene-x', '0')
      scene.style.setProperty('--scene-y', '0')
    }
    scene.addEventListener('pointermove', handleMove, {passive: true})
    scene.addEventListener('pointerleave', reset)
    return () => {
      scene.removeEventListener('pointermove', handleMove)
      scene.removeEventListener('pointerleave', reset)
    }
  }, [])

  return (
    <div ref={sceneRef} className={styles.orbitScene} aria-label={isEnglish ? 'Aivory workspace activity signals' : 'Aivory 工作区运行信号'}>
      <div className={styles.sceneGrid} aria-hidden="true" />
      <div className={styles.sceneHalo} aria-hidden="true" />
      <div className={clsx(styles.orbitRing, styles.orbitRingOne)} aria-hidden="true"><span className={styles.orbitTick} /></div>
      <div className={clsx(styles.orbitRing, styles.orbitRingTwo)} aria-hidden="true"><span className={styles.orbitTick} /></div>
      <div className={styles.orbitCore}>
        <span className={styles.coreAura} aria-hidden="true" />
        <span className={styles.coreMark} aria-hidden="true">
          <svg viewBox="0 0 32 32" role="presentation">
            <path d={AIVORY_MARK_PATH} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            <circle cx="16" cy="20.9" r="1.4" fill="var(--hero-bg)" />
          </svg>
        </span>
        <span className={styles.coreLabel}>Aivory workspace</span>
        <span className={styles.coreStatus}><i /> context / ready</span>
      </div>
      {orbitNodes(isEnglish).map((node, index) => (
        <div
          className={clsx(styles.orbitNode, styles[`tone${node.tone[0].toUpperCase()}${node.tone.slice(1)}`])}
          key={node.label}
          style={{'--node-left': node.left, '--node-top': node.top, '--node-delay': `${index * 0.8}s`} as CSSProperties}
        >
          <span className={styles.nodeDot} aria-hidden="true" />
          <span className={styles.nodeCopy}><strong>{node.label}</strong><small>{node.detail}</small></span>
        </div>
      ))}
      <div className={styles.sceneReadout}>
        <span className={styles.readoutPulse} aria-hidden="true" />
        <span>workspace / connected</span>
        <span className={styles.readoutDivider} aria-hidden="true" />
        <span>context / ready</span>
      </div>
    </div>
  )
}

function EcosystemRail({isEnglish}: {isEnglish: boolean}): ReactNode {
  const items = [...ecosystem(isEnglish), ...ecosystem(isEnglish)]
  return (
    <div className={styles.ecosystemRail} role="region" aria-labelledby="ecosystem-label">
      <div className={styles.ecosystemLabelWrap}>
        <span className={styles.railSignal} aria-hidden="true" />
        <p id="ecosystem-label">{isEnglish ? 'One workspace, complete capability boundaries' : '一处工作空间，完整能力边界'}</p>
      </div>
      <div className={styles.marqueeViewport}>
        <div className={styles.marqueeTrack} role="list">
          {items.map((item, index) => (
            <span
              className={clsx(styles.logoItem, styles[`logo${item.tone[0].toUpperCase()}${item.tone.slice(1)}`], index >= ecosystem.length && styles.marqueeDuplicate)}
              key={`${item.name}-${index}`}
              role="listitem"
              aria-hidden={index >= ecosystem.length}
            >
              <span className={styles.logoBadge} aria-hidden="true">{item.mark}</span>
              <span>{item.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function WorkspaceControlPlane({isEnglish}: {isEnglish: boolean}): ReactNode {
  const [viewId, setViewId] = useState<ControlPlaneView['id']>('workspace')
  const views = controlPlaneViews(isEnglish)
  const view = views.find((candidate) => candidate.id === viewId) ?? views[0]

  return (
    <section className={styles.controlPlane} aria-labelledby="control-plane-title">
      <div className={styles.controlPlaneInner}>
        <div className={styles.controlPlaneIntro} data-aivory-reveal="section-header">
          <p className={styles.railKicker}>WORKSPACE / BEYOND CHAT</p>
          <h2 id="control-plane-title">{isEnglish ? 'Not another chat layer. A control plane for workspaces.' : '不是另一层聊天界面，而是工作空间的控制面。'}</h2>
          <p>{isEnglish ? 'Aivory brings lasting collaboration, knowledge, execution, subscriptions and credits, payments, detailed analytics, and user management into one operable boundary.' : 'Aivory 把持续协作、知识、执行能力、订阅积分、支付、详细统计和用户管理放进同一个可运营的边界。'}</p>
          <Link className={styles.storyIntroLink} to="/product">{isEnglish ? 'Explore workspace capabilities' : '查看工作空间能力'} <span aria-hidden="true">↗</span></Link>
        </div>
        <div className={styles.controlConsole} data-aivory-reveal="control-console">
          <div className={styles.controlConsoleTopline}>
            <span><i /> Aivory workspace</span>
            <span>workspace / managed</span>
          </div>
          <div className={styles.controlTabs} role="group" aria-label={isEnglish ? 'Workspace control plane' : '工作空间控制面'}>
            {views.map((candidate) => (
              <button
                aria-pressed={candidate.id === view.id}
                className={candidate.id === view.id ? styles.controlTabActive : undefined}
                key={candidate.id}
                onClick={() => setViewId(candidate.id)}
                type="button"
              >
                {candidate.label}
              </button>
            ))}
          </div>
          <div className={styles.controlPanel} aria-live="polite">
            <div className={styles.controlPanelHeader}>
              <div><h3>{view.title}</h3><p>{view.description}</p></div>
              <span className={styles.controlPanelState}><i /> {isEnglish ? 'Ready' : '已就绪'}</span>
            </div>
            <div className={styles.controlRows}>
              {view.rows.map((row) => (
                <div className={styles.controlRow} key={row.label}>
                  <span className={clsx(styles.controlRowMark, styles[`controlTone${row.tone[0].toUpperCase()}${row.tone.slice(1)}`])} aria-hidden="true" />
                  <span><strong>{row.label}</strong><small>{row.description}</small></span>
                  <em>{row.state}</em>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.controlSignals} aria-label={isEnglish ? 'Operational capabilities' : '运营能力'}>
            <span><strong>{isEnglish ? 'Subscriptions and credits' : '订阅与积分'}</strong><small>{isEnglish ? 'Quotas, preflight, and plans' : '额度、预检与套餐'}</small></span>
            <span><strong>{isEnglish ? 'Payments and billing' : '支付与账单'}</strong><small>{isEnglish ? 'Bring collection into the product flow' : '将收款纳入产品流程'}</small></span>
            <span><strong>{isEnglish ? 'Detailed analytics' : '详细统计'}</strong><small>{isEnglish ? 'Models, channels, costs, and errors' : '模型、渠道、成本与错误'}</small></span>
            <span><strong>{isEnglish ? 'User management' : '用户管理'}</strong><small>{isEnglish ? 'Accounts, roles, and workspace members' : '账号、角色和工作空间成员'}</small></span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home(): ReactNode {
  const {i18n} = useDocusaurusContext()
  const isEnglish = i18n.currentLocale === 'en'
  useEffect(() => {
    const bodyClass = 'aivory-home-page'
    document.body.classList.add(bodyClass)
    return () => document.body.classList.remove(bodyClass)
  }, [])

  return (
    <Layout title="Aivory" description={isEnglish ? 'Aivory is a self-hosted AI workspace where conversations, knowledge, persistent Python sandboxes, and tool calling work together over time.' : 'Aivory 自托管 AI 工作空间，让对话、知识库、持久 Python 沙箱与工具调用长期协同。'}>
      <main className={clsx(styles.home, 'aivory-home-page')}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <SignalField />
          <div className={styles.heroVignette} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.heroKicker}><span className={styles.kickerDot} aria-hidden="true" />AIVORY / AI WORKSPACE</p>
              <h1 id="hero-title" className={styles.heroTitle}>
                <span className={styles.titleLine}>{isEnglish ? 'Put AI inside' : '把 AI 放进'}</span>
                <span className={clsx(styles.titleLine, styles.titleAccent)}>{isEnglish ? 'your workspace.' : '你的工作空间。'}</span>
              </h1>
              <p className={styles.heroSubtitle}>
                {isEnglish ? 'Conversations, RAG knowledge, persistent Python sandboxes, MCP, and member collaboration all live within one controlled workspace.' : '对话、RAG 知识库、持久 Python 沙箱、MCP 与成员协作，都留在同一个可控的工作空间。'}
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.heroCta} to="/docs/getting-started/personal"><span>{isEnglish ? 'Start deploying' : '开始部署'}</span><span className={styles.ctaArrow} aria-hidden="true">↗</span></Link>
                <Link className={styles.heroTextLink} to="/docs/intro">{isEnglish ? 'Browse the docs' : '浏览文档'} <span aria-hidden="true">→</span></Link>
              </div>
              <div className={styles.heroMeta} aria-label={isEnglish ? 'Aivory core capabilities' : 'Aivory 核心能力'}><span><i /> {isEnglish ? 'Models and channels' : '多模型与渠道'}</span><span><i /> {isEnglish ? 'RAG knowledge' : 'RAG 知识库'}</span><span><i /> {isEnglish ? 'Persistent Python sandbox' : '持久 Python 沙箱'}</span><span><i /> {isEnglish ? 'MCP and tool calling' : 'MCP 与工具调用'}</span></div>
            </div>
            <OrbitScene isEnglish={isEnglish} />
          </div>
          <div className={styles.heroBottom}><EcosystemRail isEnglish={isEnglish} /></div>
        </section>

        <section className={styles.docsRail} aria-labelledby="docs-rail-title">
          <div className={styles.docsRailInner}>
            <div className={styles.docsRailIntro} data-aivory-reveal="section-header">
              <p className={styles.railKicker}>THE WORKSPACE / AT A GLANCE</p>
              <h2 id="docs-rail-title">{isEnglish ? 'See the capabilities you will actually use.' : '先看见你会真正使用的能力。'}</h2>
              <p>{isEnglish ? 'Workspaces, persistent execution, and knowledge retrieval are not add-ons. They are Aivory’s basic working surface.' : '工作空间、持久执行和知识检索不是附加选项，而是 Aivory 的基础工作面。'}</p>
            </div>
            <nav className={styles.docsLinks} aria-label={isEnglish ? 'Documentation entry points' : '文档入口'}>
              {docsLinks(isEnglish).map((item, index) => (
                <Link key={item.label} className={styles.docsLink} data-aivory-reveal="feature-item" to={item.to}>
                  <span className={styles.docsIndex} aria-hidden="true">0{index + 1}</span>
                  <span className={styles.docsLinkBody}><strong>{item.label}</strong><small>{item.description}</small></span>
                  <span className={styles.docsLinkArrow} aria-hidden="true">↗</span>
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <section className={styles.workspaceDifference} aria-labelledby="workspace-difference-title">
          <div className={styles.workspaceDifferenceInner}>
            <header className={styles.workspaceDifferenceHeader} data-aivory-reveal="section-header">
              <h2 id="workspace-difference-title">
                <span>{isEnglish ? 'Ordinary chat apps end at a conversation.' : '普通聊天程序的终点，是一段对话。'}</span>
                <span>{isEnglish ? 'Aivory begins with a workspace.' : 'Aivory 的起点，是一个工作空间。'}</span>
              </h2>
              <p>{isEnglish ? 'Chat is only the entry point. Aivory places context, knowledge, execution, people, and operations inside the same durable, controlled boundary.' : '聊天只是入口。Aivory 把上下文、知识、执行、成员和运营能力放进同一个长期可控的边界。'}</p>
            </header>

            <div className={styles.comparisonStage}>
              <article className={styles.ordinaryChat} data-aivory-reveal="ordinary-chat" aria-labelledby="ordinary-chat-title">
                <header className={styles.comparisonPanelHeader}>
                  <span>{isEnglish ? 'Ordinary chat apps' : '普通聊天程序'}</span>
                  <h3 id="ordinary-chat-title">{isEnglish ? 'A temporary path for one exchange' : '一段问答的临时路径'}</h3>
                </header>
                <div className={styles.ordinaryThread} aria-label={isEnglish ? 'Example one-off chat thread' : '单次聊天路径示例'}>
                  <p className={clsx(styles.ordinaryMessage, styles.ordinaryMessageUser)}>{isEnglish ? 'Compare the differences between these two quarterly reports.' : '比较两份季度报告的差异。'}</p>
                  <p className={clsx(styles.ordinaryMessage, styles.ordinaryAttachment)}>{isEnglish ? 'Attachment: quarterly-research.pdf' : '附件：季度研究.pdf'}</p>
                  <p className={clsx(styles.ordinaryMessage, styles.ordinaryMessageAssistant)}>{isEnglish ? 'Analysis and tool calling are complete for this turn.' : '已完成本轮分析与工具调用。'}</p>
                  <p className={styles.ordinaryThreadEnd}>{isEnglish ? 'Context ends with the thread' : '上下文随线程结束'}</p>
                </div>
                <ul className={styles.ordinaryFacts}>
                  {ordinaryChatFacts(isEnglish).map((fact) => <li key={fact}>{fact}</li>)}
                </ul>
              </article>

              <article className={styles.aivoryWorkspace} data-aivory-reveal="aivory-workspace" aria-labelledby="aivory-workspace-title">
                <header className={styles.workspaceHeader}>
                  <span>{isEnglish ? 'AIVORY WORKSPACE' : 'AIVORY 工作空间'}</span>
                  <h3 id="aivory-workspace-title">{isEnglish ? 'A durable, manageable boundary for work.' : '一个持续运行、可以被管理的工作边界。'}</h3>
                </header>
                <div className={styles.workspaceBoundary}>
                  <div className={styles.workspaceLayers}>
                    {workspaceLayers(isEnglish).map((layer) => (
                      <div className={styles.workspaceLayer} data-aivory-reveal="workspace-layer" key={layer.title}>
                        <span className={clsx(styles.workspaceLayerMark, styles[`workspaceTone${layer.tone[0].toUpperCase()}${layer.tone.slice(1)}`])} aria-hidden="true">{layer.mark}</span>
                        <span><strong>{layer.title}</strong><small>{layer.description}</small></span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.workspaceOperations} data-aivory-reveal="operations" aria-label={isEnglish ? 'Instance operations' : '实例运营能力'}>
                    {workspaceOperations(isEnglish).map((operation) => <span key={operation}>{operation}</span>)}
                  </div>
                </div>
              </article>
            </div>

            <Link className={styles.storyIntroLink} data-aivory-reveal="footer-cta" to="/product">{isEnglish ? 'Explore workspace capabilities' : '查看工作空间能力'} <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section className={styles.workflowStory} aria-labelledby="workflow-story-title">
          <div className={styles.workflowStoryInner}>
            <div className={styles.workflowStoryIntro} data-aivory-reveal="section-header">
              <p className={styles.railKicker}>THE WORKSPACE / MADE LEGIBLE</p>
              <h2 id="workflow-story-title">{isEnglish ? 'Long-running work should not be trapped in one chat.' : '长期工作，不该困在一段聊天里。'}</h2>
              <p>{isEnglish ? 'Workspaces, RAG knowledge, and persistent execution connect in sequence. Together they create a durable work surface that ordinary chat apps do not.' : '工作空间、RAG 知识和持续执行环境依次连接。它们共同构成区别于普通聊天程序的长期工作面。'}</p>
              <Link className={styles.storyIntroLink} to="/architecture">{isEnglish ? 'Open the full architecture path' : '打开完整架构路径'} <span aria-hidden="true">↗</span></Link>
            </div>
            <div className={styles.storyStack} role="list">
              {workflowStories(isEnglish).map((story, index) => (
                <article
                  className={clsx(styles.storyCard, styles[`storyTone${story.tone[0].toUpperCase()}${story.tone.slice(1)}`])}
                  key={story.signal}
                  role="listitem"
                  style={{'--story-top': `${5.5 + index * 1.18}rem`, '--story-z': `${index + 1}`} as CSSProperties}
                >
                  <div className={styles.storyCardTopline}>
                    <span>{story.signal}</span>
                    <span className={styles.storyCardPulse} aria-hidden="true" />
                  </div>
                  <div className={styles.storyCardBody}>
                    <h3>{story.title}</h3>
                    <p>{story.description}</p>
                    <ul>{story.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                  </div>
                  <Link className={styles.storyCardLink} to={story.to}>{story.action} <span aria-hidden="true">↗</span></Link>
                  <span className={styles.storyOrb} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.liveTraceSection} aria-labelledby="live-trace-title">
          <div className={styles.liveTraceInner}>
            <div className={styles.liveTraceIntro} data-aivory-reveal="section-header">
              <p className={styles.railKicker}>INTERACTION / LIVE TRACE</p>
              <h2 id="live-trace-title">{isEnglish ? 'Make the state of every layer visible.' : '让每一层状态都看得见。'}</h2>
              <p>{isEnglish ? 'Choose a model and run it. This interaction advances through a real sequence to show how models, knowledge, tools, and answers form an observable path in a workspace.' : '选择模型并点击运行。这个交互会真实推进，用来说明模型、知识、工具和回复如何在工作空间内形成可观察的路径。'}</p>
              <Link className={styles.storyIntroLink} to="/playground">{isEnglish ? 'Enter the interactive lab' : '进入交互实验室'} <span aria-hidden="true">↗</span></Link>
            </div>
            <PipelineDemo isEnglish={isEnglish} />
          </div>
        </section>

        <WorkspaceControlPlane isEnglish={isEnglish} />

        <section className={styles.deploymentBand} aria-labelledby="deployment-title">
          <div className={styles.deploymentInner}>
            <div className={styles.deploymentHeader} data-aivory-reveal="section-header">
              <div><p className={styles.railKicker}>DEPLOYMENT / YOUR SCALE</p><h2 id="deployment-title">{isEnglish ? 'One workspace, two deployment paths.' : '一个工作空间，两条部署路径。'}</h2></div>
              <p>{isEnglish ? 'The personal edition starts with a single application container. The full edition preserves the same workspace experience and adds the operating conditions for teams, subscriptions and credits, payments, detailed analytics, and user management.' : '个人版从单个应用容器开始。完整版保留同样的工作空间体验，并为团队协作、订阅积分、支付、详细统计和用户管理提供完整运行条件。'}</p>
            </div>
            <div className={styles.deploymentRoutes}>
              <Link className={styles.deploymentRoute} data-aivory-reveal="feature-item" to="/docs/getting-started/personal">
                <span className={styles.deploymentNumber}>01</span>
                <span><strong>{isEnglish ? 'Personal edition' : '个人版'}</strong><small>{isEnglish ? 'SQLite, embedded vectors, and one application container. The sandbox is off by default and the built-in persistent Python sandbox can be enabled when needed.' : 'SQLite、内嵌向量与单应用容器。默认不部署沙盒，也可按需开启内置持久 Python 沙箱。'}</small></span>
                <span className={styles.deploymentArrow} aria-hidden="true">↗</span>
              </Link>
              <Link className={styles.deploymentRoute} data-aivory-reveal="feature-item" to="/docs/getting-started/full">
                <span className={styles.deploymentNumber}>02</span>
                <span><strong>{isEnglish ? 'Full edition' : '完整版'}</strong><small>{isEnglish ? 'PostgreSQL, Redis, Qdrant, and the built-in persistent Python sandbox for teams and continuous operation with subscriptions, credits, payments, analytics, and user management.' : 'PostgreSQL、Redis、Qdrant 与内置持久 Python 沙箱，适合团队、订阅积分、支付、详细统计和用户管理持续运行。'}</small></span>
                <span className={styles.deploymentArrow} aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.docsMap} aria-labelledby="docs-map-title">
          <div className={styles.docsMapInner}>
            <div className={styles.docsMapHeader} data-aivory-reveal="section-header">
              <div>
                <p className={styles.railKicker}>START / WITH YOUR WORKSPACE</p>
                <h2 id="docs-map-title">{isEnglish ? 'Enter from the task you need to complete now.' : '按你现在要完成的工作进入。'}</h2>
              </div>
              <p>{isEnglish ? 'From starting an instance and connecting models to bringing knowledge, execution environments, and team operations into one controlled boundary.' : '从启动实例、连接模型，到把知识、执行环境和团队运营放进同一个可控边界。'}</p>
            </div>
            <nav className={styles.docsMapGrid} aria-label={isEnglish ? 'Complete documentation map' : '完整文档目录'}>
              {guideGroups(isEnglish).map((group) => (
                <Link className={styles.docsMapLink} data-aivory-reveal="feature-item" key={group.label} to={group.to}>
                  <span className={styles.docsMapCount}>{group.count}</span>
                  <span><strong>{group.label}</strong><small>{group.description}</small></span>
                  <span className={styles.docsMapArrow} aria-hidden="true">→</span>
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </main>
    </Layout>
  )
}
