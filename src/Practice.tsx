import { useEffect, useState } from 'react'
import { Nav } from './Nav.tsx'
import {
  AiTag,
  CopyBtn,
  GradeMark,
  QUESTIONS,
  byKey,
  dueFirst,
  renderBody,
  typeTag,
  visible,
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
  const [queue] = useState<Question[]>(() =>
    keys ? keys.flatMap((k) => byKey.get(k) ?? []) : dueFirst(visible(QUESTIONS, hidden), stats),
  )
  const [idx, setIdx] = useState(0)
  const [mine, setMine] = useState('') // 내가 쓴 답안(선택). 비교용이라 채점에는 안 쓴다
  const [revealed, setRevealed] = useState(false)
  const [ok, setOk] = useState<boolean | null>(null) // 자가 채점 결과
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [stat] = useState(() => stats) // 배지는 이 세션 시작 시점의 성적을 보여준다

  const q = queue[idx]
  const done = !q
  const graded = ok !== null

  // 서술·작업형은 문자열로 맞출 수 없어 정답을 본 뒤 직접 맞음/틀림을 고른다.
  const grade = (right: boolean) => {
    if (graded || !q || !revealed) return
    setOk(right)
    void record([
      {
        question_key: q.key,
        correct: right,
        chosen: mine.trim() || null,
        mode,
        session_id: null,
        note: null,
      },
    ]).then(([id]) => setAttemptId(id ?? null))
  }

  const next = () => {
    if (note.trim() && attemptId !== null) void addNote(attemptId, note.trim())
    setMine('')
    setRevealed(false)
    setOk(null)
    setAttemptId(null)
    setNote('')
    setIdx((i) => i + 1)
    scrollTo(0, 0)
  }

  // 되살리기는 '내 기록 · 관심 없음' 탭에서 한다. 여기선 한 방향으로만 — 숨기고 바로 넘어간다.
  const hide = () => {
    if (!q) return
    toggle(q.key, 'hide')
    next()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q) return
      // 답안을 쓰는 중에는 Ctrl/Cmd+Enter로만 정답을 연다
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !revealed) setRevealed(true)
        return
      }
      if (e.key === 'Enter') {
        if (graded) next()
        else if (!revealed) setRevealed(true)
      } else if ((e.key === 'o' || e.key === 'O') && revealed) grade(true)
      else if ((e.key === 'x' || e.key === 'X') && revealed) grade(false)
      else if (e.key === 's' || e.key === 'S') toggle(q.key, 'mark')
      else if (e.key === 'h' || e.key === 'H') hide()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const title = mode === 'review' ? '오답 모아 풀기' : '실기 연습'

  if (done) {
    return (
      <>
        <Nav title={title} onBack={onExit} />
        <main className="screen">
          <div className="empty">{queue.length}문항을 다 풀었습니다.</div>
          <button className="btn" onClick={onExit}>
            홈으로
          </button>
        </main>
      </>
    )
  }

  const s = stat.get(q.key)
  const before = s?.wrong ?? [] // 전에 틀렸을 때 적어 둔 내 답안

  return (
    <>
      <Nav
        title={title}
        meta={`${typeTag(q.type)} · ${idx + 1}${mode === 'review' ? `/${queue.length}` : ''}`}
        onBack={onExit}
      />
      <main className="screen">
        {graded && <GradeMark ok={ok} label={ok ? '맞음' : '틀림'} />}
        <div className="label">
          {q.source}
          {q.check === 'minor' && ' · 원문 확인 권장'}
          <AiTag q={q} />
        </div>
        <div className="qbody pre">{renderBody(q.body)}</div>

        <CopyBtn q={q} />

        {!revealed && (
          <textarea
            className="field"
            rows={5}
            placeholder="내 답안 (선택)"
            value={mine}
            onChange={(e) => setMine(e.target.value)}
          />
        )}

        {revealed && (
          <>
            {mine.trim() && (
              <div className="callout">
                <span className="cot">내 답안</span>
                <p className="pre">{mine}</p>
              </div>
            )}
            <div className="callout">
              <span className="cot">정답</span>
              <div className="rbw">{renderBody(q.answer)}</div>
            </div>
            {q.explanation && (
              <div className="callout">
                <span className="cot">해설</span>
                <div className="rbw">{renderBody(q.explanation)}</div>
              </div>
            )}
          </>
        )}

        {graded && !!(s?.notes.length || before.length) && (
          <div className="callout">
            <span className="cot">지난 기록</span>
            {before.map((a, i) => (
              <p key={`w${i}`} className="pre">
                전에 쓴 답안: {a.length > 80 ? `${a.slice(0, 80)}…` : a}
              </p>
            ))}
            {s?.notes.map((n, i) => (
              <p key={i}>{n}</p>
            ))}
          </div>
        )}

        {graded && !ok && (
          <textarea
            className="field"
            rows={5}
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
              <button className="btn" style={{ flex: 2 }} onClick={next}>
                다음 문제
              </button>
            </div>
          ) : revealed ? (
            <div className="row">
              <button className="btn weak" onClick={() => grade(false)}>
                틀림
              </button>
              <button className="btn" onClick={() => grade(true)}>
                맞음
              </button>
            </div>
          ) : (
            <button className="btn" onClick={() => setRevealed(true)}>
              정답 보기
            </button>
          )}

          <div className="keys">
            {graded ? (
              <>
                <span className="kb">Enter</span> 다음 문제 <span className="kb">S</span> 북마크{' '}
                <span className="kb">H</span> 관심 없음
              </>
            ) : revealed ? (
              <>
                <span className="kb">O</span> 맞음 <span className="kb">X</span> 틀림{' '}
                <span className="kb">S</span> 북마크 <span className="kb">H</span> 관심 없음
              </>
            ) : (
              <>
                <span className="kb">Enter</span> 정답 보기 (입력 중엔 <span className="kb">Ctrl</span>+
                <span className="kb">Enter</span>) <span className="kb">S</span> 북마크{' '}
                <span className="kb">H</span> 관심 없음
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
