import { useEffect, useState } from 'react'
import { Nav } from './Nav.tsx'
import {
  CIRCLED,
  SUBJECTS,
  TIME_LIMIT_MIN,
  byKey,
  hms,
  renderBody,
  saveMock,
  type Attempt,
  type Saved,
} from './lib.tsx'

type Props = {
  mode: 'mock100' | 'mock_short'
  saved: Saved
  record: (rows: Omit<Attempt, 'answered_at'>[]) => Promise<number[]>
  marks: Set<string>
  toggleMark: (key: string) => void
  onSubmit: (elapsedMs: number) => void
  onExit: () => void
}

export function Exam({ mode, saved, record, marks, toggleMark, onSubmit, onExit }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(saved.answers)
  const [idx, setIdx] = useState(saved.idx)
  const [now, setNow] = useState(Date.now())
  const questions = saved.keys.flatMap((k) => byKey.get(k) ?? [])
  const q = questions[idx]

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // 답을 고를 때마다 진행 상태를 덮어쓴다. 앱을 닫아도 이어풀 수 있다.
  useEffect(() => {
    if (mode === 'mock100') saveMock({ ...saved, answers, idx })
  }, [mode, saved, answers, idx])

  const unanswered = questions.filter((x) => answers[x.key] === undefined).length
  const limitMs = mode === 'mock100' ? TIME_LIMIT_MIN * 60_000 : 0
  const elapsed = now - saved.startedAt
  const left = limitMs - elapsed
  const over = limitMs > 0 && left < 0

  const submit = async () => {
    if (unanswered && !confirm(`${unanswered}문항이 비어 있습니다. 제출하시겠습니까?`)) return
    await record(
      questions.map((x) => ({
        question_key: x.key,
        correct: answers[x.key] === x.answer,
        chosen: answers[x.key] ?? null,
        mode,
        session_id: saved.sessionId,
        note: null,
      })),
    )
    if (mode === 'mock100') saveMock(null)
    onSubmit(elapsed)
  }

  const exit = () => {
    if (mode === 'mock_short' && !confirm('진행 중인 문제는 저장되지 않습니다. 나가시겠습니까?')) return
    onExit()
  }

  if (!q) return null
  const subject = SUBJECTS.find((s) => s.id === q.subject)

  return (
    <>
      <Nav
        title={mode === 'mock100' ? '모의고사' : '간단 모의'}
        meta={`${subject?.short} · ${idx + 1}`}
        onBack={exit}
      />
      <div className="screen">
        <div className="timer">
          <div>
            <div className="tl">{limitMs ? (over ? '초과' : '남은 시간') : '경과'}</div>
            <div className={over ? 'tv over' : 'tv'}>
              {over ? '+' : ''}
              {hms(limitMs ? left : elapsed)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="tl">진행</div>
            <div className="prog">
              {questions.length - unanswered} / {questions.length}
            </div>
          </div>
        </div>

        <p className="qbody">{renderBody(q.body)}</p>
        {q.stimulus && <div className="stimulus">{renderBody(q.stimulus)}</div>}
        {q.note && (
          <div className="callout">
            <span className="cot">원본 정오표</span>
            <p>{q.note}</p>
          </div>
        )}

        <div className="choices">
          {(q.choices ?? []).map((c, i) => (
            <button
              key={i}
              className="ch"
              role="radio"
              aria-checked={answers[q.key] === String(i)}
              onClick={() => setAnswers((a) => ({ ...a, [q.key]: String(i) }))}
            >
              <span className="no">{CIRCLED[i]}</span>
              <span>{renderBody(c)}</span>
            </button>
          ))}
        </div>

        <div className="row">
          <button className="btn weak" onClick={() => toggleMark(q.key)}>
            {marks.has(q.key) ? '★' : '☆'}
          </button>
          <button className="btn weak" style={{ flex: 2 }} disabled={!idx} onClick={() => setIdx((i) => i - 1)}>
            ← 이전
          </button>
          <button
            className="btn"
            style={{ flex: 2 }}
            disabled={idx >= questions.length - 1}
            onClick={() => setIdx((i) => i + 1)}
          >
            다음 →
          </button>
        </div>

        <div>
          <div className="label" style={{ marginBottom: 8 }}>
            답안지
          </div>
          <div className="omr">
            {questions.map((x, i) => (
              <button
                key={x.key}
                className={i === idx ? 'now' : marks.has(x.key) ? 'mark' : answers[x.key] !== undefined ? 'done' : ''}
                onClick={() => setIdx(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="legend" style={{ marginTop: 9 }}>
            <span>
              <b style={{ background: 'var(--accent)' }} />
              현재
            </span>
            <span>
              <b style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }} />
              답 표시
            </span>
            <span>
              <b style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-line)' }} />
              북마크
            </span>
            <span>
              <b style={{ border: '1px solid var(--line-soft)' }} />
              미응답
            </span>
          </div>
        </div>

        <div className="row">
          <button className="btn weak" onClick={exit}>
            {mode === 'mock100' ? '나가기 (진행 저장)' : '나가기'}
          </button>
          <button className="btn" onClick={submit}>
            {unanswered ? `제출 · ${unanswered}문항 남음` : '제출'}
          </button>
        </div>
      </div>
    </>
  )
}
