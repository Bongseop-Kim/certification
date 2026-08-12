import { useState } from 'react'
import { Nav } from './Nav.tsx'
import { SUBJECTS, byKey, dayLabel, pct, renderBody, wrongKeys, type Stat } from './lib.tsx'

const TABS = [
  { id: 'weak', label: '약한 문제', hint: '정답률 낮은 순' },
  { id: 'wrong', label: '틀린 문제', hint: '최근 오답 순' },
  { id: 'mark', label: '북마크', hint: '이 기기에 저장' },
] as const

export type HistTab = (typeof TABS)[number]['id']

type Props = {
  stats: Map<string, Stat>
  marks: Set<string>
  toggleMark: (key: string) => void
  onSolve: (keys: string[]) => void
  onExit: () => void
  // 문제 상세에 다녀와도 보던 탭 그대로 돌아오도록 App이 들고 있는다
  tab: HistTab
  setTab: (t: HistTab) => void
}

// 세 탭 모두 같은 목록에 필터만 다르다. 오답노트·복습·즐겨찾기를 화면 하나로 덮는다.
export function History({ stats, marks, toggleMark, onSolve, onExit, tab, setTab }: Props) {
  const [open, setOpen] = useState<string>()

  const keys =
    tab === 'wrong'
      ? wrongKeys(stats)
      : tab === 'mark'
        ? [...marks].filter((k) => byKey.has(k))
        : [...stats]
            .filter(([k, s]) => s.tries > 0 && byKey.has(k))
            .sort((a, b) => a[1].correct / a[1].tries - b[1].correct / b[1].tries || b[1].tries - a[1].tries)
            .map(([k]) => k)

  const solved = [...stats].filter(([k]) => byKey.has(k)).length

  return (
    <>
      <Nav title="내 기록" meta={`푼 문제 ${solved}`} onBack={onExit} />
      <div className="screen">
        <div className="seg">
          {TABS.map((t) => (
            <button key={t.id} aria-selected={t.id === tab} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="keys">{TABS.find((t) => t.id === tab)?.hint}</div>

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
                  <button
                    className="hitem"
                    onClick={() => (q.type === 'mc' ? onSolve([k]) : setOpen(open === k ? undefined : k))}
                  >
                    <span className={cls}>{p === null ? '—' : `${p}%`}</span>
                    <span className="hb">
                      <span className="hq">{renderBody(q.body)}</span>
                      <span className="hm">
                        {SUBJECTS.find((x) => x.id === q.subject)?.short} ·{' '}
                        {s
                          ? `${s.tries}회 시도 · 마지막 ${dayLabel(s.last)}${s.notes.length ? ` · 메모 ${s.notes.length}개` : ''}`
                          : '아직 안 푼 문제'}
                      </span>
                    </span>
                    <span
                      className={marks.has(k) ? 'star' : 'star off'}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleMark(k)
                      }}
                    >
                      {marks.has(k) ? '★' : '☆'}
                    </span>
                  </button>
                  {open === k && (
                    <div className="callout" style={{ margin: '4px 0 10px' }}>
                      <span className="cot">정답 {q.type === 'ox' ? q.answer : `${Number(q.answer) + 1}번`}</span>
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

        <button className="btn" disabled={!keys.length} onClick={() => onSolve(keys.slice(0, 20))}>
          이 목록 {Math.min(keys.length, 20)}개 모아 풀기
        </button>
      </div>
    </>
  )
}
