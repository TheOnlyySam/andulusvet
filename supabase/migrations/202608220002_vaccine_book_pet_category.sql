alter table public.vaccine_books
  add column if not exists pet_category text;
