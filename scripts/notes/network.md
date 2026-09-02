# 노트 필사 — network

원본: `image/IMG_xxxx.HEIC`. 헤딩의 IMG 번호가 근거 사진이다. `[?]`는 판독 불가, `(?)`는 불확실.

## IMG_5122 — 네트워크 공격 용어정리 (DoS/DDoS, Spoofing, Sniffing/Hijacking, 라우터 기반 대응, DNS 보안) (note)

* 네트워크 공유 용어정리
P2P: 서버 없이 PC끼리         SMB/CIFS: 윈도우 파일·프린터 공유 프로토콜
NetBIOS: LAN에서 컴퓨터끼리 이름 통신·공유 지원
NetBEUI: NetBIOS용 비라우팅 프로토콜, 소규모 LAN

* DOS: 한 대가 공격                          * DDOS: 여러대가 공격
Ping of Death: 큰 ICMP 패킷                  Botnet:
SYN 플러딩: TCP, Half-open Connection
UDP 플러딩: 대용량 UDP전송                    * DRDOS: DDOS의 종류 (반사, 증폭)
Teardrop: 겹치거나 이상한 Fragment Offset      Smurf: ICMP Broadcast 증폭 공격
Fragment Overlap: 중첩된 Fragment             DNS증폭: 작은 DNS질의 → 큰 응답
Land: 출발 IP = 목적 IP                       NTP증폭: NTR증폭
Jamming: 무선 주파수 방해                     SSDP증폭: UPnP 장비용        증폭 = Amplification

* Spoofing                                   * Sniffing / Session Hijacking
ARP Spoofing: MAC위조, MITM, ARP캐시           Promiscuous Mode (무차별모드): 모든패킷 수신, NIC
IP Spoofing: 출발지 IP위조                     Seq Num Sniffing: TCP Seq Nump 이용 세션탈취
DNS Spoofing: 거짓 DNS 응답                    On Path: 통신경로 중간, MITM
                                              Off Path: 정보 위조, ISN 예측, TXID위조
* [?] (Remote Access Attack)                                                  → TCP 연결을 안는 초기 Seq
Trojan: [글자삭제] (정상 프로그램인척) → RAT (Remote Access Trojan): 원격제어
Exploit: 취약점 악용

* 라우터 기반 대응                            * DNS 보안
Ingress 필터: 들어오는 패킷 IP검사             DNSSEC: 위조방지
Egress 필터: 나가는 패킷 IP검사 → IP스푸핑     DNS Sinkhole: 악성 도메인 차단
uRDF: 역방향 경로 존재 여부확인
Blackhole: 공격 트래픽 버림    ⌐→ DoS/DDoS
Null Routing:   〃    버림

## IMG_5123 — VPN/터널링/PPP/IEEE 무선랜 규격 (note)

VPN
SSL VPN: 원격접속, HTTPS/TLS기반
VPN < IPsec VPN < 전송모드: Host↔Host(장치), 원본 IP헤더유지
터널링+인증+암호화        └ 터널모드: 망↔망, Host↔망, 원본 IP 패킷 캡슐화 +new IP헤더
   ↓
Security Association (SA: IPsec 통신에 필요한 협상 정보), 단방향
  └ SA는 SPI + 목적지 IP주소 + AH/ESP → AH+암호화
       └SA 식별값                    └ 인증+무결성
   * SAD = SA 저장소, SPD = 정책

* 터널링 기술
- PPTP: 2계층, PPP기반, 설정 간단, 인증 취약
- L2TP: 2계층, PPP기반, 자체 암호화X, IPsec와 결합
- GRE: 3계층, 암호화X, 캡슐

* PPP = Point to Point 프로토콜
연결순서   LCP = PPP 링크 설정
             ↓
          PAP/CHAP = 사용자 인증        PAP: 평문기반 인증  Password Auth Proto
             ↓                          CHAP: 챌린지 방식  Challenge Handshake Auth Proto
          NCP = IP주소, 네트워크 설정
             ↓
          IP통신

* IEEE (전자통신)                          * 무선랜
IEEE 802.3   유선 = Ethernet, CSMA/CD       - Ad-hoc: AP없이 STA끼리 통신
IEEE 802.11  무선(LAN) = Wifi, CSMA/CA      - Infrastructure: AP 통신
   802.1Q    VLAN 태깅 (VLAN구분)           - BSS: 하나의 무선 LAN 셀
   802.1X    포트기반 네트워크 접근제어      - ESS: 여러 BSS연결
     └ Supplicant + Auth + Auth Server
       인증받는단말  AP/스위치,관문체  Radius, 인증서버         * AP = 무선 단말을 LAN에 연결
802.11i  무선LAN 보안 표준 (무선단말↔AP 통해서사용)   SAE: 인증O    STA = Station = 무선단말
WEP → WPA → WPA2 → WPA3 ← OWE: 인증X, 공개 wi-fi 이용O
RC4기반,IV취약  TKIP기반  AES-CCMP        └ WPA3 - Personal, 인증O, 암호O
                                              인증 = 여권

## IMG_5124 — 네트워크 진단도구, netstat, ICMP, 포트스캔(nmap), 방화벽 구성/유형 (note)

* 진단도구 = nslookup, ping, traceout, netstat, tcpdump
nslookup = DNS 서버에 IP정보 요청
ping = 상대 호스트 도달가능여부, 살아있나?  , traceout: 목적지 까지 지난 경로, 어디서 막혔나?
tcpdump = 패킷 내용 확인    ,   netstat = 내연결 상태 확인          TTL을 1씩증가 ↑
                                                                    ICMP응답 여부확인
