import type { ReactNode } from 'react'
import { MEMO } from './lib.tsx'

const memoAnswers = new Map(MEMO.map((q) => [q.key, q.answer]))
const answer = (key: string) => memoAnswers.get(key)!

export function MemoVisuals({ source }: { source?: string }) {
  if (source === 'memo-port') return <PortMap />
  if (source === 'memo-system') return <SystemMap />
  if (source === 'memo-tool') return <ToolMap />
  if (source === 'memo-law') return <LawMap />
  return null
}

function PortMap() {
  const pairs = [
    { title: 'FTP', left: ['데이터', 'memo-port#1'], right: ['제어', 'memo-port#2'] },
    { title: 'DHCP', left: ['서버', 'memo-port#7'], right: ['클라이언트', 'memo-port#8'] },
    { title: 'SNMP', left: ['Agent', 'memo-port#15'], right: ['Trap 수신', 'memo-port#16'] },
  ] as const
  const groups = [
    { title: '원격 접속', items: [['SSH', 'memo-port#3'], ['Telnet', 'memo-port#4'], ['RDP', 'memo-port#24']] },
    { title: '웹 · 메일', items: [['SMTP', 'memo-port#5'], ['HTTP', 'memo-port#10'], ['POP3', 'memo-port#12'], ['IMAP', 'memo-port#14'], ['HTTPS', 'memo-port#18']] },
    { title: '이름 · 인증 · 시간', items: [['DNS', 'memo-port#6'], ['Kerberos', 'memo-port#11'], ['NTP', 'memo-port#13'], ['LDAP', 'memo-port#17']] },
    { title: '파일 · 인프라', items: [['TFTP', 'memo-port#9'], ['SMB', 'memo-port#19'], ['IKE', 'memo-port#20'], ['syslog', 'memo-port#21'], ['SSDP', 'memo-port#22'], ['MySQL', 'memo-port#23'], ['Nessus', 'memo-port#25']] },
  ] as const

  return (
    <div className="memo-map-content">
      <MapSection no="01" title="연속 번호 3쌍" sub="번호가 나란히 붙어 있으니 어느 쪽이 무슨 역할인지로 외운다">
        <div className="port-pairs">
          {pairs.map((pair) => <article key={pair.title}><strong>{pair.title}</strong><div><PortValue item={pair.left} /><i>↔</i><PortValue item={pair.right} /></div></article>)}
        </div>
        <div className="secure-switches"><span>Telnet <b>{answer('memo-port#4')}</b></span><i>암호화 원격접속 →</i><strong>SSH {answer('memo-port#3')}</strong><span>HTTP <b>{answer('memo-port#10')}</b></span><i>TLS 적용 →</i><strong>HTTPS {answer('memo-port#18')}</strong></div>
      </MapSection>
      <MapSection no="02" title="서비스별 포트 지도" sub="같은 상황에서 함께 떠올릴 묶음">
        <div className="port-groups">
          {groups.map((group) => <article key={group.title}><h3>{group.title}</h3><div>{group.items.map((item) => <PortChip key={item[0]} item={item} />)}</div></article>)}
        </div>
      </MapSection>
      <MapSection no="03" title="같은 숫자표에 섞지 말 것" sub="AH와 ESP는 포트가 아니라 IP 프로토콜 번호">
        <div className="protocol-split">
          <article><span>PORT</span><strong>DNS · {answer('memo-port#6')}</strong><small>{answer('memo-port#30')}B 초과 응답은 TCP</small></article>
          <i aria-hidden="true">≠</i>
          <article><span>IP PROTOCOL</span><strong>AH · {answer('memo-port#31')}</strong><strong>ESP · {answer('memo-port#32')}</strong></article>
        </div>
      </MapSection>
    </div>
  )
}

