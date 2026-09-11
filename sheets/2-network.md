# 2과목. 네트워크 보안 — 6장

> 백지 복원 효율이 가장 높은 과목. 특히 2-1·2-3은 투자 대비 회수가 크다.

## 시트 2-1. 포트 번호

| 포트 | 프로토콜 | 서비스 |
|---|---|---|
| 20 | TCP | FTP 데이터 |
| 21 | TCP | FTP 제어 |
| 22 | TCP | SSH / SFTP / SCP |
| 23 | TCP | Telnet |
| 25 | TCP | SMTP |
| 53 | UDP/TCP | DNS (질의 UDP, 존 전송 TCP) |
| 67 / 68 | UDP | DHCP (서버 67 / 클라이언트 68) |
| 69 | UDP | TFTP |
| 80 | TCP | HTTP |
| 88 | TCP/UDP | Kerberos |
| 110 | TCP | POP3 |
| 119 | TCP | NNTP |
| 123 | UDP | NTP |
| 137 / 138 | UDP | NetBIOS 이름 / 데이터그램 |
| 139 | TCP | NetBIOS 세션 |
| 143 | TCP | IMAP |
| 161 / 162 | UDP | SNMP / SNMP Trap |
| 389 | TCP | LDAP |
| 443 | TCP | HTTPS (HTTP over TLS) |
| 445 | TCP | SMB / MS-DS |
| 500 | UDP | IKE (IPSec 키 교환) |
| 3389 | TCP | RDP |

**Well-known / Registered / Dynamic**: 0–1023 / 1024–49151 / 49152–65535

**함정 포인트**
- **UDP 전용**: 67/68, 69, 123, 161/162, 500 → TCP로 표기한 선지가 오답.
- 53은 UDP와 TCP를 모두 쓴다 (존 전송·응답 512바이트 초과 시 TCP).
- 139(NetBIOS)와 445(SMB)를 혼동시킨다.

📍 [2과목 네트워크보안] 1. 네트워크 일반 > 네트워크 개념 이해(TCP/UDP/IP/ICMP 등 프로토콜)

---

## 시트 2-2. 헤더 필드와 ICMP 타입

### TCP 헤더 (기본 20바이트)

발신 포트 / 수신 포트 / 순서번호(Sequence) / 확인응답번호(Ack) / 헤더 길이(Offset) / 예약 / **플래그** / 윈도우 크기 / 체크섬 / 긴급 포인터 / 옵션

### TCP 플래그 6개

| 플래그 | 의미 |
|---|---|
| **URG** | 긴급 데이터 존재 (긴급 포인터 유효) |
| **ACK** | 확인응답 번호 유효 |
| **PSH** | 버퍼링 없이 즉시 상위 계층 전달 |
| **RST** | 연결 강제 종료·거부 |
| **SYN** | 연결 설정 요청 |
| **FIN** | 연결 정상 종료 요청 |

- 3-way: SYN → SYN/ACK → ACK
- 4-way: FIN → ACK → FIN → ACK

### IP 헤더 (기본 20바이트) 주요 필드

| 필드 | 용도 |
|---|---|
| Version / IHL | 버전(4) / 헤더 길이 |
| ToS (DSCP) | 서비스 품질 |
| Total Length | 전체 길이 (최대 65535) |
| **Identification** | 단편 재조합 식별자 |
| **Flags (DF / MF)** | 분할 금지 / 추가 단편 존재 |
| **Fragment Offset** | 단편 위치 → **Teardrop 공격 조작 대상** |
| **TTL** | 홉 제한 (0이면 폐기 + ICMP Type 11) → OS 추정 단서 |
| **Protocol** | 상위 프로토콜 번호 |
| Header Checksum | 헤더 오류 검출 |
| Source / Destination IP | 출발지·목적지 |

**Protocol 번호**: 1 ICMP / 2 IGMP / 6 TCP / 17 UDP / 50 ESP / 51 AH

### ICMP 타입

