import { describe, expect, it } from 'vitest'
import css from './index.css?raw'

type Color = [number, number, number, number]

function declarations(block: string) {
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]]))
}

const base = declarations(css.match(/@theme\s*\{([^}]+)\}/)![1] + css.match(/:root\s*\{([^}]+)\}/)![1])
const light = { ...base, ...declarations(css.match(/:root\[data-theme='light'\]\s*\{([^}]+)\}/)![1]) }

function color(tokens: Record<string, string>, name: string): Color {
  const value = tokens[name]
  if (value.startsWith('var(')) return color(tokens, value.slice(4, -1))
  if (value.startsWith('#')) {
    const hex = value.length === 4 ? [...value.slice(1)].map((c) => c + c).join('') : value.slice(1)
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16), 1]
  }
  if (value.startsWith('rgb(')) {
    const [r, g, b, a = 1] = value.match(/[\d.]+/g)!.map(Number)
    return [r, g, b, a]
  }
  throw new Error(`Unsupported color token: ${name} = ${value}`)
}

function over(front: Color, back: Color): Color {
  return [
    front[0] * front[3] + back[0] * (1 - front[3]),
    front[1] * front[3] + back[1] * (1 - front[3]),
    front[2] * front[3] + back[2] * (1 - front[3]),
    1,
  ]
}

function luminance(c: Color) {
  const linear = c.slice(0, 3).map((v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}

function contrast(a: Color, b: Color) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

describe.each([['dark', base], ['light', light]] as const)('%s theme contrast', (_theme, tokens) => {
  const get = (name: string) => color(tokens, name)
  const canvas = get('--color-canvas')
  const high = get('--color-veil-high')
  const surfaces = [canvas, over(get('--color-veil'), canvas), over(high, [0, 0, 0, 1]), over(high, [255, 255, 255, 1])]

  it('keeps all text tiers readable, including glass over bright or dark photos', () => {
    for (const tier of ['ink', 'ink-muted', 'ink-soft', 'ink-faint']) {
      for (const surface of surfaces) expect(contrast(get(`--color-${tier}`), surface)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps olive buttons and selected navigation readable after palette edits', () => {
    expect(contrast(get('--color-action-ink'), get('--color-action'))).toBeGreaterThanOrEqual(4.5)
    const accent = get('--color-accent')
    const tint = Number(tokens['--color-accent-soft'].match(/([\d.]+)%/)![1]) / 100
    for (const surface of surfaces) {
      expect(contrast(accent, over([accent[0], accent[1], accent[2], tint], surface))).toBeGreaterThanOrEqual(4.5)
      expect(contrast(accent, surface)).toBeGreaterThanOrEqual(3)
    }
  })

  it('keeps frosted navigation readable over bright and dark content', () => {
    const accent = get('--color-accent')
    const tint = Number(tokens['--color-accent-soft'].match(/([\d.]+)%/)![1]) / 100
    for (const backdrop of [[0, 0, 0, 1], [255, 255, 255, 1]] as Color[]) {
      const surface = over(get('--nav-sheen'), over(get('--nav-veil'), backdrop))
      expect(contrast(get('--color-ink'), surface)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(get('--color-ink'), over([accent[0], accent[1], accent[2], tint], surface))).toBeGreaterThanOrEqual(4.5)
    }
  })
})
