-- ============================================================================
-- MarketSell — initial schema
--
-- Conventions
--   * Every business table has `inserted_at` / `modified_at` audit columns.
--   * Every business table has an `extra jsonb` column. The web client keeps
--     its full record shape; fields that are not (yet) promoted to a typed
--     column are stored there, so nothing the UI saves is ever lost.
--   * Business dates coming from the UI are kept as ISO-8601 text exactly as
--     the client sent them (some are dates, some are timestamps).
--   * Row Level Security is enabled on every table.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.touch_modified_at()
returns trigger
language plpgsql
as $$
begin
  new.modified_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Members (application users). Linked 1:1 to auth.users once they sign up.
-- Numeric ids are kept because the UI addresses users by a numeric userId.
-- ---------------------------------------------------------------------------
create sequence if not exists public.members_id_seq start with 1000;

create table public.members (
  user_id        bigint primary key default nextval('public.members_id_seq'),
  auth_user_id   uuid unique references auth.users (id) on delete set null,
  email          text,
  name           text,
  roles          text[] not null default array['buyer']::text[],
  seller_group   text,
  buyer_group    text,
  agent_group    text,
  buyer_rating   numeric(3,1),
  seller_rating  numeric(3,1),
  agent_rating   numeric(3,1),
  extra          jsonb not null default '{}'::jsonb,
  inserted_at    timestamptz not null default now(),
  modified_at    timestamptz not null default now(),
  constraint members_roles_valid check (
    roles <@ array['buyer','seller','agent','operator','business-admin','system-admin']::text[]
  )
);
alter sequence public.members_id_seq owned by public.members.user_id;
create index members_email_idx on public.members (lower(email));

-- ---------------------------------------------------------------------------
-- Companies
-- ---------------------------------------------------------------------------
create table public.companies (
  id               text primary key default ('comp-' || substr(gen_random_uuid()::text, 1, 8)),
  name             text not null,
  country          text,
  city             text,
  contact_email    text,
  status           text not null default 'Pending' check (status in ('Active','Pending','Inactive')),
  company_group_id text,
  created_at       text,
  extra            jsonb not null default '{}'::jsonb,
  inserted_at      timestamptz not null default now(),
  modified_at      timestamptz not null default now()
);

-- Which member may act for which company, and how.
create table public.user_rights (
  id                  text primary key,
  user_id             bigint not null references public.members (user_id) on delete cascade,
  company_id          text   not null references public.companies (id) on delete cascade,
  company_group_id    text,
  role                text not null default 'buyer' check (role in ('buyer','seller','agent','operator')),
  can_sell            boolean not null default false,
  can_be_agent        boolean not null default false,
  can_place_orders    boolean not null default false,
  can_update_data     boolean not null default false,
  can_authorise_users boolean not null default false,
  extra               jsonb not null default '{}'::jsonb,
  inserted_at         timestamptz not null default now(),
  modified_at         timestamptz not null default now()
);
create index user_rights_user_idx on public.user_rights (user_id);
create index user_rights_company_idx on public.user_rights (company_id);

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table public.producers (
  id            text primary key default ('PROD-' || substr(gen_random_uuid()::text, 1, 8)),
  name          text not null,
  country       text,
  status        text not null default 'Pending',
  contact_email text,
  sku_count     integer,
  extra         jsonb not null default '{}'::jsonb,
  inserted_at   timestamptz not null default now(),
  modified_at   timestamptz not null default now()
);

create table public.skus (
  id               text primary key default ('SKU-' || substr(gen_random_uuid()::text, 1, 8)),
  sku              text,
  sku_name         text,
  ean_barcode      text,
  internal_code    text,
  warehouse_code   text,
  product          text,
  product_name     text,
  product_line     text,
  product_category text,
  origin           text,
  producer_id      text,
  producer_name    text,
  company_id       text,
  pack             text,
  status           text not null default 'pending',
  extra            jsonb not null default '{}'::jsonb,
  inserted_at      timestamptz not null default now(),
  modified_at      timestamptz not null default now()
);
create index skus_company_idx on public.skus (company_id);
create index skus_producer_idx on public.skus (producer_id);

