import { useEffect, useRef, useState } from 'react'
import { Nav } from './Nav.tsx'
import { SUBJECTS, byKey, renderBody, type Attempt } from './lib.tsx'

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

  const answer = (chosen: 'O' | 'X') => {
    if (!q || flash) return
    const ok = q.answer === chosen
    setFlash({ chosen, ok })
    setLast({ body: q.body, answer: q.answer, ok })
    setHistory((h) => [...h, ok].slice(-8))
    void record([
      { question_key: q.key, correct: ok, chosen, mode: 'ox', session_id: session.id, note: null },
    ])
    timer.current = setTimeout(
      () => {
        setFlash(null)
        if (idx + 1 >= questions.length) onDone(session.id, Date.now() - session.startedAt)
        else setIdx(idx + 1)
      },
      ok ? 450 : 1100,
    )
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'o' || e.key === 'O') answer('O')
      if (e.key === 'x' || e.key === 'X') answer('X')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!q) return null
  const streak = history.length - 1 - history.lastIndexOf(false)
  const subject = SUBJECTS.find((s) => s.id === q.subject)

  return (
    <>
      <Nav title="OX 특강" meta={`${subject?.short} · ${idx + 1}/${questions.length}`} onBack={onExit} />
      <div className="screen">
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

        <div className="ox">
          {(['O', 'X'] as const).map((v) => (
            <button
              key={v}
              className={flash?.chosen === v ? (flash.ok ? 'correct' : 'wrong') : ''}
              onClick={() => answer(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="keys" style={{ justifyContent: 'center' }}>
          <span className="kb">O</span> 또는 <span className="kb">X</span>
        </div>

        {last && (
          <div className="callout">
            <span className="cot">직전 문제 · {last.ok ? '정답' : '오답'}</span>
            <p>
              {renderBody(last.body)} — <strong>{last.answer}</strong>
            </p>
          </div>
        )}
      </div>
    </>
  )
}
