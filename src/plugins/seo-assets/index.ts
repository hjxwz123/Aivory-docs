import {writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import type {LoadContext, Plugin} from '@docusaurus/types'

/**
 * Generate host-aware crawler instructions after the static site is built.
 * Keeping this in the build makes the sitemap URL follow DOCS_SITE_URL and
 * DOCS_SITE_BASE_URL instead of shipping a domain-specific static file.
 */
export default function seoAssetsPlugin(context: LoadContext): Plugin {
  return {
    name: 'aivory-seo-assets',
    async postBuild({outDir}) {
      const siteRoot = new URL(context.baseUrl, context.siteConfig.url).toString()
      const sitemapUrl = new URL('sitemap.xml', siteRoot).toString()
      const robots = [
        'User-agent: *',
        'Allow: /',
        `Sitemap: ${sitemapUrl}`,
        '',
      ].join('\n')

      await writeFile(join(outDir, 'robots.txt'), robots, 'utf8')
    },
  }
}
