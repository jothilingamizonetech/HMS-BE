import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBilling } from '../../../context/BillingContext';
import { useHMS } from '../../../context/HMSContext';
import { BillItem, BillType, PaymentMode } from '../../../types/billing';
import {
  PlusCircle,
  Trash2,
  Search,
  User,
  CheckCircle2,
  FileText,
  Percent,
  Calculator,
  ArrowLeft,
  Building2,
  Stethoscope,
} from 'lucide-react';

export const CreateBillPage: React.FC = () => {
  const navigate = useNavigate();
  const { createNewBill } = useBilling();
  const { patients } = useHMS();

  // Patient Search & Selection
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Form Fields
  const [billType, setBillType] = useState<BillType>('OPD');
  const [department, setDepartment] = useState('General OPD');
  const [doctorName, setDoctorName] = useState('Dr. Aris Thorne');
  const [appointmentId, setAppointmentId] = useState('');
  const [ipdNumber, setIpdNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Line Items
  const [items, setItems] = useState<BillItem[]>([
    {
      service_name: 'Specialist Consultation Charge',
      category: 'OPD',
      description: 'Standard OPD Senior Doctor Consultation',
      quantity: 1,
      unit_price: 800,
      gross_amount: 800,
      discount: 0,
      tax: 0,
      net_amount: 800,
    },
  ]);

  const filteredPatients = patientSearch.trim()
    ? patients.filter(
        (p) =>
          p.firstName.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.lastName.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.uhid.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.mobile.includes(patientSearch)
      )
    : [];

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        service_name: '',
        category: 'General',
        description: '',
        quantity: 1,
        unit_price: 0,
        gross_amount: 0,
        discount: 0,
        tax: 0,
        net_amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof BillItem, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const updated = { ...item, [field]: value };
          const qty = Number(updated.quantity) || 1;
          const rate = Number(updated.unit_price) || 0;
          const disc = Number(updated.discount) || 0;
          const tax = Number(updated.tax) || 0;
          const gross = qty * rate;
          const net = Math.max(0, gross - disc + tax);
          return {
            ...updated,
            gross_amount: gross,
            net_amount: net,
          };
        }
        return item;
      })
    );
  };

  const totalGross = items.reduce((acc, item) => acc + (item.gross_amount || 0), 0);
  const totalDiscount = items.reduce((acc, item) => acc + (item.discount || 0), 0);
  const totalTax = items.reduce((acc, item) => acc + (item.tax || 0), 0);
  const totalNet = Math.max(0, totalGross - totalDiscount + totalTax);
  const pendingAmount = Math.max(0, totalNet - initialPayment);

  const handleGenerateBill = async () => {
    if (!selectedPatient) {
      alert('Please search and select a patient to generate the bill.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one billable line item.');
      return;
    }

    const payload = {
      patient_id: selectedPatient.id,
      patient_name: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      uhid: selectedPatient.uhid,
      appointment_id: appointmentId || undefined,
      ipd_number: ipdNumber || undefined,
      bill_type: billType,
      department,
      doctor_name: doctorName,
      gross_amount: totalGross,
      discount_amount: totalDiscount,
      tax_amount: totalTax,
      net_amount: totalNet,
      paid_amount: initialPayment,
      pending_amount: pendingAmount,
      payment_mode: paymentMode,
      payment_status: pendingAmount <= 0 ? 'Paid' : initialPayment > 0 ? 'Partially Paid' : 'Pending',
      bill_date: new Date().toISOString().split('T')[0],
      billing_staff: 'Ramesh Finance',
      branch: selectedPatient.branch || 'Main Branch',
      notes,
      items,
    };

    await createNewBill(payload as any);
    navigate('/billing/invoices');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Create New Hospital Bill</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select patient, specify bill category, add service items, and calculate totals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/billing/invoices')}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateBill}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Generate Bill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Search & Metadata (1 col) */}
        <div className="space-y-6">
          {/* Patient Lookup Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Patient Selection
            </h3>

            {/* Patient Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Patient Name, UHID, Mobile..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {filteredPatients.length > 0 && !selectedPatient && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-48 overflow-y-auto z-20">
                  {filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPatient(p);
                        setPatientSearch('');
                      }}
                      className="w-full text-left p-3 hover:bg-blue-50/60 border-b border-slate-100 text-xs cursor-pointer"
                    >
                      <p className="font-bold text-slate-900">{p.firstName} {p.lastName}</p>
                      <p className="text-[10px] text-slate-500">UHID: {p.uhid} | {p.mobile}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Patient Banner */}
            {selectedPatient ? (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </span>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="text-[10px] text-blue-600 underline font-bold"
                  >
                    Change
                  </button>
                </div>
                <p className="text-slate-600 font-medium">
                  UHID: <span className="font-bold text-blue-700">{selectedPatient.uhid}</span>
                </p>
                <p className="text-slate-600 font-medium">Gender/Age: {selectedPatient.gender}, {selectedPatient.age}y</p>
                <p className="text-slate-600 font-medium">Mobile: {selectedPatient.mobile}</p>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                Please search and select a registered patient to attach to this financial bill.
              </div>
            )}
          </div>

          {/* Bill Category & Department Metadata */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Bill Metadata & Type
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bill Service Category</label>
                <select
                  value={billType}
                  onChange={(e: any) => setBillType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                >
                  <option value="OPD">OPD Consultation Billing</option>
                  <option value="IPD">IPD Admission Billing</option>
                  <option value="Lab">Laboratory Test Billing</option>
                  <option value="Pharmacy">Pharmacy Sales Billing</option>
                  <option value="Procedure">Procedure / Diagnostic Billing</option>
                  <option value="Other">Other Billable Hospital Service</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hospital Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Consulting Doctor</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>

              {billType === 'OPD' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Appointment ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. APT-2026-001"
                    value={appointmentId}
                    onChange={(e) => setAppointmentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>
              )}

              {billType === 'IPD' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">IPD Admission No (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. IPD-2026-088"
                    value={ipdNumber}
                    onChange={(e) => setIpdNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Line Items & Calculation Summary (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billable Items Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">Billable Line Items</h3>
              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Service Name</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-3 py-2.5 text-right">Unit Price (₹)</th>
                    <th className="px-3 py-2.5 text-right">Discount (₹)</th>
                    <th className="px-3 py-2.5 text-right">Net Amount (₹)</th>
                    <th className="px-3 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder="e.g. ECG Test / Consultation / Room Charge"
                          value={item.service_name}
                          onChange={(e) => handleItemChange(index, 'service_name', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="w-16 bg-slate-50 border border-slate-200 rounded-lg p-2 text-center font-bold"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                          className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-2 text-right font-bold"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                          className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-2 text-right font-bold text-emerald-600"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-black text-slate-900 text-sm">
                        ₹{item.net_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Collection & Calculation Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              Bill Summary & Payment Collection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Payment Details Form */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e: any) => setPaymentMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                  >
                    <option value="Cash">Cash Collection</option>
                    <option value="UPI">UPI / Digital QR</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Payment Amount Received (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={totalNet}
                    value={initialPayment}
                    onChange={(e) => setInitialPayment(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-emerald-700 text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Billing Notes / Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Enter any billing concessions or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              {/* Calculation Totals */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Gross Amount:</span>
                  <span className="font-bold text-slate-800">₹{totalGross.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Total Discount:</span>
                  <span className="font-bold">- ₹{totalDiscount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Tax:</span>
                  <span className="font-bold">₹{totalTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-300 pt-2">
                  <span>Grand Total Net Amount:</span>
                  <span className="text-blue-700">₹{totalNet.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-100/70 p-2 rounded-lg">
                  <span>Amount Collected Now:</span>
                  <span>₹{initialPayment.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold bg-rose-100/70 p-2 rounded-lg">
                  <span>Balance Outstanding Due:</span>
                  <span>₹{pendingAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
