# 필수 암기 5표

> **반드시 외워야 하는 것만** 모았다. 설명·함정은 핵심 암기 정리에서 보고, 여기서는 표만 백지 복원한다.

## 대칭키 알고리즘 스펙표

| 알고리즘 | 블록 크기 | 키 크기 | 라운드 | 구조 | 비고 |
|---|---|---|---|---|---|
| **DES** | 64 | **56** (64 중 8은 패리티) | 16 | Feistel | 키 길이 취약 |
| **3DES** | 64 | 112 / 168 | 48 (16×3) | Feistel | EDE 방식 |
| **SEED** | 128 | 128 (SEED-128) | 16 | Feistel | 국내 표준(KISA) |
| **AES (Rijndael)** | 128 | 128 / 192 / 256 | **10 / 12 / 14** | **SPN** | 미국 표준 |
| **ARIA** | 128 | 128 / 192 / 256 | **12 / 14 / 16** | Involutional SPN | 국내 표준 |

## 블록 암호 운영 모드 5

| 모드 | 정식 명칭 | IV 필요 | 패딩 필요 | 암호화 병렬 | 복호화 병렬 | 오류 전파 | 성질 |
|---|---|---|---|---|---|---|---|
| **ECB** | Electronic CodeBook | **불필요** | 필요 | O | O | 해당 블록만 | 동일 평문 → **동일 암호문** (패턴 노출, 가장 취약) |
| **CBC** | Cipher Block Chaining | 필요 | 필요 | **X** (순차) | O | **해당 + 다음 블록** | 가장 널리 사용, 이전 암호문 XOR |
| **CFB** | Cipher FeedBack | 필요 | **불필요** | X | O | 해당 + 이후 블록 | 블록 암호를 **스트림처럼** 사용 |
| **OFB** | Output FeedBack | 필요 | **불필요** | X | X | **해당 비트만** | 키스트림 사전 생성 가능, 오류 전파 없음 |
| **CTR** | Counter | 필요(Nonce+카운터) | **불필요** | **O** | **O** | 해당 비트만 | 완전 병렬, 랜덤 액세스 가능 |

### 수식 (S = 키스트림)

```
ECB: C = E(K, P)
CBC: C = E(K, P XOR 이전 C)
CFB: C = P XOR E(K, 이전 C)
OFB: S = E(K, 이전 S)        C = P XOR S
CTR: S = E(K, Counter)      C = P XOR S
```

## 해시함수 스펙표

| 알고리즘 | 출력 크기 | 블록 크기 | 라운드 | 구조 | 안전성 |
|---|---|---|---|---|---|
| **MD5** | **128** | 512 | 64 (4×16) | Merkle-Damgård | 충돌 발견, 사용 금지 |
| **SHA-1** | **160** | 512 | 80 (4×20) | Merkle-Damgård | 충돌 발견, 폐기 권고 |
| **HAS-160** | 160 | 512 | 80 | Merkle-Damgård | 국내 표준(KCDSA용) |
| **SHA-224 / SHA-256** | 224 / 256 | **512** | 64 | Merkle-Damgård | 현행 권고 |
| **SHA-384 / SHA-512** | 384 / 512 | **1024** | 80 | Merkle-Damgård | 현행 권고 |
| **SHA-3 (Keccak)** | 224/256/384/512 | 가변(rate) | 24 | **스펀지(Sponge)** | 최신 표준 |
| RIPEMD-160 | 160 | 512 | 80 | Merkle-Damgård | |

## HTTP 상태 코드

| 코드 | 의미 | 암기 포인트 |
|---|---|---|
| **200** | OK | 정상 |
| **301** | Moved Permanently | 영구 이동 |
| **302** | Found | 임시 이동 |
| **400** | Bad Request | 잘못된 요청 |
| **401** | Unauthorized | 인증 필요/실패 |
| **403** | Forbidden | 권한 없음 |
| **404** | Not Found | 자원 없음 |
| **500** | Internal Server Error | 서버 내부 오류 |
| **503** | Service Unavailable | 서비스 일시 불가 |

## 잘 알려진 포트

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
