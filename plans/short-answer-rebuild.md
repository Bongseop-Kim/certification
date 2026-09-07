# 단답형 문제 재구축 플랜

작성 2026-09-07. 근거: `~/Downloads/정보보안기사 출제기준 (1).pdf`(필기, 적용기간 2023.1.1~2026.12.31), 웹 조사(하단 출처), 저장소 현황.

## 1. 왜 다시 만드나

현재 단답 170문항은 노트 사진(`scripts/notes/*.md`)을 줄 단위로 옮긴 것이다. 그래서

- 사진에 적힌 것이면 뭐든 문제가 됐다. "쿠키는 몇 KB 이하인가 → 4", "TCB 보안 DB 약어 → SKDB"처럼 시험에 안 나오는 잡지식이 섞여 있다.
- 방향이 뒤집힌 게 많다. 정답이 "구문", "패키저"처럼 그 단어를 모르면 유추도 못 하는 것이면 암기 카드가 아니라 퀴즈다.
- 객관식과 같은 파일에 섞여 있어(`2026-notes-*.json`) 단답만 따로 관리·검토할 수 없다.

목적을 다시 적는다. **필기 4지선다에서 "정답 보기"로 튀어나오는 용어·숫자·약어를, 보기 없이도 떠올릴 수 있게 하는 것.** 실기 대비가 아니다. 서술·절차·비교는 객관식에 맡긴다.

## 2. 삭제

| 대상 | 방법 |
|---|---|
| `questions/written/2026-algisa-general.json` (단답 12) | 파일 삭제 |
| `2026-notes-{app,general,law,network,system}.json` 안의 `type: "short"` 158문항 | 스크립트로 필터링해 객관식만 남김 |
| Supabase `attempts`·`flags`의 옛 단답 기록 | 건드리지 않는다. `byKey`에 없는 key는 집계에서 자동 무시된다(README 규칙) |

`npm run check`가 통과하면 끝. 코드 변경 없음.

## 3. 출제기준 → 카드 영역 매핑

출제기준 세세항목 중 "답이 하나로 떨어지는 사실"이 나오는 곳만 고른다. 나머지(운영, 대응 방법, 장애 분석 등)는 단답 대상이 아니다.

| 과목 | 출제기준 항목 | 단답으로 만들 것 |
|---|---|---|
| 시스템 | 시스템 정보(인증정보, 감사 로그) / 운영체제 | 리눅스 파일 경로, 로그 파일명, 특수권한 숫자, umask 결과, UID/RID, 윈도우 이벤트 ID·레지스트리 키·인증 구성요소(LSA/SAM/SRM) |
| 시스템 | 시스템 공격기법 / 대응기술 | 공격 이름(설명→이름), 방어기법 이름(ASLR, DEP, 카나리), 취약 함수→안전 함수 |
| 시스템 | 분석 도구 | 도구 이름, nmap 스캔 옵션 1개씩 |
| 네트워크 | 네트워크 개념·주소 | 포트 번호, 헤더 필드 크기, 특수 주소, 클래스 선두비트, 프리픽스 계산 |
| 네트워크 | 장비·도구 | 장비 동작 계층, 진단 명령 이름 |
| 네트워크 | DoS/DDoS·스캐닝·스푸핑·스니핑 | 설명→공격 이름, 스캔 응답 규칙(닫힌 포트→RST) |
| 네트워크 | 보안 프로토콜·솔루션 | IPSec 세부 프로토콜(AH/ESP/IKE), VPN 계층별 프로토콜, 무선 암호(WEP/WPA/WPA2 ↔ RC4/TKIP/CCMP), IDS 탐지 분류, 오탐 용어 |
| 애플리케이션 | FTP·메일·Web·DNS·DB | 포트, 설정 파일·옵션 이름, HTTP 메소드·상태코드·헤더, SPF/DKIM/DMARC 구분, DNSSEC, 공격 이름(→이름), DB 암호화 방식 이름 |
| 애플리케이션 | 전자상거래 | SET·이중서명·WTLS 등 프로토콜 이름 |
| 애플리케이션 | 개발 보안 | 취약점 이름(설명→이름), 안전한 코딩 기법 이름(Prepared Statement) |
| 정보보안 일반 | 인증·접근통제·키분배·디지털서명 | 인증 Type 1/2/3, 접근통제 모델 이름과 규칙 이름, Kerberos 구성요소, X.509/CRL/OCSP, 특수 전자서명 이름 |
| 정보보안 일반 | 암호 알고리즘·해시 | 알고리즘별 블록·키·라운드·출력 길이(값 하나씩), Feistel/SPN 분류, 수학 기반(소인수분해/이산대수/타원곡선), 운영모드 특성, MAC 종류 |
| 관리·법규 | 위험평가·대책·인증제도 | 위험분석 기법 이름, ALE/SLE 공식 항, 위험 대응 4종, 복구 사이트 종류, ISO 27000 번호, ISMS-P 개수·유효기간·의무대상 수치, CC 용어(PP/ST/EAL) |
| 관리·법규 | 개인정보보호법·정보통신망법 | 기한·인원·비율 숫자 (개정 확인된 것만) |

## 4. 카드 작성 규칙

기존 `AGENTS.md` 단답 규칙 위에 다음을 추가한다. 웹 조사(SuperMemo 20 rules, Matuschak, Anki type-answer 관행) 기준.

