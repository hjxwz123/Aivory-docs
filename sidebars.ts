import type {SidebarsConfig} from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Get started',
      items: ['intro', 'getting-started/personal', 'getting-started/full', 'getting-started/first-chat'],
    },
    {
      type: 'category',
      label: 'Deployment',
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
      label: 'Administration',
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
      label: 'User guide',
      items: ['user-guide/conversations-files'],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: ['troubleshooting/common-issues'],
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['reference/changelog'],
    },
  ],
}

export default sidebars
