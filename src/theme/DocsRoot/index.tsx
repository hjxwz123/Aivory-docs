import React from 'react'
import clsx from 'clsx'
import {HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common'
import renderRoutes from '@docusaurus/renderRoutes'
import Layout from '@theme/Layout'

// Documentation has its own persistent navigation; public routes retain the site footer.
export default function DocsRoot(props: any) {
  return (
    <HtmlClassNameProvider className={clsx(ThemeClassNames.wrapper.docsPages)}>
      <Layout noFooter>{renderRoutes(props.route.routes)}</Layout>
    </HtmlClassNameProvider>
  )
}