1. **방향은 설명→용어.** 정답은 시험 보기에 나올 형태(용어·약어·숫자). "~의 정의는?"처럼 답이 문장이 되는 방향은 금지.
2. **한 카드 한 값.** "SEED의 블록/키/라운드" 대신 "SEED 라운드 수 → 16" 3장으로 쪼갠다.
3. **열거 금지.** "위험 대응 4가지"는 안 된다. "보험 가입에 해당하는 위험 대응 → 전가"처럼 원소 하나만 묻는다. 순서형은 "n번째 단계"로만.
4. **정답이 유일해지도록 큐를 좁힌다.** 큐 끝에 형식을 못박는다. `(영문 약어)`, `(한글)`, `(숫자만)`, `(파일 경로 전체)`, `(옵션명만)`.
5. **약어가 있으면 약어가 정답.** OCSP, CRL, IKE, NAC, RBAC, ALE. 한/영 병기 갈등의 대부분이 이걸로 사라진다.
6. **정답 필드에 괄호·설명·조사 금지.** 비교 대상 문자열 그 자체만. 채점기가 `·.()_-/`와 공백·대소문자를 무시하므로 `Clark-Wilson`/`클락윌슨` 같은 표기 갈림은 큐의 `(영문)` 지시로 막는다.
7. **한글 고유어 정답은 접미어를 큐에 흡수.** "~ 공격은?"이라고 물으면 정답은 "Land"가 아니라 사용자가 "Land 공격"이라 칠 수 있다. 큐를 "~ 공격의 이름은? (영문, '공격' 제외)"로 쓰거나 접미어 없는 용어(Smurf, Teardrop)만 택한다.
8. **예/아니오, 둘 중 하나 금지.** "AH는 기밀성을 제공하나?" 대신 "IPSec에서 기밀성을 제공하는 프로토콜 → ESP".
9. **과목 태그를 큐에 넣지 않는다.** 화면이 `subjectTag`로 이미 보여준다. 대신 비슷한 카드끼리 혼동될 때(포트 161/162) 큐에 구분 단서를 넣는다.
10. **법규 숫자는 조문·시행일을 `note`에.** 2023.9.15 이후 개정이 많아 구법 수치 카드가 오답 카드가 된다(§6).
11. **출처 없는 카드는 없다.** 선정 기준(§5) 중 하나 이상을 `note`에 적는다. 예: `note: "기출 2023-03-11#48 정답보기 / notes IMG_5220"`.

## 5. 선정 기준: 무엇을 카드로 만드나

세 가지 신호가 겹치는 순서로 뽑는다. 수량 목표는 정하지 않는다(AGENTS.md 원칙). 다만 감으로는 과목당 40~60장, 총 200~300장 선에서 끝날 것이다.

1. **기출 정답 보기.** 보유 4회차(2022-03-13, 2022-06-25, 2023-03-11, 2025-1) 객관식에서 정답 보기 텍스트가 14자 이하인 165개 항목을 1차 후보로 삼는다. 이미 추출 가능하다(`choices[answer]`). 예: SCAN, NAC, Mirai, /etc/ftpusers, robots.txt, Land 공격, TCP FIN Scan, Salt, 생일공격, 시나리오법, 기준선 접근법, RTO, ISO27001, CTCPEC, 전자봉투, Blom 방식.
   여기에 웹에서 확보한 11~18회(2018~2021) 8회차 800문항 분석을 합친다(§12). **2회차 이상 반복된 정답은 무조건 후보**, 1회 등장은 §5-2·3과 겹칠 때만.
2. **웹 조사 빈출 목록**(§7). 수험 커뮤니티·요약글·실기 단답 복원에서 반복 확인된 항목. ★ 표시.
3. **노트 근거.** `scripts/notes/*.md`에 값이 적혀 있어 정답을 확인할 수 있는 것. 노트는 *근거*로만 쓴다. 노트에 있다는 이유로 카드를 만들지 않는다(현재 실패의 원인).

제외: 1·2에 없고 노트에만 있는 것, 답이 문장인 것, 도서 저자의 분류 이름(예: "바이러스 세대별 분류의 3세대 이름"), 사진 판독 불확실(`(?)`, `[?]`) 항목.

## 6. 법규 숫자: 조문 확인 완료

2026-09 기준 law.go.kr 헤더로 현행 확인: 개인정보 보호법 법률 제20897호(시행 2025.10.2), 시행령 제36121호(시행 2026.8.20), 안전성 확보조치 기준 고시 제2023-6호(시행 2023.9.22). 카드 `note`에는 아래 조문을 그대로 적는다.

