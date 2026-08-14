import type { ReactNode } from 'react'
import { MEMO } from './lib.tsx'
import { Nav } from './Nav.tsx'

const CIPHER_SPECS = [
  { name: 'DES', block: 64, keys: '56', rounds: 16, roundLabel: '16', structure: 'Feistel' },
  { name: '3DES', block: 64, keys: '112 · 168', rounds: 48, roundLabel: '3 × 16', structure: 'Feistel' },
  { name: 'AES', block: 128, keys: '128 · 192 · 256', rounds: 14, roundLabel: '10 · 12 · 14', structure: 'SPN' },
  { name: 'SEED', block: 128, keys: '128 · 256', rounds: 16, roundLabel: '16', structure: 'Feistel' },
  { name: 'ARIA', block: 128, keys: '128 · 192 · 256', rounds: 16, roundLabel: '12 · 14 · 16', structure: 'SPN' },
  { name: 'HIGHT', block: 64, keys: '128', rounds: 32, roundLabel: '32', structure: 'ARX' },
  { name: 'LEA', block: 128, keys: '128 · 192 · 256', rounds: 32, roundLabel: '24 · 28 · 32', structure: 'ARX' },
  { name: 'IDEA', block: 64, keys: '128', rounds: 8, roundLabel: '8', structure: 'Lai–Massey' },
] as const

const MODES = [
  { name: 'ECB', iv: '없음', parallel: '암호화 · 복호화', error: '해당 블록', note: '패턴 노출 · 가장 취약' },
  { name: 'CBC', iv: 'IV', parallel: '복호화', error: '다음 블록까지', note: '가장 널리 쓰임' },
  { name: 'CFB', iv: 'IV', parallel: '복호화', error: '다음 블록까지', note: '스트림형 · 비동기식' },
  { name: 'OFB', iv: 'IV', parallel: '불가', error: '없음', note: '키스트림 선생성' },
  { name: 'CTR', iv: '논스', parallel: '암호화 · 복호화', error: '없음', note: '병렬 처리 · 랜덤 접근' },
  { name: 'GCM', iv: '논스', parallel: '가능', error: '없음', note: 'CTR + 인증' },
] as const

const ATTACKS = [
  { target: '모든 암호', items: ['전수조사'], defense: '키 길이가 방어선' },
  { target: '블록 암호', items: ['차분 공격', '선형 공격'], defense: null },
  { target: '스트림 · OTP', items: ['키스트림 재사용'], defense: null },
  { target: 'Diffie–Hellman', items: ['중간자 공격'], defense: '인증으로 방어' },
  { target: '해시', items: ['생일 공격', '레인보우 테이블'], defense: '레인보우 → 솔트' },
] as const

const answers = new Map(MEMO.map((q) => [q.key, q.answer]))

