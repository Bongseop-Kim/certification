import { useState } from 'react'
import { Exam } from './Exam.tsx'
import { History } from './History.tsx'
import { Nav } from './Nav.tsx'
import { Ox } from './Ox.tsx'
import { Practice } from './Practice.tsx'
import { Result } from './Result.tsx'
import { Setup } from './Setup.tsx'
import {
  MC,
  OX,
  byKey,
  PER_SUBJECT,
  QUESTIONS,
  SUBJECTS,
  loadMock,
  pct,
  saveMock,
  shuffle,
  statsByKey,
  stampLabel,
  subjectRates,
  useAttempts,
  useBookmarks,
  wrongKeys,
  type Mode,
  type Saved,
} from './lib.tsx'

type View =
  | { s: 'home' }
  | { s: 'practice'; mode: 'practice' | 'review'; keys?: string[] }
  | { s: 'setup'; mode: 'mock_short' | 'ox' }
  | { s: 'exam'; mode: 'mock100' | 'mock_short'; saved: Saved }
  | { s: 'ox'; keys: string[] }
  | { s: 'result'; mode: Mode; sessionId: string; elapsedMs: number }
  | { s: 'history' }

/** 과목별 20문항, 과목 순서대로 배치한 100문항 */
function newMock100(): Saved {
  const keys = SUBJECTS.flatMap((s) =>
    shuffle(MC.filter((q) => q.subject === s.id))
      .slice(0, PER_SUBJECT)
      .map((q) => q.key),
  )
  return { sessionId: crypto.randomUUID(), keys, answers: {}, marked: [], idx: 0, startedAt: Date.now() }
}

export default function App() {
  const { attempts, record, addNote, error, loading } = useAttempts()
  const { marks, toggle } = useBookmarks()
  const [view, setView] = useState<View>({ s: 'home' })
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
            toggleMark={toggle}
            onExit={home}
          />
        )
      case 'setup':
        return (
          <Setup
            mode={view.mode}
            stats={stats}
            onExit={home}
            onStart={(keys) =>
              view.mode === 'ox'
                ? setView({ s: 'ox', keys })
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
            toggleMark={toggle}
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
      case 'result':
        return (
          <Result
            mode={view.mode}
            sessionId={view.sessionId}
            elapsedMs={view.elapsedMs}
            attempts={attempts}
            onHome={home}
            onReview={(keys) => setView({ s: 'practice', mode: 'review', keys })}
          />
        )
      case 'history':
        return (
          <History
            stats={stats}
            marks={marks}
            toggleMark={toggle}
            onExit={home}
            onSolve={(keys) => setView({ s: 'practice', mode: 'review', keys })}
          />
        )
      default:
        return <Home stats={stats} marks={marks} loading={loading} error={error} setView={setView} />
    }
  }

  return <div className="app">{screen()}</div>
}

function Home({
  stats,
  marks,
  loading,
  error,
  setView,
}: {
  stats: ReturnType<typeof statsByKey>
  marks: Set<string>
  loading: boolean
  error?: string
  setView: (v: View) => void
}) {
  const rates = subjectRates(stats)
  const wrong = wrongKeys(stats)
  const marked = [...marks].filter((k) => byKey.has(k))
  const resume = loadMock()

  const startMock100 = () => {
    if (resume && !confirm('진행 중인 모의고사가 있습니다. 새로 시작하면 사라집니다.')) return
    const saved = newMock100()
    saveMock(saved)
    setView({ s: 'exam', mode: 'mock100', saved })
  }

  return (
    <>
      <Nav title="보안기사 문제집" meta={`문제 ${QUESTIONS.length}개`} />
      <div className="screen">
        {error && <div className="verdict">기록 서버 오류 — {error}</div>}

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
        <button className="card" onClick={() => setView({ s: 'setup', mode: 'ox' })} disabled={!OX.length}>
          <div className="ct">OX 특강</div>
          <div className="cd">과목별 O/X를 빠르게 넘기며 개념 점검</div>
          <div className="cm">OX 문제 {OX.length}개</div>
        </button>

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
            {SUBJECTS.map((s) => {
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
                      keys: MC.filter((q) => q.subject === s.id).map((q) => q.key),
                    })
                  }
                >
                  <span className="bn">{s.short}</span>
                  <span className="track">
                    <span className={low ? 'fill low' : 'fill'} style={{ width: `${p}%` }} />
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
