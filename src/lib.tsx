import { createClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

/* ---------- 문제 (원본은 레포의 JSON, DB에 없다) ---------- */

export type Subject = 'system' | 'network' | 'app' | 'general' | 'law'

export type Question = {
  key: string
  no: number
  subject: Subject
  type: 'mc' | 'ox' | 'short'
  body: string
  stimulus: string | null
  choices: string[] | null
  answer: string // mc는 0부터 세는 보기 인덱스, ox는 'O' | 'X', short는 정답 문자열
  note: string | null // 원본 정오표
  source: string
  variantOf?: string // 변형 문제일 때 원본 문제 key
}

export const SUBJECTS: { id: Subject; label: string; short: string }[] = [
  { id: 'system', label: '시스템 보안', short: '시스템' },
  { id: 'network', label: '네트워크 보안', short: '네트워크' },
  { id: 'app', label: '애플리케이션 보안', short: '애플리케이션' },
  { id: 'general', label: '정보보안 일반', short: '보안 일반' },
  { id: 'law', label: '정보보안 관리 및 법규', short: '관리·법규' },
]

// ponytail: 회차 JSON을 빌드에 번들. 파일을 추가하면 그대로 잡힌다.
const files = import.meta.glob<Question[]>('../questions/written/*.json', {
  eager: true,
  import: 'default',
})
export const QUESTIONS = Object.keys(files)
  .sort()
  .flatMap((f) => files[f])
export const MC = QUESTIONS.filter((q) => q.type === 'mc')
export const OX = QUESTIONS.filter((q) => q.type === 'ox')
export const SHORT = QUESTIONS.filter((q) => q.type === 'short')
export const byKey = new Map(QUESTIONS.map((q) => [q.key, q]))

export const PASS_SUBJECT = 0.4
export const PASS_AVERAGE = 0.6
export const TIME_LIMIT_MIN = 150
export const PER_SUBJECT = 20
export const CIRCLED = ['①', '②', '③', '④', '⑤']

/* ---------- 풀이 기록 (여기만 서버) ---------- */

export type Mode = 'practice' | 'mock100' | 'mock_short' | 'ox' | 'short' | 'review'

export type Attempt = {
  id?: number
  question_key: string
  answered_at: string
  correct: boolean
  chosen: string | null
  mode: Mode
  session_id: string | null
  note: string | null
}

export const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export function useAttempts() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ponytail: attempts 전량 로드. 수만 행 넘어 느려지면 answered_at 기준 .range()
    sb.from('attempts')
      .select('*')
      .order('answered_at')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setAttempts(data as Attempt[])
        setLoading(false)
      })
  }, [])

  /** 낙관적으로 화면에 먼저 반영하고 insert. 반환값은 insert된 행 id들 */
  const record = useCallback(async (rows: Omit<Attempt, 'answered_at'>[]) => {
    const stamped = rows.map((r) => ({ ...r, answered_at: new Date().toISOString() }))
    setAttempts((prev) => [...prev, ...stamped])
    const { data, error } = await sb.from('attempts').insert(stamped).select('id')
    if (error) setError(error.message)
    return (data ?? []).map((r) => r.id as number)
  }, [])

  const addNote = useCallback(async (id: number, note: string) => {
    setAttempts((prev) => prev.map((a) => (a.id === id ? { ...a, note } : a)))
    const { error } = await sb.from('attempts').update({ note }).eq('id', id)
    if (error) setError(error.message)
  }, [])

  return { attempts, record, addNote, error, loading }
}

/* ---------- 집계 (뷰도 RPC도 만들지 않는다) ---------- */

export type Stat = { tries: number; correct: number; last: string; notes: string[]; lastCorrect: boolean }

export function statsByKey(attempts: Attempt[]) {
  const m = new Map<string, Stat>()
  for (const a of attempts) {
    const s = m.get(a.question_key) ?? { tries: 0, correct: 0, last: '', notes: [], lastCorrect: true }
    s.tries++
    if (a.correct) s.correct++
    if (a.answered_at >= s.last) {
      s.last = a.answered_at
      s.lastCorrect = a.correct
    }
    if (a.note) s.notes.push(a.note)
    m.set(a.question_key, s)
  }
  return m
}

export function subjectRates(stats: Map<string, Stat>) {
  const m = new Map<Subject, { tries: number; correct: number }>()
  for (const [key, s] of stats) {
    const q = byKey.get(key)
    if (!q) continue // JSON에서 사라진 문제의 기록은 무시
    const acc = m.get(q.subject) ?? { tries: 0, correct: 0 }
    acc.tries += s.tries
    acc.correct += s.correct
    m.set(q.subject, acc)
  }
  return m
}

/** 마지막 시도가 오답인 문제. 최근 오답이 먼저 온다 */
export function wrongKeys(stats: Map<string, Stat>, hidden: Set<string>) {
  return [...stats]
    .filter(([key, s]) => !s.lastCorrect && byKey.has(key) && !hidden.has(key))
    .sort((a, b) => b[1].last.localeCompare(a[1].last))
    .map(([key]) => key)
}

