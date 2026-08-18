import React, { useState } from 'react';
import { useBilling } from '../../../context/BillingContext';
import { useAuth } from '../../../context/AuthContext';
import { RefreshCw, PlusCircle, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export const RefundsPage: React.FC = () => {
  const { refunds, requestRefund, approveRefund } = useBilling();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [billNumber, setBillNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [uhid, setUhid] = useState('');
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billNumber || !patientName || !refundReason || refundAmount <= 0) {
      alert('Please fill in all mandatory refund details.');
      return;
    }

    await requestRefund({
      bill_number: billNumber,
      patient_name: patientName,
      uhid: uhid || 'UHID-2026-9999',
      original_amount: originalAmount,
      paid_amount: paidAmount,
      refund_amount: refundAmount,
      refund_reason: refundReason,
      refund_mode: 'Cash',
      requested_by: user?.name || 'Billing Officer',
    });

    setShowModal(false);
    setBillNumber('');
    setPatientName('');
    setRefundReason('');
    setRefundAmount(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hospital Refund Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Process payment refunds for cancelled procedures or duplicate test collections with manager approvals.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Initiate Refund Request
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            Total Refund Requests: <span className="text-slate-900 font-extrabold">{refunds.length}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Refund Code</th>
                <th className="px-4 py-3">Bill Number</th>
                <th className="px-4 py-3">Patient Name</th>
                <th className="px-4 py-3 text-right">Original Paid</th>
                <th className="px-4 py-3 text-right">Refund Amount</th>
                <th className="px-4 py-3">Refund Reason</th>
                <th className="px-4 py-3">Requested By</th>
                <th className="px-4 py-3">Approved By</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {refunds.map((ref) => (
                <tr key={ref.refund_code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-extrabold text-rose-700">{ref.refund_code}</td>
                  <td className="px-4 py-3 font-bold text-blue-700">{ref.bill_number}</td>
                  <td className="px-4 py-3 font-extrabold text-slate-900">{ref.patient_name}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">
                    ₹{ref.paid_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-rose-700 text-sm">
                    ₹{ref.refund_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{ref.refund_reason}</td>
                  <td className="px-4 py-3 text-slate-600">{ref.requested_by}</td>
                  <td className="px-4 py-3 text-slate-600">{ref.approved_by || 'Pending Manager'}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        ref.status === 'Processed' || ref.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {ref.status === 'Requested' ? (
                      <button
                        onClick={() => approveRefund(ref.refund_code, user?.name || 'Finance Manager')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-md shadow-xs transition-colors cursor-pointer"
                      >
                        Approve Refund
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Refund Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-rose-600" />
              Request Patient Refund
            </h3>

            <form onSubmit={handleSubmitRefund} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bill Number</label>
                <input
                  type="text"
                  placeholder="e.g. BILL-2026-00099"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Patient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sanjay Verma"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Refund Amount (₹)</label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-rose-600 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Refund Reason</label>
                <textarea
                  rows={2}
                  placeholder="Reason for refunding patient..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  Submit Refund Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
