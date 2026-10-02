// sheets/*.md → 블록 트리. 앱(src/Notes.tsx)과 검사(scripts/check.mjs)가 같은 파일을 쓴다.
// ponytail: 마크다운 라이브러리 대신 문서에 실제로 나오는 문법만 처리한다. 모르는 줄은 단락이 된다.
//
// 블록: h3 · p · ul · ol · table · code · quote · trap(함정 포인트) · warn(🟡) · scope(📍)
// 인라인: **굵게**, `코드`

/** @typedef {{ t: 'b' | 'c' | 's'; v: string }} Inline */
/** @typedef {{ text: Inline[]; children: Item[] }} Item */
/**
 * @typedef {(
 *   | { k: 'h3'; text: Inline[] }
 *   | { k: 'p'; text: Inline[] }
 *   | { k: 'ul' | 'ol'; items: Item[] }
 *   | { k: 'table'; head: Inline[][]; rows: Inline[][][]; mode: 'kv' | 'grid' | 'stack' | 'pick' }
 *   | { k: 'code'; text: string }
 *   | { k: 'quote' | 'warn'; text: Inline[] }
 *   | { k: 'trap'; items: Item[] }
 *   | { k: 'scope'; text: string }
 * )} Block
 */
/** @typedef {{ title: string; blocks: Block[] }} Sheet */

/** @returns {Inline[]} */
export function inline(s) {
  const out = []
  const re = /\*\*(.+?)\*\*|`([^`]+)`/g
  let last = 0
  for (const m of s.matchAll(re)) {
    if (m.index > last) out.push({ t: 's', v: s.slice(last, m.index) })
    out.push(m[1] !== undefined ? { t: 'b', v: m[1] } : { t: 'c', v: m[2] })
    last = m.index + m[0].length
  }
  if (last < s.length) out.push({ t: 's', v: s.slice(last) })
  return out
}

export const plain = (xs) => xs.map((x) => x.v).join('')

// 인라인 코드 안의 `|`(HMAC 식의 ||)는 열 구분자가 아니다. 코드 스팬을 잠시 치워두고 자른다.
function cells(line) {
  const codes = []
  const masked = line.replace(/`[^`]+`/g, (m) => `\uE000${codes.push(m) - 1}\uE000`)
  return masked
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim().replace(/\uE000(\d+)\uE000/g, (_, i) => codes[+i]))
}

// 표 모드. 첫 열은 식별자, 나머지는 속성이라는 전제.
// ponytail: 열 수 + 셀 평균 길이 휴리스틱. 판정이 어긋나는 표가 생기면 표 앞 <!-- stack --> 오버라이드를 넣는다.
function tableMode(head, rows) {
  const n = head.length
  if (n <= 2) return 'kv'
  if (n >= 4) return 'pick'
  const attrs = rows.flatMap((r) => r.slice(1).map((c) => plain(c).length))
  const avg = attrs.reduce((a, b) => a + b, 0) / Math.max(1, attrs.length)
  return avg <= 12 ? 'grid' : 'stack'
}

/** 들여쓰기 목록 → 중첩 Item. 2칸 = 한 단계 */
function list(lines) {
  /** @type {{ children: Item[] }} */
  const root = { children: [] }
  const stack = [{ depth: -1, node: root }]
  for (const line of lines) {
    const m = /^(\s*)(?:[-*]|\d+\.)\s+(.*)$/.exec(line)
    const depth = m[1].length
    const node = { text: inline(m[2]), children: [] }
    while (stack[stack.length - 1].depth >= depth) stack.pop()
    stack[stack.length - 1].node.children.push(node)
    stack.push({ depth, node })
  }
  return root.children
}

const isList = (l) => /^\s*(?:[-*]|\d+\.)\s+/.test(l)

/** @returns {Block[]} */
export function parseBlocks(lines) {
  /** @type {Block[]} */
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim() || line.trim() === '---') { i++; continue }
    if (line.startsWith('```')) {
      const buf = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++])
      i++
      out.push({ k: 'code', text: buf.join('\n') })
      continue
    }
    if (line.startsWith('### ')) { out.push({ k: 'h3', text: inline(line.slice(4)) }); i++; continue }
    if (line.startsWith('📍')) { out.push({ k: 'scope', text: line.replace(/^📍\s*/, '') }); i++; continue }
    if (line.startsWith('🟡')) { out.push({ k: 'warn', text: inline(line.replace(/^🟡\s*(?:경계[:：]\s*)?/, '')) }); i++; continue }
    if (line.startsWith('>')) {
      const buf = []
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''))
      const text = buf.filter(Boolean).join('\n')
      out.push({ k: 'quote', text: inline(text.replace(/^⚠️\s*/, '')) })
      continue
    }
    if (line.startsWith('|')) {
      const buf = []
      while (i < lines.length && lines[i].startsWith('|')) buf.push(lines[i++])
      const [h, , ...body] = buf.map(cells)
      const head = h.map(inline)
      const rows = body.map((r) => r.map(inline))
      out.push({ k: 'table', head, rows, mode: tableMode(head, rows) })
      continue
    }
    if (isList(line)) {
      const buf = []
      while (i < lines.length && isList(lines[i])) buf.push(lines[i++])
      const items = list(buf)
      const prev = out[out.length - 1]
      // "**함정 포인트**" 단락 바로 뒤의 목록은 함정 콜아웃으로 승격
      if (prev?.k === 'p' && plain(prev.text) === '함정 포인트') out[out.length - 1] = { k: 'trap', items }
      else out.push({ k: /^\s*\d+\./.test(line) ? 'ol' : 'ul', items })
      continue
    }
    // 단락: 빈 줄이나 다른 블록 시작 전까지
    const buf = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(```|### |📍|🟡|>|\|)/.test(lines[i]) &&
      !isList(lines[i]) &&
      lines[i].trim() !== '---'
    )
      buf.push(lines[i++].trim())
    out.push({ k: 'p', text: inline(buf.join('\n')) })
  }
  return out
}

/** 파일 하나 → 묶음 제목 + 시트 목록. `# `이 묶음, `## `마다 시트 */
export function parseFile(src) {
  const lines = src.split('\n')
  let title = ''
  /** @type {Sheet[]} */
  const sheets = []
  let intro = []
  let cur = null
  for (const line of lines) {
    if (line.startsWith('# ')) { title = line.slice(2).trim(); continue }
    if (line.startsWith('## ')) {
      if (cur) sheets.push({ title: cur.title, blocks: parseBlocks(cur.lines) })
      cur = { title: line.slice(3).trim(), lines: [] }
      continue
    }
    ;(cur ? cur.lines : intro).push(line)
  }
  if (cur) sheets.push({ title: cur.title, blocks: parseBlocks(cur.lines) })
  return { title, intro: parseBlocks(intro), sheets }
}
