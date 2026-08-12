-- Supabase SQL Editor에 붙여넣고 실행하세요.

create table questions (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now(),
  type        text not null check (type in ('mc','ox','short')),
  category    text,          -- 자격증/과목명. 풀기 화면 필터용
  body        text not null,
  choices     jsonb,         -- mc일 때만 ["보기1",...]. ox/short는 null
  answer      text not null, -- mc: 정답 인덱스("2") / ox: "O"|"X" / short: 정답 문자열
  explanation text
);

alter table questions enable row level security;

-- ponytail: 로그인이 없으므로 anon에게 전권. URL을 아는 사람은 수정·삭제 가능(의도된 선택).
-- 잠글 때: 이 policy를 지우고 Supabase Auth + "auth.uid() is not null" 조건으로 교체.
create policy anon_all on questions for all to anon using (true) with check (true);
