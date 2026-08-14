// 문제 JSON 무결성 검사. 회차를 추가한 뒤 이것만 돌린다: node scripts/check.mjs
// ponytail: 테스트 프레임워크 없음. 깨지면 exit 1 하는 assert가 전부다.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'

const DIRS = ['../questions/written/', '../questions/memo/'].map((d) => new URL(d, import.meta.url))
const SUBJECTS = ['system', 'network', 'app', 'general', 'law']
const seen = new Set()
const variants = []
let total = 0

for (const DIR of DIRS)
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
    } else if (q.type === 'ox') {
      assert(q.choices === null, `${at}: ox는 choices가 null`)
      assert(q.answer === 'O' || q.answer === 'X', `${at}: ox answer가 ${q.answer}`)
    } else if (q.type === 'short') {
      assert(q.choices === null, `${at}: short는 choices가 null`)
      assert(q.answer?.trim(), `${at}: short answer 없음`)
    } else {
      assert.fail(`${at}: 모르는 type ${q.type}`)
    }
  }
  // 암기 카드는 회상 훈련이 목적이라 전부 단답이어야 한다 (4지선다면 소거법으로 맞는다)
  const memo = DIR.href.includes('/memo/')
  if (memo) for (const q of qs) assert.equal(q.type, 'short', `${file} ${q.key}: 암기 카드는 short만`)
  // 기출 회차는 과목당 20문항 균등 (직접 만든 세트는 예외)
  if (!memo && qs.length === 100) {
    for (const s of SUBJECTS) {
      assert.equal(qs.filter((q) => q.subject === s).length, 20, `${file}: ${s} 20문항 아님`)
    }
  }
  total += qs.length
  console.log(`ok ${file} — ${qs.length}문항`)
}
for (const [at, original] of variants) assert(seen.has(original), `${at}: 원본 ${original} 없음`)
console.log(`총 ${total}문항 이상 없음`)
