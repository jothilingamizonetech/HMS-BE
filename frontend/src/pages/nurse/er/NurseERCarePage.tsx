import React, { useState } from 'react';
import { useER } from '../../../context/ERContext';
import { useAuth } from '../../../context/AuthContext';
import { TriageStatus, ERVitalSign } from '../../../types/er';
import {
  HeartPulse,
  Siren,
  ClipboardList,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Pill,
  Activity,
  UserCheck,
} from 'lucide-react';

export const NurseERCarePage: React.FC = () => {
  const { user } = useAuth();
  const { erVisits, updateERTriage, recordERVitals, addERNursingNote, administerERMedication } = useER();

  const [selectedVisitId, setSelectedVisitId] = useState<string>(erVisits[0]?.id || '');
  const activeVisit = erVisits.find((v) => v.id === selectedVisitId);

  // Triage Form State
  const [triageStatus, setTriageStatus] = useState<TriageStatus>('Priority 2 (Yellow - Urgent)');
  const [triageNotes, setTriageNotes] = useState('');

  // Vitals Form State
  const [bpSys, setBpSys] = useState<number | ''>(120);
  const [bpDia, setBpDia] = useState<number | ''>(80);
  const [pulseRate, setPulseRate] = useState<number | ''>(78);
  const [spO2, setSpO2] = useState<number | ''>(98);
  const [temperature, setTemperature] = useState<number | ''>(98.6);
  const [respiratoryRate, setRespiratoryRate] = useState<number | ''>(18);
  const [painScale, setPainScale] = useState<number | ''>(3);

  // Nursing Note State
  const [newNote, setNewNote] = useState('');

  // Medication Admin State
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [route, setRoute] = useState('IV Stat');

  const nurseName = user?.name || 'Staff Nurse';

  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit) return;
    updateERTriage(activeVisit.id, triageStatus, triageNotes, nurseName);
    setTriageNotes('');
  };

  const handleVitalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit) return;
    recordERVitals(
      activeVisit.id,
      {
        bpSys: Number(bpSys) || 120,
        bpDia: Number(bpDia) || 80,
        bloodPressure: `${bpSys || 120}/${bpDia || 80}`,
        pulseRate: Number(pulseRate) || 80,
        spO2: Number(spO2) || 98,
        temperature: Number(temperature) || 98.6,
        respiratoryRate: Number(respiratoryRate) || 18,
        painScale: Number(painScale) || 0,
      },
      nurseName
    );
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit || !newNote.trim()) return;
    addERNursingNote(activeVisit.id, newNote, nurseName);
    setNewNote('');
  };

  const handleMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit || !medicineName || !dosage) return;
    administerERMedication(activeVisit.id, {
      medicineName,
      dosage,
      route,
      timeGiven: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      givenBy: nurseName,
    });
    setMedicineName('');
    setDosage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <HeartPulse className="w-7 h-7 text-rose-300 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Nurse ER Triage & Nursing Care</h1>
            <p className="text-xs text-blue-100 mt-1">
              Classify triage urgency, record emergency vitals, administer meds, and update shared ER records.
            </p>
          </div>
        </div>
      </div>

      {/* Patient Picker Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
        <label className="block font-bold text-slate-700">Select Active ER Patient for Nursing Care *</label>
        <select
          value={selectedVisitId}
          onChange={(e) => setSelectedVisitId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
        >
          {erVisits
            .filter((v) => v.erStatus !== 'Discharged' && v.erStatus !== 'Transferred')
            .map((v) => (
              <option key={v.id} value={v.id}>
                {v.id} — {v.patientName} ({v.patientUhid}, {v.emergencyType}, {v.triageStatus}, Location: {v.currentLocation})
              </option>
            ))}
        </select>
      </div>

      {activeVisit ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Left Column: Triage & Vitals */}
          <div className="space-y-6 lg:col-span-2">
            {/* Triage Classification Form */}
            <form onSubmit={handleTriageSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Siren className="w-4 h-4 text-rose-600" />
                <span>Perform Triage Classification</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  onClick={() => setTriageStatus('Priority 1 (Red - Critical)')}
                  className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between space-y-1 transition-all ${
                    triageStatus.includes('Priority 1')
                      ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-extrabold text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Red - Critical
                  </span>
                  <span className="text-[10px] text-slate-500">Immediate life-saving intervention</span>
                </label>

                <label
                  onClick={() => setTriageStatus('Priority 2 (Yellow - Urgent)')}
                  className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between space-y-1 transition-all ${
                    triageStatus.includes('Priority 2')
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-extrabold text-amber-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" /> Yellow - Urgent
                  </span>
                  <span className="text-[10px] text-slate-500">Urgent care needed within 30 mins</span>
                </label>

                <label
                  onClick={() => setTriageStatus('Priority 3 (Green - Non-Urgent)')}
                  className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between space-y-1 transition-all ${
                    triageStatus.includes('Priority 3')
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-extrabold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Green - Non-Urgent
                  </span>
                  <span className="text-[10px] text-slate-500">Standard emergency room care</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Triage Nurse Assessment Notes</label>
                <textarea
                  rows={2}
                  placeholder="Record initial triage observations..."
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Update Triage Status
                </button>
              </div>
            </form>

            {/* Record Clinical Vitals */}
            <form onSubmit={handleVitalsSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Record Emergency Vital Signs</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">BP Systolic</label>
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">BP Diastolic</label>
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pulse Rate (bpm)</label>
                  <input
                    type="number"
                    value={pulseRate}
                    onChange={(e) => setPulseRate(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    value={spO2}
                    onChange={(e) => setSpO2(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-cyan-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Respiratory Rate</label>
                  <input
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pain Scale (1-10)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={painScale}
                    onChange={(e) => setPainScale(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-rose-600"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Save Vital Signs
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Nursing Notes & Medication Administration */}
          <div className="space-y-6">
            {/* Patient Summary Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {activeVisit.patientUhid}
              </span>
              <h3 className="text-base font-extrabold text-slate-900">{activeVisit.patientName}</h3>
              <p className="text-xs text-slate-500">
                {activeVisit.gender}, {activeVisit.age}y • Complaint: <span className="font-semibold text-slate-800">{activeVisit.initialComplaint}</span>
              </p>
              <p className="text-xs text-slate-500">Location: <span className="font-bold text-purple-700">{activeVisit.currentLocation}</span></p>
            </div>

            {/* Add Nursing Note Form */}
            <form onSubmit={handleNoteSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                <span>Add Nursing Note</span>
              </h3>
              <textarea
                rows={3}
                required
                placeholder="Log nursing observation or patient care rendered..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
              >
                Add Nursing Note
              </button>
            </form>

            {/* Medication Administration */}
            <form onSubmit={handleMedSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-cyan-600" />
                <span>Administer Medication</span>
              </h3>
              <input
                type="text"
                required
                placeholder="Medicine Name (e.g. Paracetamol IV)"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Dosage (e.g. 500mg)"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Route (e.g. IV Stat)"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold cursor-pointer"
              >
                Record Administration
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
