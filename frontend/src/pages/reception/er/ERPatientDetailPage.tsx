import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useER } from '../../../context/ERContext';
import { useAuth } from '../../../context/AuthContext';
import {
  Siren,
  ArrowLeft,
  UserCheck,
  HeartPulse,
  Stethoscope,
  ClipboardList,
  BedDouble,
  Truck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Pill,
  FileText,
  UserPlus2,
  Activity,
  Lock,
} from 'lucide-react';

export const ERPatientDetailPage: React.FC = () => {
  const { erVisitId } = useParams<{ erVisitId: string }>();
  const navigate = useNavigate();
  const { getERVisitById } = useER();
  const { user } = useAuth();

  const visit = erVisitId ? getERVisitById(erVisitId) : undefined;
  const isReception = user?.role === 'reception' || !user?.role;

  if (!visit) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-4">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">ER Visit Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested ER Visit ID "{erVisitId}" could not be located.</p>
        <button
          onClick={() => navigate('/reception/er/queue')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
        >
          Return to ER Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-rose-700 text-sm bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100">
                {visit.id}
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {visit.patientUhid}
              </span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                {visit.emergencyType}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">{visit.patientName}</h1>
            <p className="text-xs text-slate-500">
              {visit.gender}, {visit.age} yrs • Mobile: {visit.phone} • Blood Group: <span className="font-bold text-rose-600">{visit.bloodGroup || 'N/A'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {visit.erDisposition === 'Observation' && (
            <button
              onClick={() => navigate(`/reception/er/observation-beds?erVisitId=${visit.id}`)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <BedDouble className="w-4 h-4" />
              <span>Assign Observation Bed</span>
            </button>
          )}

          {visit.erDisposition === 'IPD' && (
            <button
              onClick={() => navigate(`/reception/er/ipd-coordination?erVisitId=${visit.id}`)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus2 className="w-4 h-4" />
              <span>Coordinate IPD Admission</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Master & Arrival Info */}
        <div className="space-y-6">
          {/* Patient Master Summary */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Patient Master Summary</span>
              </h2>
              {isReception && (
                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Read-Only
                </span>
              )}
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Emergency Contact:</span>
                <span className="font-semibold text-slate-800">{visit.emergencyContactName} ({visit.emergencyContactPhone})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Relationship:</span>
                <span className="font-semibold text-slate-800">{visit.emergencyRelationship}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Known Allergies:</span>
                <span className="font-bold text-rose-600">{visit.allergies || 'None reported'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Pre-existing Diseases:</span>
                <span className="font-semibold text-slate-800">{visit.existingDiseases || 'None reported'}</span>
              </div>
            </div>
          </div>

          {/* Arrival & Registration Info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Siren className="w-4 h-4 text-rose-600" />
              <span>Arrival & Encounter Details</span>
            </h2>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Arrival Date & Time:</span>
                <span className="font-semibold text-slate-800">{visit.arrivalDate} @ {visit.arrivalTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Arrival Mode:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  {visit.arrivalMode === 'Ambulance' ? <Truck className="w-3.5 h-3.5 text-rose-500" /> : <UserCheck className="w-3.5 h-3.5 text-blue-500" />}
                  {visit.arrivalMode}
                </span>
              </div>

              {visit.ambulanceInfo && (
                <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 space-y-1 text-[10px]">
                  <p className="font-bold text-rose-800">Ambulance Details:</p>
                  <p className="text-slate-700">Vehicle: {visit.ambulanceInfo.ambulanceNumber || 'N/A'}</p>
                  <p className="text-slate-700">Referral: {visit.ambulanceInfo.referralHospital || 'N/A'}</p>
                  <p className="text-slate-700">Paramedic: {visit.ambulanceInfo.paramedicName || 'N/A'}</p>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Accompanied By:</span>
                <span className="font-semibold text-slate-800">{visit.accompaniedBy}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Initial Triage Complaint:</span>
                <p className="bg-slate-50 p-2.5 rounded-xl text-slate-800 font-medium italic border border-slate-200">
                  "{visit.initialComplaint}"
                </p>
              </div>
            </div>
          </div>

          {/* Current Location & Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Current Status & Location</span>
            </h2>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Current ER Location:</span>
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {visit.currentLocation}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Workflow Status:</span>
                <span className="font-bold text-slate-800">{visit.erStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Assigned Doctor:</span>
                <span className="font-bold text-slate-900">{visit.assignedDoctor}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">ER Disposition:</span>
                <span className="font-extrabold text-amber-700">{visit.erDisposition}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Clinical Records (Nurse & Doctor Data) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Triage & Vitals (Recorded by Nurse) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Triage & Clinical Vitals (Nurse Record)</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                {visit.triageStatus}
              </span>
            </div>

            {visit.vitals ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
                  <p className="text-[10px] font-bold text-rose-700 uppercase">Blood Pressure</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">
                    {visit.vitals.bloodPressure || `${visit.vitals.bpSys}/${visit.vitals.bpDia}`}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">mmHg</p>
                </div>
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-700 uppercase">Pulse Rate</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">{visit.vitals.pulseRate}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">bpm</p>
                </div>
                <div className="bg-cyan-50/60 p-3 rounded-xl border border-cyan-100">
                  <p className="text-[10px] font-bold text-cyan-700 uppercase">SpO2 Oxygen</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">{visit.vitals.spO2}%</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Room air</p>
                </div>
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-700 uppercase">Temperature</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">{visit.vitals.temperature}°F</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Oral</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">Vitals pending nurse assessment.</p>
            )}
          </div>

          {/* Emergency Nursing Notes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              <span>Emergency Nursing Observations</span>
            </h2>

            {visit.nursingNotes && visit.nursingNotes.length > 0 ? (
              <div className="space-y-2">
                {visit.nursingNotes.map((n) => (
                  <div key={n.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{n.recordedBy}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-800">{n.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-[11px]">No nursing notes recorded yet.</p>
            )}
          </div>

          {/* Doctor Assessment & Diagnosis */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>Doctor Assessment & Emergency Diagnosis</span>
            </h2>

            {visit.doctorAssessment ? (
              <div className="space-y-3">
                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-1">
                  <p className="text-[10px] font-bold text-blue-700 uppercase">Emergency Clinical Diagnosis</p>
                  <p className="text-sm font-extrabold text-slate-900">{visit.diagnosis || 'Diagnosis Pending'}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Doctor Assessment Notes</p>
                  <p className="text-slate-800 text-[11px] leading-relaxed">{visit.doctorAssessment}</p>
                </div>

                {visit.labOrders && visit.labOrders.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700 text-[11px]">Emergency Lab Orders:</p>
                    <div className="flex flex-wrap gap-2">
                      {visit.labOrders.map((lo) => (
                        <span key={lo.id} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 text-[10px]">
                          {lo.testName} ({lo.priority}) — {lo.status}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 italic text-[11px]">Doctor assessment pending consultation.</p>
            )}
          </div>

          {/* Audit Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>ER Visit Audit Timeline</span>
            </h2>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {visit.timeline.map((item) => (
                <div key={item.id} className="relative space-y-0.5 text-[11px]">
                  <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-white" />
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{item.title}</span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    By <span className="font-semibold text-slate-700">{item.actor}</span> ({item.role})
                  </p>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
