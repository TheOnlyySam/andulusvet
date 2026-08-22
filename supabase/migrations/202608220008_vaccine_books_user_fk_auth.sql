alter table public.vaccine_books
  drop constraint if exists vaccine_books_user_id_fkey;

alter table public.vaccine_books
  add constraint vaccine_books_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;
