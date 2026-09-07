import { useState } from 'react'
import { Nav } from './Nav.tsx'
import { byKey, dayLabel, localDay, pct, renderBody, subjectTag, wrongKeys, type Attempt, type FlagKind, type Stat } from './lib.tsx'

const TABS = [
  { id: 'day', label: '날짜별' },
  { id: 'weak', label: '약한 문제' },
  { id: 'wrong', label: '틀린 문제' },
  { id: 'mark', label: '북마크' },
  { id: 'hide', label: '관심없음' },
] as const

export type HistTab = (typeof TABS)[number]['id']

type Props = {
  stats: Map<string, Stat>
  attempts: Attempt[]
  marks: Set<string>
  hidden: Set<string>
  toggle: (key: string, kind: FlagKind) => void
  onSolve: (keys: string[]) => void
  onExit: () => void
  // 문제 상세에 다녀와도 보던 탭 그대로 돌아오도록 App이 들고 있는다
  tab: HistTab
  setTab: (t: HistTab) => void
}

// 네 탭 모두 같은 목록에 필터만 다르다. 오답노트·복습·즐겨찾기·제외를 화면 하나로 덮는다.
export function History({ stats, attempts, marks, hidden, toggle, onSolve, onExit, tab, setTab }: Props) {
  const [open, setOpen] = useState<string>()
  const live = (k: string) => byKey.has(k) && !hidden.has(k)

  // 날짜별 오답. 복습 여부는 따로 저장하지 않는다 — 그날보다 뒤 날짜에 다시 풀었으면 복습한 것이다.
  // 맞혔는지는 안 본다. 같은 날 다시 푼 것도 안 친다(방금 본 답을 기억해 내는 건 복습이 아니다).
  // ponytail: 달력 격자 대신 날짜 목록. 공부한 날만 나오면 되고 빈 날짜 칸은 정보가 없다.
  const days = (() => {
    const m = new Map<string, Set<string>>()
    for (const a of attempts) {
      if (a.correct || !live(a.question_key)) continue
      const d = localDay(a.answered_at)
      m.set(d, (m.get(d) ?? new Set()).add(a.question_key))
    }
    return [...m]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([d, set]) => {
        const keys = [...set]
        const remaining = keys.filter((k) => localDay(stats.get(k)!.last) <= d)
        return { d, keys, reviewed: keys.length - remaining.length, remaining }
      })
  })()

  const keys =
    tab === 'hide'
      ? [...hidden].filter((k) => byKey.has(k))
      : tab === 'wrong'
        ? wrongKeys(stats, hidden)
        : tab === 'mark'
          ? [...marks].filter(live)
          : [...stats]
              .filter(([k, s]) => s.tries > 0 && live(k))
              .sort((a, b) => a[1].correct / a[1].tries - b[1].correct / b[1].tries || b[1].tries - a[1].tries)
              .map(([k]) => k)

  const solved = [...stats].filter(([k]) => live(k)).length

  return (
    <>
      <Nav title="내 기록" meta={`푼 문제 ${solved}`} onBack={onExit} />
      <main className="screen">
        <div className="seg" role="group" aria-label="기록 분류">
          {TABS.map((t) => (
            <button key={t.id} aria-pressed={t.id === tab} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'day' ? (
          days.length === 0 ? (
            <div className="empty">아직 없습니다.</div>
          ) : (
            <div className="hlist">
              {days.map(({ d, keys, reviewed, remaining }) => {
                const done = !remaining.length
                const cls = !reviewed ? 'rate bad' : done ? 'rate good' : 'rate mid'
                return (
                  <button
                    className="hitem"
                    key={d}
                    disabled={!remaining.length}
                    onClick={() => onSolve(remaining.slice(0, 20))}
                  >
                    <span className={cls}>{!reviewed ? '미복습' : done ? '복습함' : `${reviewed}/${keys.length}`}</span>
                    <span className="hb">
                      <span className="hq">{dayLabel(d + 'T00:00')} · 오답 {keys.length}개</span>
                      <span className="hm">
                        {remaining.length ? `아직 다시 안 푼 문제 ${remaining.length}개 · 눌러서 풀기` : '전부 다시 풀었습니다'}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          )
        ) : keys.length === 0 ? (
          <div className="empty">아직 없습니다.</div>
        ) : (
          <div className="hlist">
            {keys.map((k) => {
              const q = byKey.get(k)!
              const s = stats.get(k)
              const p = s ? pct(s.correct, s.tries) : null
              const cls = p === null ? 'rate' : p < 40 ? 'rate bad' : p < 80 ? 'rate mid' : 'rate good'
              return (
                <div key={k}>
                  {/* ponytail: 단답은 연습형 상세 화면이 없어서 그 행만 기존 펼치기 유지 */}
                  <div className="hrow">
                    <button
                      className="hitem"
                      onClick={() => (q.type === 'mc' ? onSolve([k]) : setOpen(open === k ? undefined : k))}
                    >
                      <span className={cls}>{p === null ? '—' : `${p}%`}</span>
                      <span className="hb">
                        <span className="hq">{renderBody(q.body)}</span>
                        <span className="hm">
                          {subjectTag(q.subject)} ·{' '}
                          {s
                            ? `${s.tries}회 시도 · 마지막 ${dayLabel(s.last)}${s.notes.length ? ` · 메모 ${s.notes.length}개` : ''}`
                            : '아직 안 푼 문제'}
                        </span>
                      </span>
                    </button>
                    <button
                      className={tab === 'hide' || marks.has(k) ? 'star' : 'star off'}
                      aria-label={tab === 'hide' ? '관심 없음 해제' : marks.has(k) ? '북마크 해제' : '북마크'}
                      onClick={() => toggle(k, tab === 'hide' ? 'hide' : 'mark')}
                    >
                      {tab === 'hide' ? '해제' : marks.has(k) ? '★' : '☆'}
                    </button>
                  </div>
                  {open === k && (
                    <div className="callout" style={{ margin: '4px 0 10px' }}>
                      <span className="cot">정답 {q.type === 'mc' ? `${Number(q.answer) + 1}번` : q.answer}</span>
                      {s?.notes.length ? (
                        s.notes.map((n, i) => <p key={i}>“{n}”</p>)
                      ) : (
                        <p>남긴 메모가 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* 관심 없음 탭에는 모아 풀기가 없다 — 안 볼 문제를 모아 푸는 건 모순이다 */}
        {tab !== 'hide' && tab !== 'day' && (
          <button className="btn" disabled={!keys.length} onClick={() => onSolve(keys.slice(0, 20))}>
            이 목록 {Math.min(keys.length, 20)}개 모아 풀기
          </button>
        )}
      </main>
    </>
  )
}
