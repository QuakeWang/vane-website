import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const componentSource = readFileSync('src/components/DataArchitecture.tsx', 'utf8')
const siteStyles = readFileSync('src/index.css', 'utf8')

test('data architecture preserves its horizontal design in narrow docs columns', () => {
  assert.match(componentSource, /const DATA_ARCH_DESIGN_WIDTH = 760/)
  assert.match(componentSource, /className="data-arch-viewport" ref=\{viewportRef\}/)
  assert.match(componentSource, /className="data-arch-stage" ref=\{stageRef\}/)
  assert.match(componentSource, /className="data-arch-canvas" ref=\{canvasRef\}/)
  assert.match(componentSource, /viewport\.clientWidth >= DATA_ARCH_DESIGN_WIDTH/)
  assert.match(componentSource, /requestAnimationFrame\(\(\) =>/)
  assert.match(componentSource, /observer\.observe\(canvas\)/)
  assert.doesNotMatch(componentSource, /observer\.observe\((?:viewport|stage)\)/)
  assert.match(siteStyles, /\.data-arch\s*\{[^}]*container:\s*data-arch-shell\s*\/\s*inline-size/s)
  assert.match(siteStyles, /\.data-arch-canvas\s*\{\s*container:\s*data-arch-canvas\s*\/\s*inline-size;/)
  assert.match(siteStyles, /@container data-arch-canvas \(min-width: 760px\)/)
  assert.match(siteStyles, /@container data-arch-shell \(width < 760px\)/)
  assert.match(siteStyles, /\.data-arch-canvas\s*\{[^}]*width:\s*760px;[^}]*transform:\s*scale\(var\(--da-scale, 0\.8\)\)/s)
  assert.match(siteStyles, /\.data-arch-canvas \.pa-core-features\s*\{\s*grid-template-columns:\s*repeat\(4, 1fr\);/)
  assert.match(siteStyles, /@media \(max-width: 620px\)[\s\S]*\.data-arch\s*\{\s*padding:\s*18px 12px 14px;/)
})