| 항목 | 현행 값 | 조문 | 개정 |
|---|---|---|---|
| 유출 신고 기한 | 72시간 | 법 §34③, 령 §39·40 | 2023.9.15. 구 "24시간/5일" 금지 |
| 유출 신고 대상 | 1천명 이상, 또는 민감·고유식별정보, 또는 외부 불법접근 | 법 §34③ | 2023.9.15 |
| 열람 / 정정·삭제 처리 | 10일 이내 | 법 §35③·§36, 령 §41·43 | 안정 |
| 파기 | 지체 없이 | 법 §21 | 안정 |
| 파기 5일 | 5일 이내 | **표준 개인정보 보호지침 §10** (시행령 아님) | 근거 조문 틀리기 쉬움 |
| 법정대리인 동의 연령 | 만 14세 미만 | 법 §22의2 | 안정 |
| 징벌적 손해배상 한도 | 5배 | 법 §39③ | 2023.9.15. 구 3배 |
| 과징금 상한 | 전체 매출액 3% (산정 곤란 시 20억) | 법 §64의2① | 2023.9.15. 구 "관련 매출액" |
| CPO 자격요건 대상 | 매출 1,500억 이상 & (정보주체 100만 이상 또는 민감·고유식별 5만 이상) | 법 §31, 령 §32④·별표1 | 2024.3.15 |
| CPO 자격요건 | 총 4년(개인정보보호 2년 포함) | 령 별표1 | 2024.3.15, 기존자 유예 2026.3.14 |
| 접속기록 보관 | 1년 (5만명 이상 고유식별·민감정보 또는 기간통신사업자 2년) | 안전성 확보조치 기준 §8 | 안정 |
| 접속기록 점검 | 월 1회 이상 | 기준 §8 | 안정 |
| 인터넷망 차단 대상 | 일평균 100만명 이상 | 기준 §6 | 2025.10.31 위험분석 예외 허용. 출제 불확실, 보류 |
| 악성프로그램 갱신 | 일 1회 이상 | 기준 §9 | 안정 |
| ISMS 의무대상 | ISP·IDC / 매출·세입 1,500억(상급종합병원, 재학생 1만 대학) / 정보통신서비스 매출 100억 / 일평균 이용자 100만 | 정보통신망법 §47②, 령 §49 | 안정 |
| ISMS 유효기간 / 사후심사 | 3년 / 연 1회 | 정보통신망법 §47③④ | 안정 |
| 정보통신망법 침해사고 신고 | 24시간 이내 | 정보통신망법 §48의3 | 2024.8.14. 구 "즉시" |
| ISMS-P 인증기준 수 | 101 = 16 + 64 + 21 (ISMS만 80) | ISMS-P 고시 | 2023.11 개정. 구 102 |
| ISMS-P 인증기관 / 심사기관 | KISA, 금융보안원 / KAIT, TTA, OPA, NISC, KMR(2025) | | 기관 추가가 잦음 |
| 기반시설 취약점 분석·평가 | 지정 후 6개월 이내, 이후 매년 | 정보통신기반 보호법 §9, 령 §17 | 시행령 원문 미확인 |
| 정보보호 공시 의무 | 상장법인 매출 3,000억 또는 이용자 100만, 6월 30일까지 | 정보보호산업법 §13, 령 §8 | 3,000억 기준 폐지 개정 진행 중(2027 적용 예정). 보류 |

기출(§12)에서 실제 나온 법 숫자는 유출 신고 1천명, 파기 5일, ISMS 100만/100억, 유효기간 3년, 경보단계 "경계"뿐이다. 카드는 이 5개 + 72시간 + 접속기록 1년/월 1회 + 만 14세 + 열람 10일 + 과징금 3% 정도로 좁힌다. 기관 목록·공시 기준처럼 자주 바뀌는 것은 만들지 않는다.

노트 `law.md`의 OX 해설은 개정 전 교재일 수 있다. 숫자가 위 표와 다르면 표를 따른다.

## 7. 과목별 카드 후보

웹 조사에서 뽑은 후보. ★ = 복수 출처 반복. 값은 §13에서 검증했다. 최종 채택은 §5 기준으로 한 장씩 판단한다.

### 시스템
- ★ SetUID/SetGID/Sticky 검색 perm 값 → 4000 / 2000 / 1000
- ★ umask 022 → 파일 644, 디렉터리 755
- ★ root UID → 0
- ★ `last`가 읽는 로그 → wtmp / 로그인 실패 → btmp / 현재 로그인 → utmp
- ★ 패스워드 해시 파일 → /etc/shadow
- ★ PAM 4가지 타입 중 하나씩 (account/auth/session/password)
- FTP 접속 금지 사용자 파일 → /etc/ftpusers (기출)
- ★ 레지스트리 로컬 머신 루트 키 → HKLM
- 윈도우 인증 구성요소: 로컬 보안 정책 → LSA / 계정 DB → SAM / 접근 허용 판단 → SRM
- Administrator RID → 500 / Guest → 501 (값 확인됨. 이벤트 ID 4624는 기출 미등장이라 보류, §12)
- 엘리베이터 디스크 스케줄링 → SCAN (기출)
- 스택 카나리 기법 → StackGuard / 주소 무작위화 → ASLR / 실행 방지 → DEP(NX) (기출)
- 포맷 스트링에서 메모리 쓰기 서식 → %n
- `strcpy` 대체 안전 함수 → strncpy
- 이미지 인식 AI 오작동 입력 → Adversarial 공격 (기출)
- 프로세스가 열어둔 파일 조회 명령 → lsof (기출)
- 안드로이드 권한 선언 파일 → AndroidManifest.xml

### 네트워크
- ★ 포트: FTP 20·21 / SSH 22 / Telnet 23 / SMTP 25 / DNS 53 / DHCP 67·68 / TFTP 69 / HTTP 80 / Kerberos 88 / POP3 110 / NTP 123 / NetBIOS 137·138·139 / IMAP 143 / SNMP 161·162 / LDAP 389 / HTTPS 443 / SMB 445 / Syslog 514(UDP) / RDP 3389 (한 장에 하나, 우선순위는 §12)
- ★ TCP 닫힌 포트 응답 → RST / UDP 닫힌 포트 → ICMP Port Unreachable
- ★ 출발지=목적지 IP DoS → Land / ICMP 브로드캐스트 증폭 → Smurf / 분할 오프셋 조작 → Teardrop / POST 바디 1바이트씩 → RUDY / HTTP 헤더 미완성 → Slowloris
- 2016 IoT 봇넷 → Mirai (기출)
- ★ IPSec 무결성·인증 → AH / 기밀성 → ESP / 키 교환 → IKE / 동작 계층 → 3
- ★ 2계층 VPN → PPTP, L2TP, L2F (각각 한 장) / 2계층 터널링 표준 RFC 2661 → L2TP (기출)
- ★ WEP → RC4 / WPA → TKIP / WPA2 → CCMP(AES) / WPA3 개방 암호화 → Enhanced Open (기출)
- ★ MAC 기반 단말 접근제어 솔루션 → NAC (기출)
- 클래스 B 선두 비트 → 10 / 클래스 C 기본 마스크 → 24
- ★ 신규 공격 탐지 가능한 IDS 방식 → 이상탐지 / 정상을 공격으로 판정 → False Positive
- 라우터 계층 → 3 / 스위치 → 2 / 리피터 → 1
- NIC 2개 방화벽 → Dual-Homed Host / 경계망 → 스크린드 서브넷
- 악성 도메인 자동 생성 → DGA
- TCP 순서 보장 32비트 필드 → Sequence Number / IPv4 헤더 최소 길이 → 20 / IPv6 기본 헤더 → 40
- traceroute 이용 필드 → TTL
- SNMP 기본 커뮤니티 → public
- 패킷 캡처 라이브러리 → Libpcap (기출) / 룰 기반 오픈소스 IDS → Snort (기출)
- 세션 하이재킹 탐지 지표 → ACK Storm

