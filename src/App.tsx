import { useEffect, useState } from 'react'
import { Exam } from './Exam.tsx'
import { History, type HistTab } from './History.tsx'
import { Nav } from './Nav.tsx'
import { ALL, MustView, NotesIndex, SheetView } from './Notes.tsx'
import { Practice } from './Practice.tsx'
import { Result } from './Result.tsx'
import { Setup, typeLabel, type Form } from './Setup.tsx'
import { Short } from './Short.tsx'
import {
  MC,
  SHORT,
  byKey,
  dayLabel,
  dueKeys,
  localDay,
  QUESTIONS,
  SUBJECTS,
  pct,
  shuffle,
  statsByKey,
  subjectRates,
  useAttempts,
  useFlags,
  visible,
  wrongKeys,
  type Attempt,
  type Mode,
  type Question,
  type Saved,
} from './lib.tsx'

const EXAM = '2026-09-22'

type View =
  | { s: 'home' }
  | { s: 'practice'; mode: 'practice' | 'review'; keys?: string[]; fromHistory?: boolean }
  | { s: 'setup'; type: Question['type']; form: Form; due?: string[] }
  | { s: 'exam'; saved: Saved }
  | { s: 'short'; keys: string[] }
  | { s: 'result'; mode: Mode; sessionId: string; elapsedMs: number }
  | { s: 'history' }
  | { s: 'notes' }
  | { s: 'sheet'; at: number }
  | { s: 'must' }

