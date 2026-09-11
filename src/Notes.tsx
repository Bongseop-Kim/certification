import { useState, type ReactNode } from 'react'
import { Nav } from './Nav.tsx'
import { parseFile, plain, type Block, type Inline, type Item } from '../scripts/md.mjs'
import mustRaw from './must.md?raw'

// ponytail: sheets/*.md를 번들에 넣고 로드 시 파싱한다. 90KB, 수 ms. JSON 중간 산출물 없음.
const files = import.meta.glob<string>('../sheets/*.md', { query: '?raw', eager: true, import: 'default' })
const GROUPS = Object.keys(files)
  .sort()
  .map((f) => parseFile(files[f]))

type Table = Extract<Block, { k: 'table' }>

/** 목차·이전/다음이 묶음 경계를 넘도록 전부 한 줄로 편다 */
export const ALL = GROUPS.flatMap((g) => g.sheets.map((sheet) => ({ group: g.title.split(' — ')[0], sheet })))

/** "시트 2-3. 스캔 유형별 응답표" → ['2-3', '스캔 유형별 응답표'] */
const split = (title: string) => {
  const m = /^(?:시트|지도)\s+(\S+)\.\s*(.*)$/.exec(title)
  return m ? [m[1], m[2]] : ['', title]
}

export function NotesIndex({ onOpen, onExit }: { onOpen: (at: number) => void; onExit: () => void }) {
  let at = 0
  return (
    <>
      <Nav title="핵심 암기 정리" meta={`${ALL.length}장`} onBack={onExit} />
      <main className="screen">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="label" style={{ marginBottom: 10 }}>
              {g.title}
            </div>
            <div className="toc">
              {g.sheets.map((s) => {
                const i = at++
                const [no, name] = split(s.title)
                return (
                  <button className="card" key={s.title} onClick={() => onOpen(i)}>
                    <div className="ct">
                      {no && <span className="sheet-no">{no}</span>}
                      {name}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </main>
    </>
  )
}

export function SheetView({ at, onNav, onExit }: { at: number; onNav: (at: number) => void; onExit: () => void }) {
  const { group, sheet } = ALL[at]
  const [no, name] = split(sheet.title)
  return (
    <>
      <Nav title={group} meta={no || `${at + 1}/${ALL.length}`} onBack={onExit} />
      {/* key로 시트마다 가리기 상태를 초기화한다 */}
      <SheetBody key={at} name={name} blocks={sheet.blocks}>
        {/* .dock은 .screen 안에 있어야 한다 — 음수 margin이 .screen의 padding을 상쇄하는 구조 */}
        <div className="dock">
          <div className="row">
            <button className="btn weak" disabled={at === 0} onClick={() => onNav(at - 1)}>
              ← 이전
            </button>
            <button className="btn weak" disabled={at === ALL.length - 1} onClick={() => onNav(at + 1)}>
              다음 →
            </button>
          </div>
        </div>
      </SheetBody>
    </>
  )
}

/** 홈에서 바로 여는 필수 암기 5표 — 한 화면에 전부 펼친다 */
const MUST = parseFile(mustRaw)
export function MustView({ onExit }: { onExit: () => void }) {
  return (
    <>
      <Nav title={MUST.title} meta={`${MUST.sheets.length}표`} onBack={onExit} />
      <main className="screen sheet">
        {MUST.intro.map((b, i) => (
          <Render key={i} b={b} />
        ))}
        {MUST.sheets.map((s) => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            {s.blocks.map((b, i) => (
              <Render key={i} b={b} />
            ))}
          </section>
        ))}
      </main>
    </>
  )
}

function SheetBody({ name, blocks, children }: { name: string; blocks: Block[]; children: ReactNode }) {
  return (
    <main className="screen sheet">
      <h2>{name}</h2>
      {blocks.map((b, i) => (
        <Render key={i} b={b} />
      ))}
      {children}
    </main>
  )
}

/* ---------- 블록 렌더러 ---------- */

const I = ({ xs }: { xs: Inline[] }) =>
  xs.map((x, i) => (x.t === 'b' ? <b key={i}>{x.v}</b> : x.t === 'c' ? <code key={i}>{x.v}</code> : x.v))

function Items({ items, tag }: { items: Item[]; tag: 'ul' | 'ol' }) {
  const Tag = tag
  return (
    <Tag>
      {items.map((it, i) => (
        <li key={i}>
          <I xs={it.text} />
          {it.children.length > 0 && <Items items={it.children} tag="ul" />}
        </li>
      ))}
    </Tag>
  )
}

function Render({ b }: { b: Block }) {
  switch (b.k) {
    case 'h3':
      return <h3><I xs={b.text} /></h3>
    case 'p':
      return <p><I xs={b.text} /></p>
    case 'ul': {
      const nested = b.items.some((it) => it.children.length)
      return (
        <div className={nested ? 'tree' : 'list'}>
          <Items items={b.items} tag="ul" />
        </div>
      )
    }
    case 'ol':
      return (
        <div className="steps">
          <Items items={b.items} tag="ol" />
        </div>
      )
    case 'code':
      return <pre>{b.text}</pre>
    case 'quote':
      return (
        <div className="callout">
          <p><I xs={b.text} /></p>
        </div>
      )
    case 'warn':
      return (
        <div className="callout warn">
          <div className="cot">경계</div>
          <p><I xs={b.text} /></p>
        </div>
      )
    case 'trap':
      return (
        <div className="callout trap">
          <div className="cot">함정 포인트</div>
          <div className="list">
            <Items items={b.items} tag="ul" />
          </div>
        </div>
      )
    case 'scope':
      return <div className="scope">📍 {b.text}</div>
    case 'table':
      return <TableView t={b} />
  }
}

/* ---------- 표 4모드 (plans/summary-sheets.md §4) ---------- */

function TableView({ t }: { t: Table }) {
  // pick: 첫 열 고정 + 속성 열 하나. 칩으로 열을 바꾼다
  const [col, setCol] = useState(1)

  if (t.mode === 'grid')
    return (
      <div className="grid-wrap">
        <table className="grid">
          <thead>
            <tr>
              {t.head.map((c, j) => (
                <th key={j}><I xs={c} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j}><I xs={c} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )

  if (t.mode === 'stack')
    return (
      <div className="stack">
        {t.rows.map((r, i) => (
          <div key={i} className="srow">
            <div className="st"><I xs={r[0]} /></div>
            {r.slice(1).map((c, j) => (
              <div className="sa" key={j}>
                <span className="sl"><I xs={t.head[j + 1]} /></span>
                <span className="sv"><I xs={c} /></span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )

  // kv와 pick은 같은 몸통. pick은 위에 칩이 붙고 값 열이 바뀐다
  const v = t.mode === 'pick' ? col : 1
  return (
    <div className="pick">
      {t.mode === 'pick' && (
        <div className="chips" role="group" aria-label="열 선택">
          {t.head.slice(1).map((c, j) => (
            <button key={j} aria-pressed={j + 1 === col} onClick={() => setCol(j + 1)}>
              {plain(c)}
            </button>
          ))}
        </div>
      )}
      <div className="kv">
        <div className="kvh">
          <span><I xs={t.head[0]} /></span>
          <span><I xs={t.head[v]} /></span>
        </div>
        {t.rows.map((r, i) => (
          <div key={i} className="kvr">
            <span className="kk"><I xs={r[0]} /></span>
            <span className="v"><I xs={r[v]} /></span>
          </div>
        ))}
      </div>
    </div>
  )
}