### 애플리케이션
- ★ 아파치 설정 파일 → httpd.conf / 디렉터리 리스팅 차단 옵션 → Indexes
- ★ 허용 메소드 조회 → OPTIONS / 파일 업로드 위험 메소드 → PUT
- ★ 크롤러 제어 파일 → robots.txt (기출) / 쿠키 설정 헤더 → Set-Cookie (기출)
- ★ 메일 전달 서버 → MTA / 사용자 프로그램 → MUA
- ★ 발신 IP DNS 검증 → SPF / 전자서명 → DKIM / 정책·보고 → DMARC
- ★ DNS 응답 전자서명 → DNSSEC / 리졸버 캐시 오염 → DNS 캐시 포이즈닝 / 악성 도메인 우회 → DNS 싱크홀 (기출)
- ★ FTP Active 데이터 포트 → 20 / 제어 → 21 / UDP 부팅용 전송 → TFTP (기출)
- ★ Log4Shell CVE → CVE-2021-44228
- ★ 카드 결제 프로토콜 → SET / 주문·지불 분리 서명 → 이중서명 (기출) / WAP 보안 → WTLS
- ★ 참·거짓 응답 추론 SQLi → Blind / 문자열 결합 대체 → Prepared Statement
- 상태코드: 인증 필요 → 401 / 권한 없음 → 403 / 프락시 요청 메소드 → CONNECT
- 광고 통한 악성코드 유포 → Malvertising
- 쿠키 스크립트 접근 차단 → HttpOnly / HTTPS 전용 → Secure
- 메일 포트: IMAP 143 / POP3 110 / SMTP 25 / Submission 587
- DB 암호화: DBMS 내장 → TDE / 애플리케이션 수정 → API 방식 / DB 서버 모듈 → Plug-In
- 기출: HTTP Smuggling, 디렉터리 인덱싱, 난독화, xp_cmdshell, 피닝, 은닉서명, 전자봉투, /etc/ftpusers

### 정보보안 일반
- ★ DES 블록 64 / 키 56 / 라운드 16 / 라운드 키 48
- ★ 3DES 키 → 112·168 / AES 라운드 10·12·14 / 블록 128
- ★ SEED 128·128·16 Feistel / ARIA 12·14·16 SPN(KISA 확인) / IDEA 64·128·8
- ★ Feistel 구조 → DES, SEED, Blowfish / SPN → AES, ARIA (분류 묻기: "AES 구조 → SPN")
- ★ 해시 출력: MD5 128 / SHA-1 160 / SHA-256 256 / SHA-512 512
- ★ 소인수분해 → RSA / 이산대수 → DH, ElGamal, DSA / 타원곡선 → ECC
- ★ RSA 복호화 식 → C^d mod n
- ★ IV 불필요 모드 → ECB / 스트림처럼 동작하는 모드 → CTR, OFB, CFB
- ★ MITM 취약 키 교환 → Diffie-Hellman / 해시 충돌 공격 → 생일공격 (기출)
- ★ 인증서 표준 → X.509 / 실시간 폐기 확인 → OCSP / 폐기 목록 → CRL
- ★ Kerberos: 티켓 발급 → TGS / 인증 → AS / 통합 → KDC
- ★ 인증 Type 1/2/3 → 지식/소유/존재 / 타인 수락률 → FAR / 본인 거부율 → FRR
- ★ 기밀성 MAC 모델 → BLP / 무결성 → Biba / 직무분리 무결성 → Clark-Wilson / 이해충돌 → Chinese Wall
- ★ BLP no read up → 단순 보안 속성 / no write down → *-속성
- ★ 역할 기반 → RBAC / 소유자 재량 → DAC / 등급 기반 → MAC
- ★ 해시 기반 MAC → HMAC / 블록 암호 기반 → CMAC
- OTP 시간 동기 → TOTP / 카운터 → HOTP
- 스트림 암호 대표 → RC4 / 국내 전자서명 표준 → KCDSA / 미국 → DSA
- 사전 계산 해시 공격 방어 → Salt (기출) / 키 분배 사전 방식 → Blom (기출)
- 대칭키+공개키 결합 → 하이브리드 암호 시스템 (기출) / 알고리즘 공개 원리 → 커크호프
- 128비트 보안강도 RSA 키 → 3072 / ECC → 256 (NIST SP 800-57)

