import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const englishPostPath = 'blog/2026-08-23-ai-workloads-need-a-new-data-engine.mdx'
const chinesePostPath =
  'i18n/zh-CN/docusaurus-plugin-content-blog/2026-08-23-ai-workloads-need-a-new-data-engine.mdx'
const architectureImageDirectory =
  'public/img/blog/ai-workloads-need-a-new-data-engine'
const englishArchitectureImagePath =
  `${architectureImageDirectory}/vane-data-architecture-en.png`
const chineseArchitectureImagePath =
  `${architectureImageDirectory}/vane-data-architecture-zh-cn.png`
const englishArchitectureImageUrl =
  '/img/blog/ai-workloads-need-a-new-data-engine/vane-data-architecture-en.png'
const chineseArchitectureImageUrl =
  '/img/blog/ai-workloads-need-a-new-data-engine/vane-data-architecture-zh-cn.png'

const configSource = readFileSync('docusaurus.config.ts', 'utf8')
const routesSource = readFileSync('src/plugins/vaneRoutes.ts', 'utf8')
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const englishPost = readFileSync(englishPostPath, 'utf8')
const chinesePost = readFileSync(chinesePostPath, 'utf8')
const chineseBlogOptions = JSON.parse(
  readFileSync('i18n/zh-CN/docusaurus-plugin-content-blog/options.json', 'utf8'),
)
const pageStyles = readFileSync('src/pages.css', 'utf8')

function frontmatterValue(source, key) {
  return source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]
}

function fencedCode(source) {
  return Array.from(source.matchAll(/^```[^\n]+\n([\s\S]*?)^```$/gm), (match) => match[1])
}

test('Docusaurus owns the Blog routes and content directory', () => {
  assert.equal(packageJson.dependencies['@docusaurus/plugin-content-blog'], '^3.10.1')
  assert.match(configSource, /'@docusaurus\/plugin-content-blog'/)
  assert.match(configSource, /path:\s*'blog'/)
  assert.match(configSource, /routeBasePath:\s*'blog'/)
  assert.match(configSource, /blogSidebarCount:\s*0/)
  assert.doesNotMatch(routesSource, /path:\s*routePath\('\/blog'\)/)
  assert.equal(existsSync('src/pages/Blog.tsx'), false)
})

test('English and Chinese posts share one stable localized route', () => {
  assert.equal(
    frontmatterValue(englishPost, 'slug'),
    'ai-workloads-need-a-new-data-engine',
  )
  assert.equal(frontmatterValue(chinesePost, 'slug'), frontmatterValue(englishPost, 'slug'))
  assert.equal(frontmatterValue(chinesePost, 'date'), frontmatterValue(englishPost, 'date'))
  assert.equal(frontmatterValue(englishPost, 'title'), 'AI workloads need a new data engine')
  assert.equal(frontmatterValue(chinesePost, 'title'), 'AI 工作负载需要新的数据引擎')
  for (const source of [englishPost, chinesePost]) {
    assert.equal((source.match(/<!-- truncate -->/g) ?? []).length, 1)
    assert.match(
      source,
      /<p className="blog-body-lead">[\s\S]*?<\/p>\n\n<!-- truncate -->/,
    )
  }
})

test('Both posts use localized architecture images and retain the runnable example', () => {
  const localizedPosts = [
    [englishPost, englishArchitectureImagePath, englishArchitectureImageUrl],
    [chinesePost, chineseArchitectureImagePath, chineseArchitectureImageUrl],
  ]

  for (const [source, imagePath, imageUrl] of localizedPosts) {
    assert.equal(existsSync(imagePath), true)
    assert.equal(readFileSync(imagePath).subarray(1, 4).toString('ascii'), 'PNG')
    assert.equal(frontmatterValue(source, 'image'), imageUrl)
    assert.match(source, /<img\s+className="dimg"/)
    assert.match(source, /style=\{\{ width: '100%', height: 'auto' \}\}/)
    assert.ok(source.includes(`src="${imageUrl}"`))
    assert.match(source, /width="6035"/)
    assert.match(source, /height="2678"/)
    assert.match(source, /loading="lazy"/)
    assert.doesNotMatch(source, /<DataArchitecture \/>/)
    assert.match(source, /@vane\.func\(return_dtype="BLOB"\)/)
    assert.match(source, /routes\.write_parquet\("claim_routes\.parquet"\)/)
    assert.match(source, /\[.*\]\(\/docs\/data\/quickstart\/quickstart\)/)
    assert.match(source, /\[.*\]\(\/benchmarks\)/)
    assert.doesNotMatch(source, /vane\.astrovela\.ai/)
  }

  assert.ok(fencedCode(englishPost).length > 0)
  assert.ok(fencedCode(chinesePost).length > 0)
  assert.doesNotMatch(fencedCode(chinesePost).join('\n'), /\p{Script=Han}/u)
})

test('Blog metadata and long-form styles are localized', () => {
  assert.equal(chineseBlogOptions.title.message, 'Vane 技术博客')
  assert.match(chineseBlogOptions.description.message, /工程文章/)
  assert.match(pageStyles, /\.blog-wrapper \.markdown/)
  assert.match(pageStyles, /\.blog-wrapper \.markdown p\.blog-body-lead/)
  assert.match(pageStyles, /\.blog-wrapper \.markdown \.dimg/)
  assert.match(pageStyles, /\.blog-wrapper \.table-of-contents__link/)
})