export function shuffle<T>(xs: readonly T[]) {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 단답 채점에서는 띄어쓰기·대소문자·가운뎃점 같은 표기 차이를 무시한다. */
export const normalizeShortAnswer = (answer: string) =>
  answer.normalize('NFKC').toLocaleLowerCase('ko').replace(/[\s·.()_\-/]/g, '')

/** 안 푼 문제 → 정답률 낮은 문제 → 맞은 문제 (동률은 랜덤) */
export function weakFirst(qs: readonly Question[], stats: Map<string, Stat>) {
  const rate = (q: Question) => {
    const s = stats.get(q.key)
    return !s || s.tries === 0 ? -1 : s.correct / s.tries
  }
  return shuffle(qs).sort((a, b) => rate(a) - rate(b))
}

/* ---------- 문제당 플래그: 북마크(mark) · 관심 없음(hide) ---------- */

// ponytail: 둘은 모양이 같은 "문제당 표시"라 테이블 하나에 kind로 구분한다. 토글은 insert/delete.
export type FlagKind = 'mark' | 'hide'

// 북마크가 localStorage에만 있던 시절의 키. 첫 로드에 flags로 옮기고 지운다.
const BM_KEY = 'bookmarks'

/** 출제 후보에서 '관심 없음'을 걷어낸다 */
export const visible = (qs: readonly Question[], hidden: Set<string>) =>
  qs.filter((q) => !hidden.has(q.key))

export function useFlags() {
  const [marks, setMarks] = useState<Set<string>>(new Set())
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string>()

  useEffect(() => {
    void (async () => {
      const old = JSON.parse(localStorage.getItem(BM_KEY) ?? 'null') as string[] | null
      if (old) {
        const { error } = old.length
          ? await sb
              .from('flags')
              .upsert(
                old.map((question_key) => ({ question_key, kind: 'mark' })),
                { ignoreDuplicates: true },
              )
          : { error: null }
        // 옮기기가 실패하면 키를 남겨 다음 로드에 다시 시도한다
        if (error) setError(error.message)
        else localStorage.removeItem(BM_KEY)
      }
      const { data, error } = await sb.from('flags').select('question_key, kind')
      if (error) return setError(error.message)
      const of = (kind: FlagKind) =>
        new Set(data.filter((r) => r.kind === kind).map((r) => r.question_key as string))
      setMarks(of('mark'))
      setHidden(of('hide'))
    })()
  }, [])

  /** 낙관적으로 화면에 먼저 반영하고 서버에 쓴다 */
  const toggle = useCallback(
    async (key: string, kind: FlagKind) => {
      const on = !(kind === 'mark' ? marks : hidden).has(key)
      const setter = kind === 'mark' ? setMarks : setHidden
      setter((prev) => {
        const next = new Set(prev)
        if (on) next.add(key)
        else next.delete(key)
        return next
      })
      const { error } = on
        ? await sb.from('flags').upsert({ question_key: key, kind }, { ignoreDuplicates: true })
        : await sb.from('flags').delete().eq('question_key', key).eq('kind', kind)
      if (error) setError(error.message)
    },
    [marks, hidden],
  )

  return { marks, hidden, toggle, error }
}

/* ---------- 모의고사 중간 저장 (localStorage) ---------- */

export type Saved = {
  sessionId: string
  keys: string[]
  answers: Record<string, string>
  marked: string[]
  idx: number
  startedAt: number
}
const MOCK_KEY = 'mock100'

export function loadMock(): Saved | null {
  try {
    return JSON.parse(localStorage.getItem(MOCK_KEY) ?? 'null') as Saved | null
  } catch {
    return null
  }
}
export function saveMock(s: Saved | null) {
  if (s) localStorage.setItem(MOCK_KEY, JSON.stringify(s))
  else localStorage.removeItem(MOCK_KEY)
}

/* ---------- 표시 ---------- */

/** 지문 안의 백틱을 고정폭으로. `-rwsr-xr-x`에서 l과 1을 구분하려고 있다 */
export function renderBody(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
      <code key={i}>{part.slice(1, -1)}</code>
    ) : (
      part
    ),
  )
}

/** 문제 원문 그대로. 백틱은 남겨둔다 — 붙여넣는 쪽(에디터·AI)이 코드로 읽는다 */
export function qText(q: Question) {
  return [q.body, q.stimulus, ...(q.choices ?? []).map((c, i) => `${CIRCLED[i]} ${c}`)].filter(Boolean).join('\n')
}

export function CopyBtn({ q }: { q: Question }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className="copy"
      onClick={() => {
        void navigator.clipboard.writeText(qText(q))
        setDone(true)
        setTimeout(() => setDone(false), 1500)
      }}
    >
      {done ? '복사됨' : '문제 복사'}
    </button>
  )
}

/** SUBJECTS 순서가 곧 시험 과목 번호다 */
export const subjectTag = (id: Subject) => {
  const i = SUBJECTS.findIndex((s) => s.id === id)
  return `${i + 1}과목 ${SUBJECTS[i].short}`
}

export const pct = (correct: number, tries: number) => (tries ? Math.round((correct / tries) * 100) : 0)

export function hms(ms: number) {
  const t = Math.floor(Math.abs(ms) / 1000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(t / 3600))}:${p(Math.floor(t / 60) % 60)}:${p(t % 60)}`
}

export function duration(ms: number) {
  const min = Math.round(ms / 60000)
  return min >= 60 ? `${Math.floor(min / 60)}시간 ${min % 60}분` : `${min}분`
}

export function dayLabel(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function stampLabel(iso: string) {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`
}
