import { useState } from 'react'
import { Nav } from './Nav.tsx'
import { MC, OX, SHORT, SUBJECTS, shuffle, visible, weakFirst, type Stat, type Subject } from './lib.tsx'

type Props = {
  mode: 'mock_short' | 'ox' | 'short'
  stats: Map<string, Stat>
  hidden: Set<string>
  onStart: (keys: string[]) => void
  onExit: () => void
}

export function Setup({ mode, stats, hidden, onStart, onExit }: Props) {
  // 관심 없음은 여기서 한 번 걷어낸다. 과목별 개수 표시까지 자동으로 따라온다.
  const pool = visible(mode === 'ox' ? OX : mode === 'short' ? SHORT : MC, hidden)
  const counts = mode === 'ox' ? [10, 20, 30, 50] : [10, 20, 30]
  const [picked, setPicked] = useState<Set<Subject>>(new Set())
  const [count, setCount] = useState(counts[0])
  const [weak, setWeak] = useState(true)

  const selected = picked.size ? pool.filter((q) => picked.has(q.subject)) : pool
  const n = Math.min(count, selected.length)

  const toggle = (id: Subject) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const start = () =>
    onStart((weak ? weakFirst(selected, stats) : shuffle(selected)).slice(0, n).map((q) => q.key))

  return (
    <>
      <Nav
        title={mode === 'ox' ? 'OX 특강' : mode === 'short' ? '단답 특강' : '간단 모의'}
        meta={mode === 'ox' ? 'OX' : mode === 'short' ? '주관식' : '4지선다'}
        onBack={onExit}
      />
      <div className="screen">
        <div>
          <div className="label" style={{ marginBottom: 10 }}>
            과목
          </div>
          <div className="choices" role="group" aria-label="과목">
            {SUBJECTS.map((s) => {
              const size = pool.filter((q) => q.subject === s.id).length
              const on = picked.has(s.id)
              return (
                <button key={s.id} className="ch" aria-checked={on} role="checkbox" onClick={() => toggle(s.id)}>
                  <span className="no">{on ? '☑' : '☐'}</span>
                  <span>{s.label}</span>
                  <span className="mk" style={{ color: on ? 'var(--accent)' : 'var(--ink-faint)' }}>
                    {size}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="label" style={{ marginBottom: 8 }}>
            문항 수
          </div>
          <div className="seg" role="radiogroup" aria-label="문항 수">
            {counts.map((c) => (
              <button key={c} role="radio" aria-checked={c === count} onClick={() => setCount(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          className="card option-toggle"
          role="switch"
          aria-checked={weak}
          onClick={() => setWeak((w) => !w)}
        >
          <div className="ct">
            약한 문제 먼저
            <span className="switch" aria-hidden="true" />
          </div>
          <div className="cd">정답률이 낮거나 아직 안 푼 문제를 우선 뽑습니다</div>
        </button>

        <button className="btn" onClick={start} disabled={!n}>
          {picked.size ? '' : '전 과목 '}
          {n}문항 시작
        </button>
        <div className="keys">
          선택한 과목의 문제 {selected.length}개 중 {n}개를 뽑습니다
        </div>
      </div>
    </>
  )
}