### 관리·법규
- ★ ISMS-P 인증기준 총 → 101 / 관리체계 16 / 보호대책 64 / 개인정보 처리단계 21
- ★ ISMS 의무 매출 → 100억 / 이용자 → 100만 / 유효기간 → 3년
- ★ 델파이 / 시나리오법 / 순위결정법 / 베이스라인 / 복합 접근법 (설명→이름)
- ★ ALE → SLE × ARO / SLE → 자산가치 × EF
- ★ 보험 → 위험 전가 / 사업 중단 → 위험 회피 (기출)
- 수용 가능 위험 → DoA
- ★ 실시간 동기화 사이트 → 미러 / 장소만 → 콜드 / 복구 목표 시간 → RTO (기출)
- ★ ISMS 국제표준 → ISO/IEC 27001 / 위험관리 → 27005 / 클라우드 PII → 27018 / 거버넌스 → 27014 (기출)
- CC 표준 번호 → ISO/IEC 15408 / 보호 프로파일 → PP / 보안목표명세 → ST / 평가등급 → EAL
- 캐나다 평가기준 → CTCPEC (기출) / 유럽 → ITSEC / 미국 → TCSEC
- BCP+DRP 관리 프로세스 → BCM / 고장 간격 → MTBF
- 포렌식 원칙: 동일 결과 → 재현의 원칙 (기출)
- 법규 숫자는 §6 표의 항목만

## 8. 데이터 형식

기존 스키마 그대로. 코드 변경 없음.

- 파일: `questions/written/short-{system,network,app,general,law}.json`. 과목당 한 파일, 단답만.
- key: `short-{subject}#{n}`. `attempts.question_key`가 새 key를 가리키므로 옛 기록과 섞이지 않는다.
- `type: "short"`, `choices: null`, `stimulus: null`(필요 시 짧은 지문).
- `answer`: 규칙 6에 맞춘 문자열 하나.
- `note`: 근거. `"기출 2023-03-11#48"`, `"notes IMG_5220"`, `"개인정보보호법 §34 2023.9.15 시행"`.
- `source: "short-{subject}"`.

건너뛴 것: 복수 정답(`accepted: string[]`) 필드. 규칙 4·5·7로 큐를 좁히면 필요가 거의 없다. 실제로 쓰다가 "맞는데 오답" 사례가 쌓이면 그때 `answer`를 배열로 바꾸고 `normalizeShortAnswer` 비교를 `some`으로 바꾼다(코드 두 줄).

## 9. 검증

- `npm run check` 통과.
- `scripts/check.mjs`에 단답 규칙 assert 추가(작은 변경): `answer`에 `(`·`)`·공백 3개 이상 없음, 길이 30자 이하, `note` 필수, 같은 과목 파일 안 `answer` 정규화 중복 시 `body`가 다름을 사람이 확인하도록 경고.
- 작성자가 아닌 사람(또는 다음 세션)이 과목당 10장을 무작위로 골라 큐만 보고 답을 쳐본다. 답이 둘 이상 떠오르면 큐를 고친다.

## 10. 작업 순서

**진행 상황 (2026-09-07)**: 1~5단계 완료. 단답 540장(일반 87 · 네트워크 121 · 시스템 113 · 애플리케이션 116 · 법규 102). 카드 원본은 `scripts/short/cards_<subject>.py`, 빌더는 `scripts/short/build.py`.
보류한 카드: 정보통신기반 보호법 취약점 분석·평가 주기(시행령 §17 원문 미확인), 취약점 분석 위탁 불가 기관(기관명 변경), 정보보호 공시 3,000억(폐지 예정). 원문 확인 후 추가.
셀프 테스트(§9)는 사람이 타이핑하는 단계가 남았다. 자동 검사(정답이 큐에 노출되는지, 정규화 후 빈 문자열인지)는 통과.


1. 삭제(§2). 커밋.
2. 기출 정답 보기 165개 추출 스크립트 1회 실행 → 후보 초안(§5-1). 저장하지 않고 작업 참고용.
3. 과목 순서: 일반 → 네트워크 → 시스템 → 애플리케이션 → 법규. 법규는 §6 재확인이 필요해 마지막.
4. 과목 하나 끝날 때마다 `npm run check` + 셀프 테스트(§9) + 커밋.
5. `AGENTS.md`에 규칙 1·2·3·5·7·11을 옮겨 적는다(나중에 문항을 추가하는 사람이 같은 실수를 안 하도록).

## 11. 표형 지식은 셀마다 카드를 만드나

포트 번호, 알고리즘별 블록·키·라운드, 해시 출력 길이, 리눅스 로그 파일처럼 한 주제에서 값이 여러 개 나오는 것.

**결론: 시험에 나오는 행에 대해서는 셀마다 한 장씩 만든다. 표 전체를 다 만들지는 않는다.**

근거는 보유 기출의 출제 방식이다. 표형 지식은 "다음 중 틀린 것은?"으로 나오고, 보기 4개가 표의 셀 4개다.

| 회차 | 한 문항에 깔린 셀 |
|---|---|
| 2022-06-25 #30 | SSH 22, SMTP 25, HTTPS 443, FTP(오답 보기 28) |
| 2023-03-11 #36 | NetBIOS 137·138·139, POP3 110, IMAP 143, 전송 프로토콜 포함 |
| 2023-03-11 #9 | wtmp, lastlog, secure 등 로그 파일 설명 |
| 2025-1 #18 | wtmp, utmp, btmp, lastlog |
| 2022-03-13 #80 | SEED·ARIA·HIGHT 특징 서술 → 알고리즘 이름 |

셀 하나만 알아서는 나머지 세 보기가 맞는지 판단할 수 없다. 그래서 표를 통째로 알아야 하고, 카드는 셀 단위(최소 정보 원칙)로 쪼개는 게 맞다. "SEED의 블록·키·라운드는?" 한 장은 답이 셋이라 채점도 안 되고, 셋 중 하나만 틀려도 전부 다시 외우게 된다.

