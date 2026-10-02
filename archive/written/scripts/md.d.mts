// scripts/md.mjs의 타입. 구현은 JS(check.mjs가 Node로 바로 돌린다), 타입은 여기.
export type Inline = { t: 'b' | 'c' | 's'; v: string }
export type Item = { text: Inline[]; children: Item[] }
export type TableMode = 'kv' | 'grid' | 'stack' | 'pick'
export type Block =
  | { k: 'h3'; text: Inline[] }
  | { k: 'p'; text: Inline[] }
  | { k: 'ul' | 'ol'; items: Item[] }
  | { k: 'table'; head: Inline[][]; rows: Inline[][][]; mode: TableMode }
  | { k: 'code'; text: string }
  | { k: 'quote' | 'warn'; text: Inline[] }
  | { k: 'trap'; items: Item[] }
  | { k: 'scope'; text: string }
export type Sheet = { title: string; blocks: Block[] }

export function inline(s: string): Inline[]
export function plain(xs: Inline[]): string
export function parseBlocks(lines: string[]): Block[]
export function parseFile(src: string): { title: string; intro: Block[]; sheets: Sheet[] }