create table public.warehouses (
  id          text primary key,
  code        text unique,
  name        text not null,
  city        text,
  country     text,
  is_shared   boolean not null default true,
  extra       jsonb not null default '{}'::jsonb,
  inserted_at timestamptz not null default now(),
  modified_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Operations
-- ---------------------------------------------------------------------------
create table public.stock_movements (
  id               text primary key,
  sku_id           text,
  date             text,
  type             text check (type in (
                     'INITIAL_INVENTORY','GOODS_RECEIPT_FROM_RESTOCK','GOODS_RECEIPT_FROM_RETURN',
                     'GOODS_ISSUE_TO_TRANSFORMATION','GOODS_ISSUE_TO_SALES','INVENTORY_CORRECTION')),
  quantity_units   numeric,
  warehouse_id     text,
  company_id       text,
  reference_number text,
  linked_to_type   text,
  linked_to_id     text,
  comment          text,
  extra            jsonb not null default '{}'::jsonb,
  inserted_at      timestamptz not null default now(),
  modified_at      timestamptz not null default now()
);
create index stock_movements_sku_idx on public.stock_movements (sku_id);
create index stock_movements_company_idx on public.stock_movements (company_id);

create table public.shipments (
  id                   text primary key,
  shipment_id          text,
  date                 text,
  from_location        text,
  to_location          text,
  carrier              text,
  status               text,
  items                jsonb not null default '[]'::jsonb,
  warehouse_id         text,
  company_id           text,
  buyer_id             text,
  buyer_email          text,
  buyer_name           text,
  buyer_account_number text,
  linked_order_id      text,
  linked_order_type    text,
  related_movement_id  text,
  documents            jsonb,
  pictures             jsonb,
  draft_state          boolean,
  comment              text,
  extra                jsonb not null default '{}'::jsonb,
  inserted_at          timestamptz not null default now(),
  modified_at          timestamptz not null default now()
);
create index shipments_company_idx on public.shipments (company_id);
create index shipments_linked_order_idx on public.shipments (linked_order_id);

create table public.transformation_orders (
  id                                   text primary key,
  order_id                             text,
  date                                 text,
  type                                 text,
  status                               text,
  company                              text,
  company_id                           text,
  input_items                          jsonb not null default '[]'::jsonb,
  output_items                         jsonb not null default '[]'::jsonb,
  related_movement_id                  text,
  health_ministry_authorization_number text,
  draft_state                          boolean,
  comment                              text,
  extra                                jsonb not null default '{}'::jsonb,
  inserted_at                          timestamptz not null default now(),
  modified_at                          timestamptz not null default now()
);
create index transformation_orders_company_idx on public.transformation_orders (company_id);

create table public.restocking_orders (
  id                     text primary key,
  date                   text,
  company                text,
  company_id             text,
  product                text,
  sku                    text,
  qty                    numeric,
  warehouse              text,
  requested_date         text,
  status                 text,
  notes                  text,
  linked_shipment_ids    jsonb,
  linked_transformations jsonb,
  draft_state            boolean,
  extra                  jsonb not null default '{}'::jsonb,
  inserted_at            timestamptz not null default now(),
  modified_at            timestamptz not null default now()
);
create index restocking_orders_company_idx on public.restocking_orders (company_id);

create table public.sales_orders (
  id                  text primary key,
  order_id            text,
  date                text,
  buyer_name          text,
  buyer_email         text,
  buyer_country       text,
  buyer_destination   text,
  seller_company_id   text,
  seller_company      text,
  seller_email        text,
  agent               text,
  agent_commission    numeric,
  order_source        text,
  order_source_value  text,
  status              text,
  items               jsonb not null default '[]'::jsonb,
  total_value         numeric,
  currency            text,
  total_items         numeric,
  created_date        text,
  due_date            text,
  linked_shipment_ids jsonb,
  notes               text,
  extra               jsonb not null default '{}'::jsonb,
  inserted_at         timestamptz not null default now(),
  modified_at         timestamptz not null default now()
);
create index sales_orders_seller_idx on public.sales_orders (seller_company_id);

-- ---------------------------------------------------------------------------
-- Finance & storefronts (ready for upcoming screens)
-- ---------------------------------------------------------------------------
create table public.fees (
  id                 text primary key,
  date               text,
  amount             numeric not null,
  currency           text not null default 'EUR',
  company_id         text,
  description        text,
  linked_entity_type text,
  linked_entity_id   text,
  extra              jsonb not null default '{}'::jsonb,
  inserted_at        timestamptz not null default now(),
  modified_at        timestamptz not null default now()
);

create table public.cash_transactions (
  id          text primary key,
  date        text,
  description text,
  amount      numeric not null,
  currency    text not null default 'EUR',
  company_id  text,
  extra       jsonb not null default '{}'::jsonb,
  inserted_at timestamptz not null default now(),
  modified_at timestamptz not null default now()
);

create table public.storefronts (
  id          text primary key default ('store-' || substr(gen_random_uuid()::text, 1, 8)),
  name        text not null,
  url         text,
  status      text not null default 'inactive',
  is_network  boolean not null default false,
  company_id  text,
  config      jsonb not null default '{}'::jsonb,
  extra       jsonb not null default '{}'::jsonb,
  inserted_at timestamptz not null default now(),
  modified_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- System lookup tables (categories, packaging units, countries, ...).
-- One row per table; `rows` holds the list the admin UI edits.
-- ---------------------------------------------------------------------------
create table public.system_tables (
  key         text primary key,
  rows        jsonb not null default '[]'::jsonb,
  inserted_at timestamptz not null default now(),
  modified_at timestamptz not null default now()
);

-- modified_at triggers
do $$
declare t text;
begin
  foreach t in array array[
    'members','companies','user_rights','producers','skus','warehouses','stock_movements',
    'shipments','transformation_orders','restocking_orders','sales_orders','fees',
    'cash_transactions','storefronts','system_tables'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.touch_modified_at()',
      t || '_touch', t);
  end loop;
end $$;

-- ============================================================================
-- Authorization helpers (SECURITY DEFINER so they can read members/user_rights
-- without recursing through RLS).
-- ============================================================================
create or replace function public.current_member_id()
returns bigint
language sql stable security definer set search_path = public
as $$
  select user_id from public.members where auth_user_id = auth.uid()
$$;

create or replace function public.has_role(role_name text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.members
    where auth_user_id = auth.uid() and role_name = any (roles)
  )
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.members
    where auth_user_id = auth.uid()
      and roles && array['operator','business-admin','system-admin']::text[]
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.members
    where auth_user_id = auth.uid()
      and roles && array['business-admin','system-admin']::text[]
  )
$$;

create or replace function public.is_company_member(cid text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select cid is not null and exists (
    select 1
    from public.user_rights ur
    join public.members m on m.user_id = ur.user_id
    where m.auth_user_id = auth.uid() and ur.company_id = cid
  )
$$;

create or replace function public.can_write_company(cid text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select cid is not null and exists (
    select 1
    from public.user_rights ur
    join public.members m on m.user_id = ur.user_id
    where m.auth_user_id = auth.uid() and ur.company_id = cid and ur.can_update_data
  )
$$;

revoke all on function public.current_member_id(), public.has_role(text), public.is_staff(),
  public.is_admin(), public.is_company_member(text), public.can_write_company(text) from public;
grant execute on function public.current_member_id(), public.has_role(text), public.is_staff(),
  public.is_admin(), public.is_company_member(text), public.can_write_company(text)
  to anon, authenticated;

-- Members cannot grant themselves roles; only admins change roles.
create or replace function public.guard_member_roles()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is not null
     and new.roles is distinct from old.roles
     and not public.is_admin() then
    raise exception 'Only administrators can change member roles';
  end if;
  return new;
end;
$$;
create trigger members_guard_roles before update on public.members
  for each row execute function public.guard_member_roles();

-- ============================================================================
-- Sign-up: create the member, and for seller/agent applications a pending
-- company plus the user's rights on it.
--   raw_user_meta_data: { name, role: 'buyer'|'seller'|'agent', company_name, country, city }
-- ============================================================================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  meta        jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  wanted_role text  := coalesce(meta->>'role', 'buyer');
  new_member  bigint;
  new_company text;
begin
  -- Self sign-up may only request public roles.
  if wanted_role not in ('buyer','seller','agent') then
    wanted_role := 'buyer';
  end if;

  -- Re-link an existing member row created by an operator for this email.
  update public.members
     set auth_user_id = new.id
   where auth_user_id is null and lower(email) = lower(new.email)
   returning user_id into new_member;

  if new_member is null then
    insert into public.members (auth_user_id, email, name, roles)
    values (
      new.id,
      new.email,
      coalesce(nullif(meta->>'name', ''), split_part(new.email, '@', 1)),
      case when wanted_role = 'buyer' then array['buyer'] else array['buyer', wanted_role] end
    )
    returning user_id into new_member;

    if nullif(meta->>'company_name', '') is not null then
      insert into public.companies (name, country, city, contact_email, status, created_at, extra)
      values (meta->>'company_name', meta->>'country', meta->>'city', new.email, 'Pending',
              to_char(now(), 'YYYY-MM-DD'),
              case when jsonb_typeof(meta->'company_details') = 'object'
                   then meta->'company_details' else '{}'::jsonb end)
      returning id into new_company;

      insert into public.user_rights (
        id, user_id, company_id, role, can_sell, can_be_agent,
        can_place_orders, can_update_data, can_authorise_users)
      values (
        new_member || ':' || new_company || ':' || wanted_role,
        new_member, new_company,
        case when wanted_role = 'buyer' then 'buyer' else wanted_role end,
        wanted_role = 'seller', wanted_role = 'agent', true, true, true);
    end if;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.members               enable row level security;
alter table public.companies             enable row level security;
alter table public.user_rights           enable row level security;
alter table public.producers             enable row level security;
alter table public.skus                  enable row level security;
alter table public.warehouses            enable row level security;
alter table public.stock_movements       enable row level security;
alter table public.shipments             enable row level security;
alter table public.transformation_orders enable row level security;
alter table public.restocking_orders     enable row level security;
alter table public.sales_orders          enable row level security;
alter table public.fees                  enable row level security;
alter table public.cash_transactions     enable row level security;
alter table public.storefronts           enable row level security;
alter table public.system_tables         enable row level security;

-- members
create policy members_select on public.members for select to authenticated
  using (auth_user_id = auth.uid() or public.is_staff());
create policy members_update_self on public.members for update to authenticated
  using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy members_staff_write on public.members for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- companies: directory readable by signed-in users; members edit their own
create policy companies_select on public.companies for select to authenticated using (true);
create policy companies_member_update on public.companies for update to authenticated
  using (public.can_write_company(id)) with check (public.can_write_company(id));
create policy companies_staff_write on public.companies for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- user_rights
create policy user_rights_select on public.user_rights for select to authenticated
  using (user_id = public.current_member_id() or public.is_staff());
create policy user_rights_staff_write on public.user_rights for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- catalog: public read (marketplace), staff write; sellers manage their SKUs
create policy producers_select on public.producers for select to anon, authenticated using (true);
create policy producers_staff_write on public.producers for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy skus_select on public.skus for select to anon, authenticated
  using (status = 'selling' or public.is_staff() or public.is_company_member(company_id));
create policy skus_company_write on public.skus for all to authenticated
  using (public.is_staff() or public.can_write_company(company_id))
  with check (public.is_staff() or public.can_write_company(company_id));

create policy warehouses_select on public.warehouses for select to authenticated using (true);
create policy warehouses_staff_write on public.warehouses for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- company-scoped operational tables
do $$
declare t text;
begin
  foreach t in array array[
    'stock_movements','shipments','transformation_orders','restocking_orders',
    'fees','cash_transactions','storefronts'
  ] loop
    execute format($f$
      create policy %1$I on public.%2$I for select to authenticated
        using (public.is_staff() or public.is_company_member(company_id));
      create policy %3$I on public.%2$I for all to authenticated
        using (public.is_staff() or public.can_write_company(company_id))
        with check (public.is_staff() or public.can_write_company(company_id));
    $f$, t || '_select', t, t || '_write');
  end loop;
end $$;

-- network storefronts are public
create policy storefronts_public_select on public.storefronts for select to anon, authenticated
  using (is_network and status = 'active');

-- fees and cash are posted by staff only
drop policy fees_write on public.fees;
create policy fees_write on public.fees for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy cash_transactions_write on public.cash_transactions;
create policy cash_transactions_write on public.cash_transactions for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- sales orders: visible to the selling company, the buyer (by email) and staff
create policy sales_orders_select on public.sales_orders for select to authenticated
  using (
    public.is_staff()
    or public.is_company_member(seller_company_id)
    or lower(buyer_email) = lower(auth.jwt() ->> 'email')
  );
create policy sales_orders_write on public.sales_orders for all to authenticated
  using (public.is_staff() or public.can_write_company(seller_company_id))
  with check (public.is_staff() or public.can_write_company(seller_company_id));

-- system tables: readable by everyone, editable by system admins
create policy system_tables_select on public.system_tables for select to anon, authenticated using (true);
create policy system_tables_admin_write on public.system_tables for all to authenticated
  using (public.has_role('system-admin')) with check (public.has_role('system-admin'));

-- ============================================================================
-- Storage
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true),
       ('documents', 'documents', false)
on conflict (id) do nothing;

-- product images: public read, signed-in upload into a folder named after a company they belong to
create policy "product images are public" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "company members upload product images" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (public.is_staff() or public.can_write_company((storage.foldername(name))[1]))
  );
create policy "company members manage product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images'
         and (public.is_staff() or public.can_write_company((storage.foldername(name))[1])));
create policy "company members delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images'
         and (public.is_staff() or public.can_write_company((storage.foldername(name))[1])));

-- documents (invoices, packing lists, certificates): private, path = <company_id>/...
create policy "company members read documents" on storage.objects for select to authenticated
  using (bucket_id = 'documents'
         and (public.is_staff() or public.is_company_member((storage.foldername(name))[1])));
create policy "company members upload documents" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents'
              and (public.is_staff() or public.can_write_company((storage.foldername(name))[1])));
create policy "company members delete documents" on storage.objects for delete to authenticated
  using (bucket_id = 'documents'
         and (public.is_staff() or public.can_write_company((storage.foldername(name))[1])));
