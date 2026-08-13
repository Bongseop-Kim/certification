import { useEffect, useState } from 'react'
import { Nav } from './Nav.tsx'
import {
  CIRCLED,
  CopyBtn,
  MC,
  subjectTag,
  byKey,
  pct,
  renderBody,
  visible,
  weakFirst,
  type Attempt,
  type FlagKind,
  type Question,
  type Stat,
} from './lib.tsx'

type Props = {
  mode: 'practice' | 'review'
  keys?: string[]
  stats: Map<string, Stat>
  record: (rows: Omit<Attempt, 'answered_at'>[]) => Promise<number[]>
  addNote: (id: number, note: string) => Promise<void>
  marks: Set<string>
  hidden: Set<string>
  toggle: (key: string, kind: FlagKind) => void
  onExit: () => void
}

export function Practice({ mode, keys, stats, record, addNote, marks, hidden, toggle, onExit }: Props) {
  // 출제 순서는 들어올 때 한 번만 정한다. 답을 맞힐 때마다 순서가 흔들리면 못 푼다.
  // 연습형은 4지선다만. OX는 별도 모드라 목록에서 넘어와도 걸러낸다.
  const [queue] = useState<Question[]>(() =>
    keys
      ? keys.flatMap((k) => byKey.get(k) ?? []).filter((q) => q.type === 'mc')
      : weakFirst(visible(MC, hidden), stats),
  )
  const [idx, setIdx] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [graded, setGraded] = useState(false)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [stat] = useState(() => stats) // 배지는 이 세션 시작 시점의 성적을 보여준다

  const q = queue[idx]
  const done = !q
  const ok = graded && String(chosen) === q?.answer

  // 포기는 chosen을 비운 오답으로 남긴다. 찍어서 맞힌 기록이 실력으로 보이는 걸 막는 게 목적.
  const grade = (pick: number | null) => {
    if (graded || !q) return
    setChosen(pick)
    setGraded(true)
    void record([
      {
        question_key: q.key,
        correct: pick !== null && String(pick) === q.answer,
        chosen: pick === null ? null : String(pick),
        mode,
        session_id: null,
        note: null,
      },
    ]).then(([id]) => setAttemptId(id ?? null))
  }

  const confirm = () => chosen !== null && grade(chosen)

  // ponytail: 네이티브 confirm. 커스텀 모달은 되돌릴 수 없는 동작이 늘어나면.
  const giveUp = () => {
    if (window.confirm('정말 포기하시겠습니까? 오답으로 기록됩니다.')) grade(null)
  }

  const next = () => {
    if (note.trim() && attemptId !== null) void addNote(attemptId, note.trim())
    setChosen(null)
    setGraded(false)
    setAttemptId(null)
    setNote('')
    setIdx((i) => i + 1)
  }

  // 되살리기는 '내 기록 · 관심 없음' 탭에서 한다. 여기선 한 방향으로만 — 숨기고 바로 넘어간다.
  const hide = () => {
    if (!q) return
    toggle(q.key, 'hide')
    next()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (!q) return
      const n = Number(e.key)
      if (n >= 1 && n <= (q.choices?.length ?? 0) && !graded) setChosen(n - 1)
      else if (e.key === 'Enter') {
        if (graded) next()
        else confirm()
      }
      else if ((e.key === 'g' || e.key === 'G') && !graded) giveUp()
      else if (e.key === 's' || e.key === 'S') toggle(q.key, 'mark')
      else if (e.key === 'h' || e.key === 'H') hide()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (done) {
    return (
      <>
        <Nav title={mode === 'review' ? '오답 모아 풀기' : '연습형'} onBack={onExit} />
        <div className="screen">
          <div className="empty">{queue.length}문항을 다 풀었습니다.</div>
          <button className="btn" onClick={onExit}>
            홈으로
          </button>
        </div>
      </>
    )
  }

  const s = stat.get(q.key)

  return (
    <>
      <Nav
        title={mode === 'review' ? '오답 모아 풀기' : '연습형'}
        meta={`${subjectTag(q.subject)} · ${idx + 1}${mode === 'review' ? `/${queue.length}` : ''}`}
        onBack={onExit}
      />
      <div className="screen">
        {graded && (
          <div className={ok ? 'verdict ok' : 'verdict'}>
            <span className="vt">{ok ? '정답' : chosen === null ? '포기' : '오답'}</span>
            <span className="vd">
              정답 {CIRCLED[Number(q.answer)]}
              {!ok && chosen !== null && ` · 내 답 ${CIRCLED[chosen]}`}
            </span>
          </div>
        )}
        {(!graded || q.variantOf) && (
          <div className="qchips">
            {!graded && (
              <span className="qchip">
                {s ? `${s.tries}회 풀어 ${s.correct}회 정답 · ${pct(s.correct, s.tries)}%` : '처음 푸는 문제'}
              </span>
            )}
            {q.variantOf && <span className="qchip variant">변형 문제</span>}
          </div>
        )}
        <p className="qbody">{renderBody(q.body)}</p>
        {q.stimulus && <div className="stimulus">{renderBody(q.stimulus)}</div>}

        <div className="choices">
          {(q.choices ?? []).map((c, i) => {
            const cls = graded
              ? String(i) === q.answer
                ? 'ch correct'
                : i === chosen
                  ? 'ch wrong'
                  : 'ch'
              : 'ch'
            return (
              <button
                key={i}
                className={cls}
                aria-checked={!graded && i === chosen}
                role="radio"
                onClick={() => !graded && setChosen(i)}
              >
                <span className="no">{CIRCLED[i]}</span>
                <span>{renderBody(c)}</span>
                {graded && String(i) === q.answer && <span className="mk">정답</span>}
                {graded && !ok && i === chosen && <span className="mk">내 답</span>}
              </button>
            )
          })}
        </div>

        <CopyBtn q={q} />

        {graded && !!s?.notes.length && (
          <div className="callout">
            <span className="cot">지난 메모</span>
            {s.notes.map((n, i) => (
              <p key={i}>“{n}”</p>
            ))}
          </div>
        )}

        {graded && q.note && (
          <div className="callout">
            <span className="cot">원본 정오표</span>
            <p>{q.note}</p>
          </div>
        )}

        {graded && !ok && (
          <textarea
            className="field"
            rows={2}
            placeholder="왜 틀렸는지 한 줄"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        )}

        <div className="dock">
          {graded ? (
            <div className="row">
              <button className="btn weak" onClick={() => toggle(q.key, 'mark')}>
                {marks.has(q.key) ? '★ 북마크' : '☆ 북마크'}
              </button>
              <button className="btn weak" title="이 문제를 다시 출제하지 않습니다" onClick={hide}>
                관심 없음
              </button>
              <button className="btn" onClick={next}>
                다음 문제
              </button>
            </div>
          ) : (
            <div className="row">
              <button className="btn weak" title="모르는 문제는 찍지 말고 포기 — 오답으로 기록됩니다" onClick={giveUp}>
                포기
              </button>
              <button className="btn" onClick={confirm} disabled={chosen === null}>
                확인
              </button>
            </div>
          )}

          <div className="keys">
          {graded ? (
            <>
              <span className="kb">Enter</span> 다음 문제 <span className="kb">S</span> 북마크{' '}
              <span className="kb">H</span> 관심 없음
            </>
          ) : (
            <>
              <span className="kb">1</span>
              <span className="kb">2</span>
              <span className="kb">3</span>
              <span className="kb">4</span> 선택 <span className="kb">Enter</span> 확인{' '}
              <span className="kb">G</span> 포기 <span className="kb">S</span> 북마크{' '}
              <span className="kb">H</span> 관심 없음
            </>
          )}
          </div>
        </div>
      </div>
    </>
  )
}