export function CryptoMap({ onExit }: { onExit: () => void }) {
  const answer = (key: string) => answers.get(key)!

  return (
    <>
      <Nav title="암호학 지도" meta="정보보안 일반" onBack={onExit} />
      <main className="screen crypto-map-page">
      <div className="map-content">
        <header className="map-intro crypto-intro">
          <span className="label">암호학 지도</span>
          <h2>숫자를 외우기 전에<br />구조부터 연결하기</h2>
          <p>시험에 반복해서 나오는 것만 골라 아래 여섯 단계로 묶었습니다. 위에서부터 순서대로 읽으면 됩니다.</p>
          <div className="study-route" aria-label="학습 순서">
            {['분류', '숫자', '구조', '모드', '인증', '공격'].map((step, i) => (
              <span key={step}><b>{i + 1}</b>{step}</span>
            ))}
          </div>
        </header>

        <section className="crypto-section" aria-labelledby="crypto-family-title">
          <SectionHead no="01" title="전체 분류 구조" sub="키가 몇 개인지, 무엇을 지키는지로 갈린다" id="crypto-family-title" />
          <div className="family-root">암호 기술</div>
          <div className="family-branches">
            <FamilyCard tone="symmetric" title="대칭키" desc="키 1개 · 기밀성">
              <FamilyItem title="블록 암호">DES · 3DES · AES<br />SEED · ARIA (국내)<br />HIGHT · LEA (경량)</FamilyItem>
              <FamilyItem title="스트림 암호">RC4 · ChaCha20 · A5/1</FamilyItem>
            </FamilyCard>
            <FamilyCard tone="asymmetric" title="비대칭키" desc="키 2개 · 서명 · 키교환">
              <FamilyItem title="소인수분해">RSA · Rabin</FamilyItem>
              <FamilyItem title="이산대수">DH · ElGamal · DSA</FamilyItem>
              <FamilyItem title="타원곡선">ECC · ECDSA</FamilyItem>
            </FamilyCard>
            <FamilyCard tone="hash" title="해시" desc="키 없음 · 무결성">
              <FamilyItem title="사용 권장">SHA-2 · SHA-3<br />RIPEMD-160 · LSH</FamilyItem>
              <FamilyItem title="폐기 대상">MD5 · SHA-1 · HAVAL</FamilyItem>
            </FamilyCard>
          </div>
        </section>

        <section className="crypto-section" aria-labelledby="cipher-spec-title">
          <SectionHead no="02" title="블록 암호 숫자 지도" sub="블록 크기 · 키 길이 · 라운드 수를 한 줄에" id="cipher-spec-title" />
          <div className="spec-legend" aria-hidden="true">
            <span>64-bit 블록</span><span>128-bit 블록</span><span>막대 = 최대 라운드</span>
          </div>
          <div className="spec-chart">
            {CIPHER_SPECS.map((cipher) => (
              <article className="spec-row" key={cipher.name}>
                <div className="spec-name">
                  <strong>{cipher.name}</strong>
                  <span className={`structure ${cipher.structure.toLowerCase().replace('–', '-')}`}>{cipher.structure}</span>
                </div>
                <div className="spec-visual">
                  <div className="block-dots" aria-label={`블록 ${cipher.block}비트`}>
                    <i /><i className={cipher.block === 128 ? 'on' : 'off'} />
                    <small>{cipher.block} bit</small>
                  </div>
                  <div className="round-bar" aria-label={`라운드 ${cipher.roundLabel}`}>
                    <span style={{ width: `${Math.max(12, cipher.rounds / 48 * 100)}%` }} />
                    <b>{cipher.roundLabel} R</b>
                  </div>
                </div>
                <div className="key-length"><small>KEY</small>{cipher.keys}</div>
              </article>
            ))}
          </div>
          <p className="chart-note">AES · ARIA · LEA는 키가 길어질수록 라운드가 늘어납니다. 3DES의 48은 DES 16라운드를 세 번 수행한 값입니다.</p>
          <div className="crypto-facts">
            <article><span>ARIA 개발</span><strong>{answer('memo-crypto#20')}</strong></article>
            <article><span>저전력 · RFID</span><strong>{answer('memo-crypto#24')}</strong></article>
            <article><span>Skipjack 키</span><strong>{answer('memo-crypto#29')} bit</strong></article>
          </div>
        </section>

        <section className="crypto-section" aria-labelledby="hash-spec-title">
          <SectionHead no="02+" title="해시는 두 가지 숫자가 있다" sub="결과로 나오는 길이와, 한 번에 삼키는 입력 크기" id="hash-spec-title" />
          <div className="hash-specs">
            <article>
              <header><strong>출력 길이</strong><span>결과로 나오는 지문</span></header>
              <HashBar name="MD5" value={answer('memo-crypto#30')} max={160} weak />
              <HashBar name="SHA-1" value={answer('memo-crypto#31')} max={160} weak />
              <HashBar name={answer('memo-crypto#34')} value="160" max={160} />
            </article>
            <article>
              <header><strong>입력 블록</strong><span>한 번에 처리하는 단위</span></header>
              <HashBar name="SHA-256" value={answer('memo-crypto#32')} max={1024} />
              <HashBar name="SHA-512" value={answer('memo-crypto#33')} max={1024} />
            </article>
          </div>
        </section>

        <section className="crypto-section" aria-labelledby="structure-title">
          <SectionHead no="03" title="Feistel vs SPN" sub="절반씩 번갈아 처리할까, 블록 전체를 한꺼번에 섞을까" id="structure-title" />
          <div className="structure-compare">
            <article className="structure-card feistel-card">
              <div className="structure-title"><strong>Feistel</strong><span>DES · SEED</span></div>
              <div className="feistel-diagram" aria-label="좌우 절반을 나눠 라운드 함수를 거치고 교환">
                <span>L</span><span>R</span>
                <i>⊕</i><b>F</b>
                <span>R</span><span>L′</span>
              </div>
              <p>R을 F에 넣고 L과 XOR한 뒤<br />좌우를 교환</p>
            </article>
            <article className="structure-card spn-card">
              <div className="structure-title"><strong>SPN</strong><span>AES · ARIA</span></div>
              <div className="spn-diagram" aria-label="블록 전체를 치환하고 순열">
                <div><span>01</span><span>10</span><span>11</span><span>00</span></div>
                <b>치환 S → 순열 P</b>
                <div><span>10</span><span>00</span><span>01</span><span>11</span></div>
              </div>
              <p>블록 전체에 치환과 순열을<br />반복 적용</p>
            </article>
          </div>
          <dl className="compare-list">
            <div className="compare-head"><dt>비교 항목</dt><dd>Feistel</dd><dd>SPN</dd></div>
            <div><dt>암·복호화</dt><dd>구조 동일 · 키 역순</dd><dd>역함수 별도 필요</dd></div>
            <div><dt>라운드 함수</dt><dd>역함수 불필요</dd><dd>역함수 필요</dd></div>
            <div><dt>병렬성 · 속도</dt><dd>낮음</dd><dd>높음</dd></div>
          </dl>
        </section>

        <section className="crypto-section" aria-labelledby="mode-title">
          <SectionHead no="04" title="블록 암호 운용 모드" sub="같은 알고리즘을 블록 여러 개에 어떻게 이어 붙일까" id="mode-title" />
          <div className="mode-chart">
            <div className="mode-head" aria-hidden="true"><span>모드</span><span>IV</span><span>병렬</span><span>오류</span></div>
            {MODES.map((mode) => (
              <article className={`mode-row mode-${mode.name.toLowerCase()}`} key={mode.name}>
                <strong>{mode.name}</strong>
                <span>{mode.iv}</span>
                <span>{mode.parallel}</span>
                <span>{mode.error}</span>
                <small>{mode.note}</small>
              </article>
            ))}
          </div>
          <p className="chart-note">IV는 첫 블록에 섞어 넣는 초기값, 병렬은 블록을 동시에 처리할 수 있는 방향, 오류는 한 블록이 깨졌을 때 번지는 범위입니다.</p>
        </section>

        <section className="crypto-section" aria-labelledby="integrity-title">
          <SectionHead no="05" title="무결성 · 인증 3단 비교" sub="오른쪽으로 갈수록 보장하는 범위가 넓어진다" id="integrity-title" />
          <div className="assurance-chart" role="table" aria-label="해시, MAC, 전자서명 비교">
            <div className="assurance-head" role="row"><span /><b>해시</b><b>MAC</b><b>전자서명</b></div>
            <AssuranceRow label="사용 키" values={['없음', '대칭키', '개인키']} />
            <AssuranceRow label="무결성" values={['●', '●', '●']} />
            <AssuranceRow label="송신자 인증" values={['—', '●', '●']} />
            <AssuranceRow label="부인방지" values={['—', '—', '●']} />
          </div>
          <div className="assurance-flow" aria-hidden="true"><span>변조 확인</span><i>+</i><span>누가 보냈나</span><i>+</i><span>부인 못함</span></div>
        </section>

        <section className="crypto-section" aria-labelledby="wireless-title">
          <SectionHead no="05+" title="무선 암호의 세대 전환" sub="깨진 WEP에서 AES를 쓰는 WPA2로" id="wireless-title" />
          <div className="wireless-flow">
            <article className="old"><span>WEP</span><strong>{answer('memo-crypto#43')}</strong><small>IV {answer('memo-crypto#44')} bit</small></article>
            <i aria-hidden="true">→</i>
            <article className="new"><span>WPA2</span><strong>AES</strong><small>{answer('memo-crypto#45')}</small></article>
          </div>
        </section>

        <section className="crypto-section" aria-labelledby="attack-title">
          <SectionHead no="06" title="공격은 대상을 짝지어 암기" sub="공격 이름보다 어느 암호를 노리는지가 핵심" id="attack-title" />
          <div className="attack-map">
            {ATTACKS.map((attack) => (
              <article key={attack.target}>
                <div><span>대상</span><strong>{attack.target}</strong></div>
                <i aria-hidden="true">→</i>
                <div><span>공격</span><strong>{attack.items.join(' · ')}</strong>{attack.defense && <small>{attack.defense}</small>}</div>
              </article>
            ))}
          </div>
        </section>
      </div>
      </main>
    </>
  )
}

