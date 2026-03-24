import type { PubyExpense } from '@/types/puby';
import { calculateTaxDeduction } from './tax';

const TYPE_LABELS: Record<string, string> = {
  labor: '인건비', vendor: '업체', card: '카드',
};

const STATUS_LABELS: Record<string, string> = {
  draft: '작성중', submitted: '제출됨', manager_approved: '팀장승인',
  approved: '최종승인', rejected: '반려', completed: '완료',
};

export function exportExpensesToCsv(expenses: PubyExpense[], projectNames: Map<string, string>, userNames: Map<string, string>) {
  const headers = ['날짜', '프로젝트', '유형', '금액', '원천징수', '실지급액', '상태', '작성자'];

  const rows = expenses.map((exp) => {
    let taxAmount = 0;
    let netAmount = exp.amount;
    if (exp.type === 'labor' && exp.laborDetails) {
      const calc = calculateTaxDeduction(exp.amount, exp.laborDetails.taxType);
      taxAmount = calc.taxAmount;
      netAmount = calc.netAmount;
    }

    return [
      exp.createdAt?.toDate?.()?.toISOString().slice(0, 10) || '',
      projectNames.get(exp.projectId) || '',
      TYPE_LABELS[exp.type] || exp.type,
      exp.amount.toLocaleString('ko-KR'),
      taxAmount.toLocaleString('ko-KR'),
      netAmount.toLocaleString('ko-KR'),
      STATUS_LABELS[exp.status] || exp.status,
      userNames.get(exp.createdBy) || '',
    ].map((val) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
  });

  const BOM = '\uFEFF';
  const csv = BOM + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