function SystemMap() {
  return (
    <div className="memo-map-content">
      <MapSection no="01" title="계정 파일의 레코드 구조" sub="한 줄이 콜론으로 몇 칸 나뉘는지, 몇 번째 칸이 중요한지">
        <div className="file-anatomy">
          <FileFields name="/etc/passwd" count={Number(answer('memo-system#1'))} marks={{ 3: answer('memo-system#2'), 7: 'SHELL' }} hint={`3 = ${answer('memo-system#2')} · 7 = ${answer('memo-system#3')}`} />
          <FileFields name="/etc/group" count={Number(answer('memo-system#4'))} marks={{}} />
          <FileFields name="/etc/shadow" count={Number(answer('memo-system#5'))} marks={{ 2: '$5$' }} hint={`$5$ = ${answer('memo-system#6')}`} />
        </div>
      </MapSection>
      <MapSection no="02" title="로그 3종 구분" sub="현재 상태·성공 이력·실패 이력은 서로 다른 기록">
        <div className="log-flow">
          <LogNode label="현재 로그인" file={answer('memo-system#9')} />
          <LogNode label="성공 이력" file={answer('memo-system#10')} command={answer('memo-system#12')} />
          <LogNode label="실패 이력" file={answer('memo-system#11')} command={answer('memo-system#13')} danger />
        </div>
        <div className="log-extra">
          <span>최근 성공 <b>{answer('memo-system#14')}</b></span>
          <span>명령 이력 <b>pacct → {answer('memo-system#15')}</b></span>
          <span>인증 <b>{answer('memo-system#18')}</b></span>
          <span>부팅 <b>{answer('memo-system#19')}</b></span>
        </div>
      </MapSection>
      <MapSection no="03" title="umask 022 계산" sub="파일은 666, 디렉터리는 777에서 차감">
        <div className="permission-math">
          <article><span>파일</span><div><b>666</b><i>− 022</i><strong>{answer('memo-system#23')}</strong></div></article>
          <article><span>디렉터리</span><div><b>777</b><i>− 022</i><strong>{answer('memo-system#24')}</strong></div></article>
        </div>
        <div className="special-bits"><span>SUID <b>{answer('memo-system#25')}</b></span><span>SGID <b>{answer('memo-system#26')}</b></span><span>Sticky <b>{answer('memo-system#27')}</b></span></div>
      </MapSection>
      <MapSection no="04" title="접근 제어는 allow를 먼저 본다" sub="같은 호스트가 양쪽에 있으면 허용 규칙 우선">
        <div className="access-decision"><strong>hosts.allow에 일치?</strong><div><span>예 → 허용</span><span>아니오 → hosts.deny 확인</span></div><p>두 파일에 모두 일치해도 allow가 먼저 적용됩니다.</p></div>
        <div className="system-hardening">
          <span>SSH root 차단 <b>{answer('memo-system#43')}</b></span>
          <span>세션 시간 <b>{answer('memo-system#44')}</b></span>
          <span>ASLR 전체 난수화 <b>{answer('memo-system#49')}</b></span>
          <span>불필요 계정 쉘 <b>{answer('memo-system#46')}</b></span>
        </div>
      </MapSection>
    </div>
  )
}

function ToolMap() {
  return (
    <div className="memo-map-content">
      <MapSection no="01" title="Snort 룰 해부도" sub="헤더가 대상을 정하고 괄호 안 옵션이 내용을 검사">
        <div className="snort-rule" aria-label="Snort 룰 구조">
          <span className="action">{answer('memo-tool#1')}</span><span>tcp</span><span>any any</span><b>→</b><span>any 80</span>
          <div>( <i>{answer('memo-tool#2')}</i>; <i>{answer('memo-tool#3')}</i>; <i>{answer('memo-tool#8')}</i>; <i>{answer('memo-tool#9')}</i>; )</div>
        </div>
      </MapSection>
      <MapSection no="02" title="content 검사 범위" sub="처음부터 재면 offset/depth, 이전 매치부터 재면 distance/within">
        <div className="content-windows">
          <article><header>패킷 시작 기준</header><div><span>시작점</span><i>건너뜀 <b>{answer('memo-tool#4')}</b></i><strong>검사 길이 <b>{answer('memo-tool#5')}</b></strong></div></article>
          <article><header>이전 content 매치 기준</header><div><span>이전 매치</span><i>건너뜀 <b>{answer('memo-tool#6')}</b></i><strong>검사 길이 <b>{answer('memo-tool#7')}</b></strong></div></article>
        </div>
      </MapSection>
      <MapSection no="03" title="threshold 두 방식" sub="같은 count라도 알림을 자르는 방식이 다르다">
        <div className="threshold-compare">
          <article><strong>{answer('memo-tool#10')}</strong><div><i /><i /><i /><i className="off" /><i className="off" /></div><span>시간 안의 처음 count까지만</span></article>
          <article><strong>{answer('memo-tool#11')}</strong><div><i className="off" /><i className="off" /><i /><i className="off" /><i className="off" /><i /></div><span>count번마다 한 번</span></article>
        </div>
      </MapSection>
      <MapSection no="04" title="iptables 패킷 경로" sub="방화벽이 목적지면 INPUT, 통과하면 FORWARD">
        <div className="packet-paths"><div><span>외부</span><i>→</i><strong>{answer('memo-tool#15')}</strong><i>→</i><span>방화벽</span></div><div><span>외부</span><i>→</i><strong>{answer('memo-tool#16')}</strong><i>→</i><span>내부</span></div></div>
        <div className="iptables-actions"><span>첫 행 <b>{answer('memo-tool#17')}</b></span><span>마지막 <b>{answer('memo-tool#18')}</b></span><span>전체 삭제 <b>{answer('memo-tool#19')}</b></span><span>기본 정책 <b>{answer('memo-tool#20')}</b></span></div>
      </MapSection>
      <MapSection no="05" title="점검 대상별 도구" sub="무엇을 검사하는지로 구분">
        <div className="tool-targets"><article><span>파일시스템 무결성</span><strong>{answer('memo-tool#21')}</strong></article><article><span>웹 서버 · 웹 앱</span><strong>{answer('memo-tool#22')}</strong></article></div>
      </MapSection>
    </div>
  )
}

