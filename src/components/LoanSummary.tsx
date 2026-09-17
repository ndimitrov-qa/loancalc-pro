import React from 'react';
import { LoanCalculationResult } from '../types';
import { formatCurrency } from '../utils/loanCalculations';
import { CreditCard, Landmark, Percent, CalendarCheck } from 'lucide-react';

interface LoanSummaryProps {
  result: LoanCalculationResult;
  currencyCode: string;
}

export const LoanSummary: React.FC<LoanSummaryProps> = ({ result, currencyCode }) => {
  const {
    monthlyPayment,
    totalPayment,
    totalPrincipal,
    totalInterest,
    payoffDate,
  } = result;

  const principalPercent = totalPayment > 0 ? (totalPrincipal / totalPayment) * 100 : 100;
  const interestPercent = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  return (
    <div id="loan-summary-card" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-6">
      {/* Primary Highlight: Monthly Payment */}
      <div id="monthly-payment-highlight" className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-300">
            Estimated Monthly Payment
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span id="monthly-payment-value" className="text-4xl font-bold tracking-tight text-white">
              {formatCurrency(monthlyPayment, currencyCode)}
            </span>
            <span className="text-sm font-normal text-slate-400">/ month</span>
          </div>
          {payoffDate && (
            <p className="text-xs text-slate-300 mt-2 flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
              Payoff date: <span className="font-semibold text-white">{payoffDate}</span>
            </p>
          )}
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <div id="summary-metrics-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Principal */}
        <div id="metric-principal" className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Landmark className="w-3.5 h-3.5 text-slate-600" />
            <span>Total Principal</span>
          </div>
          <span id="total-principal-value" className="text-base font-semibold text-slate-900 mt-0.5">
            {formatCurrency(totalPrincipal, currencyCode)}
          </span>
          <span className="text-[11px] text-slate-500">
            {principalPercent.toFixed(1)}% of total cost
          </span>
        </div>

        {/* Total Interest */}
        <div id="metric-interest" className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Percent className="w-3.5 h-3.5 text-amber-600" />
            <span>Total Interest</span>
          </div>
          <span id="total-interest-value" className="text-base font-semibold text-amber-700 mt-0.5">
            {formatCurrency(totalInterest, currencyCode)}
          </span>
          <span className="text-[11px] text-slate-500">
            {interestPercent.toFixed(1)}% of total cost
          </span>
        </div>

        {/* Total Payments */}
        <div id="metric-total-cost" className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total Paid</span>
          </div>
          <span id="total-paid-value" className="text-base font-semibold text-slate-900 mt-0.5">
            {formatCurrency(totalPayment, currencyCode)}
          </span>
          <span className="text-[11px] text-slate-500">
            Principal + Interest
          </span>
        </div>
      </div>

      {/* Visual Composition Bar */}
      <div id="payment-composition-section" className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>Payment Breakdown</span>
          <span className="text-slate-500 text-[11px]">
            Ratio: {principalPercent.toFixed(0)}% Principal / {interestPercent.toFixed(0)}% Interest
          </span>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex" title={`Principal: ${principalPercent.toFixed(1)}%, Interest: ${interestPercent.toFixed(1)}%`}>
          <div
            className="h-full bg-slate-800 transition-all duration-300"
            style={{ width: `${principalPercent}%` }}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${interestPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 inline-block" />
            <span>Principal ({formatCurrency(totalPrincipal, currencyCode)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            <span>Interest ({formatCurrency(totalInterest, currencyCode)})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
