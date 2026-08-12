# 보안기사 문제집

정보보안기사 **필기** 문제집. 5과목 × 4가지 풀이 모드. React + Vite + Supabase, GitHub Pages 배포.

```bash
npm run dev     # 개발 서버
npm run check   # 문제 JSON 무결성 검사 (회차 추가 후 필수)
npm run build   # tsc + vite build
```

## 구조

| 무엇 | 어디 |
|---|---|
| 문제 원본 | `questions/written/*.json` — 빌드에 번들된다. DB에 없다 |
| 풀이 기록 | Supabase `attempts` 한 테이블 (`schema.sql`) |
| 기출 파서 | `scripts/parse_exam.py` (PDF → JSON), `scripts/stimulus/*.json` (이미지 지문 필사) |
| 화면 | `src/App.tsx`(홈) `Practice` `Setup` `Exam` `Result` `Ox` `History` |

집계(정답률·오답노트·합격 판정)는 `attempts` 전량을 클라이언트에서 계산한다. 뷰도 RPC도 없다.

## 규칙

- `answer` — `mc`는 0부터 세는 보기 인덱스 문자열, `ox`는 `"O"`/`"X"`
- `key` — `'2023-03-11#82'` (회차#번호). `attempts.question_key`가 이걸 가리킨다
- 해설(`explanation`)은 쓰지 않는다. 오답일 때 남기는 한 줄 메모(`attempts.note`)가 그 역할을 한다
- 합격 판정: 과목당 40% 이상 **그리고** 평균 60% 이상 · 100문항 150분

## 아직 없는 것

실기 모드, 주관식, 이미지 문제, 기기 간 모의고사 이어풀기(지금은 `localStorage`), 북마크 서버 저장(지금은 `localStorage`), 로그인(anon 전권).
