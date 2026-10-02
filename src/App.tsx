import { useEffect, useState } from 'react'
import { History, type HistTab } from './History.tsx'
import { Nav } from './Nav.tsx'
import { Practice } from './Practice.tsx'
import { Setup, type Form } from './Setup.tsx'
import {
  QUESTIONS,
  TYPES,
  byKey,
  dueKeys,
  pct,
  shuffle,
  statsByKey,
  typeRates,
  useAttempts,
  useFlags,
  visible,
  wrongKeys,
} from './lib.tsx'

type View =
  | { s: 'home' }
  | { s: 'practice'; mode: 'practice' | 'review'; keys?: string[]; fromHistory?: boolean }
  | { s: 'setup'; form: Form; due?: string[] }
  | { s: 'history' }

export default function App() {
  const { attempts, record, addNote, error, loading } = useAttempts()
  const { marks, hidden, toggle, error: flagError } = useFlags()
  // 새로고침해도 보던 화면을 지킨다. history.state는 새로고침 뒤에도 남는다
  const [view, show] = useState<View>(() => (history.state as { view?: View } | null)?.view ?? { s: 'home' })
  const [histTab, setHistTab] = useState<HistTab>('day')

  // 화면 전환을 히스토리에 남긴다. 안 그러면 모바일에서 뒤로 스와이프할 때
  // 앱 자체를 나가버려서 풀던 문제가 날아간다. View는 전부 직렬화 가능하다.
  const setView = (v: View) => {
    history.pushState({ view: v }, '')
    show(v)
    scrollTo(0, 0) // 새 화면은 위에서 시작한다. 뒤로가기(popstate)는 브라우저가 알아서 복원한다
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
            form={view.form}
            stats={stats}
            hidden={hidden}
            due={view.due}
            onExit={home}
            onStart={(keys) => setView({ s: 'practice', mode: view.form, keys })}
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
      default:
        return (
          <Home
            stats={stats}
            marks={marks}
            hidden={hidden}
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
  loading,
  error,
  setView,
}: {
  stats: ReturnType<typeof statsByKey>
  marks: Set<string>
  hidden: Set<string>
  loading: boolean
  error?: string
  setView: (v: View) => void
}) {
  const rates = typeRates(stats)
  const wrong = wrongKeys(stats, hidden)
  const marked = [...marks].filter((k) => byKey.has(k) && !hidden.has(k))
  const pool = visible(QUESTIONS, hidden)
  const solved = pool.filter((q) => stats.has(q.key)).length
  const unseen = pool.length - solved
  // 간격 반복 큐
  const due = dueKeys(stats, hidden)

  return (
    <>
      <Nav title="정보보안기사 실기" meta={`문제 ${pool.length}개`} />
      <main className="screen">
        {error && <div className="verdict toast">기록 서버 오류 — {error}</div>}

        <div className="progress-card">
          <div className="progress-head">
            <div>
              <div className="label">실기 학습 진도</div>
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
            유형별 진도
          </div>
          <div className="bars">
            {TYPES.map((t, i) => {
              const qs = pool.filter((q) => q.type === t.id)
              const done = qs.filter((q) => stats.has(q.key)).length
              return (
                <button
                  className="bar wide"
                  key={t.id}
                  title={`${t.label} 안 푼 문제 풀기`}
                  disabled={loading || done === qs.length}
                  onClick={() =>
                    setView({
                      s: 'practice',
                      mode: 'practice',
                      keys: shuffle(qs.filter((q) => !stats.has(q.key))).map((q) => q.key),
                    })
                  }
                >
                  <span className="bn">{t.label}</span>
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
          disabled={!due.length || loading}
          onClick={() => setView({ s: 'setup', form: 'review', due })}
        >
          <div>
            <div className="bt">오늘의 복습{!loading && ` ${Math.min(20, due.length)}문제`}</div>
            <div className="bd">
              {loading
                ? '기록을 불러오고 있습니다'
                : due.length
                  ? '복습 기한이 지난 문제 — 맞힐수록 주기가 길어집니다'
                  : '복습 기한이 된 문제가 생기면 여기에 모입니다'}
            </div>
          </div>
          {due.length > 0 && <span className="go">유형 선택 →</span>}
        </button>

        <div className="mode">
          <div className="mh">
            <strong>실기 연습</strong>
            <span>자가 채점 · {pool.length}개</span>
          </div>
          <div className="md">정답과 해설을 본 뒤 맞음/틀림을 직접 고릅니다. 유형을 골라 풉니다</div>
          <div className="row">
            <button className="mbtn" disabled={!pool.length} onClick={() => setView({ s: 'setup', form: 'practice' })}>
              <b>연습</b>
              <span>문항 제한 없음</span>
            </button>
          </div>
        </div>

        <div>
          <div className="label" style={{ marginBottom: 10 }}>
            유형별 정답률
          </div>
          <div className="bars">
            {TYPES.map((t, i) => {
              const r = rates.get(t.id) ?? { tries: 0, correct: 0 }
              const p = pct(r.correct, r.tries)
              const low = r.tries > 0 && p < 40
              return (
                <button
                  className="bar"
                  key={t.id}
                  title={`${t.label} 문제 풀기`}
                  onClick={() =>
                    setView({
                      s: 'practice',
                      mode: 'practice',
                      keys: pool.filter((q) => q.type === t.id).map((q) => q.key),
                    })
                  }
                >
                  <span className="bn">{t.label}</span>
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
