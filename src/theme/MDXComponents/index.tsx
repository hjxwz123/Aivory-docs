import type { ComponentProps } from 'react'
import MDXComponents from '@theme-original/MDXComponents'
import { translate } from '@docusaurus/Translate'

function ScrollableTable(props: ComponentProps<'table'>) {
  return (
    <div
      className="aivory-table-scroll"
      role="region"
      aria-label={translate({
        id: 'aivory.docs.table',
        message: 'Table (scroll horizontally to see all columns)'
      })}
      tabIndex={0}
    >
      <table {...props} />
    </div>
  )
}

export default { ...MDXComponents, table: ScrollableTable }
