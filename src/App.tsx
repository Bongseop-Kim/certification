import { useEffect, useState } from 'react'
import { Exam } from './Exam.tsx'
import { Memo } from './Memo.tsx'
import { History, type HistTab } from './History.tsx'
import { Nav } from './Nav.tsx'
import { Ox } from './Ox.tsx'
import { Practice } from './Practice.tsx'
import { Result } from './Result.tsx'
import { Setup } from './Setup.tsx'
import { Short } from './Short.tsx'
import {
  MC,
  MEMO,
  OX,
  SHORT,
  PASS_AVERAGE,
  PASS_SUBJECT,
  byKey,
  dayLabel,
  PER_SUBJECT,
  QUESTIONS,
  SUBJECTS,
  loadMock,
  memoDue,
  pct,
  saveMock,
  shuffle,
  statsByKey,
  stampLabel,
  subjectRates,
  useAttempts,
  useFlags,
  visible,
  wrongKeys,
  type Attempt,
  type Mode,
  type Saved,
} from './lib.tsx'

type View =
  | { s: 'home' }
  | { s: 'practice'; mode: 'practice' | 'review'; keys?: string[]; fromHistory?: boolean }
  | { s: 'setup'; mode: 'mock_short' | 'ox' | 'short' }
  | { s: 'exam'; mode: 'mock100' | 'mock_short'; saved: Saved }
  | { s: 'ox'; keys: string[] }
  | { s: 'short'; keys: string[]; mode: 'short' | 'memo' }
  | { s: 'result'; mode: Mode; sessionId: string; elapsedMs: number }
  | { s: 'memo' }
  | { s: 'history' }

/** 과목별 20문항, 과목 순서대로 배치한 100문항 */
// ponytail: 관심 없음이 많으면 과목별 20문항을 못 채워 100문항 미만이 된다.
// 합격 판정은 비율 기준이라 계산은 그대로 성립한다. 실제로 걸리면 그때 경고를 띄운다.
function newMock100(hidden: Set<string>): Saved {
  const keys = SUBJECTS.flatMap((s) =>
    shuffle(visible(MC, hidden).filter((q) => q.subject === s.id))
      .slice(0, PER_SUBJECT)
      .map((q) => q.key),
  )
  return { sessionId: crypto.randomUUID(), keys, answers: {}, marked: [], idx: 0, startedAt: Date.now() }
}

