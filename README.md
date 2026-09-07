# 보안기사 문제집

정보보안기사 **필기** 문제집. 5과목 × 2유형(객관식·단답) × 2형태(연습·모의). React + Vite + Supabase, GitHub Pages 배포.

```bash
npm run dev     # 개발 서버
npm run check   # 문제 JSON 무결성 검사 (회차 추가 후 필수)
npm run build   # tsc + vite build
```

## 구조

| 무엇 | 어디 |
|---|---|
| 문제 원본 | `questions/written/*.json` — 빌드에 번들된다. DB에 없다. 단답(`short-*.json`)은 `scripts/short/cards_*.py`에서 생성 |
| 풀이 기록 | Supabase `attempts` (`schema.sql`). `mode`는 세션 형태(practice/mock_short/short/review)고 문제 유형은 `question_key`로 안다 |
| 문제당 표시 | Supabase `flags` — 북마크(`mark`), 관심 없음(`hide`) |
| 기출 파서 | `scripts/parse_exam.py` (PDF → JSON), `scripts/stimulus/*.json` (이미지 지문 필사) |
| 노트 필사 | `scripts/notes/<subject>.md` — `image/` 사진의 텍스트 필사. `2026-notes-*` 문항의 근거 |
| 화면 | `src/App.tsx`(홈) `Setup`(과목·문항 수) `Practice`(객관식 연습) `Short`(단답 연습) `Exam`(모의, 두 유형 공용) `Result` `History` |

집계(정답률·오답노트)는 `attempts` 전량을 클라이언트에서 계산한다. 뷰도 RPC도 없다.

## 규칙

- `answer` — `mc`는 0부터 세는 보기 인덱스 문자열, `short`는 정답 문자열
- `key` — `'2023-03-11#82'` (회차#번호). `attempts.question_key`가 이걸 가리킨다.
  삭제된 문제·모드의 옛 기록은 DB에 남지만 집계에서 자동으로 무시된다
- 해설(`explanation`)은 쓰지 않는다. 오답일 때 남기는 한 줄 메모(`attempts.note`)가 그 역할을 한다
- 관심 없음은 출제 후보에서만 빼고 기록은 그대로 둔다. 출제/목록 지점은 `visible(qs, hidden)`을 거친다

## 아직 없는 것

실기 모드, 이미지 문제, 로그인(anon 전권).
