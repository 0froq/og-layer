import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cardDescription, paperFields } from '../app/utils/cover.ts'

const site = 'void is a product with zero bytes, zero side effects and zero features.'

test('cardDescription collapses whitespace and keeps CJK intact', () => {
  const cjk = '一次没有事故、没有回滚、diff 极短的上线复盘。我们承诺周五前交付点什么。'
  assert.equal(cardDescription(`  ${cjk}\n\n下一句。  `), `${cjk} 下一句。`)
  assert.equal(cardDescription(''), '')
  assert.equal(cardDescription('   \n'), '')
  assert.equal(cardDescription(undefined), '')
  assert.equal(cardDescription(12), '')
})

test('paperFields prefers frontmatter description over the site description', () => {
  const fields = paperFields({
    title: ' How we shipped void on schedule ',
    description: ' A launch review.\nNo incidents. ',
    date: '2026-09-19',
    words: 42,
  }, site)
  assert.equal(fields.title, 'How we shipped void on schedule')
  assert.equal(fields.description, 'A launch review. No incidents.')
  assert.equal(fields.created, '2026-09-19')
  assert.equal(fields.words, 42)
  assert.equal(fields.evergreen, false)
})

test('paperFields falls back to the site description', () => {
  assert.equal(paperFields({ title: 'Renamed to void', description: '  ' }, site).description, site)
  assert.equal(paperFields({ title: 'Renamed to void' }, site).description, site)
  assert.equal(paperFields(null, site).description, site)
})

test('paperFields leaves the description blank when both sources are empty', () => {
  assert.equal(paperFields({ title: 'Renamed to void', description: '' }).description, '')
  assert.equal(paperFields({ title: 'Renamed to void' }, '  \n').description, '')
  assert.equal(paperFields(undefined).description, '')
})
