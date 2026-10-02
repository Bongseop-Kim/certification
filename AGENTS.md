# 문제 데이터 하네스

`questions/practical/*.json`은 직접 고치지 않는다. 원본은 `scripts/ebook/`이다.
`scripts/ebook/practical-2026/`의 추출물(`raw/`, `frames/`, `questions.json`, `exams.json`, `verdicts.json`, `usable.json`)을
`python3 scripts/ebook/export.py <bookdir> questions/practical/practical-2026.json`이 내보낸다. 추출물은 gitignore 대상이다.

- 수량을 먼저 정하지 않는다. 각 문항을 독립적으로 검토해 문제 본문과 정답이 온전한 것만 등록한다.
- 본문·정답에 글자 없는 불릿 줄(`•`만 있는 줄)이 있으면 원문에서 빠진 것이다. 추측해 채우지 않는다. 책에서 확인한 뒤 추출물에 반영한다.
- `check`는 `ok`/`minor`만 허용한다(책과 대조하기 전의 자동 판정). `broken`은 등록하지 않는다.
- 채점은 자가 채점(`grading: "self"`)이다. 서술·작업형을 문자열로 비교하지 않는다.
- 완료 조건은 수량이 아니라 `npm run check` 통과다. 사이트 코드를 바꿨으면 `npm run build`와 `npm run lint`도 돌린다.
- 교재 원문(`raw/`, `frames/` 등)은 커밋하지 않는다. 사이트에 올라가는 것은 검수한 문항 JSON뿐이다.

필기 자료(문제·정리 시트·노트 변환 도구)는 `archive/written/`에 보관했다. 검사·빌드 대상이 아니다.
