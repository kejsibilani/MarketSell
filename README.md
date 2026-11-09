# MarketSell

B2B marketplace platform for specialty coffee: sellers, agents, buyers and operators, with inventory, transformations (roasting, repackaging, sampling), shipments, sales orders and storefronts.

- **Frontend:** React 18 + Vite + Tailwind
- **Backend:** Supabase (Postgres, Auth, Row Level Security, Storage)

## Quick start (demo mode)

```bash
npm install
npm run dev
```

Without Supabase credentials the app runs entirely in the browser on sample data.

## Running with Supabase

### 1. Create the database

**Hosted project**: create a project at [supabase.com](https://supabase.com), then either

- install the [Supabase CLI](https://supabase.com/docs/guides/cli) and run
  ```bash
  supabase link --project-ref <your-project-ref>
  supabase db push
  ```
- or paste `supabase/migrations/20261109000000_initial_schema.sql` into the SQL editor and run it.

Optionally load demo data by running `supabase/seed.sql` in the SQL editor.

**Local**: `supabase start` then `supabase db reset` (applies the migration and the seed).

### 2. Configure the app

```bash
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from *Project Settings → API*, then `npm run dev`.

In *Authentication → URL Configuration*, add your site URL and `<site-url>/signin` as a redirect URL (used by email confirmation and password reset).

### 3. Create the first administrator

Sign up through the app, then in the SQL editor:

```sql
update public.members set roles = array['system-admin'] where email = 'you@example.com';
```

Administrators can grant other users the `operator`, `business-admin` or `system-admin` roles from the same table. Self sign-up can only ever create `buyer`, `seller` or `agent` accounts.

## Backend overview

| Table | Purpose |
|---|---|
| `members` | Application users, linked 1:1 to `auth.users`, with their roles and ratings |
| `companies`, `user_rights` | Companies and what each member may do for each company |
| `producers`, `skus`, `warehouses` | Catalog and logistics master data |
| `stock_movements`, `shipments`, `transformation_orders`, `restocking_orders`, `sales_orders` | Operations |
| `fees`, `cash_transactions`, `storefronts` | Finance and storefronts |
| `system_tables` | Admin-editable lookup lists (categories, packaging, countries, …) |

**Security (RLS):**

- Staff (`operator`, `business-admin`, `system-admin`) see and manage everything.
- Company members see their company's operational data. Writes require `can_update_data` on that company.
- Buyers see the sales orders placed with their email.
- Anonymous visitors can read the public catalog (selling SKUs, producers, active network storefronts, system lookups).
- Only administrators can change roles. Only system admins can edit system tables.

**Sign-up:** a database trigger creates the member. Seller and agent applications also create a `Pending` company with the applicant's rights, so an operator can review and activate it.

**Storage buckets:** `product-images` (public read) and `documents` (private). Files go under `<company_id>/…`, and access follows company membership.

### How the app talks to Supabase

`src/lib/backend/` holds the integration:

- `client.ts`: Supabase client, plus the switch between demo and Supabase mode
- `auth.tsx`: sign in/up/out, password reset, `AuthProvider` / `useAuth()`
- `schema.ts`: mapping between UI records and table rows (typed columns, with an `extra` jsonb column for any other fields)
- `sync.ts`: loads every collection the user may see at start-up and after sign-in. Each save is diffed and upserted or deleted on the server, and failures show a notice without losing local changes.
- `storage.ts`: `writeCollection()`, the single save path the pages use

To persist a new screen's data, add a `CollectionDef` in `schema.ts` and a matching table in a new migration, then read and write it with `loadFromLS` / `saveToLS` (or `writeCollection`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Type-check the backend layer |
| `npm run db:seed:generate` | Regenerate `supabase/seed.sql` from the sample data |