export default function App() {
  const { attempts, record, addNote, error, loading } = useAttempts()
  const { marks, hidden, toggle, error: flagError } = useFlags()
  const toggleMark = (key: string) => void toggle(key, 'mark')
  const [view, show] = useState<View>({ s: 'home' })
  const [histTab, setHistTab] = useState<HistTab>('weak')

  // 화면 전환을 히스토리에 남긴다. 안 그러면 모바일에서 뒤로 스와이프할 때
  // 앱 자체를 나가버려서 풀던 문제가 날아간다. View는 전부 직렬화 가능하다.
  const setView = (v: View) => {
    history.pushState({ view: v }, '')
    show(v)
  }
  useEffect(() => {
    const onPop = (e: PopStateEvent) => show((e.state as { view?: View } | null)?.view ?? { s: 'home' })
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  const home = () => setView({ s: 'home' })
  const stats = statsByKey(attempts)

  const screen = () => {
    switch (view.s) {
      case 'practice':
        return (
          <Practice
            mode={view.mode}
            keys={view.keys}
            stats={stats}
            record={record}
            addNote={addNote}
            marks={marks}
            hidden={hidden}
            toggle={toggle}
            onExit={view.fromHistory ? () => setView({ s: 'history' }) : home}
          />
        )
      case 'setup':
        return (
          <Setup
            mode={view.mode}
            stats={stats}
            hidden={hidden}
            onExit={home}
            onStart={(keys) =>
              view.mode === 'ox'
                ? setView({ s: 'ox', keys })
                : view.mode === 'short'
                  ? setView({ s: 'short', keys, mode: 'short' })
                  : setView({
                    s: 'exam',
                    mode: 'mock_short',
                    saved: { sessionId: crypto.randomUUID(), keys, answers: {}, marked: [], idx: 0, startedAt: Date.now() },
                  })
            }
          />
        )
      case 'exam':
        return (
          <Exam
            mode={view.mode}
            saved={view.saved}
            record={record}
            marks={marks}
            toggleMark={toggleMark}
            onExit={home}
            onSubmit={(elapsedMs) =>
              setView({ s: 'result', mode: view.mode, sessionId: view.saved.sessionId, elapsedMs })
            }
          />
        )
      case 'ox':
        return (
          <Ox
            keys={view.keys}
            record={record}
            onExit={home}
            onDone={(sessionId, elapsedMs) => setView({ s: 'result', mode: 'ox', sessionId, elapsedMs })}
          />
        )
      case 'short':
        return (
          <Short
            keys={view.keys}
            mode={view.mode}
            record={record}
            onExit={home}
            onDone={(sessionId, elapsedMs) => setView({ s: 'result', mode: view.mode, sessionId, elapsedMs })}
          />
        )
      case 'result':
        return (
          <Result
            mode={view.mode}
            sessionId={view.sessionId}
            elapsedMs={view.elapsedMs}
            attempts={attempts}
            onHome={home}
            onReview={(keys) =>
              setView(
                view.mode === 'ox'
                  ? { s: 'ox', keys }
                  : view.mode === 'short' || view.mode === 'memo'
                    ? { s: 'short', keys, mode: view.mode }
                    : { s: 'practice', mode: 'review', keys },
              )
            }
          />
        )
      case 'memo':
        return (
          <Memo hidden={hidden} onExit={home} />
        )
      case 'history':
        return (
          <History
            stats={stats}
            tab={histTab}
            setTab={setHistTab}
            marks={marks}
            hidden={hidden}
            toggle={toggle}
            onExit={home}
            onSolve={(keys) => setView({ s: 'practice', mode: 'review', keys, fromHistory: true })}
          />
        )
      default:
        return (
          <Home
            stats={stats}
            marks={marks}
            hidden={hidden}
            attempts={attempts}
            loading={loading}
            error={error ?? flagError}
            setView={setView}
          />
        )
    }
  }

  return <div className="app">{screen()}</div>
}

function Home({
  stats,
  marks,
  hidden,
  attempts,
  loading,
  error,
  setView,
}: {
  stats: ReturnType<typeof statsByKey>
  marks: Set<string>
  hidden: Set<string>
  attempts: Attempt[]
  loading: boolean
  error?: string
  setView: (v: View) => void
}) {
  const rates = subjectRates(stats)
  const wrong = wrongKeys(stats, hidden)
  const memo = memoDue(attempts, hidden)
  const marked = [...marks].filter((k) => byKey.has(k) && !hidden.has(k))
  const pool = visible(MC, hidden)
  const resume = loadMock()
  const solved = pool.filter((q) => stats.has(q.key)).length
  const unseen = pool.length - solved
  const review = [
    ...wrong.filter((k) => byKey.get(k)?.type === 'mc'),
    ...pool
      .filter((q) => {
        const s = stats.get(q.key)
        return s && s.tries > 1 && s.lastCorrect && s.correct / s.tries < 0.8
      })
      .sort((a, b) => {
        const sa = stats.get(a.key)!
        const sb = stats.get(b.key)!
        return sa.correct / sa.tries - sb.correct / sb.tries || sb.last.localeCompare(sa.last)
      })
      .map((q) => q.key),
  ].filter((k, i, keys) => keys.indexOf(k) === i).slice(0, 10)

  const latestMock = (() => {
    const sessions = new Map<string, Attempt[]>()
    for (const a of attempts) {
      if (!a.session_id || (a.mode !== 'mock100' && a.mode !== 'mock_short')) continue
      sessions.set(a.session_id, [...(sessions.get(a.session_id) ?? []), a])
    }
    return [...sessions.values()].sort((a, b) =>
      b[b.length - 1].answered_at.localeCompare(a[a.length - 1].answered_at),
    )[0]
  })()

  const latestMockSummary = (() => {
    if (!latestMock) return null
    const correct = latestMock.filter((a) => a.correct).length
    const full = latestMock[0].mode === 'mock100'
    const failed = full && SUBJECTS.some((subject) => {
      const rows = latestMock.filter((a) => byKey.get(a.question_key)?.subject === subject.id)
      return rows.length > 0 && rows.filter((a) => a.correct).length / rows.length < PASS_SUBJECT
    })
    const passed = full && !failed && correct / latestMock.length >= PASS_AVERAGE
    return {
      title: full ? `최근 모의고사 · ${passed ? '합격' : '불합격'}` : '최근 간단 모의',
      detail: `${dayLabel(latestMock[0].answered_at)} · ${correct}/${latestMock.length} · ${pct(correct, latestMock.length)}%`,
    }
  })()

  const startMock100 = () => {
    if (resume && !confirm('진행 중인 모의고사가 있습니다. 새로 시작하면 사라집니다.')) return
    const saved = newMock100(hidden)
    saveMock(saved)
    setView({ s: 'exam', mode: 'mock100', saved })
  }

  return (
    <>
      <Nav title="보안기사 문제집" meta={`문제 ${visible(QUESTIONS, hidden).length}개`} />
      <div className="screen">
        {error && <div className="verdict toast">기록 서버 오류 — {error}</div>}

        {resume && (
          <button className="banner" onClick={() => setView({ s: 'exam', mode: 'mock100', saved: resume })}>
            <div>
              <div className="bt">모의고사 이어풀기</div>
              <div className="bd">
                {Object.keys(resume.answers).length}/{resume.keys.length} · {stampLabel(new Date(resume.startedAt).toISOString())} 시작
              </div>
            </div>
            <span className="go">이어풀기 →</span>
          </button>
        )}

        <div className="progress-card">
          <div className="progress-head">
            <div>
              <div className="label">객관식 학습 진도</div>
              {/* 로딩 중에도 자리 폭을 지켜서 숫자가 들어올 때 레이아웃이 안 튀게 한다 */}
              <strong>{loading ? `— / ${pool.length}문제` : `${solved} / ${pool.length}문제`}</strong>
            </div>
            <span>{loading ? '—' : `${pct(solved, pool.length)}%`}</span>
          </div>
          <div className="progress-track">
            {/* 기록이 도착하면 0에서 실제 값으로 차오른다. transition만으로 되고 JS는 없다 */}
            <span style={{ transform: `scaleX(${pct(solved, pool.length) / 100})` }} />
          </div>
          <button
            disabled={!unseen || loading}
            onClick={() =>
              setView({
                s: 'practice',
                mode: 'practice',
                keys: shuffle(pool.filter((q) => !stats.has(q.key))).map((q) => q.key),
              })
            }
          >
            {loading
              ? '기록을 불러오고 있습니다'
              : unseen
                ? `안 푼 문제 ${unseen}개부터 풀기 →`
                : '모든 문제를 한 번 이상 풀었습니다'}
          </button>
        </div>

        <button
          className="banner"
          disabled={!review.length || loading}
          onClick={() => setView({ s: 'practice', mode: 'review', keys: review })}
        >
          <div>
            <div className="bt">오늘의 복습{!loading && ` ${review.length}문제`}</div>
            <div className="bd">
              {loading
                ? '기록을 불러오고 있습니다'
                : review.length
                  ? '최근 오답과 반복해서 약한 문제'
                  : '복습할 문제가 생기면 여기에 모입니다'}
            </div>
          </div>
          {review.length > 0 && <span className="go">시작 →</span>}
        </button>

        <button
          className="banner"
          disabled={!memo.length || loading}
          onClick={() => setView({ s: 'short', keys: memo.map((q) => q.key), mode: 'memo' })}
        >
          <div>
            <div className="bt">오늘 암기{!loading && ` ${memo.length}장`}</div>
            <div className="bd">
              {loading
                ? '기록을 불러오고 있습니다'
                : memo.length
                  ? '암호 스펙·포트·파일 경로를 직접 입력'
                  : '오늘 볼 카드를 다 봤습니다'}
            </div>
          </div>
          {memo.length > 0 && <span className="go">시작 →</span>}
        </button>

        {latestMockSummary && (
          <div className="recent-mock">
            <div className="label">최근 시험</div>
            <strong>{latestMockSummary.title}</strong>
            <span>{latestMockSummary.detail}</span>
          </div>
        )}

        {/* ponytail: 네이티브 details. 홈에 탭 가능한 블록이 13개라 매일 쓰는 3개(이어풀기·복습·암기)가
            묻혔다. 상태도 JS도 없이 접는다. */}
        <details className="modes">
          <summary>풀이 모드 6가지</summary>
          <div className="inner">
            <button className="card" onClick={() => setView({ s: 'practice', mode: 'practice' })}>
              <div className="ct">연습형</div>
              <div className="cd">답을 고르면 바로 정답을 봅니다</div>
              <div className="cm">문항 제한 없음 · 안 푼 문제 먼저</div>
            </button>
            <button className="card" onClick={startMock100}>
              <div className="ct">모의고사</div>
              <div className="cd">실제 시험처럼 100문항을 끝까지 풀고 한 번에 채점</div>
              <div className="cm">과목별 20문항 · 150분 · 합격 판정</div>
            </button>
            <button className="card" onClick={() => setView({ s: 'setup', mode: 'mock_short' })}>
              <div className="ct">간단 모의</div>
              <div className="cd">과목을 골라 짧게. 출퇴근길 한 세트</div>
              <div className="cm">10 / 20 / 30문항</div>
            </button>
            <button
              className="card"
              onClick={() => setView({ s: 'setup', mode: 'ox' })}
              disabled={!visible(OX, hidden).length}
            >
              <div className="ct">OX 특강</div>
              <div className="cd">과목별 O/X를 빠르게 넘기며 개념 점검</div>
              <div className="cm">OX 문제 {visible(OX, hidden).length}개</div>
            </button>
            <button
              className="card"
              onClick={() => setView({ s: 'setup', mode: 'short' })}
              disabled={!visible(SHORT, hidden).length}
            >
              <div className="ct">단답 특강</div>
              <div className="cd">용어를 직접 입력하며 핵심 개념 회상</div>
              <div className="cm">단답 문제 {visible(SHORT, hidden).length}개</div>
            </button>
            <button
              className="card"
              onClick={() => setView({ s: 'memo' })}
              disabled={!visible(MEMO, hidden).length}
            >
              <div className="ct">암기표</div>
              <div className="cd">외우기 전에 한눈에. 답은 가려져 있고 한 줄씩 눌러 확인합니다</div>
              <div className="cm">암기 카드 {visible(MEMO, hidden).length}장 · 시험 직전 훑어보기</div>
            </button>
          </div>
        </details>

        <button
          className="banner plain"
          disabled={!wrong.length}
          onClick={() => setView({ s: 'practice', mode: 'review', keys: wrong })}
        >
          <div>
            <div className="bt">틀린 문제 {wrong.length}개</div>
            <div className="bd">{wrong.length ? '최근 오답부터 모아 풀기' : '틀린 문제는 여기 모입니다'}</div>
          </div>
          {wrong.length > 0 && <span className="go">모아 풀기 →</span>}
        </button>

        <button
          className="banner plain"
          disabled={!marked.length}
          onClick={() => setView({ s: 'practice', mode: 'review', keys: marked })}
        >
          <div>
            <div className="bt">★ 즐겨찾기 {marked.length}개</div>
            <div className="bd">{marked.length ? '별표한 문제만 모아 풀기' : '문제를 풀다 ★를 누르면 여기 모입니다'}</div>
          </div>
          {marked.length > 0 && <span className="go">모아 풀기 →</span>}
        </button>


        <div>
          <div className="label" style={{ marginBottom: 10 }}>
            과목별 정답률
          </div>
          <div className="bars">
            {SUBJECTS.map((s, i) => {
              const r = rates.get(s.id) ?? { tries: 0, correct: 0 }
              const p = pct(r.correct, r.tries)
              const low = r.tries > 0 && p < 40
              return (
                <button
                  className="bar"
                  key={s.id}
                  title={`${s.label} 문제 풀기`}
                  onClick={() =>
                    setView({
                      s: 'practice',
                      mode: 'practice',
                      keys: pool.filter((q) => q.subject === s.id).map((q) => q.key),
                    })
                  }
                >
                  <span className="bn">{s.short}</span>
                  <span className="track">
                    <span
                      className={low ? 'fill low' : 'fill'}
                      style={{ transform: `scaleX(${p / 100})`, transitionDelay: `${i * 50}ms` }}
                    />
                  </span>
                  <span className={low ? 'bv bad' : 'bv'}>{r.tries ? `${p}%` : '—'}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button className="btn weak" onClick={() => setView({ s: 'history' })} disabled={loading}>
          내 기록 · 오답노트
        </button>
      </div>
    </>
  )
}
