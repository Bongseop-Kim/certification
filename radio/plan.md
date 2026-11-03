# 실기 라디오 1단계 20편

출제 분포(2024~2026 복원 124문항)와 반복 소재 기준으로 고른 핵심 20편이다. 편당 10분, 용어 7~10개.

| 편 | 사건 | 다룰 용어 |
|---|---|---|
| 1 | 웹셸 업로드 사건 (완료: 01-webshell.txt) | 파일 업로드 우회, 웹셸, access_log·error_log, 리버스 셸, SUID·SGID·Sticky, wtmp, pacct |
| 2 | 쇼핑몰 마비 사건 (완료: 02-ddos.txt) | SYN Flooding·SYN Cookie, Smurf, Land, Teardrop, Ping of Death, NTP 증폭·monlist, Memcached·SSDP, 블랙홀 라우팅, Ingress·Egress 필터링 |
| 3 | 트래픽은 적은데 서버가 죽는 사건 (완료: 03-l7dos.txt) | HTTP GET Flooding, CC Attack, Slowloris, Slow HTTP POST, Slow HTTP Read, LimitRequestBody, Timeout |
| 4 | 로그인 페이지 사건 (완료: 04-sqli.txt) | SQL Injection(Union, Blind), Prepared Statement, 에러 메시지 노출, 무차별 대입, 크리덴셜 스터핑, 패스워드 스프레이, 계정 잠금 |
| 5 | 게시판 댓글 사건 (완료: 05-xss-csrf.txt) | Reflected·Stored·DOM XSS, HttpOnly, HTML 엔티티, CSP, CSRF 토큰, 재인증, SameSite, 세션 vs 쿠키 |
| 6 | 내부 서버를 부른 이미지 주소 사건 (완료: 06-ssrf.txt) | SSRF, IMDSv2, OS Command Injection, 경로 조작, 파일 다운로드, LFI·RFI |
| 7 | 아파치 점검의 날 (완료: 07-apache.txt) | 디렉터리 리스팅(Indexes), ServerTokens·ServerSignature, OPTIONS·TRACE, .htaccess(AuthName, AuthUserFile, Require), php.ini, robots.txt, 관리자 페이지 노출 |
| 8 | 새벽 3시 침입 사건 (완료: 08-linux-logs.txt) | utmp·wtmp·btmp·lastlog·sulog·loginlog·pacct, who·last·lastb·lastcomm, secure·messages, syslog facility(authpriv), 원격 로그 서버 |
| 9 | 계정 점검의 날 (완료: 09-accounts.txt) | passwd 7필드(x), shadow `$id$salt$hash`, login.defs, PAM 4유형, pam_faillock, securetty, nologin, TMOUT |
| 10 | 권한 점검의 날 (완료: 10-permissions.txt) | 644·600·400, umask 022, world-writable(`-perm -2`), .rhosts·hosts.equiv, xinetd disable, hosts.allow·deny, cron 권한 |
| 11 | 윈도우 서버 점검의 날 (완료: 11-windows.txt) | net share, 기본 공유(C$·ADMIN$·IPC$), AutoShareServer, net session /delete, 감사 정책, 기본 그룹(Backup Operators 등), SAM·LSA, NetBIOS 해제, DDE, HTTPERR·DHCP 로그 |
| 12 | 포트 스캔 경보 사건 (완료: 12-scan-snort.txt) | TCP Connect·SYN 스캔, FIN·NULL·XMAS 스캔 응답, Decoy 스캔, nmap 옵션, hping3, Snort 룰 구조, content·offset·depth·threshold, 오탐·미탐 |
| 13 | 방화벽 정책 정리의 날 (완료: 13-firewall.txt) | iptables(체인, -A·-p·--dport·-j), ICMP 차단, 라우터 Standard·Extended ACL 해석, 방화벽 유형, DMZ |
| 14 | 같은 MAC 주소 두 개 사건 (완료: 14-arp-spoofing.txt) | ARP 스푸핑·arp -s, 포트 미러링, 무차별 모드, 스위치 재밍, 세션 하이재킹, 중간자 공격, SSL 피닝 |
| 15 | 가짜 은행 사이트 사건 (완료: 15-dns.txt) | 재귀·권한 DNS, 조회 순서(hosts → 캐시 → 서버), UDP·TCP 53, TTL, 캐시 포이즈닝, Zone Transfer·allow-transfer, named.conf·resolv.conf, recursion no |
| 16 | 스팸 발송 서버 사건 (완료: 16-mail-ftp.txt) | SMTP·POP3·IMAP, Sendmail access(RELAY·OK)·makemap, SPF·DKIM·DMARC, FTP Active·Passive, Anonymous FTP, ftpusers, TFTP |
| 17 | 관제센터의 하루 (완료: 17-soc.txt) | ESM vs SIEM, SOAR, EDR, DLP, NAC, 샌드박스, 관제 3요소, 로그 분석 단계, Tripwire·Nessus·YARA, 사이버 킬 체인 |
| 18 | 지사 연결 사건 (완료: 18-ipsec-tls.txt) | IPsec AH·ESP, Sequence Number, 전송·터널 모드, IKE, SSL/TLS 대칭·비대칭 사용 단계, Heartbleed, POODLE, WEP·WPA·WPA2 |
| 19 | 위험 관리 회의 (완료: 19-risk.txt) | 자산·위협·취약성, 기준선·상세·복합 접근법, 델파이·시나리오·순위 결정법, ALE = SLE × ARO, 수용·감소·회피·전가, DoA, BCP·BIA·RTO·RPO, 미러·핫·웜·콜드 사이트 |
| 20 | 고객 정보 유출 사건 (완료: 20-privacy.txt) | 개인정보처리자·취급자, 고유 식별 정보 4종, 내부 관리 계획, 접근 권한 기록 3년, 접속 기록 1년·2년·점검 주기(2025-10-31 개정으로 월 1회 → 내부 관리 계획), 다운로드·파기 취급자, 제3자 제공 5항목, CCTV 제25조, 가명 처리, 데이터 마스킹 |

