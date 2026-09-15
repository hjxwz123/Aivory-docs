import type { ReactNode } from 'react'
import { useDoc } from '@docusaurus/plugin-content-docs/client'
import Translate from '@docusaurus/Translate'
import DocItemPaginator from '@theme/DocItem/Paginator'
import DocVersionBanner from '@theme/DocVersionBanner'
import DocVersionBadge from '@theme/DocVersionBadge'
import DocItemFooter from '@theme/DocItem/Footer'
import DocItemTOCMobile from '@theme/DocItem/TOC/Mobile'
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop'
import DocItemContent from '@theme/DocItem/Content'
import DocBreadcrumbs from '@theme/DocBreadcrumbs'
import ContentVisibility from '@theme/ContentVisibility'
import type { Props } from '@theme/DocItem/Layout'
import styles from './styles.module.css'

// Keep Docusaurus' document metadata, navigation and accessibility behavior,
// while allocating a stable reading column instead of percentage-based columns.
export default function DocItemLayout({ children }: Props): ReactNode {
  const { metadata, frontMatter, toc } = useDoc()
  const hasToc = !frontMatter.hide_table_of_contents && toc.length > 0

  return (
    <div className={`${styles.layout} ${hasToc ? styles.withToc : ''}`}>
      <div className={styles.reading}>
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />
        <article>
          <DocBreadcrumbs />
          <DocVersionBadge />
          {hasToc && <DocItemTOCMobile />}
          <DocItemContent>{children}</DocItemContent>
          <DocItemFooter />
        </article>
        <DocItemPaginator />
      </div>
      {hasToc && (
        <aside className={styles.outline}>
          <div className={styles.outlineInner}>
            <p className={styles.outlineTitle}>
              <Translate id="aivory.docs.onThisPage">On this page</Translate>
            </p>
            <DocItemTOCDesktop />
          </div>
        </aside>
      )}
    </div>
  )
}
