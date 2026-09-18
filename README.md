# 견적함 (PDF App)

견적서와 청구서를 쉽게 만들고 관리하는 웹 애플리케이션입니다.

## 주요 기능

- ✅ 견적서 및 청구서 생성
- ✅ 한글 폰트 지원 (NanumGothic)
- ✅ PDF 다운로드 및 공유
- ✅ 무료 플랜: 월 3건 (견적서+청구서 = 1건)
- ✅ 프리미엄 플랜: 무제한 + 워터마크 제거

## 환경 변수 (선택사항)

현재 기본적으로 파일 시스템 기반 저장소를 사용합니다. 프로덕션 환경에서 더 나은 성능을 위해 다음 옵션을 고려할 수 있습니다:

### Vercel Blob (권장)
```bash
# Vercel 대시보드에서 Blob Storage 추가 시 자동 설정
BLOB_READ_WRITE_TOKEN=your_token_here
```

### Vercel KV (대안)
```bash
# Vercel 대시보드에서 KV 추가 시 자동 설정
KV_REST_API_URL=your_url_here
KV_REST_API_TOKEN=your_token_here
```

**참고:** 환경 변수가 설정되지 않은 경우, 앱은 자동으로 로컬 파일 시스템(`/data` 폴더)을 사용합니다. Vercel에서는 빌드 간에 데이터가 유지되지 않으므로 프로덕션 환경에서는 Blob 또는 KV 사용을 권장합니다.

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 배포 (Vercel)

1. GitHub 저장소를 Vercel에 연결
2. (선택) Vercel Blob 또는 KV 추가
3. 자동 배포

## P0 기능 (Week 1 MVP)

### ✅ P0-1: PDF 한글 폰트
- NanumGothic 폰트 임베딩
- 견적서/청구서에서 한글이 올바르게 표시됨
- A4 레이아웃 유지
- 무료 플랜 워터마크 작동

### ✅ P0-2: 서버 측 할당량 관리
- 한 거래 = 견적서 + 청구서 = 1건으로 카운트
- 동일 문서 재다운로드는 카운트하지 않음 (멱등성)
- 새로고침 후에도 할당량 유지
- UI에 `이번 달 n/3건` 표시
- API: `/api/quota` (GET, POST)

### ✅ P0-3: 페이월 + 대기자 명단
- 4번째 다운로드 시도 시 페이월 표시
- 월 9,900원 안내
- 이메일 수집 및 서버 저장
- API: `/api/waitlist` (POST, GET)

## 대기자 명단 확인

관리자는 다음 파일에서 대기자 명단을 확인할 수 있습니다:
```
/data/waitlist.json
```

또는 API를 통해:
```bash
curl https://your-domain.vercel.app/api/waitlist
```

## 할당량 데이터

할당량 데이터는 다음 파일에 저장됩니다:
```
/data/quota.json
```

형식:
```json
{
  "month": "2026-09",
  "count": 2,
  "downloads": ["dealId1", "dealId2"]
}
```

## 라이선스

MIT
