import { ref, uploadBytes, getDownloadURL, getBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import type { PubyExpense, ExpenseFile } from '@/types/puby';

const TYPE_PREFIX: Record<string, string> = {
  vendor: '업체지결',
  labor: '인건비지결',
  card: '카드지결',
};

function sanitize(s: string) {
  return (s || '').replace(/[\/\\:*?"<>|]/g, '_').trim().slice(0, 50);
}

function formatAmount(n: number) {
  return n.toLocaleString('ko-KR');
}

/**
 * 결의 데이터 기반 폴더명 생성
 * 형식: {유형지결}_{yymmdd}_{hhmm}_{프로젝트명}_{대상}_{비고/금액}
 */
export function buildFolderName(expense: PubyExpense, projectName: string): string {
  const date = expense.createdAt?.toDate?.() || new Date();
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const timestamp = `${yy}${mm}${dd}_${hh}${mi}`;

  const prefix = TYPE_PREFIX[expense.type] || expense.type;
  const proj = sanitize(projectName);

  if (expense.type === 'vendor' && expense.vendorDetails) {
    const v = expense.vendorDetails;
    return `${prefix}_${timestamp}_${proj}_${sanitize(v.companyName)}_${sanitize(v.description)}_${formatAmount(expense.amount)}`;
  }
  if (expense.type === 'labor' && expense.laborDetails) {
    const l = expense.laborDetails;
    return `${prefix}_${timestamp}_${proj}_${sanitize(l.name)}_${formatAmount(expense.amount)}`;
  }
  if (expense.type === 'card' && expense.cardDetails) {
    const c = expense.cardDetails;
    return `${prefix}_${timestamp}_${proj}_${sanitize(c.storeName)}_${formatAmount(expense.amount)}`;
  }

  return `${prefix}_${timestamp}_${proj}_${formatAmount(expense.amount)}`;
}

/**
 * 결의의 모든 파일(증빙 + 캐시 + 기타)을 구조화된 폴더에 복사
 */
export async function copyFilesToFolder(expense: PubyExpense, projectName: string): Promise<string> {
  const folderName = buildFolderName(expense, projectName);
  const basePath = `puby/organized/${folderName}`;

  const allFiles: ExpenseFile[] = [
    ...(expense.files || []),
    ...(expense.extraFiles || []),
  ];

  // URL에서 파일을 가져와서 새 경로에 복사
  await Promise.all(
    allFiles.map(async (file) => {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const destRef = ref(storage, `${basePath}/${file.name}`);
        await uploadBytes(destRef, blob);
      } catch (err) {
        console.error(`Failed to copy file ${file.name}:`, err);
      }
    })
  );

  return basePath;
}
