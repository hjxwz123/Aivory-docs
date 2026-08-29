import type {SidebarsConfig} from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: '开始使用',
      items: ['intro', 'getting-started/personal', 'getting-started/full', 'getting-started/first-chat'],
    },
    {
      type: 'category',
      label: '部署',
      items: [
        'deployment/choose-edition',
        'deployment/environment',
        'deployment/environment-advanced',
        'deployment/environment-sandbox',
        'deployment/environment-frontend',
        'deployment/arm-x86',
        'deployment/domain-tls-oauth',
        'deployment/upgrade-backup',
      ],
    },
    {
      type: 'category',
      label: '管理员',
      items: [
        'admin/first-run',
        'admin/channels-models',
        'admin/knowledge-rag',
        'admin/tools-sandbox',
        'admin/access-auth',
        'admin/billing',
        'admin/platform-operations',
      ],
    },
    {
      type: 'category',
      label: '用户指南',
      items: ['user-guide/conversations-files'],
    },
    {
      type: 'category',
      label: '故障排查',
      items: ['troubleshooting/common-issues'],
    },
    {
      type: 'category',
      label: '参考',
      items: ['reference/changelog'],
    },
  ],
}

export default sidebars
