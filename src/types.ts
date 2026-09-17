export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export interface LoanInputs {
  loanAmount: number;
  interestRate: number; // annual % (e.g. 7.5)
  months: number;       // total months
  startDate: string;    // YYYY-MM
  currencyCode: string; // e.g. 'USD'
}

export interface RepaymentScheduleItem {
  monthIndex: number;
  dateStr: string;
  calendarYear: number;
  calendarMonth: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface YearlyScheduleItem {
  yearIndex: number;
  calendarYear: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
  monthsCount: number;
}

export interface LoanCalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  payoffDate: string;
  schedule: RepaymentScheduleItem[];
  yearlySchedule: YearlyScheduleItem[];
  interestPrincipalRatio: number;
}
