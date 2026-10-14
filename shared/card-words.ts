// Word count for the share card. CJK ideographs count as one each.
// Latin words are whitespace-separated tokens. Fenced code is skipped.

export function countCardWords(markdown: string): number {
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---/, '')
  const text = body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ')
  const cjk = text.match(/[\u3400-\u9FFF]/g)?.length ?? 0
  const words = text
    .replace(/[\u3400-\u9FFF]/g, ' ')
    .split(/[^a-z0-9']+/i)
    .filter(Boolean)
    .length
  return cjk + words
}
