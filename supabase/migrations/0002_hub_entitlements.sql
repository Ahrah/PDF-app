-- 취미상점 결제 허브로부터 받는 구독 권한부여를 위한 컬럼/테이블.
-- is_premium(수동/레거시 플래그)과 별개로, 허브가 정기결제 성공 시 보내는
-- "이 시점까지 프리미엄" 값을 premium_until에 기록한다. 자동 갱신되며,
-- 결제가 실패하면 자연히 만료된다(허브가 별도로 "해제" 신호를 보낼 필요 없음).

alter table app_users add column if not exists premium_until timestamptz;

-- 허브가 보내는 권한부여 이벤트의 멱등 처리용. eventId(=허브 outbox row id)를
-- 이미 처리했다면 같은 요청이 재시도로 다시 와도 무시한다.
create table if not exists hub_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

alter table hub_events enable row level security;
