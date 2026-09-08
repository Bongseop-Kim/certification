// 문제 JSON 무결성 검사. 회차를 추가한 뒤 이것만 돌린다: node scripts/check.mjs
// ponytail: 테스트 프레임워크 없음. 깨지면 exit 1 하는 assert가 전부다.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'

const DIR = new URL('../questions/written/', import.meta.url)
const SUBJECTS = ['system', 'network', 'app', 'general', 'law']
const seen = new Set()
const variants = []
let total = 0

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const qs = JSON.parse(readFileSync(new URL(file, DIR), 'utf8'))
  assert(Array.isArray(qs) && qs.length, `${file}: 배열이 비어 있다`)
  for (const q of qs) {
    const at = `${file} ${q.key}`
    assert(q.key && !seen.has(q.key), `${at}: key가 없거나 중복`)
    seen.add(q.key)
    if (q.variantOf) variants.push([at, q.variantOf])
    assert(SUBJECTS.includes(q.subject), `${at}: subject가 ${q.subject}`)
    assert(q.body?.trim(), `${at}: body 없음`)
    if (q.type === 'mc') {
      assert(q.choices?.length >= 2, `${at}: 보기가 부족`)
      const i = Number(q.answer)
      assert(Number.isInteger(i) && i >= 0 && i < q.choices.length, `${at}: answer ${q.answer}가 보기 범위 밖`)
    } else if (q.type === 'short') {
      assert(q.choices === null, `${at}: short는 choices가 null`)
      assert(q.answer?.trim(), `${at}: short answer 없음`)
      // 단답 규칙(plans/short-answer-rebuild.md §4·§9): 정답은 비교 문자열 그 자체, 근거 없는 카드는 없다
      assert(!/[()]/.test(q.answer), `${at}: short answer에 괄호 — 부가설명은 body로`)
      assert(q.answer.length <= 30, `${at}: short answer 30자 초과 — 답이 문장이면 단답이 아니다`)
      assert(q.note?.trim(), `${at}: short는 note(근거)가 필수`)
    } else {
      assert.fail(`${at}: 모르는 type ${q.type}`)
    }
  }
  // 기출 회차는 과목당 20문항 균등 (직접 만든 세트는 예외)
  if (qs.length === 100) {
    for (const s of SUBJECTS) {
      assert.equal(qs.filter((q) => q.subject === s).length, 20, `${file}: ${s} 20문항 아님`)
    }
  }
  total += qs.length
  console.log(`ok ${file} — ${qs.length}문항`)
}
for (const [at, original] of variants) assert(seen.has(original), `${at}: 원본 ${original} 없음`)
console.log(`총 ${total}문항 이상 없음`)

/* ---------- 정리 시트 (sheets/*.md) — plans/summary-sheets.md §7 ---------- */
const { parseFile, plain } = await import('./md.mjs')
const SHEETS = new URL('../sheets/', import.meta.url)
let nSheets = 0
for (const file of readdirSync(SHEETS).filter((f) => f.endsWith('.md')).sort()) {
  const { title, sheets } = parseFile(readFileSync(new URL(file, SHEETS), 'utf8'))
  assert(title, `${file}: '# ' 묶음 제목 없음`)
  assert(sheets.length, `${file}: '## ' 시트 없음`)
  for (const s of sheets) {
    const at = `${file} ${s.title}`
    for (const b of s.blocks) {
      if (b.k === 'table') {
        for (const r of b.rows) assert.equal(r.length, b.head.length, `${at}: 표 열 수 불일치 — ${plain(r[0])}`)
        assert(b.head.every((c) => plain(c)), `${at}: 표 헤더에 빈 칸`)
      }
      if (b.k === 'code') assert(!/[├└│]/.test(b.text), `${at}: 코드 블록에 ASCII 트리가 남아 있다 — 중첩 목록으로 바꾼다`)
      if (b.k === 'p') assert(plain(b.text) !== '함정 포인트', `${at}: 함정 포인트 뒤에 목록이 없다`)
    }
    if (!file.startsWith('9-')) assert(s.blocks.some((b) => b.k === 'scope'), `${at}: 📍 범위 태그 없음`)
  }
  nSheets += sheets.length
  console.log(`ok ${file} — ${sheets.length}장`)
}
console.log(`정리 시트 ${nSheets}장 이상 없음`)