export default function App() {
  const { attempts, record, addNote, error, loading } = useAttempts()
  const { marks, hidden, toggle, error: flagError } = useFlags()
  const toggleMark = (key: string) => void toggle(key, 'mark')
  const [view, show] = useState<View>({ s: 'home' })
  const [histTab, setHistTab] = useState<HistTab>('day')

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
            type={view.type}
            form={view.form}
            stats={stats}
            hidden={hidden}
            due={view.due}
            onExit={home}
            onStart={(keys) =>
              view.form === 'mock'
                ? setView({
                    s: 'exam',
                    saved: { sessionId: crypto.randomUUID(), keys, answers: {}, marked: [], idx: 0, startedAt: Date.now() },
                  })
                : view.type === 'short'
                  ? setView({ s: 'short', keys })
                  : setView({ s: 'practice', mode: view.form, keys })
            }
          />
        )
      case 'exam':
        return (
          <Exam
            saved={view.saved}
            record={record}
            marks={marks}
            toggleMark={toggleMark}
            onExit={home}
            onSubmit={(elapsedMs) =>
              setView({ s: 'result', mode: 'mock_short', sessionId: view.saved.sessionId, elapsedMs })
            }
          />
        )
      case 'short':
        return (
          <Short
            keys={view.keys}
            record={record}
            onExit={home}
            onDone={(sessionId, elapsedMs) => setView({ s: 'result', mode: 'short', sessionId, elapsedMs })}
          />
        )
      case 'result':
        return (
          <Result
            mode={view.mode}
            sessionId={view.sessionId}
            elapsedMs={view.elapsedMs}
            attempts={attempts}
            marks={marks}
            hidden={hidden}
            toggle={toggle}
            onHome={home}
            onReview={(keys) =>
              // 한 세션은 한 유형이라 첫 문제로 재생기를 고른다
              setView(
                byKey.get(keys[0])?.type === 'short' ? { s: 'short', keys } : { s: 'practice', mode: 'review', keys },
              )
            }
          />
        )
      case 'history':
        return (
          <History
            stats={stats}
            attempts={attempts}
            tab={histTab}
            setTab={setHistTab}
            marks={marks}
            hidden={hidden}
            toggle={toggle}
            onExit={home}
            onSolve={(keys) => setView({ s: 'practice', mode: 'review', keys, fromHistory: true })}
          />
        )
      case 'notes':
        return <NotesIndex onOpen={(at) => setView({ s: 'sheet', at })} onExit={home} />
      case 'must':
        return <MustView onExit={home} />
      case 'sheet':
        return <SheetView at={view.at} onNav={(at) => setView({ s: 'sheet', at })} onExit={() => setView({ s: 'notes' })} />
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
  const marked = [...marks].filter((k) => byKey.has(k) && !hidden.has(k))
  const pool = visible(MC, hidden)
  const solved = pool.filter((q) => stats.has(q.key)).length
  const unseen = pool.length - solved
  // 간격 반복 큐. 유형별로 자르는 이유: 재생기가 둘(Practice=객관식, Short=단답)이라 세션도 나뉜다.
  const due = dueKeys(stats, hidden)
  const dueMc = due.filter((k) => byKey.get(k)!.type === 'mc')
  const dueShort = due.filter((k) => byKey.get(k)!.type === 'short')

  // 하루 목표 = 안 푼 문제(객관식+단답) ÷ 시험 전날까지 남은 일수. 오늘 처음 푼 문제 수로 진도를 잰다.
  // ponytail: 시험 날짜는 상수. 다음 시험엔 여기만 바꾼다.
  const goal = (() => {
    const today = localDay(new Date().toISOString())
    const daysLeft = Math.ceil((new Date(EXAM).getTime() - Date.now()) / 86400000)
    if (daysLeft <= 0) return null
    const left = visible(QUESTIONS, hidden).filter((q) => !stats.has(q.key)).length
    const seen = new Set<string>()
    let todayNew = 0
    for (const a of attempts) {
      if (seen.has(a.question_key) || !byKey.has(a.question_key)) continue
      seen.add(a.question_key)
      if (localDay(a.answered_at) === today) todayNew++
    }
    return { daysLeft, left, todayNew, target: Math.ceil((left + todayNew) / daysLeft) }
  })()

  const latestMock = (() => {
    const sessions = new Map<string, Attempt[]>()
    for (const a of attempts) {
      if (!a.session_id || a.mode !== 'mock_short') continue
      sessions.set(a.session_id, [...(sessions.get(a.session_id) ?? []), a])
    }
    return [...sessions.values()].sort((a, b) =>
      b[b.length - 1].answered_at.localeCompare(a[a.length - 1].answered_at),
    )[0]
  })()

  const latestMockSummary = (() => {
    if (!latestMock) return null
    const correct = latestMock.filter((a) => a.correct).length
    return {
      title: `최근 ${typeLabel(byKey.get(latestMock[0].question_key)?.type ?? 'mc')} 모의`,
      detail: `${dayLabel(latestMock[0].answered_at)} · ${correct}/${latestMock.length} · ${pct(correct, latestMock.length)}%`,
    }
  })()

  return (
    <>
      <Nav title="보안기사 문제집" meta={`문제 ${visible(QUESTIONS, hidden).length}개`} />
      <main className="screen">
        {error && <div className="verdict toast">기록 서버 오류 — {error}</div>}

        {!loading && goal && (
          <div className="goal">
            <span>
              오늘 <b>{goal.todayNew}</b> / {goal.target}문제
            </span>
            <span className="progress-track">
              <span style={{ transform: `scaleX(${Math.min(1, goal.todayNew / goal.target)})` }} />
            </span>
            <span>
              D-{goal.daysLeft} · 남은 {goal.left}
            </span>
          </div>
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

        <div>
          <div className="label" style={{ marginBottom: 10 }}>
            과목별 진도
          </div>
          <div className="bars">
            {SUBJECTS.map((s, i) => {
              const qs = pool.filter((q) => q.subject === s.id)
              const done = qs.filter((q) => stats.has(q.key)).length
              return (
                <button
                  className="bar wide"
                  key={s.id}
                  title={`${s.label} 안 푼 문제 풀기`}
                  disabled={loading || done === qs.length}
                  onClick={() =>
                    setView({
                      s: 'practice',
                      mode: 'practice',
                      keys: shuffle(qs.filter((q) => !stats.has(q.key))).map((q) => q.key),
                    })
                  }
                >
                  <span className="bn">{s.short}</span>
                  <span className="track">
                    <span
                      className="fill"
                      style={{ transform: `scaleX(${qs.length ? done / qs.length : 0})`, transitionDelay: `${i * 50}ms` }}
                    />
                  </span>
                  <span className="bv">푼 {done} · 안 푼 {qs.length - done}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          className="banner"
          disabled={!dueMc.length || loading}
          onClick={() => setView({ s: 'setup', type: 'mc', form: 'review', due: dueMc })}
        >
          <div>
            <div className="bt">오늘의 복습{!loading && ` ${Math.min(20, dueMc.length)}문제`}</div>
            <div className="bd">
              {loading
                ? '기록을 불러오고 있습니다'
                : dueMc.length
                  ? '복습 기한이 지난 객관식 — 맞힐수록 주기가 길어집니다'
                  : '복습 기한이 된 문제가 생기면 여기에 모입니다'}
            </div>
          </div>
          {dueMc.length > 0 && <span className="go">과목 선택 →</span>}
        </button>

        {!loading && dueShort.length > 0 && (
          <button className="banner" onClick={() => setView({ s: 'setup', type: 'short', form: 'review', due: dueShort })}>
            <div>
              <div className="bt">단답 복습 {Math.min(20, dueShort.length)}문제</div>
              <div className="bd">복습 기한이 지난 단답 문제</div>
            </div>
            <span className="go">과목 선택 →</span>
          </button>
        )}

        {latestMockSummary && (
          <div className="recent-mock">
            <div className="label">최근 시험</div>
            <strong>{latestMockSummary.title}</strong>
            <span>{latestMockSummary.detail}</span>
          </div>
        )}

        <button className="banner" onClick={() => setView({ s: 'notes' })}>
          <div>
            <div className="bt">핵심 암기 정리</div>
            <div className="bd">관계 지도 · 과목별 시트 · 시험 직전 점검 — {ALL.length}장</div>
          </div>
          <span className="go">읽기 →</span>
        </button>

        <button className="banner" onClick={() => setView({ s: 'must' })}>
          <div>
            <div className="bt">필수 암기 5표</div>
            <div className="bd">대칭키 · 운영 모드 · 해시 · HTTP 상태 코드 · 포트</div>
          </div>
          <span className="go">읽기 →</span>
        </button>

        <div>
          <div className="label" style={{ marginBottom: 10 }}>
            풀이 모드
          </div>
          <div className="modes">
            {(
              [
                { type: 'mc', title: '객관식', meta: '4지선다', desc: '기출 4지선다. 과목을 골라 풉니다', pool: pool },
                { type: 'short', title: '단답형', meta: '주관식', desc: '용어를 직접 입력해 핵심 개념을 회상합니다', pool: visible(SHORT, hidden) },
              ] as const
            ).map((m) => (
              <div className="mode" key={m.type}>
                <div className="mh">
                  <strong>{m.title}</strong>
                  <span>
                    {m.meta} · {m.pool.length}개
                  </span>
                </div>
                <div className="md">{m.desc}</div>
                <div className="row">
                  <button
                    className="mbtn"
                    disabled={!m.pool.length}
                    onClick={() => setView({ s: 'setup', type: m.type, form: 'practice' })}
                  >
                    <b>연습</b>
                    <span>바로 채점 · 문항 제한 없음</span>
                  </button>
                  <button
                    className="mbtn"
                    disabled={!m.pool.length}
                    onClick={() => setView({ s: 'setup', type: m.type, form: 'mock' })}
                  >
                    <b>모의</b>
                    <span>제출 후 채점 · 10 / 20 / 30</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

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
          내 기록 · 오답 {wrong.length} · 북마크 {marked.length}
        </button>
      </main>
    </>
  )
}
