import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useER } from '../../../context/ERContext';
import { BedDouble, UserPlus2, ShieldAlert, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const ERToIPDCoordinationPage: React.FC = () => {
  const navigate = useNavigate();
  const { erVisits, coordinateIPDAdmission } = useER();

  // Filter visits where Doctor requested IPD Admission or Disposition is IPD
  const pendingIPDVisits = erVisits.filter(
    (v) =>
      v.erDisposition === 'IPD' ||
      v.erStatus === 'IPD Admission Pending' ||
      v.ipdAdmissionStatus === 'Pending Coordination'
  );

  const handleTransferToIPD = (uhid: string, erVisitId: string) => {
    coordinateIPDAdmission(erVisitId);
    navigate(`/reception/ipd/admit?uhid=${uhid}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <UserPlus2 className="w-7 h-7 text-amber-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold">6. ER to IPD Admission Coordination</h1>
            <p className="text-xs text-amber-100 mt-1">
              Seamlessly hand off emergency patients recommended for In-Patient (IPD) ward or ICU admission.
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-white/20 text-xs font-bold self-start md:self-auto">
          {pendingIPDVisits.length} Admission Requests Pending
        </span>
      </div>

      {/* List / Cards */}
      {pendingIPDVisits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingIPDVisits.map((visit) => (
            <div
              key={visit.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-amber-400 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    IPD Admission Requested
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2">{visit.patientName}</h3>
                  <p className="text-xs text-slate-500">
                    {visit.gender}, {visit.age}y • UHID: <span className="font-bold text-blue-600">{visit.patientUhid}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-700 text-xs bg-rose-50 px-2 py-1 rounded border border-rose-100">
                    {visit.id}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 font-medium">Attending Doctor:</span>
                    <p className="font-bold text-slate-800">{visit.assignedDoctor}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Required Ward:</span>
                    <p className="font-bold text-amber-700">{visit.requiredWard || 'ICU / General Ward'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Doctor Diagnosis:</span>
                  <p className="font-semibold text-slate-800 italic mt-0.5">
                    "{visit.diagnosis || visit.initialComplaint}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Current Location: {visit.currentLocation}</span>
                  <span className="text-slate-400">Emergency Type: {visit.emergencyType}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleTransferToIPD(visit.patientUhid, visit.id)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  <BedDouble className="w-4 h-4" />
                  <span>Coordinate & Allocate IPD Bed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">All IPD Admission Requests Coordinated!</h3>
          <p className="text-xs text-slate-500">No emergency patients currently awaiting IPD ward transfer.</p>
        </div>
      )}
    </div>
  );
};
