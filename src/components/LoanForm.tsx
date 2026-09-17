import React from 'react';
import { LoanInputs, CurrencyOption } from '../types';
import { CURRENCY_OPTIONS } from '../utils/loanCalculations';
import { DollarSign, Percent, Calendar, RotateCcw, Plus, Minus } from 'lucide-react';

interface LoanFormProps {
  inputs: LoanInputs;
  onChange: (updated: LoanInputs) => void;
  onReset: () => void;
}

const AMOUNT_PRESETS = [10000, 25000, 50000, 100000, 250000, 500000];
const RATE_PRESETS = [3.5, 5.0, 6.5, 7.5, 9.0, 12.0];
const TERM_PRESETS = [
  { label: '1 yr (12 mo)', months: 12 },
  { label: '2 yrs (24 mo)', months: 24 },
  { label: '3 yrs (36 mo)', months: 36 },
  { label: '5 yrs (60 mo)', months: 60 },
  { label: '10 yrs (120 mo)', months: 120 },
  { label: '15 yrs (180 mo)', months: 180 },
  { label: '30 yrs (360 mo)', months: 360 },
];

export const LoanForm: React.FC<LoanFormProps> = ({ inputs, onChange, onReset }) => {
  const currentCurrency = CURRENCY_OPTIONS.find(c => c.code === inputs.currencyCode) || CURRENCY_OPTIONS[0];

  const handleAmountChange = (val: number) => {
    onChange({ ...inputs, loanAmount: Math.max(0, val) });
  };

  const handleRateChange = (val: number) => {
    onChange({ ...inputs, interestRate: Math.max(0, Math.min(100, Math.round(val * 100) / 100)) });
  };

  const handleMonthsChange = (val: number) => {
    onChange({ ...inputs, months: Math.max(1, Math.min(600, Math.round(val))) });
  };

  const yearsEquivalent = (inputs.months / 12).toFixed(1);

  return (
    <div id="loan-inputs-card" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Loan Parameters</h2>
          <p className="text-xs text-slate-500 mt-0.5">Adjust the amount, interest rate, and term below</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Currency Selector */}
          <label htmlFor="currency-select" className="sr-only">Currency</label>
          <select
            id="currency-select"
            value={inputs.currencyCode}
            onChange={(e) => onChange({ ...inputs, currencyCode: e.target.value })}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>

          {/* Reset button */}
          <button
            id="reset-inputs-btn"
            type="button"
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset to default values"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Loan Amount */}
      <div id="loan-amount-section" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label htmlFor="loan-amount-input" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Loan Amount
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="amount-minus-1k"
              onClick={() => handleAmountChange(inputs.loanAmount - 1000)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Minus $1,000"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="amount-plus-1k"
              onClick={() => handleAmountChange(inputs.loanAmount + 1000)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Plus $1,000"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-slate-400 font-semibold text-base pointer-events-none select-none">
            {currentCurrency.symbol}
          </span>
          <input
            id="loan-amount-input"
            type="number"
            min="100"
            max="10000000"
            step="1000"
            value={inputs.loanAmount || ''}
            onChange={(e) => handleAmountChange(Number(e.target.value))}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold text-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
            placeholder="50,000"
          />
        </div>

        {/* Range Slider */}
        <input
          id="loan-amount-slider"
          type="range"
          min="1000"
          max="500000"
          step="1000"
          value={Math.min(inputs.loanAmount, 500000)}
          onChange={(e) => handleAmountChange(Number(e.target.value))}
          className="w-full accent-slate-800 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
        />

        {/* Quick Amount Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {AMOUNT_PRESETS.map((amt) => (
            <button
              key={amt}
              type="button"
              id={`amount-preset-${amt}`}
              onClick={() => handleAmountChange(amt)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                inputs.loanAmount === amt
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {currentCurrency.symbol}{amt >= 1000 ? `${amt / 1000}k` : amt}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interest Rate */}
      <div id="interest-rate-section" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label htmlFor="interest-rate-input" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-blue-600" />
            Annual Interest Rate
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="rate-minus-quarter"
              onClick={() => handleRateChange(inputs.interestRate - 0.25)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Minus 0.25%"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="rate-plus-quarter"
              onClick={() => handleRateChange(inputs.interestRate + 0.25)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Plus 0.25%"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="relative flex items-center">
          <input
            id="interest-rate-input"
            type="number"
            min="0"
            max="100"
            step="0.05"
            value={inputs.interestRate === 0 ? '0' : inputs.interestRate || ''}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold text-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
            placeholder="6.5"
          />
          <span className="absolute right-3.5 text-slate-400 font-semibold text-base pointer-events-none select-none">
            %
          </span>
        </div>

        {/* Range Slider */}
        <input
          id="interest-rate-slider"
          type="range"
          min="0"
          max="25"
          step="0.1"
          value={inputs.interestRate}
          onChange={(e) => handleRateChange(Number(e.target.value))}
          className="w-full accent-slate-800 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
        />

        {/* Quick Rate Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {RATE_PRESETS.map((rate) => (
            <button
              key={rate}
              type="button"
              id={`rate-preset-${rate}`}
              onClick={() => handleRateChange(rate)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                inputs.interestRate === rate
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {rate.toFixed(1)}%
            </button>
          ))}
        </div>
      </div>

      {/* 3. Number of Months (Loan Term) */}
      <div id="loan-term-section" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label htmlFor="loan-months-input" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-600" />
            Number of Months (Loan Term)
          </label>
          <span className="text-xs text-slate-500 font-medium">
            ≈ {yearsEquivalent} {Number(yearsEquivalent) === 1 ? 'year' : 'years'}
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            id="loan-months-input"
            type="number"
            min="1"
            max="600"
            step="1"
            value={inputs.months || ''}
            onChange={(e) => handleMonthsChange(Number(e.target.value))}
            className="w-full pl-3.5 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold text-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
            placeholder="36"
          />
          <span className="absolute right-3.5 text-slate-400 font-medium text-sm pointer-events-none select-none">
            months
          </span>
        </div>

        {/* Range Slider */}
        <input
          id="loan-months-slider"
          type="range"
          min="6"
          max="360"
          step="6"
          value={Math.min(inputs.months, 360)}
          onChange={(e) => handleMonthsChange(Number(e.target.value))}
          className="w-full accent-slate-800 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
        />

        {/* Quick Term Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {TERM_PRESETS.map((t) => (
            <button
              key={t.months}
              type="button"
              id={`term-preset-${t.months}`}
              onClick={() => handleMonthsChange(t.months)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                inputs.months === t.months
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Start Date */}
      <div id="start-date-section" className="flex items-center justify-between pt-2 border-t border-slate-100">
        <label htmlFor="start-date-input" className="text-xs font-medium text-slate-600">
          First Payment Starting Month
        </label>
        <input
          id="start-date-input"
          type="month"
          value={inputs.startDate}
          onChange={(e) => onChange({ ...inputs, startDate: e.target.value })}
          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>
    </div>
  );
};
