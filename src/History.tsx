import { useState } from 'react'
import { Nav } from './Nav.tsx'
import { byKey, dayLabel, pct, renderBody, subjectTag, wrongKeys, type FlagKind, type Stat } from './lib.tsx'

const TABS = [
  { id: 'weak', label: '약한 문제' },
  { id: 'wrong', label: '틀린 문제' },
  { id: 'mark', label: '북마크' },
  { id: 'hide', label: '관심없음' },
] as const

export type HistTab = (typeof TABS)[number]['id']

type Props = {
  stats: Map<string, Stat>
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
export function History({ stats, marks, hidden, toggle, onSolve, onExit, tab, setTab }: Props) {
  const [open, setOpen] = useState<string>()
  const live = (k: string) => byKey.has(k) && !hidden.has(k)

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
      <div className="screen">
        <div className="seg" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={t.id === tab} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {keys.length === 0 ? (
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
                  {/* ponytail: OX는 연습형 상세 화면이 없어서 그 행만 기존 펼치기 유지 */}
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
        {tab !== 'hide' && (
          <button className="btn" disabled={!keys.length} onClick={() => onSolve(keys.slice(0, 20))}>
            이 목록 {Math.min(keys.length, 20)}개 모아 풀기
          </button>
        )}
      </div>
    </>
  )
}
