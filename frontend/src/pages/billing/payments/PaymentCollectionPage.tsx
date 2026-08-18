import React, { useState } from 'react';
import { useBilling } from '../../../context/BillingContext';
import { PaymentMode } from '../../../types/billing';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Receipt,
  Printer,
  User,
  Clock,
  DollarSign,
} from 'lucide-react';

export const PaymentCollectionPage: React.FC = () => {
  const { bills, collections, collectPayment, setSelectedReceiptForModal } = useBilling();

  const [selectedBillNo, setSelectedBillNo] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [amountInput, setAmountInput] = useState<number>(0);
  const [txRef, setTxRef] = useState('');
  const [notes, setNotes] = useState('');

  const selectedBill = bills.find((b) => b.bill_number === selectedBillNo);

  const handleBillSelect = (billNo: string) => {
    setSelectedBillNo(billNo);
    const target = bills.find((b) => b.bill_number === billNo);
    if (target) {
      setAmountInput(target.pending_amount);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) {
      alert('Please select a bill to collect payment against.');
      return;
    }
    if (amountInput <= 0) {
      alert('Please enter a positive payment amount.');
      return;
    }

    const payload = {
      receipt_number: `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      bill_id: selectedBill.id,
      bill_number: selectedBill.bill_number,
      patient_name: selectedBill.patient_name,
      uhid: selectedBill.uhid,
      service_type: selectedBill.bill_type,
      total_bill: selectedBill.net_amount,
      previously_paid: selectedBill.paid_amount,
      current_payment: amountInput,
      remaining_due: Math.max(0, selectedBill.pending_amount - amountInput),
      payment_mode: paymentMode,
      transaction_ref: txRef || `${paymentMode.toUpperCase()}-POS`,
      payment_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      collected_by: 'Sunita Sharma (Cashier)',
      branch: selectedBill.branch || 'Main Branch',
      notes,
    };

    const newRc = await collectPayment(payload);
    setSelectedReceiptForModal(newRc);
    setSelectedBillNo('');
    setAmountInput(0);
    setTxRef('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hospital Payment Collection Desk</h1>
        <p className="text-xs text-slate-500 mt-1">
          Receive cash, card, UPI, or bank transfer payments against patient bills and generate immediate official receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Payment Entry Form (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Process New Payment
          </h3>

          <form onSubmit={handleSubmitPayment} className="space-y-4">
            {/* Bill Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Pending / Unpaid Bill</label>
              <select
                value={selectedBillNo}
                onChange={(e) => handleBillSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- Choose Patient Bill --</option>
                {bills
                  .filter((b) => b.payment_status !== 'Paid' && b.payment_status !== 'Cancelled')
                  .map((b) => (
                    <option key={b.bill_number} value={b.bill_number}>
                      {b.bill_number} - {b.patient_name} (Due: ₹{b.pending_amount.toLocaleString('en-IN')})
                    </option>
                  ))}
              </select>
            </div>

            {/* Selected Bill Info Card */}
            {selectedBill && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-900">{selectedBill.patient_name} ({selectedBill.uhid})</p>
                <p className="text-slate-600">Total Net Bill: ₹{selectedBill.net_amount.toLocaleString('en-IN')}</p>
                <p className="text-slate-600">Previously Paid: ₹{selectedBill.paid_amount.toLocaleString('en-IN')}</p>
                <p className="font-extrabold text-rose-700">Outstanding Balance: ₹{selectedBill.pending_amount.toLocaleString('en-IN')}</p>
              </div>
            )}

            {/* Payment Mode */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e: any) => setPaymentMode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe QR</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Bank Transfer">Bank Transfer / NEFT / IMPS</option>
              </select>
            </div>

            {/* Amount Receiving */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Current Amount Being Received (₹)</label>
              <input
                type="number"
                min="1"
                max={selectedBill ? selectedBill.pending_amount : 999999}
                value={amountInput}
                onChange={(e) => setAmountInput(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-emerald-700 text-sm"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Transaction Ref / Cheque / UTR No</label>
              <input
                type="text"
                placeholder="e.g. UPI/981273/ICICI or POS-CARD-991"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Collect Payment & Print Receipt
            </button>
          </form>
        </div>

        {/* Right Column: History of Recent Payment Collections (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Today's Collected Receipts</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {collections.length} Receipts Issued
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Bill No</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3 text-right">Amount Collected</th>
                  <th className="px-4 py-3 text-center">Payment Mode</th>
                  <th className="px-4 py-3">Collected By</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {collections.map((rc) => (
                  <tr key={rc.receipt_number} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-extrabold text-emerald-700">{rc.receipt_number}</td>
                    <td className="px-4 py-3 font-bold text-blue-700">{rc.bill_number}</td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">{rc.patient_name}</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-800 text-sm">
                      ₹{rc.current_payment.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-md">
                        {rc.payment_mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{rc.collected_by}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedReceiptForModal(rc)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer mx-auto"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Print Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
