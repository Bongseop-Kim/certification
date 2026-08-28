import { useState } from 'react'
import { Nav } from './Nav.tsx'
import {
  CIRCLED,
  CopyBtn,
  PASS_AVERAGE,
  PASS_SUBJECT,
  SUBJECTS,
  TIME_LIMIT_MIN,
  byKey,
  duration,
  lookup,
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

  // 과락은 100문항 모의고사에서만 판정한다. 과목 하나짜리 짧은 세트엔 성립하지 않는 개념.
  const full = mode === 'mock100'
  const perSubject = SUBJECTS.map((s) => {
    const mine = rows.filter((a) => byKey.get(a.question_key)?.subject === s.id)
    const ok = mine.filter((a) => a.correct).length
    return { ...s, total: mine.length, ok, rate: mine.length ? ok / mine.length : 0 }
  }).filter((s) => s.total)
  const failed = perSubject.filter((s) => s.rate < PASS_SUBJECT)
  const passed = full && !failed.length && correct / rows.length >= PASS_AVERAGE
  const over = elapsedMs - TIME_LIMIT_MIN * 60_000

  return (
    <>
      <Nav
        title={
          full
            ? '모의고사 결과'
            : mode === 'ox'
              ? 'OX 결과'
              : mode === 'short'
                ? '단답 결과'
                : mode === 'memo'
                  ? '암기 결과'
                  : '간단 모의 결과'
        }
        meta={duration(elapsedMs)}
        onBack={onHome}
      />
      <main className="screen">
        <div className={passed || !full ? 'score ok' : 'score'}>
          <span className="big">{full ? (passed ? '합격' : '불합격') : `${rate}%`}</span>
          <span className="pt">
            {correct} / {rows.length}
            {full && ` · 평균 ${rate}%`}
          </span>
          {full && (
            <span className="why">
              {passed
                ? `전 과목 ${Math.round(PASS_SUBJECT * 100)}% 이상, 평균 ${Math.round(PASS_AVERAGE * 100)}% 이상을 넘겼습니다.`
                : failed.length
                  ? `${failed.map((s) => `${s.label} ${pct(s.ok, s.total)}%`).join(', ')}가 과락 기준 ${Math.round(PASS_SUBJECT * 100)}%에 못 미칩니다.`
                  : `과락은 없지만 평균 ${rate}%가 합격 기준 ${Math.round(PASS_AVERAGE * 100)}%에 못 미칩니다.`}
            </span>
          )}
        </div>

        {perSubject.length > 1 && (
          <div>
            <div className="label" style={{ marginBottom: 10 }}>
              과목별 점수{full && ' — 세로선이 과락 기준 40%'}
            </div>
            <div className="bars">
              {perSubject.map((s, i) => {
                const low = full && s.rate < PASS_SUBJECT
                return (
                  <div className="gbar" key={s.id}>
                    <span className="bn">{s.short}</span>
                    <span className="track">
                      {/* 120ms는 점수 카드가 먼저 자리잡길 기다리는 값. 이후 50ms씩 어긋나며 찬다 */}
                      <span
                        className={low ? 'fill cut' : 'fill'}
                        style={{ transform: `scaleX(${s.rate})`, transitionDelay: `${120 + i * 50}ms` }}
                      />
                      {full && <span className="cutline" />}
                    </span>
                    <span className={low ? 'bv bad' : 'bv'}>
                      {s.ok}/{s.total}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {full && (
          <>
            <div className="callout">
              <span className="cot">판정 기준</span>
              <p>
                과목당 {Math.round(PASS_SUBJECT * 100)}% 이상 <strong>그리고</strong> 전 과목 평균{' '}
                {Math.round(PASS_AVERAGE * 100)}% 이상. 둘 중 하나라도 못 넘기면 불합격입니다.
              </p>
            </div>
            <div className="callout">
              <span className="cot">소요 시간</span>
              <p>
                {duration(elapsedMs)} · 제한 {TIME_LIMIT_MIN}분{' '}
                {over > 0 ? <strong>{duration(over)} 초과</strong> : <strong>안에 완료</strong>}
              </p>
            </div>
          </>
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
                // 모의고사·간단 모의에서만 상세에 북마크/관심없음 버튼을 노출한다
                mode === 'mock100' || mode === 'mock_short' ? { marks, hidden, toggle } : undefined
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

/** 채점 후에만 열리는 패널이라 정답도 원본 정오표도 그대로 보여준다 */
function Detail({
  no,
  attempt,
  flags,
}: {
  no: number
  attempt: Attempt
  flags?: { marks: Set<string>; hidden: Set<string>; toggle: (key: string, kind: FlagKind) => void }
}) {
  const q = lookup(attempt.question_key)
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
      {q.note && (
        <div className="callout">
          <span className="cot">원본 정오표</span>
          <p>{q.note}</p>
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
