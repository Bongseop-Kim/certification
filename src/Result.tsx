import { Nav } from './Nav.tsx'
import {
  PASS_AVERAGE,
  PASS_SUBJECT,
  SUBJECTS,
  TIME_LIMIT_MIN,
  byKey,
  duration,
  pct,
  type Attempt,
  type Mode,
} from './lib.tsx'

type Props = {
  mode: Mode
  sessionId: string
  elapsedMs: number
  attempts: Attempt[]
  onReview: (keys: string[]) => void
  onHome: () => void
}

export function Result({ mode, sessionId, elapsedMs, attempts, onReview, onHome }: Props) {
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
      <div className="screen">
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

        <button className="btn" disabled={!wrong.length} onClick={() => onReview(wrong)}>
          틀린 문제 {wrong.length}개 모아 풀기
        </button>
        <button className="btn weak" onClick={onHome}>
          홈으로
        </button>
      </div>
    </>
  )
}