2단계로 미룬 것: Kerberos·OAuth·JWT 등 인증, 메모리 공격(버퍼 오버플로우, 포맷 스트링), 암호 알고리즘·블록 모드, 접근 통제 모델, 시큐어 코딩 7유형, 클라우드, 포렌식, ISMS-P, CC 인증.

## 편별 길이 목표 (2026-11-03)

주제 분량에 맞춰 5~30분으로 잡았다. 평균 약 10.7분이다. 음절은 1분에 400음절로 어림한 값이고, ±10%까지 허용한다.

| 편 | 분 | 음절 | | 편 | 분 | 음절 |
|---|---|---|---|---|---|---|
| 1 웹셸 | 11 | 4,400 | | 11 윈도우 | 13 | 5,200 |
| 2 디도스 | 11 | 4,400 | | 12 스캔·스노트 | 13 | 5,200 |
| 3 L7 디도스 | 6 | 2,400 | | 13 방화벽 | 11 | 4,400 |
| 4 SQL 인젝션 | 10 | 4,000 | | 14 ARP 스푸핑 | 8 | 3,200 |
| 5 XSS·CSRF | 12 | 4,800 | | 15 DNS | 11 | 4,400 |
| 6 SSRF | 8 | 3,200 | | 16 메일·FTP | 12 | 4,800 |
| 7 아파치 | 10 | 4,000 | | 17 관제 | 10 | 4,000 |
| 8 리눅스 로그 | 11 | 4,400 | | 18 IPsec·TLS | 12 | 4,800 |
| 9 계정 | 11 | 4,400 | | 19 위험 관리 | 12 | 4,800 |
| 10 권한 | 8 | 3,200 | | 20 개인정보 | 13 | 5,200 |
