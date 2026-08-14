import { useState } from 'react'
import { Nav } from './Nav.tsx'
import {
  lookup,
  normalizeShortAnswer,
  renderBody,
  subjectTag,
  type Attempt,
} from './lib.tsx'

type Props = {
  keys: string[]
  mode: 'short' | 'memo'
  record: (rows: Omit<Attempt, 'answered_at'>[]) => Promise<number[]>
  onDone: (sessionId: string, elapsedMs: number) => void
  onExit: () => void
}

export function Short({ keys, mode, record, onDone, onExit }: Props) {
  const [session] = useState(() => ({ id: crypto.randomUUID(), startedAt: Date.now() }))
  const questions = keys.flatMap((key) => lookup(key) ?? [])
  const [idx, setIdx] = useState(0)
  const [chosen, setChosen] = useState('')
  const [graded, setGraded] = useState<{ chosen: string; ok: boolean }>()
  const q = questions[idx]

  const submit = () => {
    const answer = chosen.trim()
    if (!q || !answer || graded) return
    const ok = normalizeShortAnswer(answer) === normalizeShortAnswer(q.answer)
    setGraded({ chosen: answer, ok })
    void record([
      { question_key: q.key, correct: ok, chosen: answer, mode, session_id: session.id, note: null },
    ])
  }

  const next = () => {
    if (idx + 1 >= questions.length) return onDone(session.id, Date.now() - session.startedAt)
    setIdx((i) => i + 1)
    setChosen('')
    setGraded(undefined)
  }

  if (!q) return null

  return (
    <>
      <Nav
        title={mode === 'memo' ? '암기 카드' : '단답 특강'}
        meta={`${subjectTag(q.subject)} · ${idx + 1}/${questions.length}`}
        onBack={onExit}
      />
      <form
        className="screen"
        onSubmit={(event) => {
          event.preventDefault()
          if (graded) next()
          else submit()
        }}
      >
        <p className="qbody" style={{ fontSize: 17, padding: '22px 0' }}>
          {renderBody(q.body)}
        </p>
        {q.stimulus && <div className="stimulus">{renderBody(q.stimulus)}</div>}

        <label className="short-answer">
          <span className="label">정답</span>
          <input
            autoFocus
            value={chosen}
            disabled={Boolean(graded)}
            placeholder="정답을 입력하세요"
            onChange={(event) => setChosen(event.target.value)}
          />
        </label>

        {graded && (
          <div className={graded.ok ? 'verdict ok' : 'verdict'}>
            <span className="vt">{graded.ok ? '정답입니다' : '오답입니다'}</span>
            {!graded.ok && <span className="vd">정답 {q.answer}</span>}
          </div>
        )}

        <button className="btn" type="submit" disabled={!graded && !chosen.trim()}>
          {graded ? (idx + 1 >= questions.length ? '결과 보기' : '다음 문제') : '채점'}
        </button>
      </form>
    </>
  )
}
