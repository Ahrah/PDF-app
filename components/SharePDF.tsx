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
}

export default function SharePDF({
  pdfBlob,
  fileName,
  clientName,
  amount,
  dueDate,
  bankAccount,
  type,
}: SharePDFProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStatusHelper, setShowStatusHelper] = useState(false);

  const documentType = type === 'quote' ? '견적서' : '청구서';
  const amountText = `₩${amount.toLocaleString()}`;

  const shareMessage = type === 'quote'
    ? `${clientName}님께 ${documentType}를 보내드립니다.\n\n금액: ${amountText}\n\n확인 부탁드립니다.`
    : `${clientName}님께 ${documentType}를 보내드립니다.\n\n금액: ${amountText}\n${dueDate ? `입금기한: ${dueDate}\n` : ''}${bankAccount ? `입금계좌: ${bankAccount}\n` : ''}\n확인 및 입금 부탁드립니다.`;

  const handleWebShare = async () => {
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
        }
      }
    }
  };

  const handleKakaoShare = async () => {
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

  const handleEmailShare = () => {
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

  const handleMarkAsSent = async () => {
    setShowStatusHelper(false);
  };

  const canUseWebShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <>
      <div className="space-y-3">
        <Button onClick={() => setShowShareModal(true)} fullWidth>
          보내기
        </Button>
        
        <Button variant="secondary" onClick={handleDownloadPDF} fullWidth>
          PDF 다운로드
        </Button>

        {showStatusHelper && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-800 mb-3">
              {documentType}를 공유했나요? 상태를 업데이트하세요.
            </p>
            <Button onClick={handleMarkAsSent} fullWidth>
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
            <Button onClick={handleWebShare} fullWidth>
              📱 공유하기
            </Button>
          )}

          <Button onClick={handleKakaoShare} fullWidth variant="secondary">
            💬 카카오톡으로 공유
          </Button>

          <Button onClick={handleEmailShare} fullWidth variant="secondary">
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
