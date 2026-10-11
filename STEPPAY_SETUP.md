# StepPay API 결제 설정 가이드

## 배경

기존 StepPay 마이스토어 링크는 로그인을 강제하여 PG 심사를 통과하지 못했습니다.
이제 StepPay API를 통해 주문을 생성하고 결제 링크로 직접 보내서 비로그인 결제가 가능합니다.

## 필요한 환경 변수

Vercel 또는 `.env.local`에 다음 환경 변수를 설정하세요:

### 필수

```bash
# StepPay Secret Token (필수)
STEPPAY_SECRET_TOKEN=your_secret_token_here

# StepPay Webhook Secret (기존, 웹훅 검증용)
STEPPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 선택 (기본값 사용 가능)

```bash
# 상품 코드 (기본값: product_BG6BqoE2N)
STEPPAY_PRODUCT_CODE=product_BG6BqoE2N

# 가격 플랜 코드 (기본값: price_IZwH09Bix)
STEPPAY_PRICE_CODE=price_IZwH09Bix
```

## 동작 방식

1. 사용자가 "구매하기" 버튼 클릭 → 이메일 입력 모달 표시
2. 이메일 입력 후 제출 → `/api/checkout/steppay`로 요청
3. 서버에서:
   - 이메일로 StepPay 고객 조회 (없으면 생성)
   - 구독 첫 결제 주문 생성
   - 결제 URL 생성하여 반환
4. 사용자가 결제창으로 리다이렉트
5. 결제 완료 후:
   - 성공: `/billing/success` (주문 조회 API로 검증)
   - 실패: `/billing/fail`
   - 취소: `/billing/cancel`
6. 웹훅으로 프리미엄 자동 부여 (`payer.email` 또는 `customerId` 매칭)

## 폴백 동작

`STEPPAY_SECRET_TOKEN`이 설정되지 않은 경우:
- 자동으로 기존 마이스토어 링크로 폴백됩니다
- 사용자에게 영향 없이 계속 작동합니다

## 테스트 방법

### 로컬 테스트 (STEPPAY_SECRET_TOKEN 있는 경우)

1. `.env.local`에 환경 변수 설정
2. `npm run dev`
3. `/pricing`에서 "구매하기" 클릭
4. 이메일 입력 후 결제창 확인

### Vercel 배포 후 테스트

1. Vercel Dashboard → Settings → Environment Variables에서 설정
2. Redeploy
3. Production 환경에서 결제 플로우 테스트

### 테스트 모드 확인

StepPay 포탈에서 현재 테스트 모드인지 확인하고, 테스트 결제 진행:
- 테스트 카드: https://docs.steppay.kr/ 참조

## 웹훅 확인

기존 웹훅(`/api/webhooks/steppay`)은 API 생성 주문도 처리합니다:
- `payment.completed` 이벤트에서 `payer.email`로 매칭
- `subscription.created/updated` 이벤트에서 `customerId`로 매칭

## 주의사항

- **이메일 일치**: 결제 시 입력하는 이메일은 견적함 로그인 이메일과 동일해야 프리미엄이 자동 연결됩니다.
- **Secret Token 보안**: `STEPPAY_SECRET_TOKEN`은 절대 클라이언트에 노출되면 안 됩니다.
- **테스트 모드**: 실제 결제 전에 테스트 모드에서 충분히 검증하세요.

## 변경된 파일

### 신규 파일
- `app/api/checkout/steppay/route.ts` - 주문 생성 API
- `app/api/checkout/verify/route.ts` - 결제 검증 API
- `app/billing/success/page.tsx` - 결제 성공 페이지
- `app/billing/fail/page.tsx` - 결제 실패 페이지
- `app/billing/cancel/page.tsx` - 결제 취소 페이지
- `components/CheckoutEmailModal.tsx` - 이메일 입력 모달
- `__tests__/steppay-api.test.ts` - API 테스트 (참고용)

### 수정된 파일
- `lib/steppay.ts` - StepPay API 클라이언트 함수 추가
- `lib/checkout.ts` - API 기반 결제 함수 추가
- `app/pricing/page.tsx` - 이메일 모달 사용
- `app/billing/page.tsx` - 이메일 모달 사용
- `components/PaywallModal.tsx` - 이메일 모달 사용

### 기존 유지
- `app/api/webhooks/steppay/route.ts` - 웹훅 처리 (변경 없음)
- `lib/db.ts` - 프리미엄 부여 로직 (변경 없음)