* netstat 명령어와 [?]상태
-a 모든연결/대기 포트 표시           UDP 스캔기준             0  0  응답 ping
-n IP/포트 숫자로 표시               포트열림 = 무응답        (  3  0  네트워크 도달불가
-r 라우팅 테이블 표시               [닫힘] 단힘 = 3⁰⁄₃      ←  3  1  호스트 도달불가
-s 프로토콜 통계 표시                                          3  3  포트 도달불가
   ⇓  netstat -an           TCP 스캔기준                       5  -  Redirect
0.0.0.0:0  LISTEN 연결대기중         포트열림 = 무응답                8  0  요청 ping
   ESTABLISHED 연결성립               단힘 = 응답 RST                 11  0  TTL초과 traceout
   SYN_SENT 보냄

* 포트 스캔 ┌ 개방 스캔: TCP connet, UDP scan       스캔도구 = nmap
           └ 스텔스 스캔(탐지 회피 스캔): SYN scan 연결X, Half-open   * -sn = 호스트만, -O = OS, -P = 포트지정
                        -sT    -sU                          (FIN스캔, NULL 스캔)
                (Xmas Scan: FIN+PSH+URG                         -sF      -sN
                     -sX                                    └ 윈도 사용안함.

* 윈도우 IP 명령어 = IPconfig , Linux= ifconfig, mac = ip
  └ all: DHCP, MAC, DNS 등 모든상세   release: DHCP에서 받은 IP 반납, renew: DHCP IP 다시 받기
   flushdns: dns 캐시 삭제   displaydns: dns 캐시 확인

                                                            Stateful packet inspection
* 방화벽 구성방식                              * 방화벽 유형   ↗
- Dual Homed Host: NIC 2개를 가진 호스트        패킷 필터링: 헤더기반 ACL 검사
- Screened Host: 패킷 필터링 라우터 + Bastion Host   SPI: 헤더+세션 상태 추적
- Screened Subnet: DMZ 구성                    서킷레벨게이트웨이: 세션/연결  SOCKS
        ↙          ↘                          어플레벨게이트웨이: Proxy 방식, HTTP/FTP
     격리 네트워크    외부 접속에 노출되는서버

## IMG_5125 — OSI 계층별 장비/프로토콜, 패킷 캡처(Wireshark/tcpdump), iptables, IDS/Snort (note)

계층  장비            프로토콜               *
7    게이트웨이       HTTP, FTP, SMTP, DNS   PAN < HAN·LAN < CAN
6                    SSL, TLS               개인  가정  회사건물   캠퍼스
5                    NetBIOS, RPC            *
4                    TCP, UDP               ICMP=1, TCP=6, UDP=17
3    라우터           IP, ICMP    ARP        IPv4 헤더의 프로토콜 번호
2    스위치,브릿지,NIC  이더넷, PPP
1    허브,리피터  └→ 케이블/장치에 네트워크 연결하는 장비 (=랜카드)

네트워크 트래픽, 패킷 캡처/분석                     헤더
Wireshark (GUI방식)  ⇒  PCAP 파일        Payload: 데이터
+tcpdump (CLI방식)      (패킷저장 형식)  ⇒* Timestamp 순: 반접순서, 시간순서
  └ TCP        and                        -i: 인터페이스, -n: 이름변환X
    UDP  port 443  or  host IP            -c: 지정수만캡처, -w: 저장
    ICMP        not                       -r: 읽기

Linux의 패킷 필터링/방화벽 도구 = iptables
* 명령어

-A 규칙추가  -D 규칙삭제      INPUT(수신)  OUTPUT(발송)      -s 출발지  -d 목적지
-L 규칙조회  -P 정책지정   +  FORWARD (내시스템을 거쳐가는)  +  --sport 출발포트 --dport
iptables +               ┌ACCEPT(허용)  DROP(차단응답X)┐    -j 타겟지정
                                                              무결성 탐지

* IDS 탐지 방식                                                      ↗
지식기반 = Signature기반 : 미탐 = FN = 우려오류 ↑  ⇒  HIDS: 종료관제, 콴, 설치 ex Tripwire
행위기반 = Anomaly, 기반 : 오탐 = FP = 긍정오류 ↑     NIDS: 넓고빠름, 편법, 추적 ex: Snort
* Snort (NIDS 도구)
alert  tcp  any any → 192.168.0.1    Content → offset → depth
행동   프로토콜  출발지 방향 목적지    flow = 통신 상태+방향 ; to-server 클→서버
                                     establish: 성립된 TCP 연결
                                     no case: 대소구 무시

## IMG_5126 — IP주소체계(사설IP/IPv6), 주요 포트, 클래스별 IP, NAT, AS 라우팅(IGP/EGP) (note)

네트워크
IPv4: 32비트 , MAC: 48비트 , IPv6: 128비트

10.X.X.X                              FE80::/10   링크유니캐스트, 링크 내부통신
172.16 ~ 172.31.X.X  ⟩ 사설IP         FC00::/7    로컬, 사설주소와 유사
192.168.X.X                           FF00::/8    멀티캐스트
127.X.X.X   자기자신 통신             2000::/3    글로벌 유니캐스트
169.254.X.X  APIPA (DHCP IP할당 실패시  ::         미지정
              OS가 임시 IP 할당)
224 ~ 239.X.X.X  멀티캐스트           ::1         루프백 (자기자신)

포트
FTP: 20(데이터) 21(제어)   원격접속 → 22(SSH), 23(Telnet)
메일: 25(SMTP), 110(POP3), 143(IMAP)   웹: 80(HTTP), 443(HTTPS)
      전송        수신       동기화
DHCP: 67(DHCP Server), 68(DHCP Client)
네트워크 관리: 161(SNMP), 162(SNMP Trap)              IP발급 완료여부   IP발급 요청
  └ 네트워크 장비(공유기, 스위치 등) 원격 관리프로토콜   SNMP 조회: 관리자 → 장비
시간 동기화: 123 (NTP) → 로그분석, Kerberos 등에 사용   SNMP Trap: 관리자 ← 장비  (상태/속성)
윈도우 파일공유: 445 (SMB)                              (SNMPv3)  Manager      Agent
                                                        noAuthNoPriv: 없음
                                                        authNoPriv: 인증+무결성  암호화X
                                                        authPriv: 인증+무결성+
클래스 IP, 프리픽스 , 첫 비트, 첫 번째 옥텟범위          * 등비수열의 합 = (r^(n+1) - 1)/(r-1)
A    /8    0xxxxxxx    1~126                              (계급의 누적)
B    /16   10xxxxxx    128~191             * 1옥텟 = 8비트
C    /24   110xxxxx    192~223             즉 IPv4에서 1옥텟 = 8비트 = 2^8 = 256

                                            2진수: 255.255.255.255
                                                    8   8   8   8
                                            2진수 IPv4는 32비트 이다.

Static NAT: 사설IP 하나에 공인 IP 하나 교체       * 서브네팅 (큰 네트워크 → 작은네트워크로분할)
Dynamic NAT:  〃      동적·자동교체              - FLSM 모두 같은 크기 → /26 /26 /26 /26
PAT/NAPT: 여러 사설IP를 하나의 공인 IP로 교체     - VLSM 필요한 만큼 → /25 /26 /27 /25
                                                 서로다른 크기

AS 내부 (IGP)                              AS 외부 ([?])(EGP)
- 거리백터 (RIP): 홉카운트 기준, 단순느림, Bellman-Ford
- 링크상태 (OSPF): 최단경로 계산, 정확 빠름, Dijkstra   - BGP: AS경로(AS Path) 기준

## IMG_5206 — 네트워크 개요 - 프로토콜의 주요 요소 (textbook)

# PART 05 네트워크 보안

## Chapter 01 네트워크 개요

### ① 프로토콜의 주요 요소

- 구문(Syntax) : 데이터의 형식(Format), 부호화(Coding), 신호 레벨(Signal Level) 등을 가리키는 것으로 데이터가 어떠한 구조와 순서로 표현되는지를 나타냄
- 의미(Semantics) : 각 비트가 갖는 의미를 나타내는 것으로 해당 패턴에 대한 해석과 해석에 따른 전송제어, 오류수정 등에 관한 제어정보를 규정하는 영역
- 타이밍(Timing) : 두 개체 간의 통신속도를 조정하거나 메시지의 전송시간 및 순서 등에 대한 특성을 가리킴

### Mentor's Know-how
- 프로토콜(protocol)은 데이터통신에서 송/수신자측 또는 네트워크 내에서 사전에 약속된 규약 또는 규범을 말합니다.

(페이지 번호 없음 표시 확인 안됨; 이전 페이지 78 다음 페이지로 추정)

## IMG_5207 — OSI 7계층과 TCP/IP 계층 비교표 (textbook)

## OSI 7 계층과 TCP/IP

| 계층 | 특징 |
|---|---|
| L7 Application | ・각종 응용 서비스 제공 ・네트워크 관리 |
| L6 Presentation | ・네트워크 보안(암/복호화) ・압축/압축해제, 포맷 변환 수행 |
| L5 Session | ・소켓 프로그램 ・동기화 ・세션 연결/관리/종료 |
| L4 Transport | ・데이터 전송보장 ・흐름 제어 ・Quality Of Service(QOS) |
| L3 Network | ・통신경로 설정, 중계기능 담당 ・라우팅 ・IPv4 & IPv6 |
| L2 Datalink | ・오류제어, Frame화 ・매체제어(MAC) ・에러검출, 에러정정, 흐름제어 |
| L1 Physical | ・물리적 연결설정, 해제 ・전송방식, 전송매체 |

| TCP/IP 계층 | 계층 | 메시지 종류 | 주소 | 장비 | 주요 프로토콜 | 보안 프로토콜 |
|---|---|---|---|---|---|---|
| | Application | Message | | L7SW, Gateway | FTP, TFTP, SNMP, SMTP, HTTP, DNS | Kerberos, PGP, S/MIME, SSH, SET |
| | Transport | Segment | Port(16) | L4SW | TCP, UDP, SCTP | SSL/TLS |
| Network (= Internet) | Network | Packet | IPv4(32) IPv6(128) | L3SW, 라우터 | IP, ICMP, IGMP, ARP, RIP, OSPF | IPSec |
| Datalink (= Network Access) | Datalink | Frame | MAC(48) | L2SW, 브리지 | 이더넷 | PPTP, L2F, L2TP |
| | | Bit stream | | 리피터, 허브 | | |

## Mentor's Know-how

・네트워크 보안 전체 학습 Road Map이라고 할 수 있습니다.
・네트워크는 계층의 개념을 잘 알고 있어야 합니다.

## IMG_5208 — 인터넷을 통한 통신 (TCP/IP), 포트 번호/캡슐화/역캡슐화 (textbook)

## 인터넷을 통한 통신 TCP/IP

[그림: Source(A) - Switch - Router - Switch - Destination(B), 각 노드마다 Application/Transport/Network/Data link/Physical 계층 스택 표시. A→B 경로에서 Router는 X 표시(교차)로 Network/Data link/Physical만 거침. Communication from A to B 아래 Link1(A-Switch), Link2(Switch-B), Link3(Router-C) 표시.]

## 주요 용어 정리

① Node(노드) : 네트워크에 연결된 장치(device)를 의미함. 네트워크에 연결된 컴퓨터를 포함하여 네트워크 프린터와 같은 주변기기, 라우터, 스위치, 허브와 같은 통신 장비를 포함

② HOST(호스트) : 일반적으로 Node(노드) 중 컴퓨터(PC, Server) 노드를 가리켜 호스트로 표현

③ End-Node(종단 노드) : 통신의 양 끝단에 해당하는 노드로 최초 송신 노드(최초 출발지)와 최종 수신 노드(최종 목적지)를 말함

④ Intermediate Node(중계 노드) : End-Node 사이에 패킷 중계를 해주는 노드

⑤ Link(링크) : 노드 사이에 패킷을 전달하기 위한 물리적인 통신경로

## 포트 번호, 캡슐화/역캡슐화

[그림: Sender(A, 응용프로그램 a,b,c) → H2(캡슐화 스택 A P a j 등) → Internet 클라우드 → H2(역캡슐화 스택) → Receiver(응용프로그램 i,j,k)]

## Mentor's Know-how

・애플리케이션 프로그램 하나를 포트번호 식별합니다. 예를 들어 이메일 전송에 사용되는 SMTP(Simple Mail Transfer Protocol)은 TCP 25번을 사용합니다.
・발신지 호스트에서는 캡슐화, 도착지 호스트에서는 역캡슐화 그리고 라우터에서는 캡슐화와 역캡슐화가 이루어집니다. 그러나 데이터링크 계층 스위치에서는 캡슐화/역캡슐화가 일어나지 않습니다.

## IMG_5209 — 다중화와 역다중화 (Multiplexing/Demultiplexing) (textbook)

## 다중화와 역다중화

[그림 a. Multiplexing at source: FTP, HTTP, DNS, SNMP 등 응용계층 프로토콜들이 TCP 또는 UDP로 모여들고, TCP/UDP가 다시 IP로 모여드는 구조]

[그림 b. Demultiplexing at destination: IP → TCP/UDP → 각각 FTP, HTTP / DNS, SNMP 등으로 분배되는 구조]

## Mentor's Know-how

・다중화가 의미하는 것은 상위 계층 프로토콜에서 오는 여러 개의 패킷을 한 계층에서 하나의 프로토콜로 캡슐화할 수 있다는 것입니다.(한 번에 하나씩)
・역다중화가 의미하는 것은 하나의 프로토콜은 여캡슐화(?)을 할 수 있고 패킷 여러 개의 상위 계층 프로토콜로 전송할 수 있다는 것입니다. (한 번에 하나씩)
・다중화와 역다중화를 가능하게 하기 위해 프로토콜은 캡슐화된 패킷이 어느 프로토콜에 속하는지 식별하기 위한 필드를 헤더에 포함해야 합니다.

## IMG_5210 — TCP/IP 계층별 역할, 패킷의 전송방법, 클래스별 IP 주소 분류 (textbook)

## Chapter 02 TCP/IP

### ① TCP/IP 계층별 역할

데이터링크 : 전송 매체에 프레임을 송·수신하는 역할을 담당

네트워크 : IP는 호스트 네트워크 주소를 관리하고, 패킷을 라우팅하는 역할을 담당(특정인), ARP는 네트워크 호스트의 하드웨어 주소를 얻는데 사용되며, ICMP는 패킷 전송에 관한 메시지의 처리를 담당

전송 : 종단간 통신 서비스 제공을 담당. 전송 계층에는 2개의 프로토콜(TCP와 UDP)이 있음. 연결지향적 TCP는 데이터의 확실한 전송이 필요한 경우 사용되며, UDP는 데이터의 정확한 전달을 보장하지 않음

응용 : 응용프로그램이 네트워크에 접근하도록 인터페이스 기능을 수행

### ② 패킷의 전송방법

유니캐스트(Unicast) : 하나의 송신자가 하나의 수신자에게 패킷을 보내는 방식(특정인에게 전송)

멀티캐스트(Multicast) : 하나의 송신자가 다수의 수신자에게 패킷을 보내는 경우로 일대다의 패킷 전 송방식

브로드캐스트(Broadcast) : 같은 네트워크에 있는 모든 호스트에게 패킷을 보내는 방식으로 보로드캐 스트 그룹에 가입되어 있어야 함(특정 다수인에게 전송)

애니캐스트 : 멀티캐스트 전송을 수행함(?)이 위해서는 네트워크 장치가 멀티캐스트를 지원해야 하며, 멀티캐스 스트 주소에서는 호스트 주소를 모두 1로 설정(불특정 다수인에게 전송)

### ③ 클래스별 IP 주소 분류

[표: Address space: 4,294,967,296 addresses. Class A 50%, B 25%, C 12.5%, D 6.25%, E 6.25%]

| Class | Prefixes | First byte |
|---|---|---|
| A | n = 8bits | 0 to 127 |
| B | n = 16bits | 128 to 191 |
| C | n = 24bits | 192 to 223 |
| D | Not applicable | 224 to 239 |
| E | Not applicable | 240 to 255 |

[그림: 0 Prefix/10 Prefix/1110/1111 각각 8bits씩 Prefix+Suffix 구조 표시, Multicast addresses, Reserved for future use]

## Mentor's Know-how (클래스 A/B)

・50명을 10명씩 A, B, C, D, E 그룹으로 나눈다고 가정했을 때,
- 유니캐스트는 송신자가 A그룹의 첫번째 수신자(특정인)에게 메시지 전송하는 방식
- 멀티캐스트는 B그룹 전원(10명)에게 전송하는 방식
- 브로드캐스트는 50명 전원에게 전송하는 방식
- IPv6에서는 브로드캐스트는 필요한 경우 특수한 멀티캐스트의 특수한 전달을 정확하게 인접(?)하지 않음
고, 애니캐스트가 새롭게 등장합니다.

## Mentor's Know-how (클래스 C/D/E)

클래스 A : 약 2^24-2 = 16,777,214개의 호스트를 수용할 수 있기 때문에 큰 규모의 호스트를 갖는 기관에서 사용
클래스 B : 약 2^16-2개의 호스트를 수용할 수 있음
클래스 C : 네트워크마다 254개 호스트 까지 수용할 수 있기 때문에 작은 규모의 네트워크에서 사용
클래스 D : 전체 주소가 멀티캐스트용으로 사용, 정보, 멀티미디어 데이터 그리고 리얼타임 비디오 등을 보내는데 사용
클래스 E : 추후 사용을 위해 예약된 주소

## IMG_5211 — 특수 IP 주소, 서브네팅과 슈퍼네팅 (textbook)

## ⑤ 특수 IP 주소

디스-호스트 주소
・0.0.0.0/32의 주소를 디스-호스트(this-host) 주소라고 함
・호스트가 IP 데이터그램을 보내려고 하지만 자신의 주소인 근원지 주소를 모를 때 사용

제한된 브로드캐스트 주소
・255.255.255.255/32의 주소는 제한된 브로드캐스트 주소(limited-broadcast address)라고 함
・호스트나 라우터가 네트워크상의 모든 장치에 데이터그램을 보낼 때 사용

루프백 주소
・127.0.0.0/8의 블록은 루프백 주소(loopback address)라고 함
・불록 내의 주소는 소프트웨어의 테스트 목적으로 사용

사설 주소
・127.0.0.1은 테스트에 가장 많이 쓰이는 주소
・RFC 1918은 사설 주소에만 사용할 수 있는, 라우팅이 불가능한 특수 주소 집합을 정의
공중 인터넷에 훈산되지 않음
・10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16이 사설 주소(private addresses)로 지정

| 클래스 | IP 주소 블록 | 주소 범위 |
|---|---|---|
| Class A | 24비트 블록 | 10.0.0.0 - 10.255.255.255 |
| Class B | 20비트 블록 | 172.16.0.0 - 172.31.255.255 |
| Class C | 16비트 블록 | 192.168.0.0 - 192.168.255.255 |

## Mentor's Know-how

| 네트워크 식벽자 | 호스트 식벽자 | 목적 | 송신 | 수신 |
|---|---|---|---|---|
| 네트워크 | 모두 0 | 네트워크 주소 | 불가 | 불가 |
| 네트워크 | 모두 1 | 직접적 브로드캐스트 | 불가 | 가능 |
| 모두 1 | 모두 1 | 제한적 브로드캐스트 | 가능 | 불가 |
| 모두 0 | 모두 0 | 네트워크의 한 호스트 | 가능 | 가능 |
| 127 | 관계 없음 | 루프백 주소 | 불가 | 가능 |

## ④ 서브네팅과 슈퍼네팅

Divide 1 class C block into 8 subblocks

Subnet mask: 11111111 11111111 11111111 111 00000  (n_sub = 24+3 = 27)

Default mask: 11111111 11111111 11111111 00000000  (n = 24)

Supernet mask: 11111111 11111111 11111 000 00000000  (n_super = 24-3 = 21)

Combine 8 class C blocks into 1 superblock

## Mentor's Know-how

・클래스 기반의 주소 방식으은 더 이상 사용되지 않게 됩니다. 그 이유는 주소 고갈 문제 때문입니다.(주소가 적절히 분배되지 않았기 때문에 연결하려는 기관이나 개인이 사용 할 주소가 더 이상 남아 있지 않게 되는 문제)
・주소 고갈을 해결하기 위해 서브네팅(subnetting), 슈퍼네팅(supernetting), 클래스 없는 주소지정(슬래시 표기법), IPv6의 주소 공간 확장 등이 제안되었습니다.
・슬래시 표기법

[그림: byte.byte.byte.byte/n (Slash, Prefix length) 구조]

## IMG_5212 — IPv4 데이터그램, IPv4 주요 필드, TCP/IP 계층별 다중화/역다중화 프로토콜 식별자 (textbook)

## ⑥ IPv4 데이터그램

Legend: VER: version number, HLEN: header length, byte: 8 bits

a. IP datagram
[그림: Header(20-60 bytes) + Payload = 20-65,535 bytes 총합]

b. Header format (bit 0~31 표시)
| 필드 | 크기 |
|---|---|
| VER | 4bits |
| HLEN | 4bits |
| Service type | 8bits |
| Total length | 16bits |
| Identification | 16bits |
| Flags | 3bits |
| Fragmentation offset | 13bits |
| Time-to-live | 8bits |
| Protocol | 8bits |
| Header checksum | 16bits |
| Source IP address | 32bits |
| Destination IP address | 32bits |
| Options+padding | 0 to 40 bytes |

## ⑦ IPv4의 주요 필드

버전(Version) : 프로토콜의 버전(IPv4)
헤더 길이(Header Length) : 선택사항(Option)을 포함한 헤더의 길이
Type-Of-Service(TOS) : 3비트의 우선권(Precedence)필드와 4비트의 TOS 필드, 그리고 1비트의 예약필드로 구성
전체 길이(Total Length) : 전체 길이를 바이트로 표현
Time-To-Live(TTL) : 패킷이 경유할 수 있는 최대 홉수를 의미함
식별자(Identification) : 호스트가 보낸 각 데이터그램을 유일하게 식별
플래그(Flag) : 세 개의 비트로 단편화 관련 정보 표시

## TCP/IP 계층별 다중화/역다중화 프로토콜 식별자

① Network Interface Layer - Internet Layer
・Frame 헤더의 type 필드에 상위 프로토콜(IP, ARP, RARP) 식별자가 들어있음
② Internet Layer - Transport Layer
・IP 헤더의 protocol 필드에 상위 프로토콜(ICMP,TCP,UDP) 식별자가 들어있음
③ Transport Layer - Application Layer
・TCP/UDP 헤더의 destination port 필드에 상위 프로토콜(FTP, HTTP,....)
식별자가 들어있음

## IMG_5213 — IPv6 데이터그램, IPv6의 주요 필드 (textbook)

## ⑧ IPv6 데이터그램

a. IPv6 packet
[그림: 40 bytes Base header + Up to 65,535 bytes Payload]

Header format (bit 0~31)
| 필드 | 크기/설명 |
|---|---|
| Version | (4비트) |
| Traffic class | |
| Flow label | |
| Payload length | |
| Next header | |
| Hop limit | |
| Source address | (128 bits = 16 bytes) |
| Destination address | (128 bits = 16 bytes) |

## ⑨ IPv6의 주요 필드

버전(4비트) : IP의 버전 번호를 정의(IPv6에서는 값이 6)
트래핑 분류(8비트) : IPv4의 서비스 유형 필드와 유사
흐름 레이블(20비트) : 데이터의 특정한 흐름을 위한 특별한 처리를 제공하기 위해 설계
페이로드 길이(2바이트) : 기본 헤더를 제외한 IP 메이터그램의 길이를 정의
다음 헤더(8비트) : 확장 헤더의 종류(조제한다면)를 정의하거나 데이터그램의 기본 헤더를 를
뒤따르는 헤더를 정의
홍 제한(8비트) : IPv4의 TTL 필드와 같은 목적으로 사용

## Mentor's Know-how

※ IPv6의 새로운 헤더 포맷
・헤더를 고정 길이로 변경 : 시스템에서 헤더 길이를 예측하기 용이해져
빠른 처리 가능
・패킷 단편화(fragmentation) 관련 필드가 삭제 : 라우터의 부담을 줄이고,
네트워크의 효율적인 이용
・체크섬(checksum) 필드 삭제 : 체크섬을 계산하기 위한 부하가 없음

## IMG_5214 — IPv6의 특징, IPv4와 IPv6 특징 비교 (textbook)

## ⑩ IPv6의 특징

확장된 주소 공간
・128비트 주소체계를 사용하는 IPv6는 IPv4의 주소부족 문제를 해결
・IP주소를 절약하기 위해 사용되는 NAT(Network Address Translation)와 같은 주소변환 기술도 불필요

새로운 헤더 포맷
・헤더를 고정 길이로 변경
・패킷 단편화(fragmentation) 관련 필드가 삭제
・체크섬(checksum) 필드 삭제

향상된 서비스의 지원
・IPv6는 트래핑을 효과적으로 분류할 수 있는 기능을 제공
・IPv6 헤더 내에 플로우 레이블(Flow Label) 필드를 이용

보안 기능
・IPv4에서의 보안은 IPSec이라는 별 관련 프로토콜을 별도로 설치해 주어야 하는 부가적 기능(add-on)을 필요로 함
・IPv6에서는 프로토콜 내에 보안관련 기능을 탑재할 수 있도록 설계
・확장헤더를 통하여 네트워크 계층에서의 종단간 암호화를 제공

주소 자동설정
・IPv6에서는 로컬 IPv6주소를 LAN상의 MAC(Medium Access Contorl) 주소와 라우터가 제공하는 네트워크 프리픽스(prefix)에 결합하여 IP주소를 자동 생성
・이동형 컴퓨터의 경우 어느 곳에서든 네트워크와 연결을 설정하면 자동으로 포워딩 주소를 설정할 수 있게 함

## IPv4와 IPv6 특징 비교

| 구분 | IPv4 | IPv6 |
|---|---|---|
| 주소 길이 | 32비트 | 128비트 |
| 표시 방법 | 8비트씩 4부분 10진수 표시 예) 203.252.53.55 | 16비트 8부분 16진수로 표시 예) 2002:0221:ABCD:DCBA:0000:0000:FF FF:4002 |
| 주소 개수 | 약 43억개 | 2^128개(약 43억x43억 x43억x43억) |
| 주소할당 방식 | A,B,C,D 등의 클래스 단위 비순차할당 | 네트워크 규모, 단말기수에 따라 순차할당 |
| 브로드캐스트 주소 | 있음 | 없음(대신, 로컬범위 내에서의 모든 노드에 대한 멀티캐스트 주소 사용) |
| 헤더 크기 | 가변 | 고정 |
| QoS 제공 | 미흡 | 제공 |
| 보안 | IPSec 프로토콜 별도 설치 | IPSec 자체 지원 |
| 서비스 품질 | 제한적 품질 보장(Type of Service에 의한 서비스 품질 일부 지원) | 확장된 품질 보장(트래픽 클래스, 플로우 레이블에 의한 서비스 품질을 |

## IMG_5215 — IPv4에서 IPv6로 변환 (이중 스택, 터널링, 헤더 변환) (textbook)

## ⑪ IPv4에서 IPv6로 변환

이중 스택
・모든 인터넷이 IPv6를 사용하기 전까지 시스템은 IPv4와 IPv6를 동시에 지원
[그림: Upper layers - Ipv4 / Ipv6 - Underlying LAN or WAN technology, To and from IPv4 system / To and from IPv6 system 양방향 화살표]

터널링(tunneling)
・IPv6를 사용하는 두 호스트가 통신을 할 때 패킷이 IPv4를 사용하는 지역을 지나는 경우에
사용 가능한 방법
・IPv4 지역에 들어서면 IPv6 패킷은 IPv4 패킷으로 캡슐화되고 이 지역을 벗어날 때 역캡슐화
[그림: IPv6 host - IPv6 header/Payload → IPv4 header/IPv6 header/Payload(Tunnel, IPv4 region 구간) → IPv6 header/Payload - IPv6 host]

헤더 변환(header translation)
・인터넷의 대부분이 IPv6로 변경되고 일부만이 IPv4를 사용할 필요한 바뀡
・헤더 변환을 통해 헤더의 형태를 완전히 변경
[그림: IPv6 host(IPv6 header/Payload, IPv6 region) → Header translation done here → IPv4 header/Payload(IPv4 region) → IPv4 host]

## IMG_5216 — 네트워크 계층 프로토콜, ARP 트랜잭션 절차 (textbook)

## 네트워크 계층 프로토콜

[그림: Network layer 박스 안에 IP, 그 위에 ARP(Logical address → ARP → Physical address), 옆에 IGMP, ICMP 박스]

## Mentor's Know-how

・IP : 비신뢰적이고 비연결형인 데이터그램 최선형 전송 서비스(best-effort delivery service)
・ARP : IP 주소에 해당하는 MAC 주소를 획득하기 위해 사용
・RARP : MAC 주소에 해당하는 IP 주소를 획득하기 위해 사용
・ICMP : 통신 중에 발생하는 오류의 처리와 정송 경로의 변경 등을 위한 제어 메시지를 취급하는 프로토콜
・IGMP : IP 멀티캐스트 그룹에서 호스트 멤버를 관리하는 프로토콜 사용

## ARP 트랜잭션 절차

송받지: 1. ARP 캐시에서 목적지 하드웨어 주소 확인 → 2. ARP 요청 프레임 생성 → 3. ARP 요청 브로드캐스트 프레임 전송 → (ARP 요청) → 목적지: 4. ARP 요청 프레임 처리 → 5. ARP 응답 프레임 생성 → 6. ARP 캐시 갱신 → 7. ARP 응답 프레임 송신 → (ARP 응답) → 송받지: 8. ARP 응답 프레임 처리 → 9. ARP 캐시 갱신

## Mentor's Know-how

・ARP 프로토콜은 특정 IP 주소에 대한 물리 주소를 요구할 때 사용합니다.
・ARP 요청 메시지를 보낼 때는 브로드캐스트로 전송하고, 응답 메시지는 유니캐스트로 전송합니다.
・각 시스템은 ARP Cache가 있고 Cache에 정보를 보관해 둡니다.
일정시간 경과 후에는 이를 삭제합니다.

## IMG_5217 — TCP와 UDP의 주요 차이점, ICMPv4 (textbook)

## ⑮ TCP와 UDP의 주요 차이점

| 서비스 | TCP | UDP |
|---|---|---|
| 신뢰성 | 패킷이 그들의 목적지에 도달했는지 확인하며, 패킷이 도달될 때마다 ACK를 수신하기 때문에 신뢰성 있는 네트워크 프로토콜 | ACK를 보내지 않으며 패킷이 그들의 목적지에 도달되는 것을 보장하지 않기 |
| 연결 | 연결지향적이므로, 핸드쉐이킹 과정을 수행하고 목적지 컴퓨터와 함께 가상연결을 형성 | 비연결지향적이므로 핸드쉐이킹 과정을 수행하지 않으며, 가상연결도 형성하지 |
| 패킷 순서 | 패킷들이 순차적으로 수신되도록 함 | 순서번호를 사용하지 않음 |
| 혼잡 제어 | 목적지 컴퓨터의 흐름제어에 대한 많은 데이터가 전송으로 인해 혼잡한 경우에 어렵거나 전송속도가 느려질 경우 이를 통보 | 목적지 컴퓨터의 흐름제어와 통보를 사용하지 않음 |
| 사용 | 신뢰성 있는 전송이 필요할 때 사용 | 스트리밍 비디오와 보이스캐스트 등, 신뢰성 있는 전송이 별로 필요하지 않은 때 사용 |
| 속도와 오버헤드 | 상당한 자원을 사용하며 UDP보다 느림 | 이 적은 자원을 소모하는 것 TCP보다 빠름 |

## Mentor's Know-how

・TCP와 UDP는 전송 계층 프로토콜입니다. 응용 계층이 신뢰성이 중요한 경우에는 TCP를 이용하고, 신뢰성이지는 않겠지만 빠른 속도를 요구하는 경우에는 UDP를 이용합니다.
・IPv4, IPv6, TCP, UDP 헤더를 암기를 어려하는데 도움이 되는 것은 네트워크 보안을 이해하는데 많은 도움이 됩니다.

## ⑪ ICMPv4(Internet Control Message Protocol version 4)

개요
・IP 프로토콜과 조합하여 통신 중에 발생하는 오류의 처리와 전송 경로의 변경 등을 위한 제어 메시지를 취급하는 프로토콜(RFC 792)
・OSI 기본 참조 모델의 네트워크 계층에 해당

메시지
・ICMPv4 메시지는 크게 오류보고 메시지와 질의 메시지로 나눌 수 있음
・오류보고 메시지는 라우터(목적지)나 호스트가 IP 패킷을 처리하는 도중에 탐지하는 문제를 알리고
・질의 메시지는 쌍으로 생성되는데 호스트나 네트워크 관리자가 라우터나 다른 호스트로부터 특정
정보를 획득하기 위해서 사용

대표적인 ICMP 메시지
Echo Reply : ICMP Echo Request에 대한 응답 메시지
Redirect : 데이터를 보내는 호스트에게 목적지 IP 주소에 대한 좀 더 적합한 경로가 있음을 알리기
위해 라우터가 보내는 메시지
Source Quench : 데이터를 보내는 호스트에게 IP 데이터그램이 라우터의 짐을 혼잡 상황에 의해 손실
되었음을 알리기 위해 라우터가 보내는 메시지
Destination Unreachable : 라우터나 목적지 호스트에 의해 보내지며 데이터그램이 전달되지 못한
다는 것을 보내는 호스트에게 알려줌

## Mentor's Know-how

・ICMP 프로토콜은 비신뢰적 프로토콜을 보완하는 프로토콜이라고 볼 수 있습니다.
・핑(ping)과 트레이스루트(traceroute)와 같은 디버깅 도구에서 에코 요청과
에코 응답 메시지를 사용할 수 있습니다.

## IMG_5218 — 사용자 데이터그램(UDP) 형식, TCP 세그먼트 형식 (textbook)

quality: poor

## 사용자 데이터그램(UDP) 형식

a. UDP user datagram
[그림: Header(8 bytes) + Data = 8 to 65,535 bytes]

b. Header format (bit 0~31)
| 필드 | 크기 |
|---|---|
| Source port number | 16bits |
| Destination port number | 16bits |
| Total length | 16bits |
| Checksum | 16bits |

## TCP 세그먼트 형식

a. Segment
[그림: Header(20 to 60 bytes) + Data]

b. Header (bit 0~31)
| 필드 | 크기 |
|---|---|
| Source port address | 16bits |
| Destination port address | 16bits |
| Sequence number | 32bits |
| Acknowledgment number | 32bits |
| HLEN | 4bits |
| Reserved | 6bits |
| Control flags (URG,ACK,PSH,RST,SYN,FIN) | (표시: U A P R S F / R C S S Y I / G K H T N N) |
| Window size | 16bits |
| Checksum | 16bits |
| Urgent pointer | 16bits |
| Options and padding | (up to 40 bytes) |

## IMG_5219 — TCP 헤더 주요 필드 (textbook)

## TCP 주요 필드

- 근원지 포트 주소
  - 세그먼트를 송신하는 호스트에 있는 응용 프로그램의 포트 번호를 정의하는 16비트 필드
  - UDP 헤더에 있는 근원지 포트 번호와 동일한 목적을 수행
- 목적지 포트 주소
  - 세그먼트를 수신하는 호스트에 있는 응용 프로그램의 포트 번호를 정의하는 16비트 필드
  - UDP 헤더에 있는 목적지 포트 번호와 동일한 목적을 수행
- 순서번호
  - 세그먼트에 포함된 첫 번째 데이터 바이트에 할당된 번호를 정의
  - TCP는 스트림 전송 프로토콜로 연결성을 확신하기 위해서 전송되는 각 바이트에는 번호가 부여됨
- 확인응답 번호
  - 세그먼트의 송신자가 다른 쪽으로부터 받기를 기대하는 바이트 번호를 정의
  - 세그먼트 수신자가 상대방으로부터 바이트 번호 x를 성공적으로 수신하였다면 x+1이 확인응답 번호가 됨
- 헤더 길이
  - TCP 헤더를 4바이트 단위의 개수로 나타낸 것
- 제어(Control)
  - TCP에서 흐름 제어, 연결 설정과 종료, 연결 중지 그리고 데이터 전송 모드를 가능하게 함
  - 6개의 다른 제어 비트 또는 플래그 비트를 정의

| 플래그 | 의미 | 설명 |
|---|---|---|
| URG | 긴급 | '1'로 설정되면 세그먼트에 우선순위가 높은 데이터가 있다는 뜻이며 긴급 포인터 필드값을 활용함 |
| ACK | 승인 | '1'로 설정되면 세그먼트가 승인을 포함한다는 뜻으로 승인번호 필드값은 세그먼트의 목적지가 다음에 보내야 할 순서 번호를 가리킴 |
| PSH | 밀어넣기 | 세그먼트의 송신 장비가 TCP 밀어넣기 기능을 사용했으므로 세그먼트를 받는 즉시 애플리케이션으로 송신하라는 뜻 |
| RST | 초기화 | 송신 장비에 문제가 발생했으니 연결을 초기화해야 한다는 뜻 |
| SYN | 동기화 | 순서 번호를 동기화하고 연결 수립을 요청하는 세그먼트, 순서 번호 필드는 세그먼트를 송신하는 장비의 ISN을 가짐 |
| FIN | 종료 | 세그먼트의 송신 장비가 연결 종료를 요청한다는 것 |

### Mentor's Know-how
- 만약 제어필드 값이 010010인 경우 ACK와 SYN이 활성 [원문 잘림, 오른쪽 페이지에 이어짐] 의미입니다.
- TCP와 UDP 모두 첫 번째 헤더값은 source port nu[mber] [원문 잘림]

## IMG_5220 — 주요 Well Known Port (textbook)

## 주요 Well Konwn Port

| 프로토콜 | 포트번호 | 설명 |
|---|---|---|
| FTP, Data | 20 | 파일 전송 프로토콜(File Transfer Protocol)의 데이터채널 |
| FTP, Control | 21 | 파일 전송 프로토콜의 제어채널 |
| SSH | 22 | Secure Shell : scp, sftp 같은 프로토콜 및 포트 포워딩 |
| TELNET | 23 | 터미널 네트워크(TErminal NETwork) |
| SMTP | 25 | 간단한 메일 전송 프로토콜(Simple Mail Transfer Protocol) |
| DNS | 53 | 도메인 네임 시스템(Domain Name System) |
| TFTP | 69 | Trivial File Transfer Protocol |
| HTTP | 80 | 하이퍼텍스트 전송 프로토콜(Hypertext Transfer Protocol) |
| POP3 | 110 | Post Office Protocol version 3 : 전자우편 가져오기에 사용 |
| IMAP4 | 143 | Internet Mail Access Protocol version 4 : 전자우편 가져오기에 사용 |
| SNMP. Agent | 161 | Simple Network Management Protocol - Agent 포트 |
| SNMP. Manager | 162 | Simple Network Management Protocol - Manager 포트 |
| HTTPS | 443 | HTTP over SSL(암호화 전송) |
| IMAP4S | 993 | IMAP4 over SSL(암호화 전송) |
| POP3S | 995 | POP3 over SSL(암호화 전송) |

### Mentor's Know-how
- 포트는 16비트를 사용합니다. 즉 2^16=65,536개로 프로토콜을 식별합니다.
- Well-known 포트는 서버가 주로 사용하고, Dynamic 포트(임시 포트)는 클라이언트가 주로 사용합니다.

[그림: 포트 번호 범위 눈금 — Well-known 0~1,023, Registered 1,024~49,151, Dynamic or private 49,152~65,535]

## IMG_5221 — TCP 연결설정/연결종료 과정과 상태정보 (3-way / 4-way handshake) (textbook)

## 연결설정 과정과 TCP 상태정보(3-way handshake 과정)

[그림: 3-way handshake 상태도]
Client 측
- Client State: CLOSED → (Active Open: Create TCB, Send SYN) → SYN-SENT
- SYN-SENT → (Wait For ACK to SYN) → (#2 SYN+ACK 수신) → (Receive SYN+ACK, Send ACK) → ESTABLISHED

Server 측
- Server State: CLOSED → LISTEN → (Wait For Client) → (#1 SYN 수신, Receive SYN, Send SYN+ACK) → SYN-RECEIVED → (wait for ACK to SYN) → (#3 ACK 수신, Receive ACK) → ESTABLISHED

흐름: #1 SYN (Client→Server), #2 SYN+ACK (Server→Client), #3 ACK (Client→Server)

### Mentor's Know-how
- 태스크 제어 블록(task control block, TCB) : 다중 태스킹에서 태스크 관리를 위해서 필요한 데이터베이스. 태스크의 시작 주소, 페이지 테이블, 파일의 보안 사항, 접근 제어 정보 등이 수록
- SYN_RECEIVED ≒ SYN_RECV ≒ SYN_RCVD → OS에 따라 다름

## 연결종료 과정과 TCP 상태정보(4-way handshake 과정)

[그림: 4-way handshake 상태도]
Client 측
- Client State: ESTABLISHED → (Receive Close Signal From App, Send FIN) → FIN-WAIT-1 → (wait for ACK and FIN From Server, Receive ACK) → FIN-WAIT-2 → (Wait for Server FIN, Receive FIN, Send ACK) → TIME-WAIT → (Wait For Double Maximum Segment Life (MSL) Time) → CLOSED

Server 측
- Server State: ESTABLISHED → (Normal Operation) → (#1 FIN 수신, Receive FIN, Send ACK, Tell App To Close) → CLOSE-WAIT → (Wait for App) → (App is Ready To Close, Send FIN) → LAST-ACK → (Wait for ACK to FIN) → (#2 ACK 수신, Receive ACK) → CLOSED

흐름: #1 FIN (Client→Server), #2 ACK (Server→Client), #1 FIN (Server→Client), #2 ACK (Client→Server)

### Mentor's Know-how
- CLOSE_WAIT : App이 Close 하기를 기다림
- FIN_WAIT2 : 서버가 Close 하기를 기다림
- TIME-WAIT : 만약에 서버가 Ack를 못 받으면 재전송하므로 재전송을 방지하기 위해 일정시간 대기함

## IMG_5222 — 라우팅 개관과 라우팅 프로토콜 (textbook)

# Chapter 03 라우팅

## ① 라우팅 개관

| 구분 | 특징 |
|---|---|
| 정적 라우팅 | 수동, 변경이 적을 때 유리, 노드 추가/변경 운영 요원이 라우팅 작업, 단일 경로에 적합 |
| 동적 라우팅 (전체) | 자동, 변경이 많을 때 유리, 노드 추가/변경 대처 용이, 다중 경로에 적합 |

동적 라우팅 세부:
| | | |
|---|---|---|
| IGP | 거리벡터 | RIP(홍수), IGRP(다양한 파라미터 이용), 주기적으로 라우팅 정보교환 → 느린 수렴시간 |
| IGP | 링크상태 | OSPF, 변경 시만 라우팅 정보교환 → 빠른 수렴시간 |
| EGP | 패스벡터 | BGP-4, AS 간 통신 |

### Mentor's Know-how
- 자율 시스템 (AS, autonomous system) : 1개의 관리 권한이 운영 하는 라우터와 통신망의 집합체, 인터넷은 자율 시스템의 집합체
- IGP(Interior Gateway Protocol) : AS 내에서의 라우팅 정보 교환 (RIP, OSPF 등)
- EGP(Exterior Gateway Protocol) : AS 간의 라우팅 정보 교환 (BGP 등)

## ② 라우팅 프로토콜

RIPv1(Routing Information Protocol)
- 라우팅 경로계산을 위해 거리벡터 알고리즘을 사용하는 가장 단순한 라우팅 프로토콜
- 거리벡터 프로토콜은 R.E.Bellman이 제안한 「Bellman-Ford」 프로토콜을 이용

RIPv2
- RIPv2는 RIPv1의 예약필드를 사용하여 RIPv1의 기능을 대폭 확장
- 기본적인 동작은 RIPv1과 동일하며, 서브넷마스크 식별, 경로정보 인증, AS 구별, 브로드캐스트와 멀티캐스트 전송 등의 기능이 추가

IGRP(Interior Gateway Routing Protocol)
- 하나의 매트릭 값만을 사용하는 대신 다양한 네트워크 파라미터(대역폭(Bandwidth), 지연(Delay), 신뢰도(Reliability), 부하(Load), MTU)를 이용하여 거리벡터를 계산

EIGRP(Enhanced Interior Gateway Routing Protocol)
- CIDR이나 VLSM과 같은 새로운 네트워크 기술을 지원하지 못하기 때문에 시스코에서는 IGRP 기능을 확장한 EIGRP를 개발

OSPF(Open Shortest Path First)
- 모든 라우터가 동일한 네트워크 토플로지 데이터베이스를 기반으로 경로를 계산
- 네트워크가 변화가 생겼을 경우에만 전체 네트워크에 플러딩 과정을 수행
- 최적경로 계산을 위해 Dijkstra's 알고리즘이라는 링크상태 알고리즘을 이용

BGP(Border Gateway Protocol)
- AS 사이에서 라우팅 정보를 전달하는 EGP 중 하나로 널리 사용
- 외부 라우팅의 특수성을 반영하기 위하여 패스 벡터 알고리즘(Path Vector Algorithm)을 사용

## IMG_5223 — 거리벡터와 링크상태 라우팅 프로토콜 비교 (textbook)

## ③ 거리벡터와 링크상태 라우팅 프로토콜 비교

| 거리벡터 라우팅 프로토콜 | 링크상태 라우팅 프로토콜 |
|---|---|
| 인접한 이웃으로부터 망 정보를 수집 | 모든 라우터로부터 망 정보를 수집 |
| 비용은 이웃 라우터와의 거리 비용을 더해서 구함 | 최단거리 알고리즘으로 모든 라우터에 대한 비용을 직접 계산 |
| 주기적인 라우팅 정보 교환 | 링크 상태 변화 시만 라우팅 정보 교환 |
| 느린 수렴시간 | 빠른 수렴시간 |
| 모든 라우팅 테이블 값을 이웃에게 전달 | 자신에게 직접 연결된 망 정보만 전달 |
| 브로드캐스트 방식으로 이웃에게 라우팅 광고 | 멀티캐스트 방식으로 라우팅 광고 |

### Mentor's Know-how

[거리벡터]
[그림: a. Tree for node A — A(0)→B(2)→C(7), A→D(3), B→E(6)→F(8)→G(9)]
[그림: b. Distance vector for node A — A:0, B:2, C:7, D:3, E:6, F:8, G:9]

[링크상태]
[그림: a. The weighted graph — 노드 A,B,C,D,E,F,G가 가중치 간선으로 연결됨: A-B:2, B-C:5, C-F:4, C-G:3(?), A-D:3, B-E:4, D-E:5, E-F:2, F-G:1]
[그림: b. Link state database — A~G 행렬, 대각선 0, 연결 없는 곳은 ∞(무한대 기호로 표기), 예: A행 [0,2,∞,3,∞,∞,∞], B행 [2,0,5,∞,4,∞,∞], C행 [∞,5,0,∞,∞,4,3], D행 [3,∞,∞,0,5,∞,∞], E행 [∞,4,∞,5,0,2,∞], F행 [∞,∞,4,∞,2,0,1], G행 [∞,∞,3,∞,∞,1,0]]

## IMG_5224 — 네트워크 장비의 이해, 브리지와 라우터 비교 (textbook)

# Chapter 04 네트워크 장비의 이해

## ① 네트워크 장비 개관

| 계층 | 장비 종류 | 기능 |
|---|---|---|
| 응용 | 게이트웨이 | 서로 다른 유형의 네트워크들을 연결, 프로토콜 및 포맷 변환 수행 |
| 응용 | L7 스위치 | 로드밸런싱 기능 수행 |
| 전송 | L4 스위치 | [?, 이미지 흐릿하여 판독 어려움. 아래 라우터 항목과 인접해 있으며 관련 설명일 가능성 있음] |
| 네트워크 | 라우터 | 여러 LAN을 논리적으로 연결하여 인터 네트워크를 생성, 라우터는 IP 주소에 기반하여 연결, 이기종 LAN 간 연결, LAN을 WAN에 연결, 효율적인 경로를 선택하는 라우팅 기능, 여러 패킷에 대한 패킷 등의 기능을 수행 |
| 데이터링크 | 스위치 | 통신 장치들 사이에 가상 사설 링크를 제공하여 VLAN을 가능하게 함, 충돌을 감소시키고 네트워크 스니핑을 저지 |
| 데이터링크 | 브리지 | MAC 주소에 기반을 두어 패킷을 전송하고 필터링, 브로드캐스트 트래픽을 전송하지만 충돌 트래픽을 전송하지 않음 |
| 물리 | 리피터 | 신호를 증폭하여 네트워크의 길이를 확장 |
| 물리 | 허브 | 집중화 장비로 부르며, 단순히 노드들을 연결시켜 주는 역할 수행 |

### Mentor's Know-how
- 네트워크 장비를 네트워크 계층과 연관하여 역할을 정리해야 합니다.

## ② 브리지와 라우터의 주요 차이점

| | 브리지 | 라우터 |
|---|---|---|
| 헤더정보를 읽거나, 변경시킬 수는 없음 | | 각 프레임에 새로운 헤더를 생성 |
| 사용 | MAC 주소에 근거하여 전송 테이블을 작성, 모든 포트에 대해 동일한 네트워크 주소를 지정 | IP 주소에 근거하여 라우팅 테이블을 작성, 포트마다 서로 다른 네트워크 주소를 지정 |
| | MAC 주소에 기반하여 트래픽을 필터링 | IP 주소에 기반하여 트래픽을 필터링 |
| | 브로드캐스트 패킷을 전달 | 브로드캐스트 패킷을 전달하지 않음 |
| | 브리지에게 알려지지 않은 목적지 주소를 가진 트래픽도 전달 | 라우터에게 알려지지 않은 목적지 주소를 가진 트래픽은 전달하지 않음 |

### Mentor's Know-how
- 브리지는 MAC 주소를 기반으로 작동하는 데이터링크 계층 장비이고, 라우터는 IP 주소를 기반으로 작동하는 네트워크 계층 장비입니다.

quality: poor (좌측 표의 L4 스위치 기능 설명 일부 판독 불가)

## IMG_5225 — 스위치의 종류, VLAN의 종류 (textbook)

## ③ 스위치의 종류
- L2 스위치 : Mac Address 기반 스위칭
- L3 스위치 : IP Address 기반의 트래픽 조절 가능
- L4 ~ L7스위치 : Port Number 또는 Packet 내용을 분석 및 판단하여 Packet의 경로 설정, 변환, 필터링 동작을 수행할 수 있는 장비

### Mentor's Know-how
- OSI 참조모델에 기초한 분류입니다.(MAC 주소, IP 주소, 포트 번호, 패킷 내용)
- 스위치 방식
  - Cut-through : Input frame의 목적지 MAC 주소만을 확인한 후 해당 포트로 frame 전송
  - Store-and-Forward : 전체 frame을 모두 버퍼에 저장하고 frame 오류를 검사한 후 해당 포트로 전송
  - Fragment Free(modified Cut-through) : Cut-through와 Store-and-Forward의 장점을 혼합한 방식, 에러 감지 능력이 cut through에 비해서 우수

## ④ VLAN의 종류
- Port 기반 VLAN : 스위치 포트를 각 VLAN에 할당하는 것으로 같은 VLAN에 속한 포트에 연결된 호스트들 간에만 통신이 가능, 가장 일반적이고 많이 사용
- MAC 기반 VLAN : 각 호스트들의 맥어드레스를 VLAN에 등록하여 같은 VLAN에 속한 맥어드레스들 간에만 통신이 되도록 하는 방법, 호스트들의 맥어드레스들을 전부 등록해야 하기 때문에 자주 사용되지는 않음
- 네트워크주소 기반 VLAN : 네트워크 주소별로 VLAN을 구성하여 같은 네트워크에 속한 호스트들 간에만 통신이 가능, 주로 IP네트워크 VLAN을 사용
- 프로토콜기반 VLAN : 같은 통신 프로토콜(TCP/IP, IPX/SPX, NETVIEW 등)을 가진 호스트들간에만 통신을 가능하도록 구성된 VLAN

### Mentor's Know-how
※ 가상 근거리 네트워크(VLAN, Virtual Local Area Network)의 특징
- LAN을 물리적인 세그먼트가 아닌 논리적인 세그먼트로 분할
- 하나의 LAN은 여러 개의 논리적인 LAN으로 분할될 수 있는데, 이 논리적인 LAN을 VLAN이라고 함
- 각 VLAN은 조직 내의 작업그룹
- 만약 한 사람이 한 그룹에서 다른 그룹으로 이동하더라도 물리적인 구성을 바꿀 필요가 없음
- VLAN의 그룹 소속원 자격은 하드웨어가 아닌 소프트웨어로 정의

## IMG_5226 — 무선통신 보안 - 무선랜 프로토콜, 블루투스 보안 취약점 (textbook)

# Chapter 05 무선통신 보안

## ① 주요 무선랜 프로토콜

| 시기 | 프로토콜 | 주요 사항 | 비고 |
|---|---|---|---|
| 1997.7 | 802.11 | 2.4GHz/2Mbps | 최초의 무선랜 프로토콜 |
| 1999.9 | 802.11b | 2.4GHz/11Mbps | WEP 방식의 보안을 구현할 수 있음 |
| 1999.9 | 802.11a | 5GHz/54Mbps | 전파 투과성과 회절성이 떨어져 통신 신단절 현상이 심하며, 802.11b와 호환되지 않음 |
| 2003.6 | 802.11g | 2.4GHz/54Mbps | 802.11b에 802.11a의 속도 성능을 추가한 프로토콜로, 802.11b와 호환되나 네트워크 공유 시 데이터 처리 효율이 현격히 줄어드는 문제점이 있음 |
| 2004.6 | 802.11i | 2.4GHz/11Mbps (802.11b와 동일) | 802.11b 표준에 보안성을 강화한 프로토콜 |
| 2009 | 802.11n | 5GHz, 2.4GHz | 최대 600Mbps의 속도, 여러 안테나를 사용하는 다중 입력/다중 출력(MIMO) 기술과 대역폭 손실의 최소화 |

### Mentor's Know-how
- 유선랜 접근제어 : CSMA/CD(Carrier Sense Multiple Access with Collision Detection)
- 무선랜 접근제어 : CSMA/CA(Carrier Sense Multiple Access with Collision Avoidance)

| | 장점 | 단점 |
|---|---|---|
| 무선랜 장단점 | 케이블이 불필요하여 이동이 자유롭다. 주변 환경이 깔끔하게 정리된다. 네트워크 구축비용이 절감된다. 네트워크 유지 및 보수 등이 용이하다. | 전파를 사용하는 다른 기기의 간섭을 받는다. 유선랜에 비해 상대적으로 느린 전송속도를 제공한다. 숨겨진 터미널 문제가 발생한다. |

## ② 블루투스의 보안 취약점

블루투스(bluetooth)는 서로 짧은 거리에 있을 때 전화기, 노트북, 컴퓨터(데스크톱과 랩탑), 카메라, 프린터, 케이메이커 등과 같은 서로 다른 장치를 연결하기 위하여 사용하는 무선 LAN 기술입니다. 블루투스는 에릭슨・노키아・IBM・도시바 등 5개 업체가 1998년에 결성한 블루투스 스페셜 그룹(SIG, Special Interest Group)에서 공동 개발한 근거리 무선 네트워크 기술입니다.

- 블루프린팅(Blueprinting) : 서비스 방안(?) 프로토콜을 이용해 공격자는 공격이 가능한 블루투스 장치를 검색하고 모델을 확인 가능
- 블루스나핑(bluesnarfing) : 블루투스의 취약점을 이용하여 장비의 임의의 파일에 접근하는 공격
- 블루버깅(bluebugging) : 공격 장치와 공격 대상 장치를 연결하여 공격 대상 장치에서 임의의 동작을 실행하는 공격
- 블루재킹(bluejacking) : 블루투스를 이용해 스팸처럼 명함을 임의로 뿌리는 것

quality: poor (블루투스 보안 취약점 하단 문단 글자가 작아 일부 판독 불확실, (?) 표기)

블루투스의 명칭은 10세기 덴마크와 노르웨이를 통일을 이룩한 바이킹 헤랄드 블루투스(Harald Bluetooth; 910~985)의 이름에서 따왔습니다.

## IMG_5227 — 무선랜 보안 취약점 (textbook)

## ③ 무선랜 보안 취약점

무선랜의 물리적 취약점
- 도난 및 파손 : 외부 노출된 무선 AP의 도난 및 파손으로 인한 장애 발생
- 구성설정 초기화 : 무선 AP의 리셋버튼을 통한 장비의 초기화로 인한 장애 발생
- 전원 차단 : 무선 AP의 전원 케이블의 분리로 인한 장애 발생
- LAN 차단 : 무선 AP에 연결된 내부 네트워크 케이블의 절체로 인한 장애 발생

무선랜의 기술적 취약점
- 도청 : 무선 AP에서 발송되는 전파의 강도와 지형에 따라 서비스가 필요한 범위 이상으로 전달될 수 있으므로 도청 가능
- 서비스 거부(DoS) : 무선 AP 장비에 대량의 무선 패킷을 전송하여 무선랜을 무력화하거나 강한 방해전파 전송
- 불법 AP(Rogue AP) : 공격자가 불법적으로 무선 AP를 설치하여 무선랜 사용자들의 전송 데이터를 수집하는 것
- 비인가 접근
  - SSID 노출 : 무선 AP에 별도의 인증 절차가 설정되어 있지 않은 경우에는 무선 전송 데이터의 모니터링을 통해 SSID 값을 획득하고, 획득한 SSID 값을 무선 단말기에 설정하는 것만으로 무선랜으로의 불법적인 접속이 가능
  - MAC 주소 노출 : 접근 제어를 위한 MAC 주소 필터링 적용 시 공격자가 정상 사용자의 MAC 주소를 도용함으로써 쉽게 무력화 가능

무선랜의 관리적 취약점
- 무선랜 장비 관리 미흡 : 기관에서는 장비 운영현황과 사용자 현황 등을 파악해야함
- 무선랜 사용자의 보안의식 결여 : 무선랜을 사용하는 사용자도 항상 보안에 관심을 갖고 무선랜을 사용해야 함
- 전파관리 미흡 : 기관 내부와 외부에서 전파 출력을 측정하여, 적절한 무선랜 서비스 영역을 제공할 수 있도록 해야함

### Mentor's Know-how
- 보안학습은 기본적으로 관리적, 물리적, 기술적 관점에서 구분할 수 있어야 합니다.

## IMG_5228 — 무선랜 보안 기술 (SSID, WEP, EAP, TKIP, CCMP, WPA) (textbook)

## ④ 무선랜 보안 기술

무선랜 인증 기술
- SSID(Service Set IDentifier) : AP를 구분하는 ID로 무선랜을 통해 전송되는 패킷 헤더(header)에 덧붙여지는 32바이트 고유 식별자
- MAC 어드레스 필터링 : MAC 어드레스는 네트워크 카드 제조사에 의해 부여된 48비트의 H/W 주소
- EAP(Extensible Authentication Protocol) : 원래 PPP에서 사용할 목적으로 설계된 프로토콜로써, PPP 인증방식(PAP, CHAP 등)을 쉽게 확장할 수 있도록 설계
- WEP(Wired Equivalent Privacy) : 공유키인 WEP 키를 이용하여 사용자를 인증하는 방식

무선랜 암호화 기술
- WEP(Wired Equivalent Privacy) : 무선랜 데이터 스트림의 보안을 제공하기 위해서 사용되며, 대칭키 구조의 암호화 알고리즘
- TKIP(Temporal Key Integrity Protocol) : 기존 WEP의 암호화 알고리즘인 RC4를 사용하면서 RC4의 보안상의 문제점을 개선하기 위해 Key Mixing 함수, Dynamic WEP Key(Temporal Key), 메시지 무결성 보장을 위한 스펙(spec)을 정의한 통신 규약
- CCMP(Counter mode with CBC-MAC Protocol) : AES 블록 암호를 사용한 데이터의 비밀성과 무결성을 보장하기 위한 규칙들을 정의함

무선랜 인증 및 암호화 복합 기술
- 802.1x 보안 : 브리지 혹은 무선 AP에서의 물리적인 포트의 사용권을 획득하는 절차를 규정
- WPA(Wi-Fi Protected Access) : Wi-Fi에서 정의한 무선랜 보안규격으로써 802.11i 보안 규격의 일부 기능을 수용하여 만든 표준 규격, 현재 사용되고 있는 하드웨어의 변경 없이 소프트웨어의 업그레이드를 통해 지원 가능
- WPA2 : 2세대 WPA로서 TKIP를 대체하기 위해 AES에 기반을 둔 CCMP(Counter Mode with Cipher Block Chaining Message Authentication Code Protocol) 암호화 방식을 사용하는 IEEE802.11i 수정안을 포함한 보안 기술

### Mentor's Know-how
- 무선랜 보안 기술은 크게 인증 기술, 암호화 기술, 인증+암호화 기술로 나눌 수 있습니다.
- 802.11i 인증 참조

| 구분 | 정적(Static) WEP | 동적(Dynamic) WEP | WPA v1 | WPA v2 |
|---|---|---|---|---|
| 보안키 적용 방식 | WEP(24비트 IV) | WEP(24비트 IV) | TKIP(48비트 IV) | CCMP |
| 암호화 알고리즘 | RC4 | RC4 | RC4 | AES |
| 암호 비트 | 64/128 | 128 | 128 | 128 |
| 보안 레벨 | 하 | 중/상 | 상 | 최상 |

## IMG_5229 — WPA/WPA2 모드 비교, WAP 프로토콜 구조, iOS/안드로이드 차이점 (textbook)

## ⑤ WPA, WPA2의 모드별 비교

| 구분 | WPA 인증 | WPA 암호화 | WPA2 인증 | WPA2 암호화 |
|---|---|---|---|---|
| 엔터프라이즈 모드 | IEEE 802.1X/EAP | TKIP/MIC | IEEE 802.1X/EAP | AES-CCMP |
| 개인모드 | PSK | TKIP/MIC | PSK | AES-CCMP |

## ⑥ WAP 프로토콜 구조

[그림: WAP(Wireless Application Protocol) 계층 구조]
- 좌측 스택: HTML/XML JavaScript / HTTP / TLS-SSL / TCP/IP UDP/IP
- 우측 WAP 스택 (위에서 아래로):
  - Wireless Application Environment (WAE) | Other Services and Applications
  - Session Layer (WSP)
  - Transaction Layer (WTP)
  - Security Layer (WTLS)
  - Transport Layer (WDP)
  - Bearers: SMSS, USSD, CSD, IS.136, CDMA, CDPD, PDC.P, Etc..

### Mentor's Know-how
- 무선 응용 프로토콜(WAP, Wireless Application Protocol)은 WAP 포럼에서 개발한 통합된 표준으로 웹과 같은 정보 서비스에 접근하기 위해 모바일 폰과 페이저(비퍼), PDA 같은 장비에서 이 표준을 사용한다.
- WAP 프로그래밍 모델
[그림: 무선 네트워크(WAP 장치 - WTLS 보호 영역 - WAP 게이트웨이) - 유선IP 네트워크(WAP 게이트웨이 - TLS 보호 영역 - 웹 서버) 흐름도]

## ⑦ iOS와 안드로이드의 주요 차이점

| 구분 | iOS | 안드로이드 |
|---|---|---|
| 애플리케이션 정책 | 폐쇄적 | 개방적 |
| 애플리케이션 배포 방식 | 애플 앱스토어 | 무제한 |
| 악성 애플리케이션 검수 | 애플의 검수 통과 후 앱스토어에 등록 | 누구나 마켓에 등록 가능, 등록 후 악성 애플리케이션임이 알려지면 스토어에서 내리는 방식 |

## IMG_5230 — iOS/안드로이드 보안 체계 비교, BYOD 보안 기술 (textbook)

## ⑧ iOS와 안드로이드의 보안 체계 비교

| 구분 | iOS | 안드로이드 |
|---|---|---|
| 운영체제 | Darwin UNIX에서 파생하여 발전한 OS X의 모바일 버전 | 리눅스 커널(2.6.25)을 기반으로 만들어진 모바일 운영체제 |
| 보안 통제권 | 애플 | 개발자 또는 사용자 |
| 프로그램 실행권한 | 관리자(root) | 일반 사용자 |
| 응용 프로그램에 대한 서명 | 애플이 자신의 CA를 통해 각 응용프로그램을 서명하여 배포 | 개발자가 서명 |
| 샌드박스 | 엄격하게 프로그램 간 데이터 통신 통제 | iOS에 비해 상대적으로 자유로운 형태의 애플리케이션의 실행이 가능 |
| 부팅 절차 | 암호화 로직으로 서명된 방식에 의한 안전한 부팅 절차 확보 | - |
| 소프트웨어 관리 | 단말 기기별 고유한 소프트웨어 설치 키 관리 | - |

### Mentor's Know-how
- 탈옥(Jailbreaking) : 애플사의 아이폰(iPhone) 잠금장치를 해제해 설치된 OS의 관리자 권한을 획득하는 것으로, 아이폰 해킹으로 불림. 아이폰 탈옥을 통해 애플이 승인하지 않은 애플리케이션 등을 실행할 수 있지만 동시에 보안 위협이 증가할 수 있음
- 루팅(Rooting) : 안드로이드폰의 운영체제(OS)를 해킹해 관리자 권한을 얻는 행위. 원래 리눅스에서 관리자 권한을 얻는 행위를 지칭하는 용어에서 파생됨
- AndroidManifest.xml : 안드로이드 애플리케이션에 대한 각종 정보를 기술한 애플리케이션 명세서로써 앱 실행 시 반드시 필요한 권한을 선언하며, 안드로이드 빌드 도구 및 안드로이드 운영체제에 관한 필수 정보를 설명하는 파일

## ⑨ BYOD 보안 기술
- MDM(Mobile Device Management) : 기기를 완전히 제어할 수 있도록 직원의 스마트패드와 스마트폰에 잠금・제어・암호화・보안 정책 실행을 할 수 있는 기능을 제공
- 컨테이너화(Containerization) : 하나의 모바일 기기 내에 업무용과 개인용 영역을 구분해 보안 문제와 프라이버시 보호를 동시에 해결하려는 기술
- 모바일 가상화(Hypervisors) : 하나의 모바일 기기에 개인용과 업무용 운영체제(OS)를 동시에 담아 개인과 사무 정보를 완전히 분리
- MAM(Mobile Application Management) : 스마트 기기 전체가 아니라 기기에 설치된 업무 관련 앱에만 보안 및 관리 기능을 적용
- NAC(Network Access Control) : 사용자 기기가 기업 내부 네트워크 접근 전 보안 정책을 준수했는지 여부를 검사하여 비정상 접근 여부에 따라 네트워크 접속을 통제하는 기술

### 보안 용어
- 단말기기(BYOD, Bring Your Own Device) : 개인 소유 단말기를 업무에 사용하는 환경, 스마트폰과 스마트패드와 같은 모바일 기기를 이용한 모바일 오피스 환경이 구축되면서 단말기 공급 및 유지관리와 통신비 등으로 발생되는 부담을 덜 수 있다는 측면에서 활용되고 있다. 하지만 모바일 단말을 이용하기 때문에 보안에 취약하다.

## IMG_5231 — 네트워크 5대 관리 기능 및 SNMP (textbook)

Chapter 06 네트워크 관리

① 네트워크 5대 관리 기능

[그림: "5대 관리 기능" 트리 - 계정 관리, 구성 관리, 성능 관리, 장애 관리, 보안 관리 다섯 개 박스가 각각 화살표로 설명에 연결됨]

- 계정 관리 → 비용을 계산하고 요금을 부과할 수 있는 기능
- 구성 관리 → 상호 연결 및 네트워크의 정보를 제공하는 기능
- 성능 관리 → 네트워크의 동작 및 효율성을 평가하는 기능
- 장애 관리 → 비정상적인 동작을 발견하고 대처하는 기능
- 보안 관리 → 관리 대상에 대한 보안 기능 제공

② SNMP

SNMP 개념 : 관리자와 에이전트의 개념을 사용.
즉, 보통 호스트인 관리자는 보통 라우터나 서버인 에이전트들의 집단을 제어하고 감시

관리자와 에이전트 : 관리자(manager)라고 불리는 관리 스테이션은 SNMP 클라이언트 프로그램을 수행하는 호스트, 에이전트(agent)라고 불리는 관리대상 스테이션은 SNMP 서버 프로그램을 수행하는 라우터(또는 호스트)

관리 구성요소
- SNMP : SNMP 패킷에서 객체(변수)의 상태(값)를 읽고 변경
- SMI : 객체의 이름을 붙이고 객체 유형을 정의하며, 객체와 값들을 부호화하는 방법을 나타내기 위한 일반적인 규칙들을 정의
- MIB : 관리될 각 개체를 위해, 객체의 수를 결정하고, 이들을 SMI에 의해 정의된 규칙에 따라 이름을 붙이며, 이름이 지어진 각 객체에 유형을 연결

Mentor's Know-how
- SNMP(Simple Network Management Protocol) : TCP/IP의 망 관리 프로토콜(RFC 1157), 라우터(router)나 허브(hub) 등 망 기기(network agent)의 망 관리 정보를 망 관리 시스템에 보내는 데 사용되는 표준 통신 규약으로 채용되었습니다.
- 컴퓨터 프로그래밍과 네트워크 관리 비교

[그림: Computer programming (Language syntax / Declaration and definition / Program coding) ↔ Network management (SMI / MIB / SNMP) 각 항목이 화살표로 대응]

## IMG_5232 — SSH(Secure Shell) (textbook)

③ SSH(Secure Shell)

개요
- 암호 통신을 이용하여 네트워크상의 다른 컴퓨터에 접속하여 원격으로 명령을 실행하거나 파일을 조작하는 응용 프로그램 또는 프로토콜
- 기존의 rsh, rlogin, Telnet, FTP 등 평문 송·수신 서비스의 취약점을 대체하기 위해 설계되었으며 디폴트로 22/tcp 포트를 사용

대표 서비스
- 암호화된 원격 터미널 서비스 제공
- 암호화된 파일 송·수신 서비스 제공

SSH 컴포넌트
- SSH 전송 계층 프로토콜(SSH-TRANS) : TCP상에 안전한 채널을 생성하는 프로토콜을 사용
- SSH 인증 프로토콜(SSH-AUTH) : 클라이언트와 서버 간에 안전한 채널이 설정되고 클라이언트에 대해 서버 인증이 이루어진 후 SSH는 서버에 대해 클라이언트를 인증하는 소프트웨어를 호출
- SSH 연결 프로토콜(SSH-CONN) : 여러 개의 논리적 통신채널의 다중화를 수행하는 것

Mentor's Know-how
- rlogin : 원격시스템에서 접속할 때 사용하는 서비스로 사전에 서버의 /etc/hosts.equiv 파일에 호스트를 등록 후, 클라이언트는 패스워드를 입력할 필요 없이 로그인이 가능하도록 한 서비스
- SSH 주요 기능
  - 인증(Authentication)
  - 기밀성 유지 : 암호화(Encryption)
  - 무결성(Integrity) : MAC
  - 압축(Compression)
  - 포트 포워딩(일종의 터널링)
  - 다중화

## IMG_5233 — UNIX 네트워크 기반 프로그램 활용 (ping, traceroute) (textbook)

Chapter 07 네트워크 기반 프로그램 활용

① UNIX 네트워크 기반 프로그램 활용

연결테스트(ping)
- 인터넷으로 접속하려는 원격 호스트가 정상적으로 운영되고 있는지를 확인하는 진단 목적으로 사용
- ping 명령은 ICMP를 이용하는 유틸리티
- ICMP 타입 중에서 Echo Request(Type 8) 패킷을 전송하고, Echo Reply(Type 0) 패킷을 수신함으로써 접근성(Reachability)을 확인
- ping 명령어 제공 정보
  - 대상 시스템에 ICMP 패킷 도달 가능여부
  - ICMP 패킷이 대상 시스템을 왕복하는데 걸리는 시간
  - ICMP 패킷의 손실률
- TTL 값도 운영체제에 따라 조금씩 다름(유닉스 계열은 255, 윈도우 계열은 128부터 TTL 값이 라우터를 지날 때마다 1씩 감소)

경로추적(traceroute)
- 종단(End) 노드 사이에 있는 여러 중계 노드(L3장비/라우터) 각 구간에 대한 네트워크 상태를 관리하기 위한 명령어로 네트워크의 라우팅 문제점을 찾아내는 목적으로 많이 사용
- ICMP, IP, UDP 프로토콜을 활용
- tracert(윈도우) 명령은 traceroute의 UDP 패킷 대신 ICMP Echo Request(Type 8)과 ICMP Echo Reply(Type 0)을 이용

Mentor's Know-how
- traceroute 프로그램
[그림: 출발지에서 TTL:1,2,3,4로 증가시키며 각 홉(X)에서 Time-exceeded 응답을 받고, 최종 목적지에서 Destination-unreachable 응답을 받는 과정을 화살표로 표현. 범례(Message types): Traceroute / Time-exceeded / Destination-unreachable]

## IMG_5234 — UNIX 네트워크 기반 프로그램 (netstat, route, tcpdump, ifconfig) (textbook)

네트워크 인터페이스 진단(netstat)
- UNIX 시스템의 TCP/IP 프로토콜 진단 시 다양한 용도로 사용
- 네트워크 인터페이스(LAN 카드)에 대한 성능 정보, 시스템의 라우팅 정보, 소켓 사용 정보 등 지정 옵션에 따라서 네트워크 정보를 제공

라우팅 테이블 설정(route)
- 라우팅 테이블에 라우팅 경로를 추가하거나 삭제

네트워크 패킷/로그 분석(tcpdump)
- 네트워크 인터페이스를 거치는 패킷의 내용을 출력해 주는 프로그램
- 스니핑 도구의 일종으로 자신의 컴퓨터로 들어오는 모든 패킷의 내용을 도청할 수 있음
- 공격자의 추적 및 공격 유형 분석을 위한 패킷 분석 시에 활용할 수 있는 도구
- 윈도우용으로는 windump가 있으며 활용 방법은 유사

네트워크 인터페이스 설정(ifconfig)
- 네트워크 인터페이스의 설정정보를 알아보거나 IP주소나 서브넷마스크 등의 설정을 변경할 때 사용

Mentor's Know-how
- netstat 프로그램 옵션에 따라 제공되는 정보의 차이
  -r : 라우팅 정보를 출력
  -i [interval] : 네트워크 인터페이스에 대한 정보를 출력
  -s : 각 네트워크 프로토콜(IP, TCP, UDP, ICMP)에 대한 통계 정보를 출력
  -a : 모든 소켓 정보를 출력
  -n : 네트워크 주소를 숫자로 출력

## IMG_5235 — 네트워크 기반 공격의 이해 - 공격 유형, DoS, SYN flooding (textbook)

Chapter 08 네트워크 기반 공격의 이해

① 네트워크 보안 공격 유형

| 구분 | 수동적 공격 | 능동적 공격 |
|---|---|---|
| 특징 | 직접적인 피해 없음 | 직접적인 피해 있음 |
| 탐지 가능성 | 어려움 | 쉬움 |
| 대표적인 예 | 스니핑(Sniffing), 도청(Eavesdrop) | 재전송 공격, 변조, DoS/DDoS, 세션 하이재킹 |

② 서비스 거부 공격(DoS, Denial of Service)

정의 : 정당한 사용자가 정보 시스템의 데이터나 자원을 적절한 대기 시간 내에 사용하는 것을 방해하는 행위로, 주로 시스템에 과도한 부하를 일으켜 정보 시스템의 사용을 방해하는 공격

TCP Syn flooding Attack
정의
- TCP 연결 설정 과정 중에 3-Way Handshaking 과정에서 Half-Open 연결 시도가 가능하다는 취약점을 이용한 공격
- 사용하지 않는 IP 주소로 SYN 패킷의 출발지 주소를 위조하는 것이 일반적인 방법

3-way Handshake 구조와 SYN flooding 공격 구조
[그림: 왼쪽 - TCP Client와 TCP Server 간 정상적인 3-way handshake (SYN → SYN/ACK → ACK), Client Ports 1024~65535, Service Ports 1~1023.
오른쪽 - Malicious TCP Client가 "소스 IP 주소를 속이거나 도용된 SYN 패킷 전송"으로 Victim TCP Server에 SYN을 보내고, 서버는 존재하지 않는 주소로 SYN/ACK를 반복 전송(응답 없음, "?" 표시)]

## IMG_5236 — SYN flooding 보안 대책 및 SMURF Attack (textbook)

보안 대책
- 방화벽 또는 DDoS 대응장비를 이용 : 동일 Client(IP)의 연결(SYN) 요청에 대한 임계칭(Threshold)을 통해 과도한 연결요청이 발생하는 것을 차단
- Syn_Cookie : 서버에서 클라이언트로 보내는 SYN+ACK 패킷에 임의로 생성되는 시퀀스 넘버 대신 서버에서 암호화 기술을 이용해 인증 정보가 담긴 시퀀스 넘버를 생성하여 클라이언트에 보냄
- First SYN Drop 설정 : 연결(SYN) 요청 패킷을 보내는 클라이언트가 실제로 존재하는지를 파악하는 방법으로 클라이언트로부터 전송된 첫 번째 SYN은 Drop하여 재요청 패킷이 도착하는지 확인
- TCP 연결 테이블(Backlog Queue) 엔트리 선택적 삭제 : 연결 테이블이 오버플로우가 될 때 일부 엔트리를 삭제함으로써 새로운 SYN 패킷을 처리할 수 있게 만드는 것

SMURF Attack
정의
- 직접적인 ICMP 브로드 캐스트(Broadcast)와 세 가지 구성요소인 공격자, 증폭 네트워크, 공격대상 서버(표적)를 이용
- IP 위장과 ICMP의 특징을 이용한 공격

공격 구조
[그림: 공격자가 공격대상 서버의 IP주소로 Spoofing된 ICMP ECHO 패킷을 전송(Broadcasting X.X.X.255)하여 인터넷 통해 Router 거쳐 증폭 네트워크의 여러 컴퓨터로 전달. 각 컴퓨터가 ICMP ECHO REPLY를 공격대상 서버로 전송. "ICMP ECHO 패킷을 받은 많은 시스템들은 공격대상 서버로 응답한다."]

Mentor's Know-how
- Smurf 공격은 제한적 브로드캐스트 주소(Limited Broadcast Address)가 아닌 직접 브로드캐스트 주소(Didrected Broadcast Address)로 설정한 Ping 메시지를 송신하여 공격하게 됩니다.

## IMG_5237 — 보안대책, LAND Attack, Ping of Death, Teardrop/Bonk/Boink (textbook)

보안 대책
- 라우터에서 다른 네트워크로부터 자신의 네트워크로 들어오는 IP directed broadcast 패킷을 막도록 설정
- 호스트는 IP broadcast address로 전송된 ICMP 패킷에 대해 응답하지 않도록 시스템을 설정

LAND Attack
정의 : 공격자가 임의로 자신의 IP 어드레스와 포트를 대상 서버의 IP 어드레스 및 포트와 동일하게 하여 서버에 접속하는 공격방식
보안 대책 : 자신의 시스템 주소와 동일한 소스 주소를 가진 외부 패킷을 필터링

Ping of Death
정의 : 공격자는 핑(Ping)을 이용하여 ICMP 패킷을 정상적인 크기(65,535 bytes)보다 아주 크게 만들어 공격
보안 대책 : 패치 또는 패킷 중 분할이 일어난 패킷을 공격으로 의심하여 탐지

시퀀스 넘버 기반의 오류 제어 방식을 악용한 공격

Teardrop Attack
- 오프셋 값을 단편화 간에 중복되도록 고의적으로 수정하거나 정상적인 오프셋 값보다 더 큰 값을 더해 그 범위를 넘어서는 오버플로우를 일으켜 시스템의 기능을 마비시켜 버리는 DoS 공격 기법

Bonk
- 처음 패킷을 1번으로 보낸 후 다음 패킷을 보낼 때 순서번호를 모두 1번으로 조작하여 전송하는 DoS 공격

Boink
- Bonk를 수정한 DoS 공격도구로써 패킷 시퀀스 번호를 비정상적인 상태로 보내는 공격기술

## IMG_5238 — DDoS 공격 vs DRDoS 공격 (textbook)

③ DDoS 공격 vs DRDoS 공격

DDoS 공격
정의 : 다수의 서버, PC 등을 이용해 비정상적인 트래픽을 유발시켜서 대상 시스템을 마비시키는 공격 행위
※ 서비스 거부(DoS : Denial of Service) 공격은 공격자가 단일 컴퓨터를 통해 공격하는 경우를 말하고, 분산 서비스 거부(DDoS : Distributed Denial of Service)공격은 공격자가 물리적으로 분산된 다수의 컴퓨터(좀비 PC)를 이용하여 공격하는 형태를 말함

공격 개념도
[그림: 공격자 → "악성코드 전파" → 1차 피해자(좀비 PC, 좀비단말, 봇넷) 여러 대 → "디도스 공격" → 웹서버 마비]

- 공격자는 취약한 서버를 공격하여 악성코드를 배포하고, 유포지/경유지 서버에서 악성코드를 내려 받은 서버/기기들을 이용하여 봇넷을 구축

구성 요소
- 공격자, 봇 마스터 : 공격을 주도하는 해커의 컴퓨터, C&C(Command & Control) 서버에 공격 명령을 전달하는 해커의 컴퓨터, 봇 마스터(Bot Master) 라고도 함
- 마스터, C&C 서버 : 공격자에게 직접 명령을 받은 시스템으로, 여러 대의 에이전트(Agent)를 관리
- 에이전트(Agent) : 공격 대상에 직접적인 공격을 가하는 시스템으로, 악성코드에 감염된 시스템(슬레이브(Slave), 좀비(Zombie)라고도 함)
- 표적(Victim) : 공격 대상이 되는 시스템

Mentor's Know-how
- 봇(Bot) : 소프트웨어적 로봇(Robot)의 줄임말, 보안상 결함을 이용해 원격에서 해당 시스템을 제어할 수 있는 프로그램, 악성 봇에 감염된 PC/디바이스를 "좀비 PC/디바이스"라고 함
- 봇넷(Botnet) : 악성 소프트웨어인 봇에 감염된 다수의 좀비 PC/디바이스로 구성된 네트워크, 좀비들은 C&C 서버와 직접 통신하거나 좀비들 간에 서로 통신을 수행하면서 공격자의 명령을 수행
- DNS 싱크홀(DNS Sinkhole) : 악성 봇을 조종하는 조종자를 탐지하고, 감염된 개인용 컴퓨터(PC)와 조종자 간의 접속을 차단해 2차 피해를 예방하기 위한 시스템

[그림: 싱크홀 적용 전 - 봇 감염 PC가 해커 서버 IP 응답을 받아 해커 서버와 통신(악성 도메인 질의 → DNS 서버 → 해커 서버 IP 응답 → 봇 감염 PC ↔ 해커 서버).
싱크홀 적용 후 - 악성 봇 PC의 악성 도메인 질의에 대해 DNS 서버가 싱크홀 서버 IP로 응답하도록 하여(KISA, 싱크홀 서버, 도메인 채록 제공 서버) 해커 서버와의 통신을 차단]

## IMG_5239 — DRDoS 공격 및 DDoS 공격의 사례 (Trinoo, TFN, Stacheldraht, TFN2K) (textbook)

DRDoS 공격
정의 : 별도의 에이전트 설치 없이 프로토콜 구조의 취약점을 이용해 정상적인 서비스를 운영하는 시스템을 분산 반사 서비스 거부 공격의 에이전트로 활용하여 공격

개념도
[그림: 공격자가 "출발지 IP를 공격대상 IP로 위변조"하여 120bps 크기만큼 감염 서버에 요청(반사 Reflection)을 경유지 서버(DNS, NTP, Memcached, CLDAP)로 30bps씩 보냄. 경유지 서버가 300Mbps씩 증폭(Amplification)하여 1.2Gbps 크기로 증폭되어 피해 시스템(공격대상)을 공격. 10,000배 증폭]

④ DDoS 공격의 사례

전통적인 DDoS 공격
- 트리누(Trinoo) 공격 : 많은 호스트로부터 통합된 UDP flood 서비스거부 공격을 유발하는데 사용되는 도구
- TFN 공격 : 트리누와 거의 유사한 분산 서비스 거부 도구로 많은 소스에서 하나 혹은 여러 개의 목표 시스템에 대해 서비스거부 공격을 수행, UDP flood 공격을 할 수 있을 뿐만 아니라 TCP SYN flood 공격, ICMP echo 요청 공격, ICMP 브로드캐스트 공격(smurf 공격)을 할 수도 있음
- Stacheldraht 공격 : 트리누와 TFN을 참고하여 제작된 도구로써 이들이 갖고 있는 특성을 대부분 가지고 있는 공격도구로 stacheldraht의 마스터 시스템 및 자동적으로 업데이트 되는 에이전트 데몬과의 사이에 통신을 할 때 암호화하는 기능이 추가됨
- TFN2K 공격 : TFN2K는 TFN의 발전된 형태로써 통신에 특정 포트가 사용되지 않고 암호화되어 있으며, 프로그램에 의해 UDP, TCP, ICMP가 복합적으로 사용되며 포트도 임의로 결정됨

## IMG_5240 — 최신 DDoS 공격 분류 및 Reflection Attack 종류 (textbook)

최신 DDoS 공격

분류

| 구분 | 대역폭 공격 | 자원 소진 공격 | 웹/DB 부하 공격 |
|---|---|---|---|
| 공격 특성 | 높은 bps | 높은 pps, 높은 connection | 높은 pps, 높은 connection |
| 공격 유형 | UDP Flooding 및 UDP 기반 반사공격(DNS, NTP, CLDAP, SSDP 등), ICMP Flooding 등 | TCP SYN, ACK Flooding 등 | GET Flooding, POST Flooding 등 |
| 피해 대상 | 동일 회선을 사용하는 모든 시스템 접속 불가 | 대상 서버, 네트워크 장비 등의 과부하 발생 | 대상 웹/DB 서버 과부하 발생 |
| 프로토콜 | UDP, ICMP, TCP | TCP | HTTP, HTTPS |
| IP 위/변조 여부 | 위/변조 가능 | 위/변조 가능 | 위/변조 불가능(실제 IP로 공격) |
| 비고 | 일시적으로 대량의 트래픽을 발생시키기 때문에 회선 대역폭이 작으면 방어가 어려움 | 대역폭 공격에 비해 적은 트래픽으로도 서버 과부하를 유발할 수 있음 | 정상적으로 세션을 맺은 후 과도한 HTTP 요청으로 웹/DB 서버의 과부하를 유도함 |

Mentor's Know-how
- bps(bit per second) : 초당 bit 수를 지칭하는 약어
- pps(packet per second) : 초당 packet 수를 지칭하는 약어
- connection : 데이터를 주고받기 위해 클라이언트와 서버 간에 서로 연결된 상태

Mentor's Know-how
- NTP Reflection Attack : 시간동기화를 위해 사용되는 NTP(Network Time Protocol) 서버를 반사서버로 악용한 공격
- CLDAP Reflection Attack : CLDAP(Connection-less Lightweight Directory Access Protocol, 네트워크상에서 디렉터리를 연결/검색/수정 하기 위해 사용되는 프로토콜) 서버를 반사서버로 악용한 공격으로서, 피해자의 IP로 스푸핑된 IP를 통해 CLDAP 서버에게 비정상적인 Query를 보낸 후 되돌아 오는 응답값을 공격패킷으로 활용하는 공격
- SSDP Reflection Attack : SSDP(Simple Service Discovery Protocol, 장치를 탐색할 때 주로 사용되는 프로토콜) 기능을 악용하여 가능한한 많은 데이터를 요청하는 Search 명령을 보내서, 스푸핑된 피해자의 서버 IP로 대규모 응답이 가게 만드는 공격

## IMG_5241 — 웹/DB 부하 공격(Application Layer DoS) 종류 (textbook)

종류

- GET Flooding : 공격자는 TCP Protocol의 3-way-handshake를 통해 서버와 세션을 맺은 후, HTTP GET 메소드 요청을 통해 웹서버의 자원을 소진함과 동시에 DB서버까지 자원을 소진 시켜서 정상적인 사용자의 웹서비스 이용을 차단
- Slow HTTP Header DoS(Slowloris) : 웹서버는 HTTP 메시지의 헤더부분을 먼저 수신하여 이후 수신할 데이터의 종류를 판단하게 되는데, 헤더부분을 비정상적으로 조작하여 웹서버가 헤더정보를 구분할 수 없도록 하면, 웹서버는 아직 HTTP 헤더정보가 모두 전달되지 않은 것으로 판단하여 연결을 장시간 유지하게 됨
- Slow HTTP POST DoS(RUDY, R-U-Dead Yet) : HTTP POST 지시자를 이용하여 서버로 전달할 대량의 데이터를 장시간에 걸쳐 분할 전송하면 서버는 POST 데이터가 모두 수신되지 않았다고 판단하여 연결을 장시간 유지하게 됨
- Slow HTTP Read DoS : 공격자는 웹서버와 TCP 연결 시, TCP 윈도우 크기 및 데이터 처리율을 감소시킨 후 HTTP 데이터를 송신하여 웹서버가 정상적으로 응답하지 못하도록 DoS 상태를 유발함
- GET Flooding with Cache-Control(CC Attack) : HTTP 메시지의 캐시 옵션을 조작하여 캐싱서버가 아닌 웹서버가 직접 처리하도록 유도하여 캐싱서버의 기능을 무력화하고 웹서버의 자원을 소진시킴
- 동적 HTTP Request Flooding : 차단 기법을 우회하기 위해 지속적으로 요청 페이지를 변경하여 웹 페이지를 요청하는 공격 기법

## IMG_5242 — 네트워크 스캐닝 (풋프린팅/스캐닝/목록화, TCP Full Open, Half Open, FIN/NULL/XMAS, UDP 스캔) (textbook)

⑤ 네트워크 스캐닝

3단계 과정
- 풋프린팅 : 신문, 게시판 혹은 네트워크 검색, 포털 검색 등의 방법을 통해 공격 대상의 IP 블록, DNS/Mail 서버 등의 정보를 수집하는 초기 과정
- 스캐닝 : 핑(Ping), 포트 스캔(Port Scan), 운영체제 확인 등의 방법으로 시스템 종류, IP 주소, 서비스 등을 알아내어 보다 세부적인 정보를 수집하는 과정
- 목록화 : 앞선 풋 프린팅, 스캐닝 방법을 통해서 수집된 정보를 토대로 라우팅 테이블, SNMP 정보 등 좀 더 실용적인 정보를 수집하여 시스템 취약점 분석 및 공격방법 결정을 위한 지표를 작성하는 과정

스캐닝 종류

TCP FULL OPEN 스캔(TCP Connect 스캔)
[그림: 포트가 열려 있을 경우 - 공격자→공격대상 SYN, 공격대상→공격자 SYN+ACK, 공격자→공격대상 ACK.
포트가 닫혀 있을 경우 - 공격자→공격대상 SYN, 공격대상→공격자 RST+ACK]

TCP Half Open 스캔(SYN 스캔)
[그림: 포트가 열려 있을 경우 - SYN → SYN+ACK → RST(공격자가 RST 보냄, ACK 생략).
포트가 닫혀 있을 경우 - SYN → RST+ACK]

FIN, NULL, XMAS 스캔
[그림: 포트가 열려 있을 경우 - 공격자→공격대상 FIN,NULL,XMAS 패킷, 아무런 응답이 없다.
포트가 닫혀 있을 경우 - FIN,NULL,XMAS 패킷 → RST 패킷 응답]

UDP 스캔
[그림: 포트가 열려 있을 경우 - UDP 패킷 전송, 아무런 응답이 없다.
포트가 닫혀 있을 경우 - UDP 패킷 전송 → ICMP Unreachable 패킷 응답]

Mentor's Know-how
- 포트가 열려 있을 경우 ≒ 해당 시스템이 활성화되어 있음 ≒ 해당 포트가 제공하는 서비스 추측 가능
- TCP Half Open Scan은 세션에 대한 로그가 남는 TCP Full Open 스캔의 단점을 보완하기 위해 나온 기법으로 로그를 남기지 않아 추적이 불가능하도록 하는 기법
- TCP FIN(Finish) 스캔은 TCP 헤더 내에 FIN 플래그(Flag)를 설정하여 공격대상 시스템으로 메시지를 전송
- NULL 패킷은 TCP 헤더 내에 플래그 값을 설정하지 않고 전송하는 패킷
- XMAS 패킷은 TCP 헤더 내에 ACK, FIN, RST, SYN, URG 플래그를 모두 설정하여 전송하는 패킷

## IMG_5243 — 스니핑(Sniffing) (textbook)

# 스니핑(Sniffing)

## 정의
- 네트워크상에서 자신이 아닌 다른 상대방의 패킷 교환을 엿듣는 것
- 네트워크 트래픽을 도청(eavesdropping)하는 과정

## 종류

### 허브 환경에서의 스니핑
- 허브(Hub)는 기본적으로 들어온 패킷에 대해 패킷이 들어온 포트를 제외한 모든 포트에 패킷을 보내는 장비
- 시스템의 NIC(Network Interface Card)를 promiscuous 모드로 동작하게 하면 다른 이들의 패킷을 받아볼 수 있음. 이때 스니핑 도구를 통해 해당 패킷을 저장하고 분석하는 것이 가능

### 스위치 환경에서의 스니핑
- 스위치 재밍(Switch Jamming, MAC Address Flooding, MACOF(MAC OverFlow) 공격) : 스위치의 MAC Address Table 버퍼를 오버플로우시켜서 스위치가 허브처럼 동작하게 강제적으로 만드는 기법
- ARP 스푸핑(Spoofing) : 공격자가 특정 호스트의 MAC 주소를 자신의 MAC 주소로 위조한 ARP Reply 패킷을 만들어 희생자에게 지속적으로 전송하면 희생자의 ARP Cache에 특정 호스트의 MAC 정보가 공격자의 MAC 정보로 변경이 됨. 이를 통해 희생자에게서 특정 호스트로 나가는 패킷을 공격자가 스니핑하는 기법
- ARP 리다이렉트(Redirect) : 공격자가 자신이 라우터인 것처럼 MAC 주소를 위조하여 ARP Reply 패킷을 해당 네트워크에 broadcast함. 이를 통해 해당 로컬 네트워크의 모든 호스트와 라우터 사이의 트래픽을 스니핑하고, IP Forward 기능을 통해 사용자들이 눈치채지 못하도록 하는 기법
- ICMP 리다이렉트(Redirect) : ICMP Redirect 메시지는 호스트-라우터 또는 라우터 간에 라우팅 경로를 재설정하기 위해 전송하는 메시지. 공격자가 이를 악용하여 특정 IP 또는 IP 대역으로 나가는 패킷의 라우팅 경로를 자신의 주소로 위조한 ICMP Redirect 메시지를 생성하여 희생자에게 전송함으로써 희생자의 라우팅 테이블을 변조하여 패킷을 스니핑하는 공격기법
- 스위치의 SPAN/Port Mirroring 기능 이용 : 스위치의 SPAN/Port Mirroring 기능은 트래픽을 분석 장비로 자동 복사해주는 기술로 관리적인 목적으로 사용하지만 공격자가 물리적으로 해당 포트에 접근할 수 있다면 손쉽게 패킷을 스니핑할 수 있음

## 보안 대책

### 탐지
- ping을 이용한 방법 : 호스트에 ping을 보낼 때, 네트워크에 존재하지 않는 MAC 주소를 위장하여 보내는 것(ICMP Echo Reply를 받으면 해당 호스트가 스니핑을 하고 있는 것)
- ARP를 이용하는 방법 : ping과 유사한 방법으로 위조된 ARP Request를 보냈을 때 ARP Response가 오면 프러미스큐어스 모드로 설정되어 있는 것
- DNS 방법 : 스니핑 프로그램은 사용자의 편의를 위해 스니핑한 시스템의 IP 주소로 Inverse-DNS lookup을 수행, 원격에서 테스트 대상 네트워크로 Ping sweep을 보내고, 들어오는 Inverse-DNS lookup을 감시하여 스니퍼를 탐지
- 유인(Decoy) 방법 : 공격자는 보안관리자가 의도적으로 뿌린 가짜 계정과 패스워드를 이용해 접속을 시도하고, 이 접속을 시도하는 시스템을 탐지함으로써 스니퍼를 탐지
- ARP watch : 초기에 MAC 주소와 IP 주소의 매칭 값을 저장하고 ARP 트래픽을 모니터링하여 이를 변하게 하는 패킷을 탐지

### 암호화
- 스니핑을 수행하더라도 해당 내용이 노출되지 않도록 통신 내용을 암호화하는 방법
(SSL, PGP, S/MIME, SSH, VPN 등)

## IMG_5244 — 스푸핑(Spoofing) (textbook)

# 스푸핑(Spoofing)

## 정의
- 공격자가 자신을 공격 대상자에게 노출시키지 않고 제3의 사용자인 것처럼 MAC 주소, IP 주소 등을 속이는 작업
- 주로 사용자 간의 통신 트래픽을 중간에서 몰래 가로채 수집하거나 조작하는 중간자 공격 또는 서로 다른 많은 주소를 조작하여 대량의 트래픽을 특정 시스템에 한꺼번에 발생시키는 DoS 공격 등에 사용됨

## 종류

### ARP 스푸핑
- 정의 : ARP(Address Resolution Protocol)는 호스트의 IP 주소를 랜 카드의 하드웨어 주소(MAC 주소)로 변경하는 프로토콜. ARP 스푸핑은 호스트의 주소 매칭 테이블에 위조된 MAC(Media Access Control)주소가 설정되도록 하는 공격
- 보안 대책 : ARP 캐시 테이블을 ARP reply 메시지와 관계없이 관리자가 직접 정적(static)으로 작성하거나 배치 파일 형태로 만들어두고 리부팅 시마다 자동으로 수행되도록 설정

### IP 스푸핑
- 정의 : 공격자가 정보를 얻거나 접근을 하기 위해 신뢰관계를 가진 다른 컴퓨터의 IP 주소를 사용

[그림: 공격자(A) — ①공격 전 연결 — 서버(C), ②DoS 공격 → 공격 대상(B), ③공격자 IP 재설정 후 트러스트 관계를 이용해 서버에 접속]

#### 공격 절차
(표는 원본에서 흐리게 보여 판독 불가 — quality: poor 참고)

#### 보안 대책
- 외부에서 들어오는 패킷 중에서 출발지 IP 주소(Source IP Address)에 내부망 IP 주소를 가지고 있는 패킷을 라우터 등에서 패킷 필터링을 사용하여 막음
- 신뢰(트러스트) 관계를 이용한 IP 스푸핑에 가장 좋은 대책은 트러스트를 사용하지 않는 것

### DNS 스푸핑
- 정의 : 실제 DNS 서버보다 빨리 공격 대상에게 DNS Response 패킷을 보내, 공격 대상이 잘못된 IP 주소로 웹 접속을 하도록 유도하는 공격(시간차 공격)
- 보안 대책 : hosts 파일에 중요한 사이트의 IP 주소를 확인해 적어둠

## IMG_5245 — 세션 하이재킹(Session Hijacking) (textbook)

# 세션 하이재킹(Session Hijacking)

## 정의
- 인증 작업 등이 완료되어 정상적으로 통신이 이루어지고 있는 다른 사용자(공격 대상자)의 세션을 가로채서 별도의 인증 작업 없이 가로챈 세션으로 통신을 계속하는 행위 (적극적인 공격)

## TCP 연결 하이재킹 공격절차
- 1단계 : 공격자는 스니핑을 하여 세션을 확인하고, 적절한 시퀀스 넘버를 획득
- 2단계 : RST 패킷을 보내 서버 쪽 연결만을 끊음, 서버는 잠시 Closed 상태가 되나, 클라이언트는 그대로 Established 상태로 남음
- 3단계 : 공격자는 새로 시퀀스 넘버를 생성하여 서버로 보냄
- 4단계 : 서버는 새로운 시퀀스 넘버를 받아들이며, 다시 세션을 염
- 5단계 : 공격자는 정상적인 연결처럼 서버와 시퀀스 넘버를 교환하고, 공격자와 서버 모두 Established 상태가 됨

## 탐지 및 대응
- 비동기화 상태 탐지
- ACK Storm 탐지
- 패킷의 유실과 재전송 증가 탐지
- 기대하지 않은 접속의 리셋(Reset)

## Mentor's Know-how
- Trojan : 실행 시 특정 포트를 열어 공격자의 침입을 도와 추가적으로 정보를 자동 유출하며 자신의 존재를 숨기는 기능 등을 수행하는 공격 프로그램
- Exploit : OS에서 버그를 이용하여 루트권한 획득 또는 특정 기능을 수행하기 위한 공격 코드 및 프로그램

## IMG_5246 — 네트워크 기반 공격 정리 (textbook)

quality: poor

# 네트워크 기반 공격 정리

## 왼쪽 표: 구분/특징

| 구분 | | 특징 |
|---|---|---|
| DoS | TCP Syn Flooding | 3-way handshaking 과정에서 Half-Open 연결시도가 가능하기 때문 |
| | LAND | Source와 Destination IP 동일 |
| | Smurf | ICMP, 브로드캐스트, 세 개의 주 구성요소(공격자, 증폭네트워크, 표적) |
| | Ping of Death | ICMP 패킷 최대크기(65,535 bytes) 보다 크게 |
| | Teardrop | 단편화 중복 |
| | Bonk | 모든 순서번호 '1' |
| | Boink | 순서번호 예측 못하게 |
| | Trinoo | UDP flood 서비스 거부 |
| | TFN | UDP flood 서비스 거부 + α |
| | Stacheldraht | 철조망, 암호기능 추가 |
| | TFN2K | TFN의 발전형태, 포트 임의로 결정 |
| | Get Flooding | 접속 후 특정 웹페이지를 Get Method로 무한 실행 |
| DDoS | 봇넷 HTTP Request Flooding | 지속적으로 요청 페이지를 변경하여 요청 |
| | CC attack | Get Flooding with cache-control, 캐시서버 무력화 |
| | Slowloris(Slow HTTP Header DoS) | 쓰레기 헤더 보냄, 종료 없음 |
| | Slow HTTP POST DoS | 장시간 분할 전송 |
| | Slow HTTP Read DoS | 처리율 감소시킴(ACK만 보냄) |
| | HashDoS | 해시테이블(매개변수 처리) 충돌 |
| | 헐크도스(HulkDoS) | 가용함을 모두 사용도록, URL을 지속적으로 변경 |

## 오른쪽 표: 구분/특징

| 구분 | | | 특징 |
|---|---|---|---|
| 스캔 | | TCP Open | 열림 : SYN ⇒ SYN+ACK ⇒ ACK, 닫힘 : SYN ⇒ RST+ACK |
| | | TCP Half Open | 열림 : SYN ⇒ SYN+ACK ⇒ RST, 닫힘 : SYN ⇒ RST+ACK |
| | | UDP Scan | 열림 : UDP ⇒ 응답없음, 닫힘 : UDP ⇒ ICMP Unreachable |
| | | FIN, Null, XMAS | 열림 : FIN, Null, XMAS ⇒ 응답없음, 닫힘 : FIN, Null, XMAS ⇒ RST |
| 스니핑 | 허브 | Promiscuous | 무차별 모드, 모든 패킷 열람 |
| | 스위치 | Switch Jamming | MAC Table Overflow, Fail Open 정책 |
| | | ARP Spoofing | IP ⇒ MAC(위조대상) |
| | | ARP Redirect | 라우터까지 속임 |
| | | ICMP Redirect | 패킷 흐름을 바꿈 |
| | | SPAN 포트 미러링 | 하드웨어 장비 이용 |
| | 탐지 | ping | 정상 답변 없음, 스니핑 시 답변 있음 |
| | | ARP | 정상 답변 없음, 스니핑 시 답변 있음 |
| | | DNS | Inverse DNS Lookup |
| | | Decoy | 가짜 계정/패스워드 뿌려서 유인 |
| | | ARP Watch | 초기 MAC 주소/IP주소 매칭 값 저장 후 감시 |
| 스푸핑 | | ARP Spoofing | MAC 주소 위조 |
| | | IP Spoofing | 신뢰관계 악용, 출발지 주소가 내부 IP |
| | | DNS Spoofing | 시간차 공격, 파밍 |
| | | 이메일 Spoofing | 신뢰위장 이메일 발송, 사회공학 기법 |
| 세션 하이재킹 | | TCP Session Hijacking | Sequence Number 이용, 탐지: 비동기화, ACK Storm, 패킷 유실과 재전송 증가, Reset |
| | | HTTP Session Hijacking | 세션쿠키(Session ID) |

## IMG_5247 — IDS/IPS (textbook)

# Chapter 09 IDS/IPS

## ① IDS(Intrusion Detection System)
정의 : 네트워크에서 사용되는 자원의 무결성, 비밀성, 가용성을 저해하는 비정상적인 사용과 오용, 남용 등의 행위를 가능한 한 실시간으로 탐지하여 관리자에게 경고 메시지를 보내주고 대응 하는 시스템

IDS의 실행단계
- 데이터 수집(Raw Data Collection) 단계
- 데이터 가공 및 축약(Data Reduction and Filtering) 단계
- 침입분석 및 탐지 단계
- 보고 및 대응(Reporting and Response) 단계

## Mentor's Know-how
- 네트워크 보안 학습은 ① 네트워크 기본 지식 습득 ② 네트워크 공격 이해 ③ 네트워크 방어 체계 이해 순서로 이루어집니다.
- 네트워크 방어 체계는 방화벽, IDS/IPS, VPN을 말합니다.

## ② 탐지방법에 의한 분류

| 분류형태 | 특징 | 장점 | 단점 |
|---|---|---|---|
| 지식기반/오용 침입탐지 (Misuse Detection) | 특정 공격에 관한 분석결과를 바탕으로 패턴을 설정. 패턴(시그니처)과의 비교를 통하여 일치하는 경우 불법 침입으로 간주하는 방법 | 오탐률(False Positive)이 낮음. 전문가 시스템(추론기반, 지식베이스) 이용. 트로이목마, 백도어 공격 탐지가능 | 새로운 공격탐지를 위해 지속적인 공격패턴 갱신 필요. 패턴에 없는 새로운 공격에 대해서는 탐지 불가능 |
| 행위기반/비정상행위 침입탐지 (Anomaly Detection) | 사용자의 행동양식을 분석한 후 정상적인 행동과 비교해 이상한 행동, 급격한 변화가 발견되면 불법침입으로 탐지하는 방법. 정량적인 분석, 통계적 분석을 사용. 형태 관찰, 프로파일 생성, 프로파일 기반으로 이상여부를 확인(I/O 사용량, 로그인 횟수, 패킷량 등) | 인공지능 알고리즘 사용으로 스스로 판단하여 수작업의 패턴 업데이트 불필요. 알려지지 않은 새로운 공격탐지 가능 | 오탐률(False Positive)이 높음. 정상과 비정상 구분을 위한 임계치 설정 어려움 |

## Mentor's Know-how
- 긍정오류(false positive) : 합법적 사용자를 침입자로 판단하는 오류
- 부정오류(false negative) : 침입자를 합법적 사용자로 판단하는 오류

## IMG_5248 — IDS 데이터 수집원에 따른 분류 (textbook)

# ③ 데이터 수집원에 따른 분류

| 분류형태 | 특징 | 장점 | 단점 |
|---|---|---|---|
| 호스트 기반 (Host-based IDS) | 서버에 직접 설치되므로 네트워크 환경과 무관 | 기록되는 다양한 로그자료를 통해 정확한 침입방지 가능. 호스트에 대한 명백한 침투 탐지 가능. 트로이목마, 백도어, 내부자에 의한 공격탐지/차단 가능 | 해커에 의한 로그 자료의 변조 가능성 존재 및 DoS 공격으로 IDS 무력화 가능. 호스트 성능에 의존적이며, 리소스 사용으로 서버부하 발생 |
| 네트워크 기반 (Network-based IDS) | 네트워크 세그먼트당 하나의 감지기만 설치하면 되므로 설치 용이 | 네트워크에서 실행되어 개별 서버의 성능저하가 없음. 네트워크에서 발생하는 여러 유형의 침입을 탐지. 해커의 IDS 공격에 대한 방어가 가능하며 존재 사실도 숨길 수 있음 | 네트워크 패킷이 암호화되어 전송될 때 침입 탐지 불가능. 네트워크 트래픽이 많이 증가함에 따라 성능 문제 야기. 오탐률(False Positive)이 높음 |

## Mentor's Know-how

| 구분 | 탐지방법 | 암호패킷 탐지 | OS | 스위치환경 적용 | 특징 |
|---|---|---|---|---|---|
| H-IDS | 로그 파일 | 보다 유리 | 종속적 | 적합 | 호스트에 오버헤드발생 |
| N-IDS | NW 패킷 | 불가능 | 독립적 | 어려움 | 네트워크공격 잘 잡음 |

| 구분 | 탐지방법 | Zero-day 공격 | F(-)/F(+) | 종류 | 특징 |
|---|---|---|---|---|---|
| Misuse (오용) | 비정상 case 수집 | 불가능 | F(-)[미탐] 높음 | 전문가시스템, 시그니처 분석, 페트리넷, 상태전이분석 | 새로운 공격패턴 신속 지원해야 |
| Anomaly (비정상) | 정상 프로파일 기반 | 가능 | F(+)[오탐] 높음 | 컴퓨터 면역시스템, 통계적 방법, 신경망 모델, 인공지능, 데이터 마이닝, 마르코프 모델 | 임계치 설정 어려움, 각각의 결과를 통합하여 탐지 |

## IMG_5249 — 허니팟(Honeypot), Firewall/IDS/IPS 비교 (textbook)

# ④ 허니팟(Honeypot)

정의 : 컴퓨터 침입자를 속이는 침입탐지 기법 중 하나로, 실제로 시스템이 공격을 당하는 것처럼 보이게 하여 침입자를 추적하고 정보를 수집하는 역할 수행, 침입자를 유인하는 함정을 꿀단지에 비유한 것에서 명칭이 유래

허니팟 개념도
[그림: 인터넷 → 크래커/웜이 침입 → 허니팟 → 수집 → 분석시스템 → 대응 → 대응시스템, DMZ 내에 위치, 내부 네트워크에는 서버·사용PC가 있으며 하단에 "탐지 및 방어" 경로 표시]

## 허니팟의 요건
- 해커에게 쉽게 노출되어야 한다.
- 쉽게 해킹이 가능한 것처럼 취약해 보여야 한다.
- 시스템의 모든 구성 요소를 갖추고 있어야 한다.
- 시스템을 통과하는 모든 패킷을 감시해야 한다.
- 시스템에 접속하는 모든 사람에 대한 정보를 관리자에게 알려줘야 한다.

# ⑤ Firewall, IDS, IPS 비교

| 구분 | Firewall | IDS | IPS |
|---|---|---|---|
| 목적 | 접근통제 및 인가 | 침입 여부의 감지 | 침입 이전의 방지 |
| 특징 | 수동적 차단, 내부망 보호 | 로그, Signature 기반의 패턴 매칭 | 정책, 규칙DB 기반의 비정상행위 탐지 |
| 패킷 차단 | ○ | × | ○ |
| 패킷 내용 분석 | × | ○ | ○ |
| 오용 탐지 | × | ○ | ○ |
| 오용 차단 | × | × | ○ |
| 이상 탐지 | × | ○ | ○ |
| 이상 차단 | × | × | ○ |
| 장점 | 엄격한 접근 통제, 인가된 트래픽 허용 | 실시간 탐지, 사후분석 대응기술 | 실시간 즉각 대응, 세션 기반 탐지 가능 |
| 단점 | 내부자 공격 취약, 네트워크 병목현상 | 변형된 패턴에 대해서는 탐지 어려움 | 오탐 현상 발생 가능, 장비 고가 |

## IMG_5250 — 방화벽(Firewall) (textbook)

# Chapter 10 방화벽

## ① 침입차단시스템(방화벽, Firewall)

정의 : 화재 발생 시 불길이 더 이상 번지지 않도록 막아주는 역할을 하는 것으로 사설 네트워크를 외부로부터 보호하기 위해 공중 네트워크와 사설 네트워크 사이에 설치된 일종의 벽

특징
- 침입차단시스템은 기업의 네트워크 보안 정책을 지원하고 집행하는 장비이며, 실제로 라우터, 서버 또는 전문화된 하드웨어 장비일 수도 있는 게이트웨이 유형 중 하나
- 방화벽은 특별한 형태의 참조모니터

## 방화벽의 장·단점

| 장점 | 단점 |
|---|---|
| 취약한 서비스 보호 기능 | 제한된 서비스 제공 |
| 호스트 시스템 접근제어 기능 | 우회하는 트래픽은 제어 불가 |
| 로그와 통계자료 유지 | 악의적인 내부 사용자로부터 시스템 보호 곤란 |
| 내부 네트워크의 모든 자원에 일관된 보안정책 적용 가능 | 바이러스 및 새로운 형태의 위험에 대한 방어 곤란 |

## 방화벽의 운영 정책

| 정책 | 상세내용 | 예시 |
|---|---|---|
| Deny All 정책 | 모든 트래픽을 먼저 차단하고, 허용해야 할 트래픽만을 선별적으로 허용하는 방식 | 중요 서버의 접속이나, 외부에서 내부망으로의 접속차단 정책 |
| Permit All 정책 | 모든 트래픽을 허용하고, 특정 트래픽만을 선별적으로 차단 | 주로 내부망에서 외부로의 접속차단 정책 |

## 방화벽의 기능
- 접근제어 : 정책에 의해 허용/차단을 결정하기 위한 검사
- 로깅 및 감사 추적
- 인증(Authentication) : 네트워크 스니핑 등의 공격에 대응하는 방법
- Traffic의 암호화
- 트래픽 로그

## IMG_5251 — 침입차단시스템의 유형 분류 (textbook)

# ② 침입차단시스템의 유형 분류

## 개요
- 침입차단시스템은 크게 네트워크 계층과 전송 계층에서 수행되는 패킷 필터링 시스템과 응용 계층에서 수행되는 응용 게이트웨이 방식의 침입차단시스템으로 구분
- 패킷 필터링 시스템은 수신된 패킷의 TCP/IP 헤더 부분만을 이용하여 침입 차단 기능을 수행하는 수동적인 침입차단시스템
- 응용 게이트웨이 방식의 침입차단시스템은 수신된 패킷을 응용 계층의 서비스 단위로 프락시 기능을 이용하여 침입 차단 기능을 수행하는 능동적인 침입차단시스템

## 패킷 필터링 시스템
정의 : 패킷 필터링 침입차단시스템에서 사용되는 라우터는 일반적인 라우터에 패킷 필터링 기능을 구현한 것으로서 스크린 라우터 혹은 패킷 필터링 라우터라고 불림

장점
- 확장 가능
- 높은 성능 제공
- 응용프로그램에 독립적

단점
- 패킷에서 헤더정보 이상을 조사하지 않음
- 다른 옵션들에 비해 상대적으로 낮은 보안을 제공
- 연결 상태를 추적하지 않음

## 상태기반 검사 방화벽(stateful packet inspection firewall)
- 이스라엘의 방화벽 업체인 체크포인트사가 최초로 사용한 용어로, 좀 더 세련된 형태의 패킷 필터링 방식
- 패킷 필터링 침입차단시스템에서와 마찬가지로 동일한 패킷 정보를 검토하지만 TCP 연결에 관한 정보를 기록
- TCP 순서번호를 추적해서 순서번호를 이용한 세션하이재킹 공격을 막음
- 네트워크, 전송 계층에서 동작하며, 연결이 시작되면 패킷의 모든 계층(모든 헤더, 페이로드, 트레일러 등)을 조사

## 패킷 필터링을 위하여 사용되는 정보
- 발신지 IP 주소와 목적지 IP 주소
- 발신지 포트 번호와 목적지 포트 번호
- 트래픽의 방향(인바운드 혹은 아웃바운드)
- 프로토콜의 형태(IP, TCP, UDP, IPX 등)
- 패킷의 상태(SYN 혹은 ACK)

## Mentor's Know-how
※ NAT(Network Address Translation)
- 패킷 필터링과 상태 유지 방화벽은 NAT라 불리는 제2의 보안체제 제공
- 내부 네트워크와 외부 네트워크를 분리
- 네트워크 보안효과 향상

※ NAT의 종류
- Static : 1:1 매핑
- Dynamic : 범용주소 풀 사용
- PAT(Port Address Translation) : Well Known Port가 아닌 임시 포트로 구분

## IMG_5252 — 프락시 방화벽(Proxy) (textbook)

# 프락시 방화벽(Proxy)
- 프락시 서비스는 침입차단시스템 호스트에서 실행되는 전문화된 애플리케이션 또는 서버 프로그램으로서 배스천호스트에 설치되어 운영
- 응용프로그램 수준과 회선 수준 프락시 방화벽 비교

| 응용프로그램 수준 프락시 | 회선 수준 프락시 |
|---|---|
| 모니터 되는 각 프로토콜을 위해 서로 다른 프락시가 요구된다. | 각 프로토콜을 위해 서로 다른 프락시를 요구하지 않는다. |
| 회선 수준 프락시 방화벽보다 나은 보호를 제공한다. | 응용프로그램 수준 방화벽이 제공하는 깊은 검사 능력을 제공하지 않는다. |
| 패킷당 보다 많은 처리를 요구하기 때문에 회선 수준 프락시 방화벽보다 느리다. | |

## Mentor's Know-how
※ 배스천호스트(Bastion Host)
- 침입차단 S/W가 설치되어 내·외부 네트워크 사이에서 게이트웨이 역할을 수행하며 철저한 보안 방어기능이 구축되어 있는 컴퓨터시스템
- 배스천(bastion)이란 중세 성곽의 외부 방벽의 강화된 돌출부에서 유래된 이름

## IMG_5253 — 방화벽 구조 (textbook)

# ③ 방화벽 구조

| 구분 | 특징 | 장점 | 단점 |
|---|---|---|---|
| 스크리닝 라우터 구조 (Screening Router) | 라우터를 이용해 각 인터페이스에 들어오고 나가는 패킷을 필터링하여 내부 서버로의 접근을 가려내는 역할 | 구조가 간단하고, 장비 추가비용 소요가 없음 | 라우터에 복잡한 필터링 규칙설정이 필요하고 인증기능 수행은 불가능하며 내부구조를 숨기기 어렵고, 1개의 장애물밖에 없어 방어의 깊이가 약함. |
| 이중 네트워크 호스트 구조 (Dual-Homed Host Architecture) | 듀얼홈드는 두 개의 인터페이스를 가지는 장비를 말하며, 하나의 인터페이스는 외부 네트워크와 연결되고 다른 인터페이스는 내부 네트워크로 연결되며, 라우팅 기능이 없는 방화벽을 설치하는 형태 | 각종 기록정보를 생성하고 방화벽의 관리와 설치, 유지보수가 비교적 용이하며 내부 네트워크를 숨길 수 있음. | 사용자정보 입력이 필요하고, 베스천호스트가 손상되거나 로그인정보가 누출되면 내부 네트워크를 보호할 수 없음 |
| 스크린드 호스트 게이트웨이 구조(Screened Host Gateway) | 듀얼-홈드 게이트웨이와 스크리닝 라우터를 결합한 형태로 내부 네트워크에 놓여 있는 베스천호스트와 외부 네트워크 사이에 스크리닝 라우터를 설치하여 구성 | 2단계 방어가 가능하고, 기본 필터구조 보다 필터링 규칙이 단순하며, 방어의 깊이가 개선되어 해커의 공격에 잘 대처 가능 | 베스천호스트 침해 시 보안에 취약함. 해커나 악의의 내부자에 의해 스크린 라우터의 라우팅 테이블이 변경되면 내부 네트워크 방어가 붕가 |
| 스크린드 서브넷 구조 (Screened Subnet Architecture) | 스크리닝 라우터들 사이에 듀얼홈드 게이트웨이가 위치하는 구조로 인터넷과 내부 네트워크 사이에 DMZ(Demilitarized Zone)라는 네트워크 완충지역 역할을 하는 서브넷을 운영하는 방식 | 타 방식의 장점들을 그대로 계승하고, DMZ와 같은 보안층을 가지고 있어 매우 안전하며 모듈러하고 유연하고 높은 방어의 깊이를 가짐 | 다른 침입차단시스템 방식에 비해 설치와 관리가 어렵고 구축비용이 많이 들며, 서비스 속도가 느려짐 |

## Mentor's Know-how
① 듀얼 홈드 게이트웨이
[그림: 2계위 네트워크 카드를 지닌 호스트 컴퓨터가 LAN(내부 PC들)과 WAN(인터넷) 사이에 위치하는 구조]

② 스크린드 호스트 게이트웨이 구조
[그림: 인터넷 → 스크리닝 장비 → 방화벽 → 스크린드 호스트 → 내부 네트워크(PC, 서버들)]

③ 스크린드 서브넷 구조
[그림: 외부 라우터 → 경계 네트워크1(방어벽1) → 내부 라우터 → 경계 네트워크2(방어벽2) → 내부 네트워크, 각 구간에 컴퓨터/서버 다수 배치]

## IMG_5254 — VPN(가상 사설망) (textbook)

# Chapter 11 VPN

## ① VPN(가상 사설망, Virtual Private Network)

정의
- VPN은 인터넷과 같은 공중 네트워크를 마치 전용회선처럼 사용할 수 있게 해주는 기술 혹은 네트워크
- VPN은 공중망을 경유하여 데이터가 전송되더라도 외부인으로부터 안전하게 보호되도록 주소 및 라우터 체계의 비공개, 데이터 암호화, 사용자 인증 및 사용자 액세스 권한 제한 등의 기능을 제공

기능
- 데이터 기밀성 : 송·수신되는 데이터를 제3자가 그 내용을 파악하지 못하도록 암호화하여 전송
- 데이터 무결성 : 송·수신 도중 데이터의 내용이 변경되지 않았음을 보장하는 방법으로 암호화 및 전자서명(Digital Signature)을 이용
- 데이터 근원 인증 : 수신한 데이터가 해당 송신자에 의해서 전송된 것임을 확인할 수 있는 서비스 제공
- 접근 통제 : 인증된 사용자에게만 접근을 허용하는 기능으로 협상내용을 모르는 제3자의 접근을 통제하는 서비스를 제공

## Mentor's Know-how
- VPN 개념도
[그림: Site A(Station 100, laptop들) — R1 — Internet — R2 — Site B(Station 200, laptop들). "From 100 to 200"과 "From R1 to R2" 트래픽 흐름 표시]

- 터널링
- 송신자와 수신자 사이의 전송로에 외부로부터의 침입을 막기 위해 일종의 파이프를 구성하는 것
- 터널링되는 데이터를 페이로드(Payload)라고 부름

## IMG_5255 — 계층별 터널링 프로토콜 비교, IPSec VPN과 SSL VPN 비교 (textbook)

## 계층별 터널링 프로토콜 비교

| 구분 | 2계층 | 3계층 | MPLS |
|---|---|---|---|
| 프로토콜 | L2TP, PPTP | IPSec | MPLS |
| 구현 형태 | 클라이언트-서버 | 호스트-호스트 | 호스트-호스트 |
| 캡슐화 대상 | IP, IPX, 애플토크등 | IP | IP |
| 보안 - 인증 | 비표준, 자체지원 | IPSec | 비표준 |
| 보안 - 암호화 | 비표준, 자체지원 | IPSec | 비표준 |
| 특징 | PPP 기술 활용 | 다중 서비스 지원 | QoS 제공 기능 |

## 보안 용어

- MPLS(Multiprotocol Label Switching) : 네트워크 트래픽 속도 향상 및 관리를 위한 기술을 말한다. MPLS는 주어지는 패킷열에 대하여 특정 경로를 설정하는 것에 관여하여 소요되는 시간을 절약할 수 있다. 트래픽을 전반적으로 빠르게 움직이게 하는 것 외에도, QoS를 위한 네트워크 관리를 쉽게 해준다.
- MPLS VPN(Multiprotocol Label Switching Virtual Private Network) : 패킷 스위칭 기술인 MPLS 환경을 통해 V[?]을 구현하는 것으로 시간에 민감한 애플리케이션 운영 환경에 적합 (음성, 동영상)

## IPSec VPN과 SSL VPN 비교

| 구분 | IPSec VPN | SSL VPN |
|---|---|---|
| 접근 제어 | 애플리케이션 차원의 정교한 접근제어 미흡 | 애플리케이션 차원의 정교한 접근제어 가능 |
| 적용 계층 | TCP/IP의 3계층 | TCP/IP의 5계층 |
| 지원성 | 별도의 소프트웨어 설치 필요 | 웹 브라우저 자체 지원 |
| 암호화 | DES/3DES/AES/RC4, MD5/SHA-1(패킷 단위) | DES/3DES/AES/RC4, MD5/SHA-1(메시지 단위) |
| 적합성 | Site to Site | Site to Remote |
| 장점 | 종단간 보안 가능, 종단 부하 없음 | 접속과 관리의 편리성, Client Server 상호 인증 |

## IMG_5256 — IPSec(IP Security Protocol) (textbook)

## IPSec(IP Security Protocol)

### 정의

- IPSec은 IP 계층의 보안 프로토콜로서 호스트와 호스트 간, 호스트와 보안 게이트웨이 간, 보안 게이트웨이와 보안 게이트웨이 간의 경로를 보호하기 위한 프로토콜. 보안 게이트웨이는 기존의 라우터 혹은 침입차단시스템에 IPSec 프로토콜을 구현한 시스템

### 보안 서비스(RFC 2401)

- 접근제어(Access control)
- 비연결 무결성(Connectionless integrity) : 메시지 인증 코드(MAC)를 통해 보장
- 데이터 발신처 인증(Data origin authentication) : 메시지 인증 코드(MAC)를 통해 보장
- 재전송 패킷의 거부(Rejection of replayed packets) : 순서번호(Sequence Number)를 통해 보장
- 기밀성(Confidentiality)(암호화) : AH 프로토콜은 암호화 미지원, ESP 프로토콜만 암호화 지원
- 제한된 트래픽 흐름의 기밀성(Limited traffic flow confidentiality) : ESP 터널모드에서 제공

## IMG_5257 — IPSec의 전송 모드 vs 터널 모드 (textbook)

## IPSec의 전송 모드 vs 터널 모드

### IPSec 전송 모드

[그림: Transport layer(Transport-layer payload) → IPSec layer(IPSec-H | ... | IPSec-T, H: header, T: trailer) → Network layer(IP H | IP payload)]

### IPSec 터널 모드

[그림: Network layer(IP H | IP payload) → IPSec layer(IPSec-H | ... | IPSec-T, H: header, T: trailer) → New network layer(New header: IP H | New IP payload)]

### AH와 ESP의 패킷 형태

전송모드:
- IP 헤더 | AH 헤더 | IP 페이로드
- IP 헤더 | ESP 헤더 | IP 페이로드 | ESP 트레일러 | ESP 인증  [암호화 범위, 인증영역 표시]

터널모드:
- 새로운 IP 헤더 | AH 헤더 | IP 헤더 | IP 페이로드
- 새로운 IP 헤더 | ESP 헤더 | IP 헤더 | IP 페이로드 | ESP 트레일러 | ESP 인증  [암호화 범위, 인증영역 표시]

## Mentor's Know-how

※ 보안 연계(SA, Security Association, 보안 연관)
- AH와 ESP를 이용하여 다양한 보안 서비스를 제공하기 위하여 보안 프로토콜 각각에 대한 보안 매개변수집합(알고리즘 식별자, 모드, 키 등)을 정의하는 역할을 수행(보안 방법을 명시한 계약서)
- 보안 연계는 보안 연계 데이터베이스(SAD, Security Association Database)에 포함
- SA는 단방향이기 때문에 각각 인바운드 또는 아웃바운드 트래픽 중 하나만 담당

※ IKE(Internet Key Exchange)
- IPSec에서의 키 관리 프로토콜은 보안 정책을 협상하고 ESP, AH에서 사용하게 될 키를 관리하기 위한 프로토콜
- 내부적 및 외부적 보안 연계(SA)를 생성하기 위해 설계된 프로토콜

## IMG_5258 — 최신 네트워크 보안기술 (역추적, ESM, NAC, SIEM, SOAR, PMS) (textbook)

## Chapter 11 최신 네트워크 보안기술

### 최신 네트워크 보안기술

역추적 시스템
- 역추적(traceback)이란 해킹을 시도하는 해커의 실제 위치를 실시간으로 추적하는 기술
- TCP 연결 역추적은 TCP 연결을 기반으로 우회 공격을 시도하는 해커의 실제 위치를 실시간으로 추적하는 기법으로 호스트 기반 연결 역추적 기술과 네트워크 기반 연결 역추적 기술로 분류함

ESM(Enterprise Security Management)
- 기업과 기관의 보안 정책을 반영하고 다양한 보안 시스템을 관제·운영·관리함으로써 조직의 보안 목적을 효율적으로 실현하는 시스템
- 각종 네트워크 보안제품의 인터페이스를 표준화하여 중앙 통합 관리, 침입 종합대응, 통합 모니터링이 가능한 지능형 보안 관리 시스템

NAC(Network Access Control)의 정의
- 네트워크에 접근하는 접속 단말의 보안성을 검증하여 보안성을 강제화하고 접속을 통제할 수 있는 보안 인프라
- 사용 단말이 내부 네트워크에 접근하기 전에 보안 정책을 준수했는지 여부를 검사해 네트워크 접속을 통제하는 보안 솔루션

SIEM(Security Information Event Management)
- 수많은 IT 시스템 및 보안 시스템에서 발생하는 로그를 분석하여 이상 징후를 파악하고, 그 결과를 경영진에게 보고할 수 있도록 해주는 시스템

보안 오케스트레이션, 자동화 및 대응 시스템(SOAR, Security Orchestration, Automation and Response)
- 보안 위협에 대한 자동화된 분석과 대응 환경을 만들어 보안 인력을 효율적으로 운영하면서 분석의 정확도를 높이고 대응 시간을 단축하기 위한 솔루션, 자동화된 통합보안관제 솔루션이라고도 함

패치관리시스템(PMS, Patch Management System)
- 시스템이 관리하는 PC에 소프트웨어 업데이트 설치와 운영체제 패치 등을 유도하는 기업용 솔루션, 보안 패치와 소프트웨어 업데이트는 최상의 보안을 위한 필수사항이기 때문에, 개인에게만 맡겨두는 대신 패치관리시스템을 이용하여 중앙에서 강제로 설치하는 것

## Mentor's Know-how

최신 네트워크 보안기술은 간단한 정의형태로 많이 출제가 됩니다. 공격기술 뿐만 아니라 발전하는 최신 기술에 대한 관심을 꾸준히 가져야 합니다.
