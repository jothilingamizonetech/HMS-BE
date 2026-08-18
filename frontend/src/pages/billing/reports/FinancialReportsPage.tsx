import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBilling } from '../../../context/BillingContext';
import {
  BarChart3,
  Printer,
  Download,
  CalendarDays,
  Wallet,
  Building2,
  UserCheck,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  Percent,
  RefreshCw,
  Clock,
} from 'lucide-react';

export const FinancialReportsPage: React.FC = () => {
  const { bills, collections, refunds, discounts, supplierPayables, kpis } = useBilling();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'daily';

  const [dateRange, setDateRange] = useState('Today');

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hospital Financial Reports & Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive 16+ financial auditing, cashier collection, doctor revenue, and net revenue reporting suite.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2"
          >
            <option value="Today">Today</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl overflow-x-auto text-xs font-bold">
        {[
          { id: 'daily', name: 'Daily Collection', icon: CalendarDays },
          { id: 'payment-mode', name: 'Payment Mode', icon: Wallet },
          { id: 'department', name: 'Department Revenue', icon: Building2 },
          { id: 'doctor', name: 'Doctor Revenue', icon: UserCheck },
          { id: 'revenue-expense', name: 'Revenue vs Expense', icon: TrendingUp },
          { id: 'cashier', name: 'Shift Collection', icon: DollarSign },
          { id: 'discounts-refunds', name: 'Discounts & Refunds', icon: Percent },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive ? 'bg-white text-blue-600 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body */}
      {/* TAB 1: Daily Collection Report */}
      {activeTab === 'daily' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Daily Billing Collection Report
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Billing Staff</th>
                  <th className="px-4 py-3 text-right">Cash (₹)</th>
                  <th className="px-4 py-3 text-right">UPI (₹)</th>
                  <th className="px-4 py-3 text-right">Card (₹)</th>
                  <th className="px-4 py-3 text-right">Bank Transfer (₹)</th>
                  <th className="px-4 py-3 text-right">Gross Total (₹)</th>
                  <th className="px-4 py-3 text-right">Refunds (₹)</th>
                  <th className="px-4 py-3 text-right">Net Collection (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">Today ({new Date().toISOString().split('T')[0]})</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">Sunita Sharma (Desk 1)</td>
                  <td className="px-4 py-3 text-right font-bold">₹45,000</td>
                  <td className="px-4 py-3 text-right font-bold">₹72,500</td>
                  <td className="px-4 py-3 text-right font-bold">₹55,000</td>
                  <td className="px-4 py-3 text-right font-bold">₹30,000</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">₹2,02,500</td>
                  <td className="px-4 py-3 text-right text-rose-600 font-bold">₹1,500</td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-black text-sm">₹2,01,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Payment Mode Breakdown */}
      {activeTab === 'payment-mode' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Payment Mode-wise Collection Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-[10px] font-extrabold text-emerald-800 uppercase">Cash Collection</p>
              <p className="text-xl font-black text-emerald-900 mt-1">₹45,000</p>
              <p className="text-[10px] text-emerald-700 font-bold mt-1">120 Transactions (21.7%)</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-[10px] font-extrabold text-blue-800 uppercase">UPI / QR Digital</p>
              <p className="text-xl font-black text-blue-900 mt-1">₹72,500</p>
              <p className="text-[10px] text-blue-700 font-bold mt-1">95 Transactions (34.9%)</p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <p className="text-[10px] font-extrabold text-indigo-800 uppercase">Credit / Debit Card</p>
              <p className="text-xl font-black text-indigo-900 mt-1">₹55,000</p>
              <p className="text-[10px] text-indigo-700 font-bold mt-1">60 Transactions (26.5%)</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <p className="text-[10px] font-extrabold text-purple-800 uppercase">Bank Transfer / NEFT</p>
              <p className="text-xl font-black text-purple-900 mt-1">₹30,000</p>
              <p className="text-[10px] text-purple-700 font-bold mt-1">25 Transactions (14.5%)</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Department Revenue */}
      {activeTab === 'department' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Department-wise Revenue Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 text-right">OPD Revenue</th>
                  <th className="px-4 py-3 text-right">IPD Revenue</th>
                  <th className="px-4 py-3 text-right">Procedure Revenue</th>
                  <th className="px-4 py-3 text-right">Gross Total Revenue</th>
                  <th className="px-4 py-3 text-right">Collected</th>
                  <th className="px-4 py-3 text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-extrabold text-slate-900">Cardiology</td>
                  <td className="px-4 py-3 text-right font-bold">₹45,000</td>
                  <td className="px-4 py-3 text-right font-bold">₹60,000</td>
                  <td className="px-4 py-3 text-right font-bold">₹12,000</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">₹1,17,000</td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-bold">₹1,05,000</td>
                  <td className="px-4 py-3 text-right text-rose-600 font-bold">₹12,000</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-extrabold text-slate-900">Orthopedics</td>
                  <td className="px-4 py-3 text-right font-bold">₹25,000</td>
                  <td className="px-4 py-3 text-right font-bold">₹45,000</td>
                  <td className="px-4 py-3 text-right font-bold">₹6,000</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">₹76,000</td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-bold">₹62,000</td>
                  <td className="px-4 py-3 text-right text-rose-600 font-bold">₹14,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Doctor-wise Revenue */}
      {activeTab === 'doctor' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Doctor-wise Financial Revenue
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Doctor Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 text-center">Consultations</th>
                  <th className="px-4 py-3 text-center">Procedures</th>
                  <th className="px-4 py-3 text-right">Gross Revenue</th>
                  <th className="px-4 py-3 text-right">Discounts</th>
                  <th className="px-4 py-3 text-right">Net Revenue</th>
                  <th className="px-4 py-3 text-right">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-extrabold text-slate-900">Dr. Aris Thorne</td>
                  <td className="px-4 py-3 text-slate-600 font-bold">Cardiology</td>
                  <td className="px-4 py-3 text-center font-bold">42</td>
                  <td className="px-4 py-3 text-center font-bold">12</td>
                  <td className="px-4 py-3 text-right font-bold">₹65,000</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-bold">₹2,500</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">₹62,500</td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-bold">₹60,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Revenue vs Expense */}
      {activeTab === 'revenue-expense' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Hospital Net Revenue Statement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <p className="font-extrabold text-emerald-900 text-sm">Gross Hospital Collections</p>
              <p className="text-2xl font-black text-emerald-700">₹{kpis.total_revenue.toLocaleString('en-IN')}</p>
              <p className="text-slate-600">Sum of OPD, IPD, Lab, Pharmacy & Procedure Collections</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <p className="font-extrabold text-rose-900 text-sm">Relevant Expenses</p>
              <p className="text-2xl font-black text-rose-700">₹{kpis.total_expenses.toLocaleString('en-IN')}</p>
              <p className="text-slate-600">Pharmacy purchases, vendor payables & refunds</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-2">
              <p className="font-extrabold text-cyan-300 text-sm">Net Operating Revenue</p>
              <p className="text-2xl font-black text-emerald-400">₹{kpis.net_revenue.toLocaleString('en-IN')}</p>
              <p className="text-slate-300">Formula: Gross Revenue - Expenses</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Cashier Report */}
      {activeTab === 'cashier' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Shift Collection Summary
          </h3>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs max-w-lg">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Opening Drawer Cash:</span>
              <span className="font-bold text-slate-900">₹5,000</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Cash Collections Today:</span>
              <span className="font-bold text-emerald-700">+ ₹45,000</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Digital / UPI / Card Collections:</span>
              <span className="font-bold text-blue-700">+ ₹1,57,500</span>
            </div>
            <div className="flex justify-between text-rose-600 font-bold">
              <span>Cash Refunds Paid:</span>
              <span>- ₹1,500</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 text-sm border-t border-slate-300 pt-2">
              <span>Closing Cash in Drawer:</span>
              <span className="text-emerald-700">₹48,500</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
