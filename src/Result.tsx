import { useState } from 'react'
import { Nav } from './Nav.tsx'
import { typeLabel } from './Setup.tsx'
import {
  CIRCLED,
  CopyBtn,
  SUBJECTS,
  byKey,
  duration,
  pct,
  renderBody,
  type Attempt,
  type FlagKind,
  type Mode,
} from './lib.tsx'

type Props = {
  mode: Mode
  sessionId: string
  elapsedMs: number
  attempts: Attempt[]
  marks: Set<string>
  hidden: Set<string>
  toggle: (key: string, kind: FlagKind) => void
  onReview: (keys: string[]) => void
  onHome: () => void
}

export function Result({ mode, sessionId, elapsedMs, attempts, marks, hidden, toggle, onReview, onHome }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const rows = attempts.filter((a) => a.session_id === sessionId)
  const correct = rows.filter((a) => a.correct).length
  const rate = pct(correct, rows.length)
  const wrong = rows.filter((a) => !a.correct).map((a) => a.question_key)

  const perSubject = SUBJECTS.map((s) => {
    const mine = rows.filter((a) => byKey.get(a.question_key)?.subject === s.id)
    const ok = mine.filter((a) => a.correct).length
    return { ...s, total: mine.length, ok, rate: mine.length ? ok / mine.length : 0 }
  }).filter((s) => s.total)

  return (
    <>
      <Nav
        title={`${typeLabel(byKey.get(rows[0]?.question_key)?.type ?? 'mc')} ${mode === 'mock_short' ? '모의' : '연습'} 결과`}
        meta={duration(elapsedMs)}
        onBack={onHome}
      />
      <main className="screen">
        <div className="score ok">
          <span className="big">{rate}%</span>
          <span className="pt">
            {correct} / {rows.length}
          </span>
        </div>

        {perSubject.length > 1 && (
          <div>
            <div className="label" style={{ marginBottom: 10 }}>
              과목별 점수
            </div>
            <div className="bars">
              {perSubject.map((s, i) => (
                <div className="gbar" key={s.id}>
                  <span className="bn">{s.short}</span>
                  <span className="track">
                    {/* 120ms는 점수 카드가 먼저 자리잡길 기다리는 값. 이후 50ms씩 어긋나며 찬다 */}
                    <span
                      className="fill"
                      style={{ transform: `scaleX(${s.rate})`, transitionDelay: `${120 + i * 50}ms` }}
                    />
                  </span>
                  <span className="bv">
                    {s.ok}/{s.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="label" style={{ marginBottom: 8 }}>
            문제 다시 보기
          </div>
          <div className="omr">
            {rows.map((a, i) => (
              <button
                key={a.question_key}
                className={`${a.correct ? 'ok' : 'miss'}${i === open ? ' now' : ''}`}
                aria-expanded={i === open}
                onClick={() => setOpen((o) => (o === i ? null : i))}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="legend" style={{ marginTop: 9 }}>
            <span>
              <b style={{ background: 'var(--pass-soft)', border: '1px solid var(--pass)' }} />
              정답
            </span>
            <span>
              <b style={{ background: 'var(--fail-soft)', border: '1px solid var(--fail)' }} />
              오답
            </span>
          </div>
          {open !== null && (
            <Detail
              no={open + 1}
              attempt={rows[open]}
              flags={
                // 간단 모의에서만 상세에 북마크/관심없음 버튼을 노출한다
                mode === 'mock_short' ? { marks, hidden, toggle } : undefined
              }
            />
          )}
        </div>

        <button className="btn" disabled={!wrong.length} onClick={() => onReview(wrong)}>
          틀린 문제 {wrong.length}개 모아 풀기
        </button>
        <button className="btn weak" onClick={onHome}>
          홈으로
        </button>
      </main>
    </>
  )
}

/** 채점 후에만 열리는 패널이라 정답을 그대로 보여준다 */
function Detail({
  no,
  attempt,
  flags,
}: {
  no: number
  attempt: Attempt
  flags?: { marks: Set<string>; hidden: Set<string>; toggle: (key: string, kind: FlagKind) => void }
}) {
  const q = byKey.get(attempt.question_key)
  if (!q) return null
  const mc = q.type === 'mc'
  const label = (v: string) => (mc ? (CIRCLED[Number(v)] ?? v) : v)

  return (
    <div className="detail">
      <div role="status" className={attempt.correct ? 'verdict ok' : 'verdict'}>
        <span className="vt">
          {no}번 · {attempt.correct ? '정답' : attempt.chosen === null ? '무응답' : '오답'}
        </span>
        <span className="vd">
          정답 {label(q.answer)}
          {!attempt.correct && attempt.chosen !== null && ` · 내 답 ${label(attempt.chosen)}`}
        </span>
      </div>
      <p className="qbody">{renderBody(q.body)}</p>
      {q.stimulus && <div className="stimulus">{renderBody(q.stimulus)}</div>}
      {mc && (
        <div className="choices">
          {(q.choices ?? []).map((c, i) => (
            <div
              key={i}
              className={
                String(i) === q.answer ? 'ch correct' : String(i) === attempt.chosen ? 'ch wrong' : 'ch'
              }
            >
              <span className="no">{CIRCLED[i]}</span>
              <span>{renderBody(c)}</span>
              {String(i) === q.answer && <span className="mk">정답</span>}
              {!attempt.correct && String(i) === attempt.chosen && <span className="mk">내 답</span>}
            </div>
          ))}
        </div>
      )}
      {flags && (
        <div className="row">
          <button className="btn weak" onClick={() => flags.toggle(q.key, 'mark')}>
            {flags.marks.has(q.key) ? '★ 북마크' : '☆ 북마크'}
          </button>
          <button
            className="btn weak"
            title="이 문제를 다시 출제하지 않습니다"
            onClick={() => flags.toggle(q.key, 'hide')}
          >
            {flags.hidden.has(q.key) ? '관심 없음 해제' : '관심 없음'}
          </button>
        </div>
      )}
      <CopyBtn q={q} />
    </div>
  )
}
