import { useState, useMemo } from 'react';
import { LoanInputs } from './types';
import { calculateLoan } from './utils/loanCalculations';
import { LoanForm } from './components/LoanForm';
import { LoanSummary } from './components/LoanSummary';
import { RepaymentSchedule } from './components/RepaymentSchedule';
import { Calculator } from 'lucide-react';

const DEFAULT_INPUTS: LoanInputs = {
  loanAmount: 25000,
  interestRate: 6.5,
  months: 36,
  startDate: new Date().toISOString().slice(0, 7), // YYYY-MM
  currencyCode: 'USD',
};

export default function App() {
  const [inputs, setInputs] = useState<LoanInputs>(DEFAULT_INPUTS);

  // Compute calculated loan results memoized
  const loanResult = useMemo(() => {
    return calculateLoan(inputs);
  }, [inputs]);

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
  };

  return (
    <div id="loan-calculator-app" className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Loan Calculator</h1>
              <p className="text-xs text-slate-500">Calculate payments and repayment schedule</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md font-medium text-slate-700">
              Loan: {inputs.loanAmount ? inputs.loanAmount.toLocaleString() : 0} {inputs.currencyCode}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md font-medium text-slate-700">
              Rate: {inputs.interestRate}%
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md font-medium text-slate-700">
              Term: {inputs.months} mo
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top Grid: Parameters and Calculation Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Loan Input Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <LoanForm
              inputs={inputs}
              onChange={setInputs}
              onReset={handleReset}
            />
          </div>

          {/* Right Column: Loan Summary & Payment Highlight (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <LoanSummary
              result={loanResult}
              currencyCode={inputs.currencyCode}
            />
          </div>
        </div>

        {/* Full-Width Section: Repayment Schedule Table */}
        <div className="w-full">
          <RepaymentSchedule
            schedule={loanResult.schedule}
            yearlySchedule={loanResult.yearlySchedule}
            currencyCode={inputs.currencyCode}
            loanAmount={inputs.loanAmount}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Standard fixed-rate amortization schedule</span>
          <span>{loanResult.schedule.length} total monthly installments calculated</span>
        </div>
      </footer>
    </div>
  );
}
