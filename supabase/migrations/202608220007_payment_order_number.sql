alter table public.payments
  add column if not exists order_number text;

update public.payments
set order_number = 'ALD-' || upper(substr(replace(id::text, '-', ''), 1, 10))
where order_number is null;

create unique index if not exists payments_order_number_key
on public.payments(order_number)
where order_number is not null;

create index if not exists payments_order_number_idx
on public.payments(order_number);
