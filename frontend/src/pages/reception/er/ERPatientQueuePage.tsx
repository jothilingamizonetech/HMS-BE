import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useER } from '../../../context/ERContext';
import { ERStatus, TriageStatus, EmergencyType } from '../../../types/er';
import {
  Siren,
  Search,
  Filter,
  Eye,
  BedDouble,
  UserPlus2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Truck,
  UserCheck,
} from 'lucide-react';

export const ERPatientQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { erVisits } = useER();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTriage, setSelectedTriage] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filtered ER Visits
  const filteredVisits = useMemo(() => {
    return erVisits.filter((v) => {
      const matchesSearch =
        v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.patientUhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone.includes(searchTerm);

      const matchesStatus = selectedStatus === 'ALL' || v.erStatus === selectedStatus;
      const matchesTriage = selectedTriage === 'ALL' || v.triageStatus === selectedTriage;
      const matchesCategory = selectedCategory === 'ALL' || v.emergencyType === selectedCategory;

      return matchesSearch && matchesStatus && matchesTriage && matchesCategory;
    });
  }, [erVisits, searchTerm, selectedStatus, selectedTriage, selectedCategory]);

  const getTriageBadge = (triage: TriageStatus) => {
    if (triage.includes('Priority 1') || triage.includes('Red')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          Priority 1 (Red - Critical)
        </span>
      );
    }
    if (triage.includes('Priority 2') || triage.includes('Yellow')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          Priority 2 (Yellow - Urgent)
        </span>
      );
    }
    if (triage.includes('Priority 3') || triage.includes('Green')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          Priority 3 (Green - Non-Urgent)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
        Pending Triage
      </span>
    );
  };

  const getStatusBadge = (status: ERStatus) => {
    switch (status) {
      case 'Registered':
      case 'Waiting for Triage':
        return <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 whitespace-nowrap">Waiting Triage</span>;
      case 'Triage Completed':
      case 'Waiting for Doctor':
        return <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 whitespace-nowrap">Awaiting Doctor</span>;
      case 'Under Doctor Assessment':
        return <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 whitespace-nowrap">Under Assessment</span>;
      case 'Observation':
        return <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 whitespace-nowrap">Observation Bed</span>;
      case 'IPD Admission Pending':
        return <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap animate-pulse">IPD Pending</span>;
      case 'Discharged':
        return <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">Discharged</span>;
      case 'Transferred':
        return <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-800 whitespace-nowrap">IPD Transferred</span>;
      default:
        return <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 whitespace-nowrap">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <Siren className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">4. Real-Time ER Patient Queue & Monitoring</h1>
            <p className="text-xs text-slate-500">
              Live hospital emergency room oversight tracking registrations, triage, location, and disposition status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/reception/er/register')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
          >
            + Existing Patient ER
          </button>
          <button
            onClick={() => navigate('/reception/er/walk-in')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            + Walk-in New Patient ER
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ER Visit ID, UHID, Patient Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-semibold outline-none focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 outline-none"
            >
              <option value="ALL">All ER Statuses</option>
              <option value="Registered">Registered / Waiting Triage</option>
              <option value="Waiting for Doctor">Waiting for Doctor</option>
              <option value="Under Doctor Assessment">Under Assessment</option>
              <option value="Observation">Observation Bed</option>
              <option value="IPD Admission Pending">IPD Admission Pending</option>
              <option value="Discharged">Discharged</option>
              <option value="Transferred">Transferred</option>
            </select>
          </div>

          <div>
            <select
              value={selectedTriage}
              onChange={(e) => setSelectedTriage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 outline-none"
            >
              <option value="ALL">All Triage Levels</option>
              <option value="Priority 1 (Red - Critical)">Priority 1 (Red - Critical)</option>
              <option value="Priority 2 (Yellow - Urgent)">Priority 2 (Yellow - Urgent)</option>
              <option value="Priority 3 (Green - Non-Urgent)">Priority 3 (Green - Non-Urgent)</option>
              <option value="Pending Triage">Pending Triage</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 outline-none"
            >
              <option value="ALL">All Emergency Types</option>
              <option value="Cardiac">Cardiac</option>
              <option value="Trauma">Trauma</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Neurological">Neurological</option>
              <option value="Burns">Burns</option>
              <option value="Pediatric">Pediatric</option>
              <option value="General Emergency">General Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4">ER Visit ID</th>
                <th className="py-3.5 px-4">Patient Profile</th>
                <th className="py-3.5 px-4">Arrival</th>
                <th className="py-3.5 px-4">Triage Priority</th>
                <th className="py-3.5 px-4">Current Location</th>
                <th className="py-3.5 px-4">ER Status</th>
                <th className="py-3.5 px-4">Assigned Doctor</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredVisits.length > 0 ? (
                filteredVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ER Visit ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-xs inline-block">
                        {visit.id}
                      </span>
                      <p className="text-[11px] font-semibold text-slate-400 mt-1">{visit.emergencyType}</p>
                    </td>

                    {/* Patient Profile */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900 text-xs">{visit.patientName}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono font-semibold text-blue-600">{visit.patientUhid}</span>
                        <span className="text-slate-300">•</span>
                        <span>
                          {visit.gender}, {visit.age}y
                        </span>
                      </div>
                    </td>

                    {/* Arrival */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-xs">
                        {visit.arrivalMode === 'Ambulance' ? (
                          <Truck className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                        <span>{visit.arrivalMode}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{visit.arrivalTime}</p>
                    </td>

                    {/* Triage Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getTriageBadge(visit.triageStatus)}</td>

                    {/* Current Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 text-xs">{visit.currentLocation}</span>
                    </td>

                    {/* ER Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(visit.erStatus)}</td>

                    {/* Doctor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-800 text-xs">{visit.assignedDoctor}</p>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/reception/er/patient/${visit.id}`)}
                          title="View ER Patient Record"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {(visit.erStatus === 'Observation' || visit.erDisposition === 'Observation') && (
                          <button
                            onClick={() => navigate(`/reception/er/observation-beds?erVisitId=${visit.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <BedDouble className="w-3.5 h-3.5" />
                            <span>Assign Bed</span>
                          </button>
                        )}

                        {(visit.erStatus === 'IPD Admission Pending' || visit.erDisposition === 'IPD') && (
                          <button
                            onClick={() => navigate(`/reception/er/ipd-coordination?erVisitId=${visit.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <UserPlus2 className="w-3.5 h-3.5" />
                            <span>Coordinate IPD</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No active emergency visits match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
