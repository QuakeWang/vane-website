import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const componentSource = readFileSync('src/components/PlatformArchitecture.tsx', 'utf8')
const siteStyles = readFileSync('src/index.css', 'utf8')

test('platform architecture keeps its desktop composition inside narrow containers', () => {
  assert.match(componentSource, /const PLATFORM_ARCH_DESIGN_WIDTH = 1132/)
  assert.match(componentSource, /className="platform-arch-viewport" ref=\{viewportRef\}/)
  assert.match(componentSource, /className="platform-arch-stage" ref=\{stageRef\}/)
  assert.match(componentSource, /className="platform-arch-canvas" ref=\{canvasRef\}/)
  assert.match(componentSource, /viewport\.clientWidth >= PLATFORM_ARCH_DESIGN_WIDTH/)
  assert.match(componentSource, /requestAnimationFrame\(\(\) =>/)
  assert.match(componentSource, /observer\.observe\(canvas\)/)
  assert.doesNotMatch(componentSource, /observer\.observe\((?:viewport|stage)\)/)
  assert.match(siteStyles, /\.platform-arch-viewport\s*\{[^}]*container:\s*platform-arch-viewport\s*\/\s*inline-size/s)
  assert.match(siteStyles, /@container platform-arch-viewport \(width < 1132px\)/)
  assert.match(siteStyles, /\.platform-arch \.pa-pillars\s*\{\s*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/)
  assert.match(siteStyles, /\.platform-arch \.pa-core-features\s*\{\s*grid-template-columns:\s*repeat\(4, 1fr\);/)
})
