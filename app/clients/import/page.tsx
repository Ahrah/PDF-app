'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Client, ClientColumnKey, CLIENT_COLUMN_KEYS, ImportRow, ImportDuplicateAction } from '@/lib/types';
import {
  parseImportFile,
  autoMapHeaders,
  buildImportRow,
  findDuplicateInList,
  findDuplicateWithinBatch,
  downloadCSVTemplate,
  MAX_IMPORT_FILE_SIZE,
  MAX_IMPORT_ROWS,
} from '@/lib/import';

type Step = 'upload' | 'mapping' | 'preview' | 'result';

const COLUMN_LABELS: Record<ClientColumnKey, string> = {
  company: '회사명',
  contactName: '담당자',
  name: '고객명',
  email: '이메일',
  phone: '전화번호',
  businessNumber: '사업자번호',
  address: '주소',
  memo: '비고',
};

interface ImportResult {
  total: number;
  created: number;
  updated: number;
  excluded: number;
  failed: number;
  errors: { rowIndex: number; message: string }[];
}

export default function ClientImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, ClientColumnKey | ''>>({});
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [existingClients, setExistingClients] = useState<Client[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFile(file: File | null) {
    setError('');
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.csv') && !lowerName.endsWith('.xlsx')) {
      setError('.xlsx 또는 .csv 파일만 업로드할 수 있어요.');
      return;
    }
    if (file.size > MAX_IMPORT_FILE_SIZE) {
      setError('파일 크기는 5MB를 넘을 수 없어요.');
      return;
    }

    try {
      const parsed = await parseImportFile(file);
      if (parsed.rows.length === 0) {
        setError('파일에서 데이터를 찾을 수 없어요. 첫 행이 제목(컬럼명)인지 확인해 주세요.');
        return;
      }
      if (parsed.rows.length > MAX_IMPORT_ROWS) {
        setError(`한 번에 최대 ${MAX_IMPORT_ROWS}명까지 등록할 수 있어요. 파일을 나눠서 업로드해 주세요.`);
        return;
      }

      const clientsRes = await fetch('/api/clients');
      const clients: Client[] = clientsRes.ok ? await clientsRes.json() : [];

      setFileName(file.name);
      setHeaders(parsed.headers);
      setRawRows(parsed.rows);
      setColumnMap(autoMapHeaders(parsed.headers));
      setExistingClients(clients);
      setStep('mapping');
    } catch (err) {
      console.error(err);
      setError('파일을 읽지 못했어요. 파일 형식을 확인해 주세요.');
    }
  }

  function proceedToPreview() {
    const built = rawRows.map((raw, idx) => buildImportRow(idx, raw, columnMap));

    // duplicate detection against existing DB clients + within this batch
    const withDupes = built.map((row, idx) => {
      if (row.status === 'excluded') return row;

      const dupInDb = findDuplicateInList(existingClients, {
        businessNumber: row.mapped.businessNumber,
        email: row.mapped.email,
        phone: row.mapped.phone,
        company: row.mapped.company,
      });
      if (dupInDb) {
        return {
          ...row,
          status: 'warning' as const,
          issues: [...row.issues, `중복 후보: ${dupInDb.reason}`],
          duplicateOfClientId: dupInDb.client.id,
          duplicateReason: dupInDb.reason,
          action: 'keep_existing' as ImportDuplicateAction,
        };
      }

      if (findDuplicateWithinBatch(built, idx)) {
        return {
          ...row,
          status: 'warning' as const,
          issues: [...row.issues, '업로드 파일 내에서 중복된 행이 있어요.'],
        };
      }

      return row;
    });

    setRows(withDupes);
    setStep('preview');
  }

  function updateRowAction(rowIndex: number, action: ImportDuplicateAction) {
    setRows((prev) => prev.map((r) => (r.rowIndex === rowIndex ? { ...r, action } : r)));
  }

  const summary = useMemo(() => {
    const ok = rows.filter((r) => r.status !== 'excluded' && r.action !== 'exclude').length;
    const excluded = rows.filter((r) => r.status === 'excluded' || r.action === 'exclude').length;
    const dupes = rows.filter((r) => r.duplicateOfClientId).length;
    return { total: rows.length, willImport: ok, excluded, dupes };
  }, [rows]);

  async function handleConfirmImport() {
    setSubmitting(true);
    setError('');
    try {
      const payload = rows
        .filter((r) => r.status !== 'excluded')
        .map((r) => ({
          mapped: r.mapped,
          action: r.action,
          duplicateOfClientId: r.duplicateOfClientId,
        }));

      const res = await fetch('/api/clients/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '일괄등록에 실패했어요.');
        return;
      }
      setResult(data);
      setStep('result');
    } catch (err) {
      setError('네트워크 오류가 발생했어요. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep('upload');
    setFileName('');
    setHeaders([]);
    setRawRows([]);
    setColumnMap({});
    setRows([]);
    setResult(null);
    setError('');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/clients" className="text-primary-600 hover:text-primary-700 inline-flex items-center">
          ← 고객 목록으로
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">고객 일괄등록</h1>
        <Button variant="secondary" onClick={downloadCSVTemplate}>양식 다운로드</Button>
      </div>

      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        {(['upload', 'mapping', 'preview', 'result'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step === s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </span>
            <span className={step === s ? 'text-gray-900 font-medium' : ''}>
              {{ upload: '파일 업로드', mapping: '컬럼 매핑', preview: '검증 및 미리보기', result: '결과' }[s]}
            </span>
            {i < 3 && <span className="mx-1 text-gray-300">→</span>}
          </div>
        ))}
      </div>

      {error && (
        <Card className="mb-6 bg-danger-50 border-danger-200">
          <p className="text-sm text-danger-700">{error}</p>
        </Card>
      )}

      {step === 'upload' && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">.xlsx 또는 .csv 파일을 업로드하세요.</p>
            <p className="text-sm text-gray-400 mb-6">최대 5MB, {MAX_IMPORT_ROWS}명까지 한 번에 등록할 수 있어요.</p>
            <label className="inline-block">
              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
              <span className="btn-primary cursor-pointer">파일 선택</span>
            </label>
          </div>
        </Card>
      )}

      {step === 'mapping' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">컬럼 매핑</h2>
          <p className="text-sm text-gray-500 mb-6">
            {fileName} · {rawRows.length}행 감지됨. 자동으로 인식된 컬럼을 확인하고 필요하면 수정하세요.
          </p>
          <div className="space-y-3">
            {headers.map((header) => (
              <div key={header} className="flex items-center gap-4">
                <div className="w-1/3 text-sm text-gray-700 break-words">{header}</div>
                <div className="text-gray-400">→</div>
                <select
                  className="input flex-1"
                  value={columnMap[header] || ''}
                  onChange={(e) =>
                    setColumnMap((prev) => ({ ...prev, [header]: e.target.value as ClientColumnKey | '' }))
                  }
                >
                  <option value="">(사용 안 함)</option>
                  {CLIENT_COLUMN_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {COLUMN_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <Button variant="secondary" onClick={reset} className="flex-1">다시 업로드</Button>
            <Button onClick={proceedToPreview} className="flex-1">다음: 검증 및 미리보기</Button>
          </div>
        </Card>
      )}

      {step === 'preview' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">검증 및 미리보기</h2>
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <span className="badge badge-gray">전체 {summary.total}행</span>
            <span className="badge badge-primary">등록 예정 {summary.willImport}</span>
            <span className="badge badge-gray">제외 {summary.excluded}</span>
            {summary.dupes > 0 && <span className="badge-warning">중복 후보 {summary.dupes}</span>}
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="px-4 sm:px-0 space-y-2" style={{ minWidth: 720 }}>
              {rows.map((row) => (
                <div
                  key={row.rowIndex}
                  className={`p-3 rounded-lg border text-sm ${
                    row.status === 'excluded'
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : row.status === 'warning'
                      ? 'bg-warning-50 border-warning-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {row.mapped.company || row.mapped.name || '(이름 없음)'}
                        {row.mapped.company && row.mapped.contactName && (
                          <span className="text-gray-500 font-normal"> · {row.mapped.contactName}</span>
                        )}
                      </p>
                      <p className="text-gray-500">
                        {[row.mapped.email, row.mapped.phone].filter(Boolean).join(' · ') || '연락처 없음'}
                      </p>
                      {row.issues.length > 0 && (
                        <ul className="mt-1 text-xs text-warning-700 list-disc list-inside">
                          {row.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {row.status === 'excluded' ? (
                      <span className="badge badge-gray flex-shrink-0">등록 제외</span>
                    ) : row.duplicateOfClientId ? (
                      <select
                        className="input text-xs py-1 flex-shrink-0"
                        value={row.action}
                        onChange={(e) => updateRowAction(row.rowIndex, e.target.value as ImportDuplicateAction)}
                      >
                        <option value="keep_existing">기존 고객 유지 (건너뛰기)</option>
                        <option value="update_existing">기존 고객 정보 업데이트</option>
                        <option value="create_new">새 고객으로 추가</option>
                        <option value="exclude">이 행 제외</option>
                      </select>
                    ) : (
                      <span className="badge badge-primary flex-shrink-0">등록</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button variant="secondary" onClick={() => setStep('mapping')} className="flex-1">이전</Button>
            <Button onClick={handleConfirmImport} disabled={submitting || summary.willImport === 0} className="flex-1">
              {submitting ? '등록 중...' : `${summary.willImport}명 등록하기`}
            </Button>
          </div>
        </Card>
      )}

      {step === 'result' && result && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">등록 완료</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{result.total}</p>
              <p className="text-xs text-gray-500 mt-1">총 처리</p>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-700">{result.created}</p>
              <p className="text-xs text-gray-500 mt-1">등록 완료</p>
            </div>
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <p className="text-2xl font-bold text-success-700">{result.updated}</p>
              <p className="text-xs text-gray-500 mt-1">기존 고객 업데이트</p>
            </div>
            <div className="text-center p-4 bg-danger-50 rounded-lg">
              <p className="text-2xl font-bold text-danger-700">{result.failed}</p>
              <p className="text-xs text-gray-500 mt-1">오류</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-2">오류 발생 행</p>
              <ul className="text-sm text-danger-700 space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i}>#{e.rowIndex + 1}행: {e.message}</li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-2">오류가 발생한 행을 파일에서 수정한 뒤 다시 업로드해 주세요.</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={reset} className="flex-1">다시 업로드</Button>
            <Button onClick={() => router.push('/clients')} className="flex-1">고객 목록 보기</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
