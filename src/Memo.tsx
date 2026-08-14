import { useState } from 'react'
import { Nav } from './Nav.tsx'
import { MEMO, renderBody, visible } from './lib.tsx'

// ponytail: memo 파일을 추가하면 여기 한 줄 추가한다. 자동 수집은 라벨을 못 만든다.
const TABS = [
  { id: 'memo-crypto', label: '암호' },
  { id: 'memo-port', label: '포트' },
  { id: 'memo-system', label: '시스템' },
  { id: 'memo-tool', label: '도구' },
  { id: 'memo-law', label: '법규' },
].filter((t) => MEMO.some((q) => q.source === t.id))

type Props = {
  hidden: Set<string>
  onExit: () => void
}

/**
 * 암기표. 카드를 셀 단위로 쪼갠 탓에 사라진 표 구조를 원래 순서대로 되돌려 보여준다.
 * 기본이 가림 상태인 이유 — 다시 읽기는 가장 약한 학습법이라 읽는 페이지가 아니라 스스로 묻는 표여야 한다.
 * 카드를 실제로 푸는 건 홈의 '오늘 암기'가 맡는다. 여기는 보기만 하는 화면이다.
 */
export function Memo({ hidden, onExit }: Props) {
  const [tab, setTab] = useState(TABS[0]?.id)
  const [open, setOpen] = useState<Set<string>>(new Set())

  const rows = visible(MEMO, hidden).filter((q) => q.source === tab)

  // 답 열 너비를 이 탭에서 가장 긴 답에 맞춘다. 폭을 안 주면 답을 펼칠 때마다 문제 텍스트가
  // 밀리고, 전 탭 공통 고정폭이면 포트 탭(최장 4자)에 빈 칸이 남는다. 한글은 두 칸으로 센다.
  const ansCh = Math.max(
    6,
    ...rows.map((q) => [...q.answer].reduce((n, c) => n + (c.charCodeAt(0) > 127 ? 2 : 1), 0)),
  )

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
      <main className="screen">
        <div className="seg" role="group" aria-label="암기표 분류">
          {TABS.map((t) => (
            <button key={t.id} aria-pressed={t.id === tab} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="hlist">
          {rows.map((q) => (
            <button className="hitem" key={q.key} onClick={() => reveal(q.key)}>
              <span className="hb">
                <span className="hq">{renderBody(q.body)}</span>
              </span>
              {/* key로 노드를 갈아끼워야 @starting-style이 걸린다. 클래스만 바꾸면 진입 애니메이션이 없다.
                  가린 동안 답을 렌더하지 않으므로 DOM에도 남지 않는다 */}
              <span
                key={open.has(q.key) ? 'on' : 'off'}
                className={open.has(q.key) ? 'ans' : 'ans off'}
                style={{ width: `${ansCh}ch` }}
              >
                {open.has(q.key) ? q.answer : ''}
              </span>
            </button>
          ))}
        </div>
      </main>
    </>
  )
}
