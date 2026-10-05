import Modal from './Modal';
import Button from './Button';
import { PREMIUM_CHECKOUT_URL } from '@/lib/checkout';
import { useAuth } from '@/lib/auth-context';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
}

export default function PaywallModal({ isOpen, onClose, currentCount }: PaywallModalProps) {
  const { user } = useAuth();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="무료 한도 초과" size="md">
      <div className="space-y-4">
        <div className="text-center py-2">
          <p className="text-lg text-gray-900 mb-2">
            무료 3건까지 사용 가능하며,<br />
            이후에는 월 4,900원입니다.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">
            이번 달 사용량: <span className="font-semibold">{currentCount}/3건</span>
          </p>
          <p className="text-sm text-gray-500">
            한 거래 건에는 견적서와 청구서가 함께 포함됩니다.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">프리미엄 혜택</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              워터마크 제거
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              로고 및 브랜드 색상
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              문서번호 자동 생성
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              입금 상태 추적 및 검색
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              무제한 거래 건
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} fullWidth>
            나중에 보기
          </Button>
          <a
            href={PREMIUM_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full text-center"
          >
            월 4,900원으로 시작하기
          </a>
        </div>
        <p className="text-xs text-center text-gray-500">
          결제할 때 이메일은 견적함 아이디 이메일과 같아야 프리미엄이 바로 적용됩니다.
        </p>
        {user && (
          <p className="text-xs text-center text-gray-600 bg-gray-50 rounded px-2 py-1">
            지금 로그인된 아이디: <span className="font-semibold break-all">{user.email}</span>
          </p>
        )}
      </div>
    </Modal>
  );
}
