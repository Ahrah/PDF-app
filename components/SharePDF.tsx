'use client';

import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';

interface SharePDFProps {
  pdfBlob: Blob;
  fileName: string;
  clientName: string;
  amount: number;
  dueDate?: string;
  bankAccount?: string;
  type: 'quote' | 'invoice';
  dealId: string;
  onQuotaExceeded?: () => void;
  onMarkAsSent?: () => void;
}

export default function SharePDF({
  pdfBlob,
  fileName,
  clientName,
  amount,
  dueDate,
  bankAccount,
  type,
  dealId,
  onQuotaExceeded,
  onMarkAsSent,
}: SharePDFProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStatusHelper, setShowStatusHelper] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const documentType = type === 'quote' ? '견적서' : '청구서';
  const amountText = `₩${amount.toLocaleString()}`;

  const shareMessage = type === 'quote'
    ? `${clientName}님께 ${documentType}를 보내드립니다.\n\n금액: ${amountText}\n\n확인 부탁드립니다.`
    : `${clientName}님께 ${documentType}를 보내드립니다.\n\n금액: ${amountText}\n${dueDate ? `입금기한: ${dueDate}\n` : ''}${bankAccount ? `입금계좌: ${bankAccount}\n` : ''}\n확인 및 입금 부탁드립니다.`;

  const checkQuotaAndDownload = async (): Promise<boolean> => {
    if (downloading) return false;
    
    setDownloading(true);
    try {
      const res = await fetch('/api/quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, type }),
      });

      if (res.status === 403) {
        if (onQuotaExceeded) {
          onQuotaExceeded();
        }
        return false;
      }

      if (!res.ok) {
        throw new Error('Failed to check quota');
      }

      return true;
    } catch (error) {
      console.error('Quota check failed:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
      return false;
    } finally {
      setDownloading(false);
    }
  };

  const handleWebShare = async () => {
    const allowed = await checkQuotaAndDownload();
    if (!allowed) return;

    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        const canShareFile = navigator.canShare({ files: [file] });

        if (canShareFile) {
          await navigator.share({
            title: `${documentType} - ${clientName}`,
            text: shareMessage,
            files: [file],
          });
          setShowShareModal(false);
          setShowStatusHelper(true);
        } else {
          await navigator.share({
            title: `${documentType} - ${clientName}`,
            text: shareMessage,
          });
          handleDownloadPDF();
          setShowShareModal(false);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
          alert('공유에 실패했습니다. 다른 방법을 시도해 주세요.');
        }
      }
    } else {
      alert('이 브라우저는 공유 기능을 지원하지 않습니다. 카카오톡이나 이메일 옵션을 사용해 주세요.');
    }
  };

  const handleKakaoShare = async () => {
    const allowed = await checkQuotaAndDownload();
    if (!allowed) return;

    handleDownloadPDF();
    
    try {
      await navigator.clipboard.writeText(shareMessage);
      alert('카카오 문구를 복사했어요. 채팅방에 붙여넣으세요.');
      setShowShareModal(false);
      setShowStatusHelper(true);
    } catch (err) {
      alert('메시지 복사에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleEmailShare = async () => {
    const allowed = await checkQuotaAndDownload();
    if (!allowed) return;

    const subject = encodeURIComponent(`${documentType} - ${clientName}`);
    const body = encodeURIComponent(shareMessage);
    
    handleDownloadPDF();
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    setTimeout(() => {
      alert('방금 받은 PDF를 메일에 첨부해 주세요.');
      setShowShareModal(false);
      setShowStatusHelper(true);
    }, 500);
  };

  const handleDownloadPDF = () => {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDirectDownload = async () => {
    const allowed = await checkQuotaAndDownload();
    if (!allowed) return;

    handleDownloadPDF();
  };

  const handleMarkAsSent = async () => {
    setShowStatusHelper(false);
    if (onMarkAsSent) {
      onMarkAsSent();
    }
  };

  const canUseWebShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <>
      <div className="space-y-3">
        <Button onClick={() => setShowShareModal(true)} fullWidth disabled={downloading}>
          보내기
        </Button>
        
        <Button variant="secondary" onClick={handleDirectDownload} fullWidth disabled={downloading}>
          {downloading ? '확인 중...' : 'PDF 다운로드'}
        </Button>

        {showStatusHelper && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-800 mb-3">
              {documentType}를 공유했나요? 상태를 업데이트하세요.
            </p>
            <Button variant="transition" onClick={handleMarkAsSent} fullWidth>
              발송함으로 표시
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={`${documentType} 보내기`}
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            {clientName}님께 {documentType}를 어떻게 보내시겠어요?
          </p>

          {canUseWebShare && (
            <Button onClick={handleWebShare} fullWidth disabled={downloading}>
              📱 공유하기
            </Button>
          )}

          <Button onClick={handleKakaoShare} fullWidth variant="secondary" disabled={downloading}>
            💬 카카오톡으로 공유
          </Button>

          <Button onClick={handleEmailShare} fullWidth variant="secondary" disabled={downloading}>
            📧 이메일로 보내기
          </Button>

          <Button onClick={() => setShowShareModal(false)} fullWidth variant="secondary">
            취소
          </Button>
        </div>
      </Modal>
    </>
  );
}
