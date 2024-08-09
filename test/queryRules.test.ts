import { describe, expect, it } from 'vitest'
import { createResolver } from '@nuxt/kit'
import { $fetch, setup } from '@nuxt/test-utils'

const { resolve } = createResolver(import.meta.url)

process.env.NODE_ENV = 'production'

const tests = [
  {
    rule: '/en/?a=*',
    allowed: [
      '/en/admin?a=asdf',
      '/en/?b=value',
    ],
    disallowed: [
      '/en/?a=value',
    ],
  },
  {
    rule: '/es/admin/*?b=',
    allowed: [
      '/es/?b=asdf',
      '/es/admin/login?c=value',
      '/es/admin?c=value',
      '/es/admin/login?c=value&b=asdf',
      '/es/admin?c=value&b=asdf',
    ],
    disallowed: [
      '/es/admin/login?b=asdf',
    ],
  },
  {
    rule: '/fr/admin*?*c=',
    allowed: [
      '/fr/?a=value&c=asdf',
      '/fr/admin/login?a=value',
    ],
    disallowed: [
      '/fr/admin?c=asdf',
      '/fr/admin/login?c=asdf',
      '/fr/admin?b=value&c=value',
    ],
  },
] as const

await setup({
  rootDir: resolve('./fixtures/i18n'),
  nuxtConfig: {
    robots: {
      disallow: tests.map(t => t.rule),
    },
  },
})

describe('queryParameterRules', () => {
  describe.each(tests.map(t => t.rule))('%s', async (rule) => {
    const test = tests.find(t => t.rule === rule) as unknown as typeof tests[number]

    it.each(test.allowed)('%s should be allowed', async (path) => {
      const res = await $fetch(path)
      expect(res.match(/<meta name="robots" content="(.*)">/)?.[1]).not.toContain('noindex')
    })

    it.each(test.disallowed)('%s should be disallowed', async (path) => {
      const res = await $fetch(path)
      expect(res.match(/<meta name="robots" content="(.*)">/)?.[1]).toContain('noindex')
    })
  })
})