| Type | 의미 | 비고 |
|---|---|---|
| **0** | Echo Reply | ping 응답 |
| **3** | Destination Unreachable | **Code 3 = Port Unreachable** (UDP 스캔 판단 근거) |
| 4 | Source Quench | 흐름 제어(폐기됨) |
| **5** | Redirect | 경로 변경 → ICMP Redirect 공격 |
| **8** | Echo Request | ping 요청 |
| **11** | Time Exceeded | TTL 초과 → traceroute 원리 |
| 12 | Parameter Problem | 헤더 오류 |
| **13 / 14** | Timestamp Request / Reply | |
| 17 / 18 | Address Mask Request / Reply | |

**함정 포인트**
- **0(Reply)과 8(Request)의 방향**을 뒤집어 낸다. 8이 요청이다.
- Teardrop은 **Fragment Offset**, Ping of Death는 **Total Length** 조작. 필드가 다르다.
- traceroute는 TTL을 1씩 늘려 **Type 11**을 유도하는 원리다.

📍 [2과목 네트워크보안] 1. 네트워크 일반 > 네트워크 개념 이해 / 네트워크 도구(ping, traceroute, tcpdump)

---

## 시트 2-3. 스캔 유형별 응답표

| 스캔 유형 | 열린 포트 | 닫힌 포트 | 특징 |
|---|---|---|---|
| **TCP Open (Connect)** | SYN/ACK 수신 → ACK 전송(연결 완료) | RST/ACK | 로그 남음, 권한 불필요 |
| **TCP SYN (Half-open)** | SYN/ACK 수신 → **RST 전송** | RST/ACK | Stealth 스캔, 로그 회피, 관리자 권한 필요 |
| **FIN 스캔** | **무응답** | RST/ACK | Stealth |
| **NULL 스캔** (플래그 전부 0) | **무응답** | RST/ACK | Stealth |
| **XMAS 스캔** (FIN+PSH+URG) | **무응답** | RST/ACK | Stealth |
| **ACK 스캔** | (열림/닫힘 판단 아님) | — | **방화벽 필터링 여부** 판단용. RST 오면 unfiltered |
| **UDP 스캔** | **무응답** 또는 서비스 응답 | **ICMP Type 3 / Code 3** (Port Unreachable) | 느리고 신뢰도 낮음 |

### 부가 기법

| 기법 | 내용 |
|---|---|
| TCP Fragmentation | 헤더를 작게 분할해 필터링 우회 |
| Decoy 스캔 | 위조 출발지 다수를 섞어 실제 공격자 은닉 |
| Idle(Zombie) 스캔 | 제3의 호스트 IP ID 증가량을 관찰해 간접 스캔 |
| Bounce 스캔 | FTP PORT 명령을 악용해 서버가 대신 스캔 |
| 배너 그래빙 / OS 핑거프린팅 | 응답 배너·TTL·윈도우 크기로 OS·버전 추정 |

### 스캔 대응
방화벽·IPS로 비인가 스캔 차단, 불필요 서비스 중지, 배너 제거, IDS 임계치 기반 탐지(단시간 다수 포트 접근)

**함정 포인트**
- **열린 포트가 무응답**인 것은 FIN·NULL·XMAS 세 가지다. 직관과 반대라 자주 틀린다.
- Windows 계열은 FIN/NULL/XMAS에 **모두 RST로 응답**해 구분이 무의미하다 → 스캔 한계로 출제된다.
- SYN 스캔은 마지막에 **ACK가 아니라 RST**를 보낸다.

📍 [2과목 네트워크보안] 2. 네트워크 기반 공격기술의 이해 및 대응 > 스캐닝(포트 및 취약점 스캐닝 동작원리·특징, 대응 방법)

---

## 시트 2-4. DoS / DDoS 유형 분류

### 취약점 기반 (구형, 단일 패킷 조작)

| 공격 | 원리 | 대응 |
|---|---|---|
| **Land Attack** | 출발지 IP = 목적지 IP로 위조 → 자기 자신에 응답 루프 | 출발지 = 자신 IP인 패킷 차단 |
| **Teardrop** | Fragment Offset을 겹치게(overlap) 조작 → 재조합 오류 | 패치, 비정상 단편 폐기 |
| **Ping of Death** | 65,535바이트 초과 ICMP를 분할 전송 → 재조합 시 오버플로 | 패치, 대용량 ICMP 차단 |
| **Bonk / Boink** | Fragment 순서번호를 비정상 조작 | 패치 |

