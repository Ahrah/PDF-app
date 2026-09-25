import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 55%, #eff6ff 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #8b5cf6, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <div style={{ width: 22, height: 22, background: '#fff', borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#111827' }}>견적함</div>
        </div>

        <div style={{ fontSize: 56, fontWeight: 800, color: '#111827', lineHeight: 1.25, marginBottom: 20 }}>
          견적서 작성부터 입금 확인까지
        </div>
        <div style={{ fontSize: 30, color: '#4b5563', marginBottom: 48 }}>
          견적서를 PDF로 만들고, 청구서와 입금 상태를 한곳에서 관리하세요.
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            padding: '28px 32px',
            width: 460,
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>견적서</div>
            <div style={{ fontSize: 16, color: '#9ca3af' }}>No. SAMPLE01</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: '#374151', marginBottom: 8 }}>
            <div>로고 디자인</div>
            <div style={{ fontWeight: 700 }}>300,000원</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: '#374151' }}>
            <div>웹사이트 시안 제작</div>
            <div style={{ fontWeight: 700 }}>450,000원</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