다만 셀을 고를 때는 이렇게 자른다.

1. **행은 기출·빈출에 나온 것만.** 포트라면 IANA 목록이 아니라 시험에 나온 15~20개(§7 네트워크 목록). 블록 암호라면 DES·3DES·AES·SEED·ARIA·IDEA까지. LEA·HIGHT는 "경량 암호 이름"으로 한 장이면 된다.
2. **열은 시험이 묻는 것만.** 블록 암호는 블록·키·라운드·구조 4열. 개발 연도나 설계자는 안 낸다.
3. **방향은 한 가지로 고정.** 프로토콜→포트, 알고리즘→값, 로그 파일→내용. 역방향("161번 포트를 쓰는 프로토콜은?")은 혼동이 잦은 셀(161/162, 137/138/139, 20/21, wtmp/utmp/btmp)에만 따로 둔다. 시험이 그렇게 묻기 때문이다.
4. **파생 가능한 값은 안 만든다.** "AES-192 라운드 12"는 만들되 "AES 블록 128"은 세 키 길이에 대해 한 번만. "3DES 블록 64"는 DES 블록 64에서 따라오므로 생략.
5. **간격 반복이 간섭을 흡수한다.** 비슷한 카드 20장이 같은 세션에 몰려 나오면 서로 헷갈리지만, Leitner 간격이 벌어지면 틀린 셀만 반복된다. 카드 수를 줄이는 것보다 큐에 구분 단서를 넣는 게 낫다("SNMP 매니저가 트랩을 받는 포트" vs "에이전트가 폴링을 받는 포트").

예상 규모: 포트 약 20장 + 역방향 6장, 블록 암호 6행×3~4열 약 20장, 해시 4~5장, 리눅스 로그 8장 + 역방향 4장, 윈도우 이벤트 ID 4~5장. 표형만 70장 안팎으로, 전체 200~300장 안에 들어간다.

## 12. 기출 8회차(11~18회) 반복 항목

cbtbank·comcbt·kinz에서 2018-03 ~ 2021-09 필기 8회차 원문을 확보해 "정답이 용어·숫자 하나"인 문항을 집계했다. 2024년부터 CBT 전환으로 원문이 비공개라 2024~2025는 합격 후기 용어 목록만 있다. 로컬 4회차(19·20·21회, 2025-1)는 이 집계에 넣지 않았으므로 합산하면 회차 수가 더 올라간다.

회차 수는 8회차 중 등장 횟수. 3회 이상은 반드시 카드로, 2회는 후보, 1회는 §5 다른 신호와 겹칠 때만.

### 시스템 (3회 이상)
xferlog(4) · 비권장 함수 gets/strcpy ↔ 권장 fgets/strncpy(4) · EXT 계열은 리눅스 FS(4) · wtmp/btmp/messages 로그(4) · Sticky bit·SetUID 4755 표기(4) · RADIUS(3) · find -perm -4000(3) · crontab 필드 해석(3) · HKEY_CLASSES_ROOT(3) · Spectre/Meltdown(3) · DLP(3) · SOAR(3) · OTP(3) · SSO(3) · 트로이목마는 자기복제 없음(3) · DAC(3) · PAM(3) · MFT(3)
2회: IPC$ Null Session, init PID 1, exFAT, i-node에 파일명 없음, umask 077, UID 0, /etc/shadow, /etc/hosts.equiv·.rhosts, Mirai, Race Condition, UAC, Cyber Kill Chain, CDR, SIEM, 좀비 프로세스 STAT Z, CryptoJacking, 윈도우 부팅 순서

### 네트워크 (3회 이상)
SYN Flooding(5) · IPSec AH/ESP·터널/전송·3계층(5) · Smurf·Directed Broadcast 차단(4) · Teardrop(4) · NAC(4) · Promiscuous Mode·Port Mirroring(3) · Snort 룰 옵션(3) · WPA2=CCMP/AES(3)
2회: ESM, Null 스캔, Watering Hole, Pharming, Land, ARP Spoofing, TCP 세션 하이재킹, HTTP GET Flooding, traceroute·ICMP Time Exceeded, Honeypot, Egress/Ingress Filtering

### 애플리케이션 (3회 이상)
FTP Bounce(5) · 이중서명/SET(5) · CSRF(5) · DRM 구성요소(5, 26년에도) · XSS(4) · SQL Injection·Blind(4) · 연계보관성 Chain of Custody(3) · PGP는 수신 부인방지 미제공(3) · DNSSEC(3) · SSL/TLS Record 프로토콜 역할(3) · Set-Cookie/Cache-Control/Referer/Received 헤더(3)
2회: DNS 조회 순서(캐시→hosts→DNS), HTTP 401, HEAD/POST 메소드, 화이트박스, FDS, Heartbleed, Supply Chain, HSM, WPKI, TFTP UDP 69, CAPTCHA, OCSP

### 정보보안 일반 (3회 이상)
DAC/MAC/RBAC 구분(7, 거의 매회) · CRL 기본영역 vs 확장영역(5) · Kerberos(4) · Needham-Schroeder(4) · 재전송 공격 방어=순서번호·타임스탬프·Nonce(4) · 스트림 암호 XOR(4) · CFB(3) · CBC(3) · MD5 128/SHA-1 160(3) · BLP(3) · AES 256→14라운드·SPN(3) · 충돌저항성/제2역상저항성(3) · 생체인식 요구조건(3)
2회: Diffie-Hellman, RSA(소인수분해, 계산 문제), 대칭키 개수 n(n-1)/2, 차분 공격, 선택 평문 공격, 은닉서명, X.509는 개인키 미포함, HMAC, IV, 트래픽 분석, OTP(One Time Pad), OAuth

