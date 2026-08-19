import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHMS } from '../../../context/HMSContext';
import { Patient } from '../../../types/hms';
import { Search, UserCheck, Siren, UserPlus, AlertCircle, ArrowRight, ShieldCheck, Users } from 'lucide-react';

export const ExistingPatientSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { patients } = useHMS();

  const [query, setQuery] = useState('');

  // Real-time filter of patient master records
  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;

    return patients.filter(
      (p) =>
        p.uhid.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        (p.mobile && p.mobile.includes(q))
    );
  }, [query, patients]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">2. Existing Patient / UHID Search</h1>
            <p className="text-xs text-slate-500">
              Lookup existing patient master records by UHID, Name, or Mobile before registering an emergency visit.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <label className="block text-xs font-bold text-slate-700">Search Patient Master *</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Type UHID (e.g. UHID-2026-1001), Patient Name, or Mobile Number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Results / Full Directory Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>
              {query ? `Search Results (${filteredPatients.length})` : `All Patient Master Records (${patients.length})`}
            </span>
          </h2>
        </div>

        {filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                      {patient.uhid}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {patient.gender}, {patient.age} yrs • Blood: <span className="font-bold text-rose-600">{patient.bloodGroup || 'N/A'}</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 font-medium">Mobile: </span>
                    <span className="font-semibold text-slate-800">{patient.mobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Emergency Contact: </span>
                    <span className="font-semibold text-slate-800">{patient.emergencyPhone || patient.mobile}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => navigate(`/reception/er/register?uhid=${patient.uhid}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Siren className="w-3.5 h-3.5" />
                    <span>Create Emergency Visit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-amber-50/60 p-8 rounded-2xl border border-amber-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">No Patient Found with "{query}"</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                This patient is not currently registered in the Hospital Patient Master. You can proceed directly to Walk-in Emergency Registration to create a new UHID.
              </p>
            </div>
            <button
              onClick={() => navigate('/reception/er/walk-in')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register as Walk-in Emergency Patient</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