### 자원 소진 (플러딩)

| 공격 | 원리 | 대응 |
|---|---|---|
| **SYN Flooding** | SYN만 대량 전송 → **backlog 큐** 고갈 (Half-open 상태 유지) | SYN Cookie, backlog 증대, 타임아웃 단축, 방화벽 |
| **UDP / ICMP Flooding** | 대량 트래픽으로 대역폭 소진 | 임계치 기반 차단, ISP 협조 |
| **Smurf** | 위조 출발지 + **브로드캐스트 주소로 ICMP** → 증폭 반사 | Directed Broadcast 비활성, 브로드캐스트 ICMP 응답 차단 |
| **Fraggle** | Smurf와 동일 원리, **UDP** 사용 (echo 7 / chargen 19) | 동일 |
| **DRDoS** | 반사(Reflection) + 증폭(Amplification). 위조 출발지로 DNS·NTP·memcached 질의 | 위조 IP 필터링(ingress filtering), 개방 리졸버 차단 |

### 애플리케이션 계층 (L7, 소량 트래픽)

| 공격 | 원리 | 대응 |
|---|---|---|
| **Slowloris** | HTTP 헤더를 **미완성 상태**로 조금씩 지속 전송 → 연결 슬롯 고갈 | 연결 타임아웃 축소, 동시 연결 제한 |
| **RUDY (R-U-Dead-Yet)** | Content-Length를 크게 설정한 **POST 본문**을 극히 느리게 전송 | 요청 본문 전송 시간 제한 |
| **Slow Read** | TCP **Window 크기를 작게** 광고해 응답을 느리게 수신 | 최소 수신 속도 기준 적용 |
| **HTTP GET Flooding** | 동일 URL을 대량 반복 요청 | 임계치, 캐시, CAPTCHA |
| **Cache-Control 공격** | `no-cache` 지정으로 캐시 우회해 원 서버 직접 부하 | 헤더 검사·정규화 |
| **HULK** | 요청 URL을 매번 무작위화해 캐시·패턴 탐지 회피 | 이상행위 기반 탐지 |

**대응 계층 요약**: L3/L4 플러딩 → 방화벽·라우터·ISP / L7 → WAF·웹서버 튜닝·안티DDoS 장비

**함정 포인트**
- **Smurf(ICMP) ↔ Fraggle(UDP)** 프로토콜을 바꿔 낸다.
- Slowloris(**헤더** 미완성) ↔ RUDY(**POST 본문**) ↔ Slow Read(**Window 크기**) — 셋의 조작 대상이 각각 다르다.
- SYN Flooding의 대상은 backlog 큐이지 대역폭이 아니다. 대역폭 소진은 플러딩류다.
- DRDoS의 핵심은 **출발지 IP 위조 + 증폭률**이다.

📍 [2과목 네트워크보안] 2. 네트워크 기반 공격기술의 이해 및 대응 > DoS/DDoS(유형별 동작원리·특징, 각각의 대응 방법)

---

## 시트 2-5. 방화벽 · IDS · 보안 솔루션

### 방화벽 유형 5

| 유형 | 동작 계층 | 특징 |
|---|---|---|
| 패킷 필터링 | 3~4 | IP·포트·플래그 기반, 빠름, 로깅·인증 취약 |
| **상태 추적 (Stateful Inspection)** | 3~4 (+세션) | 연결 상태 테이블 유지, 응답 패킷 자동 허용 |
| 애플리케이션 게이트웨이 (Proxy) | 7 | 서비스별 프록시, 강력한 인증·로깅, **성능 저하**·서비스별 프록시 필요 |
| 서킷 게이트웨이 (Circuit) | 5 | SOCKS 기반, 클라이언트 수정 필요 |
| 하이브리드 | — | 위 방식 혼합 |

### 방화벽 구축 형태 5

