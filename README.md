# 정보보안기사 실기 문제집

정보보안기사 **실기** 문제집. 교재 기출·모의고사 문항을 유형별(단답형·서술형·작업형)로 풀고, 정답을 본 뒤 맞음/틀림을 직접 고르는 자가 채점 방식이다. React + Vite + Supabase, GitHub Pages 배포.

```bash
npm run dev     # 개발 서버
npm run check   # 문제 JSON 무결성 검사 (문제 추가 후 필수)
npm run build   # tsc + vite build
```

## 구조

| 무엇 | 어디 |
|---|---|
| 문제 원본 | `questions/practical/*.json` — 빌드에 번들된다. DB에 없다 |
| 교재 추출 도구 | `scripts/yes24/` — YES24 뷰어 접근성 텍스트 → 문항 JSON. 산출물(`raw/`·`frames/` 등)은 gitignore |
| 풀이 기록 | Supabase `attempts` (`schema.sql`). `correct`는 자가 채점 결과, `chosen`은 내가 쓴 답안, `note`는 오답 메모 |
| 문제당 표시 | Supabase `flags` — 북마크(`mark`), 관심 없음(`hide`) |
| 화면 | `src/App.tsx`(홈) `Setup`(유형 선택) `Practice`(풀이·자가 채점) `History`(내 기록) |
| 필기 자료 | `archive/written/` — 합격 후 보관. 번들·`check` 대상이 아니다 |

집계(정답률·오답노트)는 `attempts` 전량을 클라이언트에서 계산한다. 뷰도 RPC도 없다.

## 규칙

- `key` — `igijeok-2026:mock:004`, `igijeok-2026:2020-2:10`. `attempts.question_key`가 이걸 가리킨다.
  필기 때의 옛 기록은 DB에 남지만 `byKey`에 없어 집계에서 자동으로 무시된다
- `type` — `short`·`essay`·`task` 세 가지. `kind`는 교재 원래 분류이고 화면은 `type`을 쓴다
- `check` — `ok`/`minor`. 책과 대조하기 전의 자동 판정이다. `broken`은 등록하지 않는다
- 관심 없음은 출제 후보에서만 빼고 기록은 그대로 둔다. 출제/목록 지점은 `visible(qs, hidden)`을 거친다

## 아직 없는 것

모의(일괄 채점) 화면, 이미지·표 문제, 로그인(anon 전권), 실기 시험일 D-day.