### 관리·법규 (3회 이상)
델파이/시나리오/순위결정법(5) · 개인정보 영향평가 고려사항(5) · 민감정보 범위(4) · BCP 5단계(4) · 암호화 필수 아닌 항목=전화번호(3) · 취약점 분석·평가 위탁 가능 기관(3) · CC=ISO 15408(3) · 주요정보통신기반시설 지정 고려사항(3)
2회: 위험 전가, 위험 감소, 핫 사이트, ISMS-P, ISMS 의무대상 100만/100억, OECD 8원칙, 개인정보 처리방침, 위험관리 절차, 업무연속성계획, 정량적 분석 장단점, ALE=SLE×ARO, BS7799/ISO 27001

### 표형 지식: 실제 출제된 셀 (11~18회)
- **포트**: 22, 53, 161 / 143 / 67·68 / 137·138·139 / 20·21·Passive 1024↑ / 69. 23·25·110·443·514·3389는 8회차에서 미등장이지만 로컬 회차(2022-06-25 #30)에 25·443이 나왔다. §11 예상 20장에서 우선순위는 이 순서.
- **알고리즘**: AES 14라운드·SPN, IDEA 128/64/8, MD5 128(512블록·4라운드), SHA-1 160, LEA 경량, ARIA·LEA·SEED 국산, RC4·A5 스트림. SEED·ARIA 라운드 수는 직접 묻지 않았다. **DES 파라미터도 직접 출제 없음** → §7 일반 목록의 DES/3DES/SEED/ARIA 세부값은 각 1~2장으로 줄인다.
- **운영모드**: CFB(3), CBC(3), OFB, CTR, IV — 모드는 "특징→이름" 방향이 전부.
- **리눅스 파일**: xferlog, wtmp, btmp, messages, pacct, /etc/shadow, /etc/skel, /etc/services, /etc/hosts.equiv, /etc/securetty, /etc/rc.d/rc.local, /etc/ftpusers, xinetd only_from, logrotate, TMOUT
- **리눅스 명령**: find -perm, crontab, umask, chmod 4755, passwd -x, ps STAT Z, last
- **윈도우**: HKEY_CLASSES_ROOT, SAM/LSA/SRM, MFT, NTFS/exFAT, UAC, mstsc, net share, ipconfig /displaydns, autorun.inf. **이벤트 ID(4624 등)는 미등장** → §7의 이벤트 ID 카드는 보류.
- **HTTP**: 401, 200/400/500, HEAD, POST, Set-Cookie, Cache-Control, Referer
- **표준 번호**: 15408, 27001, BS7799. **27002/27005/27701 미등장** → §7 법규의 27005/27018/27014는 로컬 기출(27014)만 남긴다.
- **법 숫자**: 유출 신고 1천명, 파기 5일, ISMS 100만/100억, 유효기간 3년, 경보단계 "경계". 그 외 숫자는 8회차에 없다. §6 표는 구법 오답 방지용이고, 카드는 이 5개 + 72시간·접속기록 1년 정도로 좁힌다.

### 2024~2025 후기에서 언급된 용어
BlueBorne, FTP Passive/Bounce, WEP/WPA/WPA2, NetBIOS, nmap, tcpdump, Hydra, HMAC, 역상저항성, 은닉/이중서명, CBC/CTR, BLP/Biba, 포맷스트링, CSRF, Half Open 스캔, 백오리피스, SRM/SAM, BYOD, 정량적 위험분석. 위 반복표와 대부분 겹친다. 원문이 없으므로 이것으로 새 카드를 만들지는 않고, 겹치는 항목의 우선순위를 올리는 데만 쓴다.

### 이 분석이 §7 후보에 주는 수정
- 추가: xferlog, FTP Bounce, RADIUS, Needham-Schroeder, CRL 확장영역, Promiscuous Mode, Egress/Ingress Filtering, HKEY_CLASSES_ROOT, MFT, IPC$, /etc/hosts.equiv, Spectre/Meltdown, DLP, SOAR, CDR, Chain of Custody, FDS, HSM, 대칭키 개수 공식, OECD 8원칙(원소 하나씩), 민감정보 범위(원소 하나씩)
- 축소: 블록 암호 파라미터 전체 표(→AES·IDEA·MD5·SHA-1 중심), 윈도우 이벤트 ID(보류), ISO 27000 시리즈(→15408·27001·27014)
- 유지: 포트, 접근통제 모델, 위험분석 기법, DoS 공격 이름, IPSec, 무선 암호

출처: https://cbtbank.kr/category/정보보안기사 (ccw20180331 ~ ccw20210327), https://www.comcbt.com/cbt/exam/15984/ (18회), https://www.kinz.kr/subject/258531, https://newbt.kr/시험/정보보안기사 (2023-2회 24문항, 26년 파트1), https://tnfhrnsss.github.io/docs/etc/challenge/secure_test_2025_02/ (2025-2 후기), https://blog.system32.kr/506 (2025-1 후기)

## 13. 표형 값 검증 결과와 카드 함정

권위 출처(IANA, NIST FIPS, KISA, man page, Microsoft Docs, RFC 9110, law.go.kr)로 값을 확인했다. 카드 작성 시 아래 값을 쓰고, 노트나 블로그 값과 다르면 이쪽을 따른다.

**블록 암호** (블록 / 키 / 라운드 / 구조)
DES 64/56/16/Feistel · 3DES 64/112·168/48/Feistel · AES 128/128·192·256/10·12·14/SPN · SEED 128/128/16/Feistel · ARIA 128/128·192·256/12·14·16/SPN · LEA 128/128·192·256/24·28·32/ARX · HIGHT 64/128/32/Feistel · IDEA 64/128/8/Lai-Massey · Blowfish 64/32~448/16/Feistel · Skipjack 64/80/32

**해시** (출력 / 블록)
MD5 128/512(64스텝) · SHA-1 160/512(80) · SHA-256 256/512(64) · SHA-512 512/1024(80) · SHA-3 Sponge 24라운드 · RIPEMD-160 160/512 · HAS-160 160/512(KCDSA용) · LSH 국산(2014)

**공개키 기반 난제**: RSA·Rabin 소인수분해 / DH·ElGamal·DSA·KCDSA 이산대수 / ECDSA·EC-KCDSA 타원곡선. DSA는 FIPS 186-5(2023)에서 서명 생성 승인 철회.
**보안강도 등가**: 112→RSA 2048·ECC 224 / 128→3072·256 / 192→7680·384 / 256→15360·512.

**리눅스 로그**: utmp 현재 로그인(who,w) · wtmp 로그인 이력(last) · btmp 실패(lastb) · lastlog 마지막 로그인(lastlog) · sulog su 기록(Unix) · secure/auth.log 인증 · xferlog FTP · pacct 프로세스(lastcomm) · messages 일반 · cron · dmesg 커널.
**passwd 7필드 / shadow 9필드**: shadow 3 최종변경일, 4 최소, 5 최대, 6 경고, 7 비활성, 8 만료.
**find -perm**: `-mode` 모두 설정, `/mode` 하나라도, `mode` 정확히.

**윈도우**: RID 500 Administrator · 501 Guest · 512 Domain Admins · 513 Domain Users · 544 빌트인 Administrators. Winlogon → LSA(검증·SID 매칭·감사) → SAM(계정 DB) → SRM(접근 판단). FAT32 파일 최대 4GiB. EFS는 압축 파일 불가. BitLocker는 TPM 1.2+, XTS-AES 128 기본.

**카드로 만들 때 함정이 되는 값**

| 값 | 함정 | 카드 처리 |
|---|---|---|
| 514 | TCP는 rsh, UDP가 syslog | 큐에 "UDP" 명시, 정답 514 |
| 1521 | IANA 등록은 ncube-lm, Oracle은 관행 | 큐에 "관행상 Oracle 리스너" |
| 465 | IANA에 urd·submissions 이중 등록 | 587 Submission만 카드화 |
| 3DES 키 | 112(2키)와 168(3키) 둘 다 정답 | "3키 3DES 유효 키 길이" 식으로 큐 분리 |
| IDEA 라운드 | 8 + 출력변환(8.5로 쓰는 교재 있음) | 정답 8, 큐에 "출력변환 제외" |
| 파기 5일 | 시행령이 아니라 표준 개인정보 보호지침 §10 | note에 근거 정확히 |
| ISMS 의무대상 매출 | 1,500억(세입)과 100억(정보통신서비스 매출) 둘 | 큐에 어느 매출인지 명시 |
| CPO 대상 100만 | ISMS 100만과 헷갈림 | 큐에 "CPO 자격요건 적용 기준" 명시 |
| 27001 vs 27002 | 인증 규격 vs 실행지침 | 큐에 "인증 심사 규격" / "통제 실행지침" |
| 정보보호 공시 3,000억 | 2027년 폐지 예정 | 카드 안 만듦 |

**미확인으로 남은 것**: NIST SP 800-57 FFC N열(160/224/256/384/512), 정보통신기반 보호법 시행령 §17 원문, 법정손해배상 300만원. 이 셋은 카드화 전 원문 확인.

출처: IANA https://www.iana.org/assignments/service-names-port-numbers/ · KISA 암호 https://seed.kisa.or.kr/kisa/algorithm/EgovAriaInfo.do · RFC 4269(SEED) · FIPS 180-4 https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf · https://www.keylength.com/en/4/ · man7 lastlog(8)/passwd(5)/shadow(5)/find(1) · Microsoft SID https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-identifiers · 이벤트 ID https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/appendix-l--events-to-monitor · RFC 9110 · law.go.kr 개인정보 보호법 lsId=011357, 시행령 lsId=011468, 안전성 확보조치 기준 admRulSeq=2100000229672 · https://itwiki.kr/w/암호화_알고리즘 · https://itwiki.kr/w/ISO/IEC_27000_시리즈

## 출처

카드 작성 원칙
- https://www.supermemo.com/en/blog/twenty-rules-of-formulating-knowledge
- https://andymatuschak.org/prompts/
- https://docs.ankiweb.net/templates/fields.html
- https://github.com/scott2000/answerset

빈출·암기 항목
- https://velog.io/@dotaky99/정보보안기사-핵심-요약
- https://velog.io/@yeon_ni/정보보안기사-필기-25년-3월
- https://cbtbank.kr/exam/ccw20230311
- https://itwiki.kr/w/정보보안기사_교본
- https://itwiki.kr/w/ISMS-P_인증_기준
- https://itwiki.kr/w/ISMS-P_인증심사원_주요_암기사항
- https://newbt.kr/시험/정보보안기사 실기 (실기 단답 복원, 핵심 용어 프록시)

법규 개정
- http://www.boannews.com/news/articleView.html?idxno=121977 (2023.9.15 과징금)
- http://www.boannews.com/news/articleView.html?idxno=127454 (2024.3.15 시행)
- https://www.kimchang.com/ko/insights/detail.kc?sch_section=4&idx=30389 (침해사고 24시간)
- https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=9200 (안전성 확보조치)
- https://intothesec.com/149 (2025.10.31 개정)
