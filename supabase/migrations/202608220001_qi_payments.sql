create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid unique not null,
  qi_payment_id text unique,
  user_id uuid references auth.users(id) on delete set null,
  purpose text not null check (purpose in ('vaccine_book', 'cart')),
  vaccine_book_id uuid references public.vaccine_books(id) on delete set null,
  amount_iqd numeric not null,
  currency text not null default 'IQD',
  status text not null default 'CREATED_LOCAL',
  form_url text,
  cart_payload jsonb,
  checkout_payload jsonb,
  gateway_payload jsonb,
  webhook_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_vaccine_book_id_idx on public.payments(vaccine_book_id);
create index if not exists payments_status_idx on public.payments(status);

alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
on public.payments for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own"
on public.payments for insert
to authenticated
with check (user_id = auth.uid());
