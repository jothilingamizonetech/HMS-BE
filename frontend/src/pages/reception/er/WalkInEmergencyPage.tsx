import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHMS } from '../../../context/HMSContext';
import { useER } from '../../../context/ERContext';
import { useAuth } from '../../../context/AuthContext';
import { ArrivalMode, EmergencyType } from '../../../types/er';
import { UserCheck, Siren, Save, ShieldAlert, Truck, Sparkles } from 'lucide-react';

export const WalkInEmergencyPage: React.FC = () => {
  const navigate = useNavigate();
  const { addPatient, doctors } = useHMS();
  const { createERVisit } = useER();
  const { user } = useAuth();

  // Step 1: Patient Master Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | ''>(35);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [mobile, setMobile] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [existingDiseases, setExistingDiseases] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Relative');

  // Step 2: ER Visit Fields
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0]);
  const [arrivalTime, setArrivalTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [arrivalMode, setArrivalMode] = useState<ArrivalMode>('Walk-in');
  const [ambulanceNumber, setAmbulanceNumber] = useState('');
  const [referralHospital, setReferralHospital] = useState('');
  const [paramedicName, setParamedicName] = useState('');

  const [emergencyType, setEmergencyType] = useState<EmergencyType>('General Emergency');
  const [accompaniedBy, setAccompaniedBy] = useState('');
  const [initialComplaint, setInitialComplaint] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState(doctors[0]?.name || 'Dr. Vikram Malhotra');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !mobile || !initialComplaint) return;

    let registeredUhid = '';
    try {
      // 1. Attempt to register patient in Patient Master (generates UHID)
      const newPatient = await addPatient({
        firstName,
        lastName,
        gender,
        age: Number(age) || 30,
        mobile,
        bloodGroup: bloodGroup as any,
        allergies: allergies || 'None',
        existingDiseases: existingDiseases || 'None',
        emergencyContactName: emergencyContactName || firstName,
        emergencyPhone: emergencyPhone || mobile,
        emergencyRelationship,
        branch: user?.branch || 'Main Hospital',
      } as any);

      if (newPatient && newPatient.uhid) {
        registeredUhid = newPatient.uhid;
      }
    } catch (err) {
      console.warn('Backend patient creation failed/fallback triggered:', err);
    }

    // Fallback UHID generation if server or context registration encountered an issue
    if (!registeredUhid) {
      registeredUhid = `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    try {
      // 2. Immediately create ER Visit linked to the UHID
      createERVisit({
        patientUhid: registeredUhid,
        patientName: `${firstName} ${lastName}`,
        age: Number(age) || 30,
        gender,
        bloodGroup,
        phone: mobile,
        emergencyContactName: emergencyContactName || firstName,
        emergencyContactPhone: emergencyPhone || mobile,
        emergencyRelationship,
        allergies,
        existingDiseases,
        arrivalDate,
        arrivalTime,
        arrivalMode,
        ambulanceInfo:
          arrivalMode === 'Ambulance'
            ? { ambulanceNumber, referralHospital, paramedicName, arrivalTime }
            : undefined,
        emergencyType,
        accompaniedBy: accompaniedBy || 'Self / Escort',
        emergencyContact: `${emergencyContactName || firstName} (${emergencyPhone || mobile})`,
        initialComplaint,
        registeredBy: user?.name || 'Receptionist',
        assignedDoctor: assignedDoctor || 'Dr. Emergency Specialist',
        branch: user?.branch || 'Main Hospital',
      });

      navigate('/reception/er/queue');
    } catch (err) {
      console.error('Walk-in ER visit launch error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <UserCheck className="w-7 h-7 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold">3. Walk-in Emergency Patient Registration</h1>
            <p className="text-xs text-emerald-100 mt-1">
              Create a new Patient Master record (UHID) and instantly launch their active ER Visit in one seamless flow.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white/20 text-xs font-bold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Unified 2-Step Flow</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Patient Master Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Step 1: Patient Master Profile Setup (Generates UHID)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amit"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kumar"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Age (Years) *</label>
              <input
                type="number"
                required
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 12345"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:bg-white"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Emergency Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Sunita Kumar (Wife)"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Known Drug/Food Allergies</label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Sulfa, None"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pre-existing Medical History</label>
              <input
                type="text"
                placeholder="e.g. Diabetes, Asthma, Hypertension"
                value={existingDiseases}
                onChange={(e) => setExistingDiseases(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Emergency Visit Specification */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-rose-700 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Step 2: Emergency Visit Encounter Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Arrival Date *</label>
              <input
                type="date"
                required
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Arrival Time *</label>
              <input
                type="text"
                required
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Arrival Mode *</label>
              <select
                value={arrivalMode}
                onChange={(e) => setArrivalMode(e.target.value as ArrivalMode)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none"
              >
                <option value="Walk-in">Walk-in</option>
                <option value="Ambulance">Ambulance</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Emergency Category *</label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value as EmergencyType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-rose-700 outline-none"
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

          {arrivalMode === 'Ambulance' && (
            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-3">
              <p className="font-bold text-rose-800 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Ambulance Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Ambulance Vehicle #"
                  value={ambulanceNumber}
                  onChange={(e) => setAmbulanceNumber(e.target.value)}
                  className="bg-white border border-rose-200 px-3 py-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Referral Hospital"
                  value={referralHospital}
                  onChange={(e) => setReferralHospital(e.target.value)}
                  className="bg-white border border-rose-200 px-3 py-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Paramedic Name"
                  value={paramedicName}
                  onChange={(e) => setParamedicName(e.target.value)}
                  className="bg-white border border-rose-200 px-3 py-2 rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Accompanied By</label>
              <input
                type="text"
                placeholder="e.g. Brother / Relative"
                value={accompaniedBy}
                onChange={(e) => setAccompaniedBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Duty Doctor *</label>
              <select
                value={assignedDoctor}
                onChange={(e) => setAssignedDoctor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} - {doc.department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Initial Complaint & Symptoms *</label>
            <textarea
              required
              rows={3}
              placeholder="Describe acute emergency symptoms, injuries, or complaints..."
              value={initialComplaint}
              onChange={(e) => setInitialComplaint(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => navigate('/reception/er/queue')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Register Patient & Launch ER Visit</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
