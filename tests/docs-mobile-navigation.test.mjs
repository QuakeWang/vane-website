import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const layoutSource = readFileSync('src/theme/DocItem/Layout/index.tsx', 'utf8')
const navigationSource = readFileSync('src/components/DocsMobileNavigation.tsx', 'utf8')
const navSource = readFileSync('src/components/Nav.tsx', 'utf8')
const pageStyles = readFileSync('src/pages.css', 'utf8')
const siteStyles = readFileSync('src/index.css', 'utf8')

test('mobile docs navigation reuses the active Docusaurus sidebar', () => {
  assert.match(layoutSource, /useDoc, useDocsSidebar/)
  assert.match(layoutSource, /<DocsMobileNavigation key=\{pathname\} path=\{pathname\} sidebar=\{sidebar\.items\} \/>/)
  assert.match(navigationSource, /<DocSidebarItems/)
  assert.match(navigationSource, /items=\{sidebar\}/)
  assert.match(navigationSource, /activePath=\{path\}/)
  assert.match(navigationSource, /item\.type === 'link'/)
})

test('mobile docs drawer preserves reading space and modal accessibility', () => {
  assert.match(navSource, /className="nav-docs-menu"/)
  assert.match(navSource, /aria-controls="docs-mobile-navigation"/)
  assert.match(navSource, /window\.dispatchEvent\(new Event\(OPEN_DOCS_MOBILE_NAV_EVENT\)\)/)
  assert.match(navigationSource, /window\.addEventListener\(OPEN_DOCS_MOBILE_NAV_EVENT, openNavigation\)/)
  assert.match(navigationSource, /role="dialog"/)
  assert.match(navigationSource, /aria-modal="true"/)
  assert.match(navigationSource, /event\.key === 'Escape'/)
  assert.match(navigationSource, /event\.key !== 'Tab'/)
  assert.match(navigationSource, /classList\.add\('docs-mobile-nav-open'\)/)
  assert.match(siteStyles, /\.nav-docs-menu\s*\{[^}]*display:\s*none;/s)
  assert.match(siteStyles, /@media \(max-width: 996px\)[\s\S]*\.nav-docs-menu\s*\{[^}]*display:\s*inline-flex;/)
  assert.match(pageStyles, /\.docs-mobile-nav-drawer\s*\{[^}]*width:\s*min\(88vw, 340px\);[^}]*height:\s*100%;/s)
  assert.match(pageStyles, /\.docs-mobile-nav-body\s*\{[^}]*overflow-y:\s*auto;/s)
})

test('mobile docs drawer releases state after leaving the mobile breakpoint', () => {
  assert.match(navigationSource, /matchMedia\('\(max-width: 996px\)'\)/)
  assert.match(navigationSource, /if \(!event\.matches\) setOpen\(false\)/)
  assert.match(navigationSource, /mobileViewport\.addEventListener\('change', onViewportChange\)/)
  assert.match(navigationSource, /mobileViewport\.removeEventListener\('change', onViewportChange\)/)
})

test('mobile docs focus trap excludes hidden and untabbable sidebar items', () => {
  assert.match(navigationSource, /element\.tabIndex >= 0/)
  assert.match(navigationSource, /element\.getClientRects\(\)\.length > 0/)
})
