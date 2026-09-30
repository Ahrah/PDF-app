alter table app_users
  add column if not exists steppay_customer_id text,
  add column if not exists steppay_subscription_id text,
  add column if not exists steppay_last_event_timestamp bigint not null default 0;

create unique index if not exists app_users_steppay_customer_id_idx
  on app_users (steppay_customer_id)
  where steppay_customer_id is not null;
