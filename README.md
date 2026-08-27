# KSTV-Icons-Hangout

## Supabase setup

Create a `registrations` table with these columns: `id` (uuid or bigint primary key), `full_name` (text), `email` (text), `whatsapp_number` (text), `attendance` (text), and `payment_made` (text). Enable Row Level Security and add policies that allow anonymous visitors to insert registrations and authenticated admins to select them:

```sql
alter table public.registrations enable row level security;

create policy "Anyone can submit a registration"
on public.registrations for insert
to anon, authenticated
with check (true);

create policy "Admins can view registrations"
on public.registrations for select
to authenticated
using (true);
```

Create the admin account in Supabase Dashboard under Authentication > Users. Open `admin.html` to sign in and view the exact participant count. The anon key is safe to use in this browser app, but the database policies must remain enabled.