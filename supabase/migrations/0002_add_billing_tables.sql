-- Fix trial_ends_at to allow NULL (signup creates users with null trial)
alter table app_users alter column trial_ends_at drop not null;

-- Subscriptions table for Toss Payments recurring billing
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references app_users(id) on delete cascade,
  
  -- Subscription status
  status text not null default 'trialing' check (
    status in ('trialing', 'active', 'past_due', 'canceled', 'locked')
  ),
  
  -- Toss Payments billing credentials (server-only, never expose to client)
  billing_key text,
  customer_key text not null,
  
  -- Subscription period
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_billing_at timestamptz,
  
  -- Cancellation
  canceled_at timestamptz,
  
  -- Failed payment tracking
  fail_count integer not null default 0,
  last_failure_code text,
  last_failure_message text,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on subscriptions(user_id);
create index if not exists subscriptions_status_idx on subscriptions(status);
create index if not exists subscriptions_next_billing_idx on subscriptions(next_billing_at) where status = 'active';

-- Payments table to track all billing transactions
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  
  -- Toss Payments identifiers
  order_id text not null unique,
  payment_key text,
  
  -- Payment details
  amount integer not null,
  status text not null check (
    status in ('pending', 'approved', 'failed', 'canceled', 'refunded')
  ),
  
  -- Timestamps
  approved_at timestamptz,
  failed_at timestamptz,
  
  -- Failure details
  failure_code text,
  failure_message text,
  
  -- Raw Toss API response for debugging
  raw_response jsonb,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_id_idx on payments(user_id);
create index if not exists payments_subscription_id_idx on payments(subscription_id);
create index if not exists payments_order_id_idx on payments(order_id);
create index if not exists payments_status_idx on payments(status);
create index if not exists payments_created_at_idx on payments(created_at desc);

-- RLS: enable + no policies => default deny (service_role bypasses)
alter table subscriptions enable row level security;
alter table payments enable row level security;

-- Add metadata column to app_users for future extensibility (e.g., Toss customerKey)
alter table app_users add column if not exists metadata jsonb default '{}'::jsonb;
