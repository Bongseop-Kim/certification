import { useEffect, useState } from 'react'
import { Nav } from './Nav.tsx'
import {
  CIRCLED,
  CopyBtn,
  subjectTag,
  byKey,
  hms,
  renderBody,
  type Attempt,
  type Saved,
} from './lib.tsx'

type Props = {
  saved: Saved
  record: (rows: Omit<Attempt, 'answered_at'>[]) => Promise<number[]>
  marks: Set<string>
  toggleMark: (key: string) => void
  onSubmit: (elapsedMs: number) => void
  onExit: () => void
}

export function Exam({ saved, record, marks, toggleMark, onSubmit, onExit }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(saved.answers)
  const [idx, setIdx] = useState(saved.idx)
  const [now, setNow] = useState(Date.now())
  const questions = saved.keys.flatMap((k) => byKey.get(k) ?? [])
  const q = questions[idx]

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const unanswered = questions.filter((x) => answers[x.key] === undefined).length
  const elapsed = now - saved.startedAt

  const submit = async () => {
    if (unanswered && !confirm(`${unanswered}문항이 비어 있습니다. 제출하시겠습니까?`)) return
    await record(
      questions.map((x) => ({
        question_key: x.key,
        correct: answers[x.key] === x.answer,
        chosen: answers[x.key] ?? null,
        mode: 'mock_short',
        session_id: saved.sessionId,
        note: null,
      })),
    )
    onSubmit(elapsed)
  }

  const exit = () => {
    if (!confirm('진행 중인 문제는 저장되지 않습니다. 나가시겠습니까?')) return
    onExit()
  }

  if (!q) return null

  return (
    <>
      <Nav title="간단 모의" meta={`${subjectTag(q.subject)} · ${idx + 1}`} onBack={exit} />
      <main className="screen">
        <div className="timer">
          <div>
            <div className="tl">경과</div>
            <div className="tv">{hms(elapsed)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="tl">진행</div>
            <div className="prog">
              {questions.length - unanswered} / {questions.length}
            </div>
          </div>
        </div>

        {q.variantOf && (
          <div className="qchips">
            <span className="qchip variant">변형 문제</span>
          </div>
        )}
        <p className="qbody">{renderBody(q.body)}</p>
        {q.stimulus && <div className="stimulus">{renderBody(q.stimulus)}</div>}
        {/* ponytail: 정오표(note)는 문제 푸는 중엔 안 보여준다 — "2번을 누르면 정답"이 답을 불어버린다.
            모의고사는 채점 화면이 따로라, 여기선 아예 렌더하지 않는다. 연습형은 채점 후에 보여준다. */}

        <div className="choices" role="radiogroup" aria-label="보기">
          {(q.choices ?? []).map((c, i) => (
            <label
              key={i}
              className={answers[q.key] === String(i) ? 'ch selected' : 'ch'}
            >
              <input
                className="sr-only"
                type="radio"
                name="exam-choice"
                checked={answers[q.key] === String(i)}
                onChange={() => setAnswers((a) => ({ ...a, [q.key]: String(i) }))}
              />
              <span className="no">{CIRCLED[i]}</span>
              <span>{renderBody(c)}</span>
            </label>
          ))}
        </div>

        <CopyBtn q={q} />

        <div className="row">
          <button className="btn weak" aria-label="북마크" onClick={() => toggleMark(q.key)}>
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

        {/* 제출은 답안지 100칸 아래라 매번 스크롤해야 했다 — 이 줄만 하단 고정.
            이전/다음은 선택지 바로 아래(답안지 위)라 이미 스크롤 없이 닿는다. */}
        <div className="dock">
          <div className="row">
            <button className="btn weak" onClick={exit}>
              나가기
            </button>
            <button className="btn" onClick={submit}>
              {unanswered ? `제출 · ${unanswered}문항 남음` : '제출'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
