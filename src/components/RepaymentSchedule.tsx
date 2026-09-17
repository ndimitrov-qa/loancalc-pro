import React, { useState, useMemo } from 'react';
import { RepaymentScheduleItem, YearlyScheduleItem } from '../types';
import { formatCurrency, exportScheduleToCSV } from '../utils/loanCalculations';
import { Download, Printer, Search, ChevronLeft, ChevronRight, Calendar, Layers } from 'lucide-react';

interface RepaymentScheduleProps {
  schedule: RepaymentScheduleItem[];
  yearlySchedule: YearlyScheduleItem[];
  currencyCode: string;
  loanAmount: number;
}

export const RepaymentSchedule: React.FC<RepaymentScheduleProps> = ({
  schedule,
  yearlySchedule,
  currencyCode,
  loanAmount,
}) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(12); // Default to 12 months (1 year per page)

  // Filter items
  const filteredSchedule = useMemo(() => {
    if (!searchTerm.trim()) return schedule;
    const term = searchTerm.toLowerCase().trim();
    return schedule.filter(
      (item) =>
        item.dateStr.toLowerCase().includes(term) ||
        item.monthIndex.toString().includes(term) ||
        item.calendarYear.toString().includes(term)
    );
  }, [schedule, searchTerm]);

  // Pagination calculations for monthly view
  const totalItems = filteredSchedule.length;
  const effectivePageSize = pageSize === -1 ? totalItems : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / (effectivePageSize || 1)));
  
  // Safe page clamp
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * effectivePageSize;
  const endIndex = pageSize === -1 ? totalItems : Math.min(startIndex + effectivePageSize, totalItems);
  const paginatedSchedule = useMemo(() => {
    return filteredSchedule.slice(startIndex, endIndex);
  }, [filteredSchedule, startIndex, endIndex]);

  const handleExportCSV = () => {
    exportScheduleToCSV(schedule, currencyCode, loanAmount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="repayment-schedule-section" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Repayment Schedule</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {schedule.length} payments
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full amortization breakdown of principal, interest, and remaining balance
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div id="view-mode-toggle" className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              id="view-monthly-btn"
              onClick={() => {
                setViewMode('monthly');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Monthly
            </button>
            <button
              type="button"
              id="view-yearly-btn"
              onClick={() => setViewMode('yearly')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'yearly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Annual
            </button>
          </div>

          {/* Export to CSV */}
          <button
            type="button"
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium transition-colors"
            title="Download repayment schedule as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Print */}
          <button
            type="button"
            id="print-schedule-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium transition-colors"
            title="Print schedule"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Filter and Paging Toolbar (for Monthly view) */}
      {viewMode === 'monthly' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Search by date or month */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              id="search-schedule-input"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by date or month #..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
            />
          </div>

          {/* Page Size & Pagination summary */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Show:</span>
              <select
                id="page-size-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 font-medium cursor-pointer"
              >
                <option value={12}>12 mo / page</option>
                <option value={24}>24 mo / page</option>
                <option value={60}>60 mo / page</option>
                <option value={-1}>All ({totalItems})</option>
              </select>
            </div>

            {pageSize !== -1 && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <span className="text-slate-500 mr-1">
                  Page {validPage} of {totalPages}
                </span>
                <button
                  type="button"
                  id="prev-page-btn"
                  disabled={validPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-700"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id="next-page-btn"
                  disabled={validPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-700"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        {viewMode === 'monthly' ? (
          <table id="monthly-schedule-table" className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5 whitespace-nowrap">#</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Date</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Payment</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Principal</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Interest</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Total Interest</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedSchedule.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching payments found
                  </td>
                </tr>
              ) : (
                paginatedSchedule.map((item) => (
                  <tr key={item.monthIndex} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3.5 text-slate-500 font-normal">
                      {item.monthIndex}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-900 whitespace-nowrap">
                      {item.dateStr}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrency(item.payment, currencyCode)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-slate-800 whitespace-nowrap">
                      {formatCurrency(item.principal, currencyCode)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-amber-700 whitespace-nowrap">
                      {formatCurrency(item.interest, currencyCode)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-slate-500 whitespace-nowrap">
                      {formatCurrency(item.cumulativeInterest, currencyCode)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrency(item.remainingBalance, currencyCode)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          /* Yearly Schedule Table */
          <table id="yearly-schedule-table" className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Year</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Calendar Year</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Months</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Total Payment</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Principal Paid</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Interest Paid</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {yearlySchedule.map((item) => (
                <tr key={item.calendarYear} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3.5 text-slate-500 font-normal">
                    Year {item.yearIndex}
                  </td>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                    {item.calendarYear}
                  </td>
                  <td className="py-2.5 px-3.5 text-center text-slate-500">
                    {item.monthsCount}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                    {formatCurrency(item.payment, currencyCode)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right text-slate-800 whitespace-nowrap">
                    {formatCurrency(item.principal, currencyCode)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right text-amber-700 whitespace-nowrap">
                    {formatCurrency(item.interest, currencyCode)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                    {formatCurrency(item.endingBalance, currencyCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer summary bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Showing {viewMode === 'monthly' ? `${startIndex + 1}–${endIndex} of ${totalItems} payments` : `${yearlySchedule.length} years total`}
        </span>
        {viewMode === 'monthly' && pageSize !== -1 && totalPages > 1 && (
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <button
              type="button"
              id="footer-prev-page"
              disabled={validPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              Previous
            </button>
            <span className="text-slate-600">
              {validPage} / {totalPages}
            </span>
            <button
              type="button"
              id="footer-next-page"
              disabled={validPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