| 형태 | 구성 |
|---|---|
| 스크리닝 라우터 | 라우터 ACL만 사용. 저비용, 로깅·상세 제어 취약 |
| 단일 홈 게이트웨이 | NIC 1개 베스천 호스트 |
| 이중 홈 게이트웨이 | NIC 2개 베스천 호스트로 내·외부 분리 |
| 스크린드 호스트 | 스크리닝 라우터 + 베스천 호스트 (2단 방어) |
| **스크린드 서브넷** | 라우터–베스천–라우터, **DMZ 구성**. 가장 안전, 가장 느리고 비쌈 |

### IDS 탐지 방식

| 구분 | 오용 탐지 (Misuse) | 이상 탐지 (Anomaly) |
|---|---|---|
| 별칭 | 지식 기반, 시그니처 기반 | 행위 기반, 통계 기반 |
| 원리 | 알려진 공격 패턴 매칭 | 정상 프로파일과의 편차 측정 |
| 오탐(FP) | 낮음 | **높음** |
| 미탐(FN) | **높음** | 낮음 |
| 신규(제로데이) | 탐지 불가 | **탐지 가능** |

### 탐지 4분면

| 판단 ＼ 실제 | 실제 공격 | 실제 정상 |
|---|---|---|
| 공격이라 판단 | True Positive | **False Positive (오탐)** |
| 정상이라 판단 | **False Negative (미탐)** | True Negative |

### 솔루션 비교

| 솔루션 | 핵심 기능 |
|---|---|
| **IDS** | 탐지·경보 중심. 수동적, 미러링(passive) 배치 |
| **IPS** | 탐지 + **차단**. 인라인(in-line) 배치, 오탐 시 정상 서비스 차단 위험 |
| **Firewall** | 정책 기반 접근통제 (허용/차단) |
| **WAF** | HTTP 요청 검사, SQLi·XSS 등 웹 공격 차단 |
| **VPN** | 터널링 + 암호화로 가상 전용선 |
| **NAC** | 단말 인증·무결성 점검 후 네트워크 접근 허용 |
| **ESM** | 이기종 보안장비 로그 통합 관리·상관분석 |
| **SIEM** | ESM 확장, 빅데이터 기반 장기 로그 분석 |
| **UTM** | 방화벽·IPS·AV·VPN 등 통합 단일 장비. 관리 편의 ↔ 단일 장애점 |
| **역추적 시스템** | 공격 근원지 추적 (TCP 연결 역추적, IP 패킷 역추적) |
| **Honeypot** | 유인 시스템으로 공격 정보 수집 |

### Snort 룰 구조

```
action  protocol  src_IP  src_port  ->  dst_IP  dst_port  ( options )
alert   tcp       any     any       ->  192.168.0.0/24 80  (msg:"..."; content:"..."; sid:1000001;)
```
- 룰 헤더: action(alert·log·pass·drop·reject) / 프로토콜 / 주소·포트 / 방향(`->`, `<>`)
- 룰 옵션: `msg`, `content`, `nocase`, `offset`, `depth`, `flags`, `sid`, `rev`, `threshold`

**함정 포인트**
- **오용 탐지의 오탐은 낮고 미탐이 높다.** 이상 탐지는 정반대. 이 표가 가장 많이 뒤집힌다.
- IDS는 미러링, IPS는 **인라인**. 배치 방식이 정답 근거로 쓰인다.
- 스크린드 서브넷이 DMZ를 구성하는 형태다. 이중 홈 게이트웨이와 구분한다.
- ESM은 통합 관제, UTM은 통합 **장비**. 목적이 다르다.

📍 [2과목 네트워크보안] 3. 네트워크 보안 기술 > 네트워크 보안기술 및 응용(보안 솔루션, 솔루션 활용 Snort)

---

## 시트 2-6. 보안 프로토콜 계층 지도

> 4과목·3과목과 공유되는 시트. 투자 대비 회수가 가장 크다.