function LawMap() {
  return (
    <div className="memo-map-content">
      <MapSection no="01" title="사고 신고 타임라인" sub="개인정보 유출 72시간, 침해사고 24시간">
        <div className="law-timelines">
          <article><header>개인정보 유출</header><div><span>인지</span><i>→</i><strong>{answer('memo-law#1')}시간 이내</strong><i>→</i><b>정보주체 통지 · 신고</b></div></article>
          <article><header>침해사고</header><div><span>인지</span><i>→</i><strong>{answer('memo-law#10')}시간 이내</strong><i>→</i><b>최초 신고</b></div><div><span>추가 사항 확인</span><i>→</i><strong>{answer('memo-law#11')}시간 이내</strong><i>→</i><b>보완 신고</b></div></article>
        </div>
        <div className="report-decision"><strong>유출 신고</strong><span>{answer('memo-law#3')}명 이상</span><i>또는</i><span>민감정보 · {answer('memo-law#4')}</span><b>→ {answer('memo-law#5')}</b></div>
      </MapSection>
      <MapSection no="02" title="ISMS-P 101개 구조" sub="ISMS는 앞의 두 영역, ISMS-P는 개인정보 21개까지">
        <div className="isms-stack">
          <span style={{ flex: 16 }}><b>{answer('memo-law#14')}</b>관리체계</span>
          <span style={{ flex: 64 }}><b>{answer('memo-law#15')}</b>보호대책</span>
          <span style={{ flex: 21 }}><b>{answer('memo-law#16')}</b>개인정보</span>
        </div>
        <div className="isms-totals"><span>ISMS <b>{answer('memo-law#13')}</b></span><span>ISMS-P <b>{answer('memo-law#12')}</b></span></div>
      </MapSection>
      <MapSection no="03" title="개인정보 영향평가 임계치" sub="정보의 민감도와 결합 위험이 높을수록 기준이 낮다">
        <div className="pia-steps">
          <article><strong>{answer('memo-law#17')}만</strong><span>민감 · 고유식별</span></article>
          <article><strong>{answer('memo-law#18')}만</strong><span>파일 연계</span></article>
          <article><strong>{answer('memo-law#19')}만</strong><span>일반 개인정보</span></article>
        </div>
      </MapSection>
      <MapSection no="04" title="운영 주기" sub="보관·점검·파기·최초 평가의 시간 단위">
        <div className="law-cycles">
          <Metric value={`${answer('memo-law#7')}년`} label="접속기록 기본 보관" />
          <Metric value={`월 ${answer('memo-law#9')}회`} label="접속기록 점검" />
          <Metric value={`${answer('memo-law#20')}일`} label="불필요 개인정보 파기" />
          <Metric value={`${answer('memo-law#21')}개월`} label="기반시설 최초 평가" />
          <Metric value={`연 ${answer('memo-law#22')}회`} label="기반시설 정기 평가" />
        </div>
      </MapSection>
      <MapSection no="05" title="제재 숫자판" sub="퍼센트·배수·금액의 단위를 함께 외운다">
        <div className="sanction-grid">
          <Metric value={`${answer('memo-law#23')}%`} label="전체 매출액 과징금" />
          <Metric value={`${answer('memo-law#25')}배`} label="징벌적 손해배상" />
          <Metric value={`${answer('memo-law#26')}만원`} label="법정손해배상" />
          <Metric value={`${answer('memo-law#6')}천만원`} label="유출 미신고 과태료" />
        </div>
      </MapSection>
    </div>
  )
}

function MapSection({ no, title, sub, children }: { no: string; title: string; sub: string; children: ReactNode }) {
  const id = `map-section-${no.replace(/[^0-9]/g, '')}`
  return <section className="crypto-section" aria-labelledby={id}><header className="section-head"><span>{no}</span><div><h2 id={id}>{title}</h2><p>{sub}</p></div></header>{children}</section>
}

function PortValue({ item }: { item: readonly [string, string] }) {
  return <span><small>{item[0]}</small><b>{answer(item[1])}</b></span>
}

function PortChip({ item }: { item: readonly [string, string] }) {
  return <span><b>{answer(item[1])}</b>{item[0]}</span>
}

function FileFields({ name, count, marks, hint }: { name: string; count: number; marks: Record<number, string>; hint?: string }) {
  return <article><header><code>{name}</code><span>{count} fields</span></header><div>{Array.from({ length: count }, (_, i) => <span key={i} className={marks[i + 1] ? 'marked' : ''}>{marks[i + 1] ?? i + 1}</span>)}</div>{hint && <small>{hint}</small>}</article>
}

function LogNode({ label, file, command, danger = false }: { label: string; file: string; command?: string; danger?: boolean }) {
  return <article className={danger ? 'danger' : ''}><span>{label}</span><strong>{file}</strong>{command && <small>{command}</small>}</article>
}

function Metric({ value, label }: { value: string; label: string }) {
  return <article><strong>{value}</strong><span>{label}</span></article>
}
