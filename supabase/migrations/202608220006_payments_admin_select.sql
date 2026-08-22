drop policy if exists "payments_select_admin" on public.payments;

create policy "payments_select_admin"
on public.payments for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);