function SectionHead({ no, title, sub, id }: { no: string; title: string; sub: string; id: string }) {
  return <header className="section-head"><span>{no}</span><div><h2 id={id}>{title}</h2><p>{sub}</p></div></header>
}

function FamilyCard({ tone, title, desc, children }: { tone: string; title: string; desc: string; children: ReactNode }) {
  return <article className={`family-card ${tone}`}><header><strong>{title}</strong><span>{desc}</span></header><div>{children}</div></article>
}

function FamilyItem({ title, children }: { title: string; children: ReactNode }) {
  return <div className="family-item"><strong>{title}</strong><span>{children}</span></div>
}

function AssuranceRow({ label, values }: { label: string; values: [string, string, string] | readonly [string, string, string] }) {
  return <div className="assurance-row" role="row"><b role="rowheader">{label}</b>{values.map((v, i) => <span key={i} role="cell" className={v === '●' ? 'yes' : v === '—' ? 'no' : ''}>{v}</span>)}</div>
}

function HashBar({ name, value, max, weak = false }: { name: string; value: string; max: number; weak?: boolean }) {
  return <div className="hash-bar"><b>{name}</b><span><i className={weak ? 'weak' : ''} style={{ width: `${Number(value) / max * 100}%` }} /></span><small>{value} bit</small></div>
}
