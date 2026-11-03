---
name: explainer-motion
description: 정보보안기사 실기 궁금증 영상(사물궁이 스타일)을 Claude Motion으로 만들거나 고칠 때 사용. 나레이션 대본(narration/*.txt)을 장면으로 나누고, lib/의 캐릭터·표·흐름도 부품으로 장면을 짜고, ego-browser 캡처로 검수한다. "영상 만들어", "모션", "N편 영상", "장면 고쳐" 등에 트리거.
---

# 실기 궁금증 영상 (Claude Motion)

말투·화면 규칙은 `narration/STYLE.md`가 원본이다. 이 스킬은 그것을 Motion 영상으로 옮기는 방법이다.
샘플: https://claude.ai/artifact/S9Xd3cyGJHKPYrPKrU8fnQ (1편 앞부분 60초)

## 순서

1. **장면 나누기.** 대본을 4~10초 장면으로 자른다. 한 장면에 개념 하나, 화면 글자는 제목 한 줄 + 자막 한 줄 + 라벨 몇 개까지.
2. **부품 고르기.** 장면마다 아래 표에서 하나를 주인공으로 정한다. 두 개 이상 겹치지 않는다.
3. **만들기.** Motion 타입으로 새 아티팩트를 만들고 `lib/base.css` → `modules/base.css`, `lib/shared.js` → `modules/shared.js`로 넣는다. 장면은 `lib/example-scene.js` 모양을 따른다. 한국어 영상이라 `fonts`는 비운다.
4. **검수.** ego-browser로 아티팩트를 열고(claude.ai 로그인 필요) 타임라인 칩의 75% 지점을 눌러 장면별로 캡처한다. 캡처 전에 마우스를 타임라인 밖으로 옮겨 미리보기 썸네일을 피한다. 잘림, 겹침, 빈 화면을 보고 고친 뒤 다시 캡처한다.

## 부품 (`lib/shared.js`의 `window.UI`)

| 부품 | 쓰는 곳 | 호출 |
|---|---|---|
| `guide` + `pose` | 안내 캐릭터(흰 머리, 이어셋). 질문·놀람·손짓 | `UI.guide(kit,x,y,s)` → render에서 `UI.pose(g,t,{dx,dy,tilt,look,armL,armR,wow})` |
| `table` | 비교·정리(공격 종류, 포트, 로그 파일) | `UI.table(kit,{x,y,w,head,rows,widths,hl:[r,c]})` → `tb.render(t,t0)` |
| `flow` | 순서·경로(공격 흐름, 핸드셰이크), 한 단계 끊기 | `UI.flow(kit,{x,y,nodes,step})` → `f.render(t,t0,{i,at})` |
| `frame` | 모든 장면 필수. 들어올 때 떠오르고 나갈 때 사라짐 | render 첫 줄 `UI.frame(this.root,t,장면길이)` |
| CSS `.bubble` `.chip` `.cap` `.line.hl` | 말풍선, 라벨, 자막, 노란 제목 | base.css |

새 부품이 필요하면 `shared.js`에 추가하고 이 표에 한 줄 적는다. 부품은 `{ el, render(t, t0) }`를 돌려주고 render는 t만으로 상태를 정한다.

## 모션 규칙 (video-motion-graphics 스킬 요약)

- 등장은 ease-out 0.25~0.4초, 전환은 ease-in-out. 일정한 속도(linear) 금지.
- 같이 나오는 요소는 0.1~0.35초씩 순차 등장. 한꺼번에 띄우지 않는다.
- 중요 요소만 살짝 넘쳤다 돌아오기(`eob`). 나머지는 `eo`.
- **계속 흔들리는 동작 금지.** 사인파로 꼬리표·카드·말풍선을 출렁이게 하면 조잡해 보인다. 캐릭터 숨쉬기·눈 깜빡임만 허용.
- 핵심 정보가 다 나온 뒤 2초 이상 멈춰 읽을 시간을 준다.

## 자주 난 실수

- 움직이는 라벨이 화면 오른쪽 밖으로 잘림 → 기준점을 가운데로(`translateX(-50%)`).
- 캐릭터와 말풍선·파일이 겹침 → 캐릭터 자리(x 1500 이후)를 비워 두고 배치.
- 밑줄이 아랫줄 글자를 가로지름 → 아랫줄에 `margin-top` 36px.
- 내용 오류: 이미지 우회 예시의 매직 바이트는 `GIF89a`(PDF 아님).
