import { describe, expect, it } from 'vitest'
import { decodeBase64Url, encodeBase64Url } from './base64url'

describe('base64url', () => {
  it('round-trips ascii without padding issues', () => {
    const original = 'abcd'
    expect(decodeBase64Url(encodeBase64Url(original))).toBe(original)
  })

  it('round-trips utf8 content', () => {
    const original = 'clau súper secreta 🔐'
    expect(decodeBase64Url(encodeBase64Url(original))).toBe(original)
  })

  it('decodes unpadded base64url payloads', () => {
    expect(decodeBase64Url('YQ')).toBe('a')
    expect(decodeBase64Url('YWI')).toBe('ab')
    expect(decodeBase64Url('YWJjZA')).toBe('abcd')
  })
})
