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
| 암기 카드 | `questions/memo/*.json` — 전부 `short`. 출제 풀(`QUESTIONS`)에 섞지 않아 모의고사에 안 나온다 |
| 풀이 기록 | Supabase `attempts` (`schema.sql`) |
| 문제당 표시 | Supabase `flags` — 북마크(`mark`), 관심 없음(`hide`) |
| 기출 파서 | `scripts/parse_exam.py` (PDF → JSON), `scripts/stimulus/*.json` (이미지 지문 필사) |
| 화면 | `src/App.tsx`(홈) `Practice` `Setup` `Exam` `Result` `Ox` `Short` `Memo` `History` |

집계(정답률·오답노트·합격 판정)는 `attempts` 전량을 클라이언트에서 계산한다. 뷰도 RPC도 없다.

## 규칙

- `answer` — `mc`는 0부터 세는 보기 인덱스 문자열, `ox`는 `"O"`/`"X"`
- `key` — `'2023-03-11#82'` (회차#번호). `attempts.question_key`가 이걸 가리킨다
- 해설(`explanation`)은 쓰지 않는다. 오답일 때 남기는 한 줄 메모(`attempts.note`)가 그 역할을 한다
- 합격 판정: 과목당 40% 이상 **그리고** 평균 60% 이상 · 100문항 150분
- 관심 없음은 출제 후보에서만 빼고 기록은 그대로 둔다. 출제/목록 지점은 `visible(qs, hidden)`을 거친다
- 암기 카드는 4지선다로 만들지 않는다. 보기가 있으면 소거법으로 맞아 회상 훈련이 안 된다 (`npm run check`가 막는다)
- 오늘 볼 카드는 `memoDue()`가 `attempts`에서 파생한다. 연속 정답 수 = Leitner 박스(0·1·3·7·21일), 하루 30장
- `Memo`(암기표)는 같은 카드를 표로 되돌린 화면이다. 별도 정리글을 만들지 않는다 — 원본이 둘로 갈린다.
  카드를 파일 안에 표 순서대로 써두면 `no` 순 나열만으로 표가 복원된다

## 아직 없는 것

실기 모드, 주관식, 이미지 문제, 기기 간 모의고사 이어풀기(지금은 `localStorage`), 로그인(anon 전권).
