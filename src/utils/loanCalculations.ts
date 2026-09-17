import { LoanInputs, LoanCalculationResult, RepaymentScheduleItem, YearlyScheduleItem, CurrencyOption } from '../types';

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AU$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' },
];

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = CURRENCY_OPTIONS.find(c => c.code === currencyCode)?.symbol || '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateLoan(inputs: LoanInputs): LoanCalculationResult {
  const { loanAmount, interestRate, months, startDate } = inputs;

  if (loanAmount <= 0 || months <= 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalPrincipal: 0,
      totalInterest: 0,
      payoffDate: '',
      schedule: [],
      yearlySchedule: [],
      interestPrincipalRatio: 0,
    };
  }

  const [startYearStr, startMonthStr] = startDate.split('-');
  const startYear = parseInt(startYearStr, 10) || new Date().getFullYear();
  const startMonth = parseInt(startMonthStr, 10) || (new Date().getMonth() + 1);

  const monthlyRate = interestRate > 0 ? (interestRate / 100) / 12 : 0;
  
  let baseMonthlyPayment = 0;
  if (monthlyRate === 0) {
    baseMonthlyPayment = loanAmount / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    baseMonthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
  }

  let remainingBalance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let totalPaid = 0;

  const schedule: RepaymentScheduleItem[] = [];
  const yearlyMap = new Map<number, YearlyScheduleItem>();

  for (let i = 1; i <= months; i++) {
    // Determine payment calendar month & year
    const totalMonthOffset = startMonth - 1 + (i - 1);
    const itemYear = startYear + Math.floor(totalMonthOffset / 12);
    const itemMonth = (totalMonthOffset % 12) + 1;
    
    // Format date string (e.g. "Oct 2026")
    const dateObj = new Date(itemYear, itemMonth - 1, 1);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    let interestPayment = remainingBalance * monthlyRate;
    let principalPayment = baseMonthlyPayment - interestPayment;
    let currentPayment = baseMonthlyPayment;

    // Boundary check for last month or edge rounding
    if (i === months || principalPayment > remainingBalance) {
      principalPayment = remainingBalance;
      currentPayment = principalPayment + interestPayment;
      remainingBalance = 0;
    } else {
      remainingBalance = Math.max(0, remainingBalance - principalPayment);
    }

    cumulativeInterest += interestPayment;
    cumulativePrincipal += principalPayment;
    totalPaid += currentPayment;

    const scheduleItem: RepaymentScheduleItem = {
      monthIndex: i,
      dateStr,
      calendarYear: itemYear,
      calendarMonth: itemMonth,
      payment: currentPayment,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance,
      cumulativeInterest,
      cumulativePrincipal,
    };

    schedule.push(scheduleItem);

    // Grouping by calendar year for yearly summary
    if (!yearlyMap.has(itemYear)) {
      yearlyMap.set(itemYear, {
        yearIndex: yearlyMap.size + 1,
        calendarYear: itemYear,
        payment: 0,
        principal: 0,
        interest: 0,
        endingBalance: remainingBalance,
        monthsCount: 0,
      });
    }

    const yearEntry = yearlyMap.get(itemYear)!;
    yearEntry.payment += currentPayment;
    yearEntry.principal += principalPayment;
    yearEntry.interest += interestPayment;
    yearEntry.endingBalance = remainingBalance;
    yearEntry.monthsCount += 1;
  }

  const yearlySchedule = Array.from(yearlyMap.values());
  const lastItem = schedule[schedule.length - 1];
  const payoffDate = lastItem ? lastItem.dateStr : '';
  const interestPrincipalRatio = loanAmount > 0 ? (cumulativeInterest / loanAmount) * 100 : 0;

  return {
    monthlyPayment: baseMonthlyPayment,
    totalPayment: totalPaid,
    totalPrincipal: loanAmount,
    totalInterest: cumulativeInterest,
    payoffDate,
    schedule,
    yearlySchedule,
    interestPrincipalRatio,
  };
}

export function exportScheduleToCSV(schedule: RepaymentScheduleItem[], currencyCode: string, loanAmount: number): void {
  const headers = ['Payment #', 'Date', 'Payment', 'Principal', 'Interest', 'Total Interest Paid', 'Remaining Balance'];
  const rows = schedule.map(item => [
    item.monthIndex,
    `"${item.dateStr}"`,
    item.payment.toFixed(2),
    item.principal.toFixed(2),
    item.interest.toFixed(2),
    item.cumulativeInterest.toFixed(2),
    item.remainingBalance.toFixed(2),
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Loan_Repayment_Schedule_${currencyCode}_${loanAmount}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
