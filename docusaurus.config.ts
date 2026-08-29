import {themes as prismThemes} from 'prism-react-renderer'
import type {Config} from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import seoAssetsPlugin from './src/plugins/seo-assets'

const siteUrl = process.env.DOCS_SITE_URL ?? 'https://docs.aivory.example.com'
const siteBaseUrl = process.env.DOCS_SITE_BASE_URL ?? '/'
const siteRoot = new URL(siteBaseUrl, siteUrl).toString()
const siteStructuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteRoot}#website`,
      url: siteRoot,
      name: 'Aivory Documentation',
      description: 'Deployment, configuration, and administration documentation for the self-hosted Aivory AI workspace.',
    },
    {
      '@type': 'Organization',
      '@id': `${siteRoot}#organization`,
      name: 'Aivory',
      url: siteRoot,
      logo: new URL('img/aivory-mark.svg', siteRoot).toString(),
      sameAs: ['https://github.com/hjxwz123/Aivory'],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Aivory',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Linux',
      url: siteRoot,
      description: 'A self-hosted AI workspace that brings multi-model chat, RAG knowledge, persistent Python sandboxes, and tool calling into one controlled environment.',
    },
  ],
})

if (process.env.NODE_ENV === 'production' && !process.env.DOCS_SITE_URL) {
  console.warn('DOCS_SITE_URL is not set; canonical, sitemap, and robots URLs use the example domain.')
}

const config: Config = {
  title: 'Aivory',
  tagline: '把 AI 工作空间部署在自己的边界内',
  favicon: 'img/aivory-mark.svg',

  future: {
    v4: true,
  },

  url: siteUrl,
  baseUrl: siteBaseUrl,
  // Emit directory index files and canonical URLs with a trailing slash so
  // static hosts can serve each document without an SPA catch-all rewrite.
  trailingSlash: true,
  organizationName: 'hjxwz123',
  projectName: 'Aivory',

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'robots',
        content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content: 'Aivory,AI workspace,self-hosted AI,RAG,knowledge base,Python sandbox,MCP,multi-model,部署文档',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'author',
        content: 'Aivory contributors',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'sitemap',
        type: 'application/xml',
        href: new URL('sitemap.xml', siteRoot).toString(),
      },
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: siteStructuredData,
    },
  ],

  plugins: [
    seoAssetsPlugin,
  ],

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hans'],
    localeConfigs: {
      'zh-Hans': {
        label: '简体中文',
        htmlLang: 'zh-CN',
      },
      en: {
        label: 'English',
        htmlLang: 'en-US',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/aivory-admin.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Aivory',
      logo: {
        alt: 'Aivory',
        src: 'img/aivory-mark.svg',
      },
      items: [
        {
          type: 'dropdown',
          label: '能力',
          position: 'left',
          items: [
            {label: '多模型对话', to: '/docs/getting-started/first-chat'},
            {label: '知识库与向量', to: '/docs/user-guide/conversations-files'},
            {label: '工具与沙盒', to: '/docs/admin/tools-sandbox'},
          ],
        },
        {
          type: 'dropdown',
          label: '部署',
          position: 'left',
          items: [
            {label: '个人版', to: '/docs/getting-started/personal'},
            {label: '完整版', to: '/docs/getting-started/full'},
            {label: 'ARM64 与 x86_64', to: '/docs/deployment/arm-x86'},
          ],
        },
        {
          to: '/docs/admin/channels-models',
          label: '模型',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: '学习',
          position: 'left',
          items: [
            {label: '快速开始', to: '/docs/intro'},
            {label: '常见问题', to: '/docs/troubleshooting/common-issues'},
            {label: '更新日志', to: '/docs/reference/changelog'},
          ],
        },
        {
          type: 'dropdown',
          label: '探索',
          position: 'left',
          items: [
            {label: '产品工作区', to: '/product'},
            {label: '架构路径', to: '/architecture'},
            {label: '交互实验室', to: '/playground'},
          ],
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/hjxwz123/Aivory',
          label: 'GitHub',
          position: 'right',
        },
        {
          to: '/docs/getting-started/personal',
          label: '开始使用',
          position: 'right',
          className: 'aivory-navbar-cta',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '开始使用',
          items: [
            {label: '产品介绍', to: '/docs/intro'},
            {label: '个人版部署', to: '/docs/getting-started/personal'},
            {label: '完整版部署', to: '/docs/getting-started/full'},
          ],
        },
        {
          title: '参考',
          items: [
            {label: '环境变量', to: '/docs/deployment/environment'},
            {label: '升级与备份', to: '/docs/deployment/upgrade-backup'},
            {label: '故障排查', to: '/docs/troubleshooting/common-issues'},
          ],
        },
        {
          title: '项目',
          items: [
            {label: 'GitHub', href: 'https://github.com/hjxwz123/Aivory'},
            {label: '更新日志', to: '/docs/reference/changelog'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Aivory contributors.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
