-- 견적함 core schema: users, clients, deals, seller_info
-- All access happens through the Next.js server using the service_role key.
-- RLS is enabled on every table with NO policies for anon/authenticated roles,
-- so PostgREST/anon access is denied by default; only service_role (which
-- bypasses RLS) can read/write, and every server query is additionally scoped
-- by user_id in application code. This is defense-in-depth equivalent to RLS.

create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  display_name text,
  phone text,
  trial_ends_at timestamptz not null,
  is_premium boolean not null default false,
  monthly_deal_count integer not null default 0,
  current_month text not null default to_char(now(), 'YYYY-MM'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  customer_type text not null default '개인' check (customer_type in ('개인', '사업자')),
  name text not null,
  company text,
  contact_name text,
  email text,
  phone text,
  business_number text,
  address text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_name_or_company check (
    coalesce(trim(name), '') <> '' or coalesce(trim(company), '') <> ''
  )
);

create index if not exists clients_user_id_idx on clients(user_id);
create index if not exists clients_user_id_name_idx on clients(user_id, name);
create index if not exists clients_user_id_company_idx on clients(user_id, company);
create index if not exists clients_user_id_business_number_idx on clients(user_id, business_number);
create index if not exists clients_user_id_email_idx on clients(user_id, email);
create index if not exists clients_user_id_phone_idx on clients(user_id, phone);

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  type text not null check (type in ('quote', 'invoice')),
  status text not null default '초안' check (status in ('초안', '발송함', '입금 완료')),
  issue_date date not null,
  valid_until date,
  due_date date,
  line_items jsonb not null default '[]'::jsonb,
  discount numeric not null default 0,
  vat_mode text not null default '별도' check (vat_mode in ('없음', '별도', '포함')),
  memo text,
  payment_memo text,
  total_amount numeric not null default 0,
  pdf_downloaded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deals_user_id_idx on deals(user_id);
create index if not exists deals_client_id_idx on deals(client_id);

create table if not exists seller_info (
  user_id uuid primary key references app_users(id) on delete cascade,
  name text not null,
  business_name text,
  email text not null,
  phone text not null,
  bank_account text not null,
  business_number text,
  address text,
  updated_at timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_tokens_user_id_idx on password_reset_tokens(user_id);

-- RLS: enable + no policies => default deny for anon/authenticated (service_role bypasses)
alter table app_users enable row level security;
alter table clients enable row level security;
alter table deals enable row level security;
alter table seller_info enable row level security;
alter table password_reset_tokens enable row level security;
