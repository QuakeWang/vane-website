import clsx from 'clsx'
import type {ReactNode} from 'react'
import {useWindowSize} from '@docusaurus/theme-common'
import {useDoc, useDocsSidebar} from '@docusaurus/plugin-content-docs/client'
import {useLocation} from '@docusaurus/router'
import ContentVisibility from '@theme/ContentVisibility'
import DocBreadcrumbs from '@theme/DocBreadcrumbs'
import DocItemContent from '@theme/DocItem/Content'
import DocItemFooter from '@theme/DocItem/Footer'
import DocItemPaginator from '@theme/DocItem/Paginator'
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop'
import DocVersionBadge from '@theme/DocVersionBadge'
import DocVersionBanner from '@theme/DocVersionBanner'
import DocsMobileNavigation from '../../../components/DocsMobileNavigation'

function useDocTOC() {
  const {frontMatter, toc} = useDoc()
  const windowSize = useWindowSize()
  const hidden = frontMatter.hide_table_of_contents
  const canRender = !hidden && toc.length > 0

  return {
    desktop: canRender && (windowSize === 'desktop' || windowSize === 'ssr') ? <DocItemTOCDesktop /> : undefined,
    hidden,
  }
}

export default function DocItemLayout({children}: {children: ReactNode}) {
  const docTOC = useDocTOC()
  const {metadata} = useDoc()
  const sidebar = useDocsSidebar()
  const {pathname} = useLocation()

  return (
    <div className="row docs-data-row">
      {sidebar && <DocsMobileNavigation key={pathname} path={pathname} sidebar={sidebar.items} />}
      <div className={clsx('col', !docTOC.hidden && 'docs-data-doc-col')}>
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />
        <article className="doc">
          <DocBreadcrumbs />
          <DocVersionBadge />
          <DocItemContent>{children}</DocItemContent>
          <DocItemFooter />
          <DocItemPaginator />
        </article>
      </div>
      {docTOC.desktop && <div className="col col--3 docs-data-toc-col">{docTOC.desktop}</div>}
    </div>
  )
}
