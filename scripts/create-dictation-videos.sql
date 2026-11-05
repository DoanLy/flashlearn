-- Bảng lưu video + tiến độ tab "Chép chính tả". Chạy một lần trong Supabase SQL Editor
-- (key publishable trong App.jsx không có quyền tạo bảng). Chạy lại không sao.
create table if not exists public.dictation_videos (
  id text primary key,
  title text not null,
  video_id text not null,
  segments jsonb not null default '[]'::jsonb,
  progress jsonb not null default '{}'::jsonb,
  created_at bigint not null
);

alter table public.dictation_videos enable row level security;

-- App không có đăng nhập: client dùng key publishable (role anon) để đọc/ghi, giống bảng cards.
drop policy if exists "anon full access" on public.dictation_videos;
create policy "anon full access" on public.dictation_videos
  for all to anon using (true) with check (true);

grant select, insert, update, delete on public.dictation_videos to anon;
