import {existsSync, readFileSync} from 'node:fs'
import {test} from 'node:test'
import assert from 'node:assert/strict'

const read = (path) => readFileSync(path, 'utf8')

const englishExamples = [
  'docs/data/tutorials/index.mdx',
  'docs/data/tutorials/examples/basic-prompt.mdx',
  'docs/data/tutorials/examples/common-crawl.mdx',
  'docs/data/tutorials/examples/image-generation.mdx',
  'docs/data/tutorials/examples/llms-red-pajamas.mdx',
  'docs/data/tutorials/examples/minhash-dedupe.mdx',
  'docs/data/tutorials/examples/querying-images.mdx',
  'docs/data/tutorials/examples/voice-ai-analytics.mdx',
]

const chineseExamples = englishExamples.map((path) =>
  path.replace(
    'docs/data/',
    'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/',
  ),
)

const exampleSources = [...englishExamples, ...chineseExamples]
const tutorialSources = [...englishExamples.slice(1), ...chineseExamples.slice(1)]
const aiApiSources = [
  'docs/data/concepts/ai-functions.mdx',
  'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/concepts/ai-functions.mdx',
]

test('tutorial inventory matches the Vane 0.1.0 examples release', () => {
  for (const path of [
    'docs/data/tutorials/examples/basic-prompt.mdx',
    'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/tutorials/examples/basic-prompt.mdx',
  ]) {
    assert.equal(existsSync(path), true, `${path} must document basic_prompt.py`)
    assert.match(read(path), /examples\/basic_prompt\.py/)
  }

  for (const path of [
    'docs/data/tutorials/examples/multimodal-structured-outputs.mdx',
    'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/tutorials/examples/multimodal-structured-outputs.mdx',
  ]) {
    assert.equal(existsSync(path), false, `${path} documents an example removed before 0.1.0`)
  }
})

test('example tutorials link to main and use released API names', () => {
  for (const path of exampleSources) {
    const source = read(path)
    assert.doesNotMatch(source, /github\.com\/AstroVela\/vane\/blob\/v[^/]+\/examples\//)
    assert.doesNotMatch(source, /\bembed_text\b/)
    assert.doesNotMatch(source, /duckdb\.sqltypes/)
  }

  for (const path of tutorialSources) {
    assert.match(read(path), /github\.com\/AstroVela\/vane\/blob\/main\/examples\//)
  }

  for (const path of [
    'docs/data/tutorials/examples/common-crawl.mdx',
    'docs/data/tutorials/examples/llms-red-pajamas.mdx',
    'docs/data/tutorials/examples/voice-ai-analytics.mdx',
    'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/tutorials/examples/common-crawl.mdx',
    'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/tutorials/examples/llms-red-pajamas.mdx',
    'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/tutorials/examples/voice-ai-analytics.mdx',
  ]) {
    assert.match(read(path), /\bembed\(/)
  }

  for (const path of [
    'docs/data/tutorials/examples/common-crawl.mdx',
    'docs/data/tutorials/examples/image-generation.mdx',
    'docs/data/tutorials/examples/querying-images.mdx',
    'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/tutorials/examples/common-crawl.mdx',
    'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/tutorials/examples/image-generation.mdx',
    'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/tutorials/examples/querying-images.mdx',
  ]) {
    assert.match(read(path), /vane\.sqltypes/)
  }
})

test('0.1.0 example setup installs the matching wheel release', () => {
  for (const path of [
    'docs/data/tutorials/index.mdx',
    'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/tutorials/index.mdx',
  ]) {
    const source = read(path)
    assert.match(source, /uv pip install vane-ai==0\.1\.0 numpy pyarrow/)
    assert.match(source, /uv pip install 'vane-ai\[openai\]==0\.1\.0'/)
    assert.doesNotMatch(source, /OPENAI_BASE_URL/)
  }

  for (const path of [
    'docs/data/tutorials/examples/basic-prompt.mdx',
    'i18n/zh-CN/docusaurus-plugin-content-docs-data/current/tutorials/examples/basic-prompt.mdx',
  ]) {
    assert.match(read(path), /uv pip install 'vane-ai\[openai\]==0\.1\.0'/)
  }
})

test('AI documentation uses the flat Vane 0.1.0 option surface', () => {
  for (const path of aiApiSources) {
    const source = read(path)
    assert.doesNotMatch(
      source,
      /OpenAIProviderOptions|OpenAIPromptOptions|OpenAIEmbeddingOptions|provider_options|prompt_options|embedding_options|max_api_concurrency/,
    )
  }

  for (const path of aiApiSources) {
    const source = read(path)
    assert.match(source, /actor_number/)
    assert.match(source, /max_concurrency_per_actor/)
    assert.match(source, /max_output_tokens/)
    assert.match(source, /encoding_format/)
  }
})

test('navigation replaces the removed example and preserves its old URLs', () => {
  const registry = read('src/docs/registry.ts')
  const sidebar = read('src/docs/sidebar.data.json')
  const redirects = read('src/docs/legacySlugs.ts')
  const integrationTest = read('tests/docusaurus-docs-i18n-config.test.mjs')

  for (const source of [registry, sidebar, integrationTest]) {
    assert.match(source, /tutorials\/examples\/basic-prompt/)
    assert.doesNotMatch(source, /tutorials\/examples\/multimodal-structured-outputs/)
  }
  assert.match(
    redirects,
    /'examples\/multimodal-structured-outputs':\s*'tutorials\/examples\/basic-prompt'/,
  )
  assert.match(
    redirects,
    /'examples\/example-tutorials\/multimodal-structured-outputs':\s*'tutorials\/examples\/basic-prompt'/,
  )
  assert.match(
    redirects,
    /'tutorials\/examples\/multimodal-structured-outputs':\s*'tutorials\/examples\/basic-prompt'/,
  )
})

test('published package documentation retains Python 3.10 through 3.14', () => {
  const english = [
    read('docs/data/quickstart/installation.mdx'),
    read('docs/data/contributing/development.mdx'),
  ]
  const chinese = [
    read('i18n/zh-CN/docusaurus-plugin-content-docs-data/current/quickstart/installation.mdx'),
    read('i18n/zh-CN/docusaurus-plugin-content-docs-data/current/contributing/development.mdx'),
  ]

  for (const source of english) assert.match(source, /Python 3\.10 through 3\.14/)
  for (const source of chinese) assert.match(source, /Python 3\.10 至 3\.14/)

  const marketing = read('src/pages/useCasesData.ts')
  assert.doesNotMatch(marketing, /\bembed_text\b/)
})
