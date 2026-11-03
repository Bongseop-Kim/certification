# 로컬 영상 제작: HyperFrames 기반 (video/)

## Context

Claude Motion 아티팩트는 한 편 300초·24장면 한도, 회사 계정 로그인, colorfigures 장면의 실시간 버벅임, TTS를 따로 합쳐야 하는 문제가 있었다. 사용자와 상의해 HyperFrames(HeyGen, Apache-2.0)로 로컬에서 미리보기·렌더하기로 했다. 장면 코드(`kit.scene` + `window.UI`)는 HyperFrames의 `hf-seek` 이벤트로 그대로 돌린다.

## 시험 결과 (2026-11-03 완료)

- `video/`에 HyperFrames 프로젝트를 만들고 colorfigures 서버 장면(12초)을 옮겼다.
- `hyperframes check` 통과(lint·runtime·layout·contrast). 경고 1개: 첫 프레임이 배경뿐(장면 페이드 인 때문).
- `hyperframes render`: 12초 30fps를 18초에 렌더. 11분 편이면 약 17분 예상.
- MP4에 Pretendard 글꼴, 손그림 질감 필터, 잉크 선이 그대로 나온다.
- 사용 통계는 `HYPERFRAMES_NO_TELEMETRY=1`로 끈다(package.json 스크립트에 넣음).

## 구조

```
video/
  index.html        편 하나 = 페이지 하나. 장면 목록(id, dur) → window.play(), 빈 GSAP 타임라인으로 길이만 등록
  package.json      dev/check/snapshot/render (hyperframes@0.9.7 고정, 통계 끔)
  lib/kit.js        Motion kit 대체: seg, lerp, eo/ei/eio/eob, h, esc, TextFx.fadeFromRight, typist, scene, play
  lib/shared.js     UI 부품(guide, table, flow, subs, code, term, compare, list, auto, frame)
  lib/base.css, lib/gsap.min.js, lib/fonts/PretendardVariable.woff2 (+ OFL 라이선스)
  figures/          colorfigures 엔진(core.js, 페이지 UI 부분 제거) + 사물별 그림 + export.js(메모 캐시)
  scenes/           장면 모듈(ES module)
  out/, .hyperframes/   gitignore
```

## 남은 순서

1. **편 구조 정리**: 편마다 장면 목록 파일(`ep01.js`)을 두고 index.html은 편 번호 하나만 바꾸게 한다. 첫 장면은 프레임 0부터 보이게(UI.frame의 페이드 인을 첫 장면만 생략).
2. **1편 1부 이식**: Motion 아티팩트(CKNC5sA6usTi8aNnJoLnD1)의 장면 16개를 `ArtifactData list`로 받아 `scenes/ep01/`로 옮긴다. `kit.exec`, `this.k` 등 차이만 손본다. snapshot 컨택트 시트로 검수하고 "잡아 줄 것" 정리.
3. **rough.js 적용**: 흐름도·표·밑줄을 손그림 선으로. 라이선스 MIT, `lib/`에 고정 파일로.
4. **사물 교체**: 1부의 손그림 노트북·서버를 colorfigures 사물로. 서버는 `figures/server-fig.js` 재사용, 노트북은 새로.
5. **2·3부(문단 17~46)** 장면 작성 → 1편 전체 11분 한 파일로 렌더.
6. **TTS 연동**(API 키 생기면): `@google/genai`로 문단별 음성 → ffprobe로 길이 → 장면 dur 갱신 → `<audio data-start>`로 합쳐 렌더.
7. 스킬 `explainer-motion` 갱신: Motion 대신 video/ 기준으로 작업 순서·검수 방법(snapshot 컨택트 시트) 적기. 스킬의 lib/는 video/lib를 가리키게.

## 검증

- `cd video && npm run check` 통과(오류 0).
- `npm run snapshot -- --at ...` 컨택트 시트를 눈으로 확인.
- `npm run render -- -o out/ep01.mp4` 후 ffprobe로 길이·해상도, ffmpeg로 프레임 몇 장 뽑아 확인.
- 저장소 루트 `npm run lint` 종료 코드 0(경고는 colorfigures 엔진의 전역 함수들), `npm run check` 통과.
