# Supabase Setup

## Environment variables

Create a local `.env` file with:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Expo will expose these to the app because they use the `EXPO_PUBLIC_` prefix.

## Expected tables

### `profiles`
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid unique not null references auth.users(id) on delete cascade`
- `username text unique`
- `display_name text`
- `role text not null default 'customer'`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### `products`
- `id uuid primary key default gen_random_uuid()`
- `name_ar text not null`
- `name_en text not null`
- `brand_ar text not null`
- `brand_en text not null`
- `description_ar text`
- `description_en text`
- `category_id text not null`
- `animal_type text not null`
- `life_stage text`
- `price numeric not null`
- `image_url text`
- `is_active boolean not null default true`
- `created_at timestamptz default now()`

### `discount_rules`
- `id uuid primary key default gen_random_uuid()`
- `label_ar text not null`
- `label_en text not null`
- `threshold numeric not null`
- `value numeric not null`
- `value_type text not null check (value_type in ('percentage', 'fixed'))`
- `scope text not null default 'order'`
- `type text not null default 'threshold'`
- `is_active boolean not null default true`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `created_at timestamptz default now()`

### `vaccine_books`
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `client_name text not null`
- `location text not null`
- `pet_name text not null`
- `pet_type text not null`
- `pet_category text`
- `first_visit_date_iso timestamptz not null`
- `pet_birth_date_iso timestamptz`
- `owner_phone text`
- `owner_email text`
- `vet_name text not null`
- `protocol text not null`
- `approval_status text not null default 'pending'` (recommended values: `pending`, `approved`)
- `approved_at timestamptz`
- `payment_status text not null default 'unpaid'` (recommended values: `unpaid`, `paid`)
- `payment_amount_iqd numeric not null default 5000`
- `book_count integer not null default 1`
- `paid_at timestamptz`
- `notes text`
- `attachment jsonb`
- `image jsonb`
- `created_at timestamptz default now()`

### `booking_records`
- `id uuid primary key default gen_random_uuid()`
- `vaccine_book_id uuid not null references vaccine_books(id) on delete cascade`
- `pet_name text not null`
- `pet_type text not null`
- `vaccine_name text not null`
- `date_iso timestamptz`
- `planned_date_iso timestamptz`
- `received_date_iso timestamptz`
- `notes text`
- `attachments jsonb default '[]'::jsonb`
- `created_at timestamptz default now()`

### `notifications`
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid references auth.users(id) on delete cascade`
- `title_ar text not null`
- `title_en text not null`
- `message_ar text`
- `message_en text`
- `type text not null default 'general'`
- `audience text not null default 'all'`
- `is_read boolean not null default false`
- `created_at timestamptz default now()`

### `payments`
- `id uuid primary key default gen_random_uuid()`
- `request_id uuid unique not null`
- `qi_payment_id text unique`
- `user_id uuid references auth.users(id) on delete set null`
- `purpose text not null` (recommended values: `vaccine_book`, `cart`)
- `vaccine_book_id uuid references vaccine_books(id) on delete set null`
- `amount_iqd numeric not null`
- `currency text not null default 'IQD'`
- `status text not null default 'CREATED_LOCAL'`
- `form_url text`
- `cart_payload jsonb`
- `checkout_payload jsonb`
- `gateway_payload jsonb`
- `webhook_payload jsonb`
- `paid_at timestamptz`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

## Suggested storage buckets

### `product-images`
- public read
- admin write

### `booking-files`
- private
- customer upload for own records
- admin read

### `pet-images`
- private or public based on your preference
- customer upload for own records
- admin read

## Suggested RLS next

### `profiles`
- authenticated users can read/update their own profile
- admins can read all profiles

### `products`
- everyone can read active products
- only admins can insert/update products

### `discount_rules`
- everyone can read active discount rules
- only admins can insert/update discount rules

### `vaccine_books`
- customers can read and insert only their own books
- admins can read all books
- admins can update `approval_status` and `approved_at`

### `booking_records`
- customers can read records belonging to their own `vaccine_books`
- admins can read all records

### `notifications`
- users can read notifications where `user_id = auth.uid()` or `audience = 'all'`
- admins can read all notifications
- only admins can insert broadcast notifications

### `payments`
- customers can read their own payments
- payment creation, webhook updates, and gateway status sync are handled by Supabase Edge Functions using the service role key

## Notes about the current app wiring

- Products are normalized into the existing localized UI shape after fetching from Supabase.
- Discounts are fetched dynamically and applied in the cart through the existing calculation layer.
- Vaccine books and booking records are normalized into the app's existing booking model.
- Notifications are ready for Supabase but still fall back to mock/local behavior when credentials are missing.
- Admin UI visibility depends on the `profiles.role` field.
# Electronic book pet and deworming fields

Apply this additive migration to existing projects so sex, breed, and the separate deworming records persist in Supabase:

```sql
alter table public.vaccine_books add column if not exists pet_sex text;
alter table public.vaccine_books add column if not exists pet_breed text;
alter table public.booking_records add column if not exists record_type text not null default 'vaccine';
alter table public.booking_records add column if not exists status text not null default 'pending';
```

# Qi payment gateway testing

Apply the migration in `supabase/migrations/202608220001_qi_payments.sql`, then deploy these Edge Functions:

```bash
supabase functions deploy qi-create-payment
supabase functions deploy qi-payment-webhook --no-verify-jwt
supabase functions deploy qi-payment-sync
supabase functions deploy qi-payment-finish --no-verify-jwt
```

Recommended function secrets for sandbox testing:

```bash
supabase secrets set QI_GATEWAY_BASE_URL=https://uat-sandbox-3ds-api.qi.iq/api/v1
supabase secrets set QI_GATEWAY_USERNAME=paymentgatewaytest
supabase secrets set QI_GATEWAY_PASSWORD=WHaNFE5C3qlChqNbAzH4
supabase secrets set QI_GATEWAY_TERMINAL_ID=237984
```

Optional production/security settings:

```bash
supabase secrets set QI_GATEWAY_PUBLIC_KEY='-----BEGIN PUBLIC KEY-----...'
supabase secrets set QI_FINISH_PAYMENT_URL=https://your-domain.example/payment-finish
supabase secrets set QI_NOTIFICATION_URL=https://your-project.supabase.co/functions/v1/qi-payment-webhook
```

Flow:
- vaccine books always create a 5,000 IQD payment
- cart checkout creates a Qi payment for the current cart total
- Qi returns a hosted `formUrl`, which the app opens
- `qi-payment-webhook` marks successful payments as `SUCCESS`
- when a successful payment is for a vaccine book, the function updates `vaccine_books.payment_status` to `paid`, sets `paid_at`, and approves/unlocks the book
- the in-app "Check payment status" button calls `qi-payment-sync` as a manual fallback while testing
