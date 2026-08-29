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
  tagline: 'Deploy your AI workspace inside your own boundaries',
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
          label: 'Capabilities',
          position: 'left',
          items: [
            {label: 'Multi-model chat', to: '/docs/getting-started/first-chat'},
            {label: 'Knowledge and vectors', to: '/docs/user-guide/conversations-files'},
            {label: 'Tools and sandbox', to: '/docs/admin/tools-sandbox'},
          ],
        },
        {
          type: 'dropdown',
          label: 'Deploy',
          position: 'left',
          items: [
            {label: 'Personal edition', to: '/docs/getting-started/personal'},
            {label: 'Full edition', to: '/docs/getting-started/full'},
            {label: 'ARM64 and x86_64', to: '/docs/deployment/arm-x86'},
          ],
        },
        {
          to: '/docs/admin/channels-models',
          label: 'Models',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Learn',
          position: 'left',
          items: [
            {label: 'Quick start', to: '/docs/intro'},
            {label: 'Troubleshooting', to: '/docs/troubleshooting/common-issues'},
            {label: 'Changelog', to: '/docs/reference/changelog'},
          ],
        },
        {
          type: 'dropdown',
          label: 'Explore',
          position: 'left',
          items: [
            {label: 'Product workspace', to: '/product'},
            {label: 'Architecture path', to: '/architecture'},
            {label: 'Interactive lab', to: '/playground'},
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
          label: 'Get started',
          position: 'right',
          className: 'aivory-navbar-cta',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Get started',
          items: [
            {label: 'Product overview', to: '/docs/intro'},
            {label: 'Personal edition', to: '/docs/getting-started/personal'},
            {label: 'Full edition', to: '/docs/getting-started/full'},
          ],
        },
        {
          title: 'Reference',
          items: [
            {label: 'Environment variables', to: '/docs/deployment/environment'},
            {label: 'Upgrade and backup', to: '/docs/deployment/upgrade-backup'},
            {label: 'Troubleshooting', to: '/docs/troubleshooting/common-issues'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'GitHub', href: 'https://github.com/hjxwz123/Aivory'},
            {label: 'Changelog', to: '/docs/reference/changelog'},
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