| 프로토콜 | 계층 | 핵심 |
|---|---|---|
| PGP | **응용** | 메일 보안, **신뢰의 웹(Web of Trust)**, CA 불필요 |
| S/MIME | 응용 | 메일 보안, **X.509 인증서·CA 기반** |
| SET | 응용 | 전자상거래, **이중서명** |
| S-HTTP | 응용 | HTTP 메시지 단위 암호화 (사장됨) |
| SSH | 응용 | 원격접속 암호화 (22) |
| Kerberos | 응용 | 대칭키 기반 티켓 인증 (88) |
| SNMPv3 | 응용 | 인증·암호화 추가 |
| DNSSEC | 응용 | DNS 응답 무결성·출처 인증 |
| **SSL / TLS** | **전송** | 443. 레코드·핸드셰이크 프로토콜. TCP 기반 |
| **IPSec** | **네트워크** | AH / ESP + IKE(500/UDP) |
| PPTP, L2TP, L2F | **데이터링크** | VPN 터널링 (2계층) |
| PAP / CHAP | 데이터링크 | PPP 인증 (PAP 평문 / CHAP 챌린지-리스폰스) |

### IPSec

| 구분 | AH (Authentication Header) | ESP (Encapsulating Security Payload) |
|---|---|---|
| 무결성·인증 | **제공** | 제공 |
| **기밀성(암호화)** | **미제공** | **제공** |
| 재전송 방지 | 제공 | 제공 |
| 프로토콜 번호 | 51 | 50 |

| 모드 | 보호 대상 | 용도 |
|---|---|---|
| **전송(Transport) 모드** | IP 페이로드만 | 종단 간(End-to-End) |
| **터널(Tunnel) 모드** | **원본 IP 헤더 포함 전체** + 새 IP 헤더 | 게이트웨이 간 VPN |

- SA(Security Association): 단방향 논리 연결, SPI로 식별
- IKE: 1단계(ISAKMP SA 수립, Main/Aggressive) → 2단계(IPSec SA 수립, Quick)

### SSL/TLS 핸드셰이크 순서

1. ClientHello
2. ServerHello
3. 서버 인증서 (+ 필요 시 키교환·인증서 요청)
4. ServerHelloDone
5. (클라이언트 인증서)
6. ClientKeyExchange
7. ChangeCipherSpec → Finished (클라이언트)
8. ChangeCipherSpec → Finished (서버)

- 하위 프로토콜: **Handshake / ChangeCipherSpec / Alert / Record**
- Record 프로토콜 처리 순서: 단편화 → 압축 → MAC 추가 → 암호화 → 헤더 추가

### 무선 LAN 보안 진화

| 규격 | 암호 알고리즘 | 무결성 | 키 관리 |
|---|---|---|---|
| **WEP** | RC4 (키 40/104bit + **IV 24bit**) | CRC-32 | 고정 공유키 |
| **WPA** | RC4 + **TKIP** | **MIC (Michael)** | 키 동적 변경 |
| **WPA2** | **AES-CCMP** | CCM | 802.1X / PSK |
| **WPA3** | AES-GCMP | GMAC | **SAE (Dragonfly)**, PMF |

- 인증 프레임워크: **IEEE 802.1X** (요청자–인증자–인증서버) + EAP + RADIUS(1812/1813)
- 무선 공격: WarDriving, Rogue AP, Evil Twin, 비콘/디어센티케이션 공격

**함정 포인트**
- **AH는 기밀성을 제공하지 않는다.** 최다 출제 지점이다.
- 전송 모드는 원본 IP 헤더를 보호하지 않고, 터널 모드가 전체를 보호한다.
- **PGP = 신뢰의 웹 / S/MIME = CA 기반**. 짝으로 외운다.
- WEP의 취약 원인은 **IV 24비트 재사용**과 CRC-32(무결성 부적합)다.
- SSL은 전송 계층, IPSec은 네트워크 계층. 계층을 바꿔 낸다.

📍 [2과목 네트워크보안] 3. 네트워크 보안 기술 > 보안 프로토콜 이해(프로토콜별 동작원리·특징, 응용 사례) / 1. 네트워크 일반 > 유·무선 네트워크 서비스

---
---
