import type { IncomeType } from '@/types/puby';

export function calculateTaxDeduction(amount: number, incomeType: IncomeType): {
  taxRate: number;
  taxAmount: number;
  netAmount: number;
} {
  switch (incomeType) {
    case 'business': {
      const taxAmount = Math.round(amount * 0.033);
      return { taxRate: 0.033, taxAmount, netAmount: amount - taxAmount };
    }
    case 'other': {
      const taxAmount = Math.round(amount * 0.088);
      return { taxRate: 0.088, taxAmount, netAmount: amount - taxAmount };
    }
    case 'daily_labor': {
      const taxable = Math.max(0, amount - 150000);
      const taxAmount = Math.round(taxable * 0.027);
      return {
        taxRate: amount > 0 ? taxAmount / amount : 0,
        taxAmount,
        netAmount: amount - taxAmount,
      };
    }
  }
}

export function formatTaxRate(incomeType: IncomeType): string {
  switch (incomeType) {
    case 'business': return '3.3%';
    case 'other': return '8.8%';
    case 'daily_labor': return '2.7% (15만원 초과분)';
  }
}
