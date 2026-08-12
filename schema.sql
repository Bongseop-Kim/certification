-- Supabase 스키마 전체. 테이블이 하나뿐이다.
--
-- 문제 원본은 DB에 없다. questions/written/*.json 이 원본이고 정적 빌드에 번들된다.
-- 정적 호스팅(GitHub Pages)이라 회차를 추가하면 어차피 재빌드·재배포하므로,
-- DB에 사본을 두면 원본이 둘로 갈리고 push 단계만 하나 늘어난다.
-- 서버가 실제로 필요한 것은 집·회사·폰이 공유해야 하는 풀이 기록뿐이다.

create table attempts (
  id           bigint generated always as identity primary key,
  question_key text not null,  -- '2023-03-11#82' (회차#번호). JSON의 key 필드와 같다
  answered_at  timestamptz not null default now(),
  correct      boolean not null,
  chosen       text,          -- 고른 답. mc는 보기 인덱스, ox는 O/X
  mode         text not null check (mode in ('practice','mock100','mock_short','ox','review')),
  session_id   uuid,          -- 모의고사 결과 재계산용
  note         text           -- "왜 틀렸는지" 오답 메모
);
create index attempts_question_key_idx on attempts (question_key);

alter table attempts enable row level security;

-- ponytail: 로그인이 없으므로 anon에게 전권. URL을 아는 사람은 기록을 지울 수 있다(의도된 선택).
-- 잠글 때: 이 policy를 지우고 Supabase Auth + "auth.uid() is not null" 조건으로 교체.
create policy anon_all on attempts for all to anon using (true) with check (true);

-- 정답률, 오답노트, 과목별 대시보드, 모의고사 결과가 전부 이 테이블에서 파생된다.
-- 집계는 클라이언트에서 한다(뷰도 RPC도 만들지 않는다).
-- ponytail: attempts 전량 로드. 수만 행 넘어 느려지면 answered_at 기준 .range()
