// 실기 문제 JSON 무결성 검사. 문제를 추가·변형한 뒤 이것만 돌린다: node scripts/check.mjs
// ponytail: 테스트 프레임워크 없음. 깨지면 exit 1 하는 assert가 전부다. 수량은 맞추지 않는다.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'

const DIR = new URL('../questions/practical/', import.meta.url)
const TYPES = ['short', 'essay', 'task']
const seen = new Set()
let total = 0

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const qs = JSON.parse(readFileSync(new URL(file, DIR), 'utf8'))
  assert(Array.isArray(qs) && qs.length, `${file}: 배열이 비어 있다`)
  for (const q of qs) {
    const at = `${file} ${q.key}`
    assert(q.key && !seen.has(q.key), `${at}: key가 없거나 중복`)
    seen.add(q.key)
    assert(TYPES.includes(q.type), `${at}: type이 ${q.type}`)
    assert(q.body?.trim() && q.answer?.trim(), `${at}: body/answer 없음`)
    assert(q.grading === 'self', `${at}: grading은 self`)
    assert(q.ai === undefined || ['restored', 'inferred', 'adjusted'].includes(q.ai), `${at}: ai가 ${q.ai}`)
    // 책과 대조하기 전의 자동 판정만 등록한다. broken은 export 단계에서 걸러진다.
    assert(['ok', 'minor'].includes(q.check), `${at}: check가 ${q.check} — 검수 안 된 문항은 등록하지 않는다`)
    for (const f of ['body', 'answer']) {
      assert(!q[f].split('\n').some((l) => /^[•·-]$/.test(l.trim())), `${at}: ${f}에 글자 없는 불릿 줄`)
    }
  }
  total += qs.length
  console.log(`ok ${file} — ${qs.length}문항`)
}
console.log(`총 ${total}문항 이상 없음`)
