-- 현재 Supabase 스키마 전체. 실제 변경은 supabase 마이그레이션으로 적용했고,
-- 이 파일은 레포를 읽는 사람이 한눈에 보기 위한 사본이다. 빈 DB에 그대로 붙여도 동작한다.

create table questions (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now(),
  exam        text not null default 'written' check (exam in ('written','practical')),
  subject     text not null check (subject in ('system','network','app','general','law')),
  type        text not null check (type in ('mc','ox','short')),  -- short는 실기용. 아직 안 씀
  body        text not null,
  stimulus    text,          -- 문제 위 박스 지문. 기출 PDF에서는 이미지라 사람이 옮긴다
  choices     jsonb,         -- mc일 때만 ["보기1",...]. ox는 null
  answer      text not null, -- mc: 0부터 세는 보기 인덱스("2") / ox: "O"|"X"
  explanation text,
  note        text,          -- 확정답안 정정 안내 등 문제와 무관한 주석
  source      text,          -- 기출 회차. 예: '2023-03-11'
  bookmarked  boolean not null default false
);

-- 같은 문제를 두 번 넣지 않는다. JSON을 다시 밀어넣어도 안전하다.
-- body만으로는 부족하다 -- 48번/59번처럼 본문이 "다음 문장에서 설명하는 것은?"으로
-- 같고 실제 내용이 stimulus에만 있는 문항이 있다.
create unique index questions_uniq
  on questions (exam, subject, md5(body || coalesce(stimulus, '')));

-- 풀이 기록. 정답률, 오답노트, 과목별 대시보드, 모의고사 결과가 전부 여기서 파생된다.
create table attempts (
  id          bigint generated always as identity primary key,
  question_id bigint not null references questions(id) on delete cascade,
  answered_at timestamptz not null default now(),
  correct     boolean not null,
  chosen      text,          -- 고른 답. mc는 인덱스, ox는 O/X
  mode        text not null check (mode in ('practice','mock100','mock_short','ox','review')),
  session_id  uuid,          -- 모의고사 결과 재계산용
  note        text           -- "왜 틀렸는지" 오답 메모
);
create index attempts_question_id_idx on attempts (question_id);

alter table questions enable row level security;
alter table attempts  enable row level security;

-- ponytail: 로그인이 없으므로 anon에게 전권. URL을 아는 사람은 수정·삭제 가능(의도된 선택).
-- 잠글 때: 이 policy를 지우고 Supabase Auth + "auth.uid() is not null" 조건으로 교체.
create policy anon_all on questions for all to anon using (true) with check (true);
create policy anon_all on attempts  for all to anon using (true) with check (true);
