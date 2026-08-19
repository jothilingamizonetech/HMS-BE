import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHMS } from '../../../context/HMSContext';
import { useER } from '../../../context/ERContext';
import { useAuth } from '../../../context/AuthContext';
import { ArrivalMode, EmergencyType } from '../../../types/er';
import { Patient } from '../../../types/hms';
import { Siren, Search, Save, UserCheck, Truck, ShieldAlert, ArrowLeft } from 'lucide-react';

export const EmergencyRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { patients, doctors } = useHMS();
  const { createERVisit } = useER();
  const { user } = useAuth();

  // Search filter
  const [searchQuery, setSearchQuery] = useState(searchParams.get('uhid') || '');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // ER Visit fields
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0]);
  const [arrivalTime, setArrivalTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [arrivalMode, setArrivalMode] = useState<ArrivalMode>('Walk-in');

  // Ambulance specific fields
  const [ambulanceNumber, setAmbulanceNumber] = useState('');
  const [referralHospital, setReferralHospital] = useState('');
  const [paramedicName, setParamedicName] = useState('');

  // Clinical emergency specs
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('Cardiac');
  const [accompaniedBy, setAccompaniedBy] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [initialComplaint, setInitialComplaint] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState(doctors[0]?.name || 'Dr. Vikram Malhotra');

  // Perform search / pre-fill when query or patients change
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      if (patients.length > 0 && !selectedPatient) {
        setSelectedPatient(patients[0]);
      }
      return;
    }

    const match = patients.find(
      (p) =>
        p.uhid.toLowerCase() === q ||
        p.id.toLowerCase() === q ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        (p.mobile && p.mobile.includes(q))
    );

    if (match) {
      setSelectedPatient(match);
    }
  }, [searchQuery, patients]);

  // Sync emergency contact from patient selection
  useEffect(() => {
    if (selectedPatient) {
      const contactStr = selectedPatient.emergencyContactName
        ? `${selectedPatient.emergencyContactName} (${selectedPatient.emergencyRelationship || 'Contact'}) - ${selectedPatient.emergencyPhone || selectedPatient.mobile}`
        : selectedPatient.mobile || 'N/A';
      setEmergencyContact(contactStr);
    }
  }, [selectedPatient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    createERVisit({
      patientUhid: selectedPatient.uhid,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      age: selectedPatient.age,
      gender: selectedPatient.gender,
      bloodGroup: selectedPatient.bloodGroup,
      phone: selectedPatient.mobile,
      emergencyContactName: selectedPatient.emergencyContactName || 'N/A',
      emergencyContactPhone: selectedPatient.emergencyPhone || selectedPatient.mobile,
      emergencyRelationship: selectedPatient.emergencyRelationship || 'N/A',
      allergies: selectedPatient.allergies || 'None Reported',
      existingDiseases: selectedPatient.existingDiseases || 'None Reported',
      arrivalDate,
      arrivalTime,
      arrivalMode,
      ambulanceInfo:
        arrivalMode === 'Ambulance'
          ? {
              ambulanceNumber,
              referralHospital,
              paramedicName,
              arrivalTime,
            }
          : undefined,
      emergencyType,
      accompaniedBy: accompaniedBy || 'Self / Relative',
      emergencyContact,
      initialComplaint,
      registeredBy: user?.name || 'Receptionist',
      assignedDoctor: assignedDoctor || 'Dr. Duty Emergency Specialist',
      branch: user?.branch || selectedPatient.branch || 'Main Hospital',
    });

    navigate('/reception/er/queue');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <Siren className="w-7 h-7 text-rose-200 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold">1. Emergency Registration (ER Visit)</h1>
            <p className="text-xs text-rose-100 mt-1">
              Register active emergency visits for existing patients without creating duplicate patient master records.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => navigate('/reception/er/walk-in')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <span>+ Walk-in (New Patient)</span>
          </button>
          <button
            onClick={() => navigate('/reception/er/queue')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View ER Queue</span>
          </button>
        </div>
      </div>

      {/* Patient Lookup Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-600" />
          <span>Search & Select Existing Patient Master Record</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by UHID (e.g. UHID-2026-1001), Patient Name, or Mobile Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
          <div>
            <select
              value={selectedPatient?.uhid || ''}
              onChange={(e) => {
                const found = patients.find((p) => p.uhid === e.target.value);
                if (found) setSelectedPatient(found);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:bg-white"
            >
              <option value="">-- Select Patient Master --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.uhid}>
                  {p.uhid} — {p.firstName} {p.lastName} ({p.gender}, {p.age}y, {p.mobile})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Registration Form */}
      {selectedPatient ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* READ ONLY Patient Master Information */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-500" />
                <span>Existing Patient Master Record (READ-ONLY)</span>
              </h2>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Reception Read-Only Master
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">UHID</p>
                <p className="font-bold text-blue-700 mt-0.5">{selectedPatient.uhid}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Patient Name</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Age & Gender</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedPatient.age} yrs, {selectedPatient.gender}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</p>
                <p className="font-bold text-rose-600 mt-0.5">{selectedPatient.bloodGroup || 'N/A'}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile Phone</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedPatient.mobile}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact</p>
                <p className="font-semibold text-slate-800 mt-0.5 truncate">
                  {selectedPatient.emergencyContactName || 'N/A'} ({selectedPatient.emergencyPhone || 'N/A'})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                <p className="text-[10px] font-bold text-rose-700 uppercase">Known Allergies</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedPatient.allergies || 'None reported'}</p>
              </div>
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-800 uppercase">Existing Medical Conditions</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedPatient.existingDiseases || 'None reported'}</p>
              </div>
            </div>
          </div>

          {/* ER Visit Data Fields */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-xs">
            <h2 className="text-sm font-bold text-rose-700 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Current Emergency Visit Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Arrival Date */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Arrival Date *</label>
                <input
                  type="date"
                  required
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:bg-white"
                />
              </div>

              {/* Arrival Time */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Arrival Time *</label>
                <input
                  type="text"
                  required
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  placeholder="e.g. 10:30 AM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:bg-white"
                />
              </div>

              {/* Arrival Mode */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Arrival Mode *</label>
                <select
                  value={arrivalMode}
                  onChange={(e) => setArrivalMode(e.target.value as ArrivalMode)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:bg-white"
                >
                  <option value="Walk-in">Walk-in</option>
                  <option value="Ambulance">Ambulance</option>
                </select>
              </div>

              {/* Emergency Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Category *</label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value as EmergencyType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-rose-700 outline-none focus:bg-white"
                >
                  <option value="Cardiac">Cardiac Emergency</option>
                  <option value="Trauma">Trauma / Accident</option>
                  <option value="Respiratory">Respiratory Distress</option>
                  <option value="Neurological">Neurological / Stroke</option>
                  <option value="Burns">Burns & Thermal</option>
                  <option value="Pediatric">Pediatric Emergency</option>
                  <option value="General Emergency">General Emergency</option>
                  <option value="Other">Other Emergency</option>
                </select>
              </div>
            </div>

            {/* Conditional Ambulance Information */}
            {arrivalMode === 'Ambulance' && (
              <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-4">
                <div className="flex items-center gap-2 text-rose-800 font-bold">
                  <Truck className="w-4 h-4" />
                  <span>Ambulance & Paramedic Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ambulance Number</label>
                    <input
                      type="text"
                      placeholder="e.g. KA-01-EM-108"
                      value={ambulanceNumber}
                      onChange={(e) => setAmbulanceNumber(e.target.value)}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Referral Hospital / Clinic</label>
                    <input
                      type="text"
                      placeholder="e.g. City Life Clinic"
                      value={referralHospital}
                      onChange={(e) => setReferralHospital(e.target.value)}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Paramedic / Escort Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Officer Suresh"
                      value={paramedicName}
                      onChange={(e) => setParamedicName(e.target.value)}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Accompanied By */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Accompanied By *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spouse / Relative / Self"
                  value={accompaniedBy}
                  onChange={(e) => setAccompaniedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:bg-white"
                />
              </div>

              {/* Assigned On-Call ER Doctor */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned ER Duty Doctor *</label>
                <select
                  value={assignedDoctor}
                  onChange={(e) => setAssignedDoctor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:bg-white"
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} - {doc.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Initial Complaint */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Triage Complaint & Symptoms *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe patient's chief complaints upon arrival (e.g. Acute breathlessness, chest pain, head injury)..."
                value={initialComplaint}
                onChange={(e) => setInitialComplaint(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100 gap-3">
              <button
                type="button"
                onClick={() => navigate('/reception/er/queue')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Create ER Visit & Queue Patient</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Patient Selected</h3>
          <p className="text-xs text-slate-500">Please search and select an existing patient master record above.</p>
        </div>
      )}
    </div>
  );
};
