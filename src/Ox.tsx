import { useEffect, useRef, useState } from 'react'
import { Nav } from './Nav.tsx'
import { byKey, renderBody, subjectTag, type Attempt } from './lib.tsx'

type Props = {
  keys: string[]
  record: (rows: Omit<Attempt, 'answered_at'>[]) => Promise<number[]>
  onDone: (sessionId: string, elapsedMs: number) => void
  onExit: () => void
}

export function Ox({ keys, record, onDone, onExit }: Props) {
  const [session] = useState(() => ({ id: crypto.randomUUID(), startedAt: Date.now() }))
  const questions = keys.flatMap((k) => byKey.get(k) ?? [])
  const [idx, setIdx] = useState(0)
  const [flash, setFlash] = useState<{ chosen: string; ok: boolean } | null>(null)
  const [last, setLast] = useState<{ body: string; answer: string; ok: boolean } | null>(null)
  const [history, setHistory] = useState<boolean[]>([])
  const timer = useRef<number>(0)

  const q = questions[idx]

  const advance = () => {
    setFlash(null)
    if (idx + 1 >= questions.length) onDone(session.id, Date.now() - session.startedAt)
    else setIdx(idx + 1)
  }

  // 정답은 450ms 뒤 자동으로 넘어간다. 오답은 넘기지 않는다 — 정답을 읽는 데 걸리는
  // 시간은 사람마다 달라서 고정 타이머로 정할 수 없다.
  const answer = (chosen: 'O' | 'X') => {
    if (!q || flash) return
    const ok = q.answer === chosen
    setFlash({ chosen, ok })
    setLast({ body: q.body, answer: q.answer, ok })
    setHistory((h) => [...h, ok].slice(-8))
    void record([
      { question_key: q.key, correct: ok, chosen, mode: 'ox', session_id: session.id, note: null },
    ])
    if (ok) timer.current = setTimeout(advance, 450)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (flash && !flash.ok) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          advance()
        }
        return
      }
      if (e.key === 'o' || e.key === 'O') answer('O')
      if (e.key === 'x' || e.key === 'X') answer('X')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!q) return null
  const streak = history.length - 1 - history.lastIndexOf(false)

  return (
    <>
      <Nav title="OX 특강" meta={`${subjectTag(q.subject)} · ${idx + 1}/${questions.length}`} onBack={onExit} />
      <main className="screen">
        <div className="streak">
          <span>연속 {streak}개</span>
          <span className="dots">
            {history.map((ok, i) => (
              <b key={i} className={ok ? '' : 'miss'} />
            ))}
          </span>
        </div>

        <p className="qbody" style={{ fontSize: 17, padding: '22px 0' }}>
          {renderBody(q.body)}
        </p>

        {/* 정오답을 테두리 색으로만 알리면 색각이상 사용자가 구분 못 한다 (WCAG 1.4.1) */}
        <div className="ox" role="group" aria-label="OX 선택">
          {(['O', 'X'] as const).map((v) => (
            <button
              key={v}
              className={flash?.chosen === v ? (flash.ok ? 'correct' : 'wrong') : ''}
              aria-label={flash?.chosen === v ? `${v}, ${flash.ok ? '정답' : '오답'}` : v}
              disabled={Boolean(flash)}
              onClick={() => answer(v)}
            >
              {v}
              {flash?.chosen === v && <span aria-hidden="true"> {flash.ok ? '✓' : '✗'}</span>}
            </button>
          ))}
        </div>

        {flash && !flash.ok && (
          <button className="btn" onClick={advance}>
            다음 문제 →
          </button>
        )}

        {last && (
          <div role="status" className="callout">
            <span className="cot">
              {flash ? '이 문제' : '직전 문제'} · {last.ok ? '정답' : '오답'}
            </span>
            <p>
              {renderBody(last.body)} — <strong>{last.answer}</strong>
            </p>
          </div>
        )}
      </main>
    </>
  )
}
