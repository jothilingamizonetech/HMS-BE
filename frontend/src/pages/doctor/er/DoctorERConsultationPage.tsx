import React, { useState } from 'react';
import { useER } from '../../../context/ERContext';
import { useAuth } from '../../../context/AuthContext';
import { ERDisposition, ERLabOrder, ERPharmacyOrder, EROrderedProcedure } from '../../../types/er';
import {
  Stethoscope,
  Siren,
  FileText,
  Save,
  BedDouble,
  UserPlus2,
  CheckCircle2,
  AlertTriangle,
  Pill,
  ClipboardList,
  HeartPulse,
} from 'lucide-react';

export const DoctorERConsultationPage: React.FC = () => {
  const { user } = useAuth();
  const { erVisits, recordDoctorAssessment, setERDisposition } = useER();

  const [selectedVisitId, setSelectedVisitId] = useState<string>(erVisits[0]?.id || '');
  const activeVisit = erVisits.find((v) => v.id === selectedVisitId);

  // Form State
  const [diagnosis, setDiagnosis] = useState(activeVisit?.diagnosis || '');
  const [assessmentNotes, setAssessmentNotes] = useState(activeVisit?.doctorAssessment || '');
  const [disposition, setDisposition] = useState<ERDisposition>(activeVisit?.erDisposition || 'Pending');
  const [dispositionNotes, setDispositionNotes] = useState('');
  const [requiredWard, setRequiredWard] = useState('ICU');

  // Lab & Pharmacy Orders
  const [newLabTest, setNewLabTest] = useState('');
  const [newLabPriority, setNewLabPriority] = useState<'Normal' | 'STAT' | 'Emergency'>('STAT');
  const [labOrdersList, setLabOrdersList] = useState<ERLabOrder[]>(activeVisit?.labOrders || []);

  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [pharmacyOrdersList, setPharmacyOrdersList] = useState<ERPharmacyOrder[]>(activeVisit?.pharmacyOrders || []);

  const doctorName = user?.name || 'Dr. Vikram Malhotra';

  const handleAddLab = () => {
    if (!newLabTest.trim()) return;
    const item: ERLabOrder = {
      id: `lab-${Date.now()}`,
      testName: newLabTest,
      priority: newLabPriority,
      status: 'Ordered',
    };
    setLabOrdersList([...labOrdersList, item]);
    setNewLabTest('');
  };

  const handleAddMed = () => {
    if (!newMedName.trim() || !newMedDosage.trim()) return;
    const item: ERPharmacyOrder = {
      id: `ph-${Date.now()}`,
      medicineName: newMedName,
      dosage: newMedDosage,
      quantity: 1,
      status: 'Prescribed',
    };
    setPharmacyOrdersList([...pharmacyOrdersList, item]);
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit) return;

    recordDoctorAssessment(
      activeVisit.id,
      assessmentNotes,
      diagnosis,
      labOrdersList,
      pharmacyOrdersList,
      undefined,
      doctorName
    );

    if (disposition !== 'Pending') {
      setERDisposition(activeVisit.id, disposition, dispositionNotes, requiredWard, doctorName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-700 via-teal-700 to-emerald-700 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <Stethoscope className="w-7 h-7 text-cyan-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Doctor Emergency Consultation & Disposition</h1>
            <p className="text-xs text-cyan-100 mt-1">
              Perform emergency clinical assessment, diagnose, order labs/meds, and trigger ER disposition handoffs.
            </p>
          </div>
        </div>
      </div>

      {/* ER Patient Picker */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
        <label className="block font-bold text-slate-700">Select Emergency Case for Assessment *</label>
        <select
          value={selectedVisitId}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedVisitId(id);
            const found = erVisits.find((v) => v.id === id);
            if (found) {
              setDiagnosis(found.diagnosis || '');
              setAssessmentNotes(found.doctorAssessment || '');
              setDisposition(found.erDisposition || 'Pending');
              setLabOrdersList(found.labOrders || []);
              setPharmacyOrdersList(found.pharmacyOrders || []);
            }
          }}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500/20"
        >
          {erVisits
            .filter((v) => v.erStatus !== 'Discharged' && v.erStatus !== 'Transferred')
            .map((v) => (
              <option key={v.id} value={v.id}>
                {v.id} — {v.patientName} ({v.patientUhid}, {v.emergencyType}, Triage: {v.triageStatus})
              </option>
            ))}
        </select>
      </div>

      {activeVisit ? (
        <form onSubmit={handleSubmitAssessment} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Left / Main Column: Assessment & Orders */}
          <div className="space-y-6 lg:col-span-2">
            {/* Clinical Assessment */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-cyan-600" />
                <span>Emergency Clinical Assessment & Diagnosis</span>
              </h2>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute ST-Elevation Myocardial Infarction (STEMI)"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Evaluation & Consultation Notes *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail clinical findings, physical evaluation, ECG/imaging interpretations..."
                  value={assessmentNotes}
                  onChange={(e) => setAssessmentNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* Emergency Orders (Lab & Pharmacy) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-indigo-600" />
                <span>Emergency Orders (STAT Lab & Pharmacy)</span>
              </h2>

              {/* Lab Orders */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Order STAT Lab Investigations</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Lab test name (e.g. Troponin I STAT, ECG 12 Lead)..."
                    value={newLabTest}
                    onChange={(e) => setNewLabTest(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                  <select
                    value={newLabPriority}
                    onChange={(e) => setNewLabPriority(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-rose-600"
                  >
                    <option value="STAT">STAT</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Normal">Normal</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddLab}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold cursor-pointer"
                  >
                    + Add Lab
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {labOrdersList.map((lo) => (
                    <span key={lo.id} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[11px]">
                      {lo.testName} ({lo.priority})
                    </span>
                  ))}
                </div>
              </div>

              {/* Pharmacy Orders */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="block font-bold text-slate-700">Prescribe Emergency STAT Medications</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Medicine Name (e.g. Aspirin)"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 300mg oral)"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-36 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddMed}
                    className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold cursor-pointer"
                  >
                    + Add Med
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {pharmacyOrdersList.map((po) => (
                    <span key={po.id} className="px-3 py-1 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold text-[11px]">
                      {po.medicineName} - {po.dosage}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: ER Disposition & Action Box */}
          <div className="space-y-6">
            {/* Vitals Summary Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                {activeVisit.triageStatus}
              </span>
              <h3 className="text-base font-extrabold text-slate-900">{activeVisit.patientName}</h3>
              <p className="text-xs text-slate-500">
                Location: <span className="font-bold text-purple-700">{activeVisit.currentLocation}</span>
              </p>

              {activeVisit.vitals && (
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2">
                  <div>
                    <span className="text-slate-400">BP:</span> <span className="font-bold">{activeVisit.vitals.bloodPressure || '120/80'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Pulse:</span> <span className="font-bold text-blue-600">{activeVisit.vitals.pulseRate} bpm</span>
                  </div>
                  <div>
                    <span className="text-slate-400">SpO2:</span> <span className="font-bold text-cyan-600">{activeVisit.vitals.spO2}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Temp:</span> <span className="font-bold">{activeVisit.vitals.temperature}°F</span>
                  </div>
                </div>
              )}
            </div>

            {/* ER Disposition Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Siren className="w-4 h-4 text-rose-600" />
                <span>Select ER Disposition</span>
              </h2>

              <div className="space-y-2">
                <label
                  onClick={() => setDisposition('Discharge')}
                  className={`p-3 rounded-xl border cursor-pointer block space-y-1 transition-all ${
                    disposition === 'Discharge' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Discharge Patient
                  </span>
                  <span className="text-[10px] text-slate-500 block">Patient stable for outpatient discharge</span>
                </label>

                <label
                  onClick={() => setDisposition('Observation')}
                  className={`p-3 rounded-xl border cursor-pointer block space-y-1 transition-all ${
                    disposition === 'Observation' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-500/20' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="font-bold text-purple-800 flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-purple-600" /> ER Short-Stay Observation
                  </span>
                  <span className="text-[10px] text-slate-500 block">Assign temporary observation bed</span>
                </label>

                <label
                  onClick={() => setDisposition('IPD')}
                  className={`p-3 rounded-xl border cursor-pointer block space-y-1 transition-all ${
                    disposition === 'IPD' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="font-bold text-amber-800 flex items-center gap-2">
                    <UserPlus2 className="w-4 h-4 text-amber-600" /> IPD Inpatient Admission
                  </span>
                  <span className="text-[10px] text-slate-500 block">Require inpatient ward transfer</span>
                </label>
              </div>

              {disposition === 'IPD' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recommended Ward Type</label>
                  <select
                    value={requiredWard}
                    onChange={(e) => setRequiredWard(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 outline-none"
                  >
                    <option value="ICU">ICU (Intensive Care Unit)</option>
                    <option value="General Ward">General Ward</option>
                    <option value="Deluxe Suite">Deluxe Suite</option>
                    <option value="Surgical Ward">Surgical Ward</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Disposition Notes</label>
                <textarea
                  rows={2}
                  placeholder="Reason for disposition decision..."
                  value={dispositionNotes}
                  onChange={(e) => setDispositionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Consultation & Disposition</span>
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
};
