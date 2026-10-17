-- شغّل الملف ده مرة واحدة في Supabase: SQL Editor > New query > Run
create table public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  student_id text not null,
  student_name text,
  class_name text,
  kind text not null,          -- login | open | start | answer | finish
  subject text,
  chapter text,
  data jsonb not null default '{}'
);
create index on public.events (student_id);
create index on public.events (created_at desc);
alter table public.events enable row level security;

-- الطالب يقدر يضيف أحداث بس، ومايقدرش يقرا حاجة
create policy "students insert" on public.events for insert to anon
  with check (length(student_id) < 80 and length(coalesce(student_name,'')) < 80 and length(kind) < 20);

-- حساب الإدارة فقط يقرا
create policy "admin read" on public.events for select to authenticated using (true);

-- مهم: من Authentication > Sign In / Providers اقفل "Allow new users to sign up"،
-- وبعدين اعمل حساب الإدارة بإيدك من Authentication > Users > Add user.
