import { useState } from 'react'
import { Nav } from './Nav.tsx'
import { MEMO, pct, renderBody, visible, type Stat } from './lib.tsx'

// ponytail: memo 파일을 추가하면 여기 한 줄 추가한다. 자동 수집은 라벨을 못 만든다.
const TABS = [
  { id: 'memo-crypto', label: '암호' },
  { id: 'memo-port', label: '포트' },
  { id: 'memo-system', label: '시스템' },
  { id: 'memo-tool', label: '도구' },
  { id: 'memo-law', label: '법규' },
].filter((t) => MEMO.some((q) => q.source === t.id))

type Props = {
  stats: Map<string, Stat>
  hidden: Set<string>
  onSolve: (keys: string[]) => void
  onExit: () => void
}

/**
 * 암기표. 카드를 셀 단위로 쪼갠 탓에 사라진 표 구조를 원래 순서대로 되돌려 보여준다.
 * 기본이 가림 상태인 이유 — 다시 읽기는 가장 약한 학습법이라 읽는 페이지가 아니라 스스로 묻는 표여야 한다.
 */
export function Memo({ stats, hidden, onSolve, onExit }: Props) {
  const [tab, setTab] = useState(TABS[0]?.id)
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [all, setAll] = useState(false)

  const rows = visible(MEMO, hidden).filter((q) => q.source === tab)
  const shown = (key: string) => all || open.has(key)

  const reveal = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <>
      <Nav title="암기표" meta={`${visible(MEMO, hidden).length}장`} onBack={onExit} />
      <div className="screen">
        <div className="seg" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={t.id === tab} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="keys">
          {all ? '시험 직전 훑어보기 모드입니다' : '답을 가렸습니다 — 한 줄씩 눌러 확인하세요'}
        </div>

        <button className="btn weak" onClick={() => setAll((v) => !v)}>
          {all ? '답 가리기' : '답 펼치기'}
        </button>

        <div className="hlist">
          {rows.map((q) => {
            const s = stats.get(q.key)
            const p = s ? pct(s.correct, s.tries) : null
            const cls = p === null ? 'rate' : p < 40 ? 'rate bad' : p < 80 ? 'rate mid' : 'rate good'
            return (
              <button className="hitem" key={q.key} onClick={() => reveal(q.key)}>
                <span className={cls}>{p === null ? '—' : `${p}%`}</span>
                <span className="hb">
                  <span className="hq">{renderBody(q.body)}</span>
                </span>
                <span className={shown(q.key) ? 'ans' : 'ans off'}>
                  {shown(q.key) ? q.answer : '· · · ·'}
                </span>
              </button>
            )
          })}
        </div>

        <button className="btn" disabled={!rows.length} onClick={() => onSolve(rows.map((q) => q.key))}>
          이 표 {rows.length}장 풀어보기
        </button>
      </div>
    </>
  )
}
