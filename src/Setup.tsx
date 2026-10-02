import { useState } from 'react'
import { Nav } from './Nav.tsx'
import { QUESTIONS, TYPES, byKey, dueFirst, shuffle, visible, type QType, type Stat } from './lib.tsx'

export type Form = 'practice' | 'review'

type Props = {
  form: Form
  stats: Map<string, Stat>
  hidden: Set<string>
  /** 복습은 기한이 지난 문제만 고른다. 복습 기한 순으로 정렬된 key */
  due?: string[]
  onStart: (keys: string[]) => void
  onExit: () => void
}

const formLabel: Record<Form, string> = { practice: '연습', review: '복습' }

export function Setup({ form, stats, hidden, due = [], onStart, onExit }: Props) {
  // 관심 없음은 여기서 한 번 걷어낸다. 유형별 개수 표시까지 자동으로 따라온다.
  // 복습은 due 순서를 지켜야 해서 key 순서대로 다시 뽑는다.
  const pool = form === 'review' ? due.map((k) => byKey.get(k)!) : visible(QUESTIONS, hidden)
  const [picked, setPicked] = useState<Set<QType>>(new Set())
  const [weak, setWeak] = useState(true)

  const selected = picked.size ? pool.filter((q) => picked.has(q.type)) : pool
  // 연습은 문항 제한 없이 고른 유형 전체를 푼다. 복습은 홈 배너와 같은 20문제 상한
  const n = form === 'review' ? Math.min(20, selected.length) : selected.length

  const toggle = (id: QType) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const start = () =>
    onStart(
      (form === 'review' ? selected : weak ? dueFirst(selected, stats) : shuffle(selected))
        .slice(0, n)
        .map((q) => q.key),
    )

  return (
    <>
      <Nav title={`실기 ${formLabel[form]}`} meta="자가 채점" onBack={onExit} />
      <main className="screen">
        <div>
          <div className="label" style={{ marginBottom: 10 }}>
            유형
          </div>
          <div className="choices" role="group" aria-label="유형">
            {TYPES.map((t) => {
              const size = pool.filter((q) => q.type === t.id).length
              const on = picked.has(t.id)
              return (
                <label key={t.id} className={on ? 'ch selected' : 'ch'}>
                  <input className="sr-only" type="checkbox" checked={on} onChange={() => toggle(t.id)} />
                  <span className="no">{on ? '☑' : '☐'}</span>
                  <span>{t.label}</span>
                  <span className="mk" style={{ color: on ? 'var(--accent)' : 'var(--ink-faint)' }}>
                    {size}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {form !== 'review' && (
          <button
            className="card option-toggle"
            role="switch"
            aria-checked={weak}
            onClick={() => setWeak((w) => !w)}
          >
            <div className="ct">
              복습 주기 우선
              <span className="switch" aria-hidden="true" />
            </div>
            <div className="cd">안 푼 문제와 복습 기한이 지난 문제를 우선 뽑습니다</div>
          </button>
        )}

        <button className="btn" onClick={start} disabled={!n}>
          {picked.size ? '' : '전 유형 '}
          {n}문항 시작
        </button>
      </main>
    </>
  )
}
