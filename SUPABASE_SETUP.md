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
- `first_visit_date_iso timestamptz not null`
- `pet_birth_date_iso timestamptz`
- `owner_phone text`
- `owner_email text`
- `vet_name text not null`
- `protocol text not null`
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

### `booking_records`
- customers can read records belonging to their own `vaccine_books`
- admins can read all records

### `notifications`
- users can read notifications where `user_id = auth.uid()` or `audience = 'all'`
- admins can read all notifications
- only admins can insert broadcast notifications

## Notes about the current app wiring

- Products are normalized into the existing localized UI shape after fetching from Supabase.
- Discounts are fetched dynamically and applied in the cart through the existing calculation layer.
- Vaccine books and booking records are normalized into the app's existing booking model.
- Notifications are ready for Supabase but still fall back to mock/local behavior when credentials are missing.
- Admin UI visibility depends on the `profiles.role` field.
