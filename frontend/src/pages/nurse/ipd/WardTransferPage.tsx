import React, { useState, useMemo } from 'react';
import {
  BedDouble,
  Search,
  Eye,
  Lock,
  Building2,
  UserCheck,
  FileText,
  ShieldCheck,
  Clock,
  ArrowLeftRight,
  ShieldAlert,
} from 'lucide-react';
import { WardTransfer } from '../../../types/nurse';
import { Patient } from '../../../types/hms';
import { useNurse } from '../../../context/NurseContext';
import { useHMS } from '../../../context/HMSContext';
import { PatientSearch } from '../../../components/nurse/PatientSearch';
import { PatientInfoCard } from '../../../components/nurse/PatientInfoCard';
import { Modal } from '../../../components/common/Modal';
import { NurseBranchSelector } from '../../../components/nurse/NurseBranchSelector';

export const WardTransferPage: React.FC = () => {
  const { transfers, selectedBranch } = useNurse();
  const { patients, beds, addToast } = useHMS();

  // Active Selected Patient from HMS Database
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);

  // Derive current ward and bed from beds database
  const occupiedBed = useMemo(() => {
    if (!selectedPatient) return null;
    return beds.find((b) => b.currentPatientUhid === selectedPatient.uhid);
  }, [selectedPatient, beds]);

  const currentWard = occupiedBed?.ward || (selectedPatient?.status === 'Admitted' ? 'ICU Ward' : 'General Ward');
  const currentBed = occupiedBed?.bedNumber || 'B-101';
  const roomNumber = occupiedBed ? `Room-${occupiedBed.roomNumber}` : 'Room 102';
  const wardCategory = occupiedBed?.category || 'General IPD Care';

  // Table & Modal states
  const [tableSearch, setTableSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTransferRecord, setSelectedTransferRecord] = useState<WardTransfer | null>(null);

  // Handle Patient selection
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    addToast('info', 'Patient Loaded', `Loaded read-only profile for ${patient.firstName} ${patient.lastName}`);
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
  };

  // Filtered Transfers Table
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const matchesSearch =
        t.patientName.toLowerCase().includes(tableSearch.toLowerCase()) ||
        t.patientUhid.toLowerCase().includes(tableSearch.toLowerCase()) ||
        t.currentWard.toLowerCase().includes(tableSearch.toLowerCase()) ||
        t.newWard.toLowerCase().includes(tableSearch.toLowerCase());
      const matchesBranch = selectedBranch === 'All' || !t.branch || t.branch === selectedBranch;
      return matchesSearch && matchesBranch;
    });
  }, [transfers, tableSearch, selectedBranch]);

  const paginatedTransfers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransfers.slice(start, start + itemsPerPage);
  }, [filteredTransfers, currentPage]);

  return (
    <div className="space-y-6">
      {/* Branch Selection Bar */}
      <NurseBranchSelector />

      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <nav className="flex text-xs font-semibold text-slate-500 gap-2 mb-1">
            <span>Nurse Module</span>
            <span>/</span>
            <span className="text-blue-600">Patient Ward</span>
          </nav>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-indigo-600" />
            <span>Patient Ward & Bed Location Details</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search patient from HMS database to view read-only ward assignment, room info, and transfer log. (Ward transfers managed by Reception).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-800">
          <Lock className="w-4 h-4 text-indigo-600" />
          <span>Read-Only Nurse Access</span>
        </div>
      </div>

      {/* STEP 1: PATIENT SEARCH */}
      <PatientSearch
        onSelectPatient={handleSelectPatient}
        selectedPatient={selectedPatient}
        onClearPatient={handleClearPatient}
      />

      {/* STEP 2: READ-ONLY PATIENT INFORMATION CARD */}
      <PatientInfoCard patient={selectedPatient} />

      {/* STEP 3: READ-ONLY PATIENT WARD INFORMATION DISPLAY */}
      {selectedPatient && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-indigo-600" />
              <span>Assigned Ward Details for {selectedPatient.firstName} {selectedPatient.lastName}</span>
            </h3>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Read-Only Ward Info
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Assigned Ward (Read-Only)
              </label>
              <p className="font-bold text-slate-900 text-xs">{currentWard}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Assigned Bed Number (Read-Only)
              </label>
              <p className="font-bold text-slate-900 text-xs">{currentBed}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Room Number & Category
              </label>
              <p className="font-bold text-slate-900 text-xs">{roomNumber} ({wardCategory})</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Occupancy & Admission Status
              </label>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {selectedPatient.status === 'Admitted' ? '🟢 IPD Admitted & Occupied' : '🔵 Daycare / OPD'}
              </span>
            </div>
          </div>

          {/* Access Banner */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center gap-3 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="font-medium">
              <strong>Reception Management Restriction:</strong> Patient ward transfers and bed allocations are authorized exclusively by the <strong>Reception Desk</strong>. Nurse portal has read-only access to view current patient ward locations.
            </p>
          </div>
        </div>
      )}

      {/* HISTORICAL TRANSFERS TABLE (READ-ONLY FOR NURSE) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
              <span>Patient Ward Transfer Log (Read-Only)</span>
            </h3>
            <p className="text-xs text-slate-500">History of patient bed transfers executed by Reception</p>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transfers..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Transfer ID</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">From Ward</th>
                <th className="py-3.5 px-4">To Ward</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">View Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedTransfers.length > 0 ? (
                paginatedTransfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{t.transferId}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{t.patientName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{t.patientUhid}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{t.currentWard} ({t.currentBed})</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{t.newWard} ({t.newBed})</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{t.transferDate} ({t.transferTime})</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600">{t.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTransferRecord(t);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                        title="View Transfer Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No transfers logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal (Read-Only) */}
      {selectedTransferRecord && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Transfer Details - ${selectedTransferRecord.transferId}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-xs p-2">
            <p><span className="font-bold text-slate-700">Patient:</span> {selectedTransferRecord.patientName} ({selectedTransferRecord.patientUhid})</p>
            <p><span className="font-bold text-slate-700">From Ward:</span> {selectedTransferRecord.currentWard} (Bed {selectedTransferRecord.currentBed})</p>
            <p><span className="font-bold text-slate-700">To Ward:</span> {selectedTransferRecord.newWard} (Bed {selectedTransferRecord.newBed})</p>
            <p><span className="font-bold text-slate-700">Transfer Reason:</span> {selectedTransferRecord.transferReason}</p>
            <p><span className="font-bold text-slate-700">Transferred By:</span> {selectedTransferRecord.transferredBy || 'Reception Desk'}</p>
            <p><span className="font-bold text-slate-700">Status:</span> <span className="font-bold text-emerald-600">{selectedTransferRecord.status}</span></p>
            <div className="flex justify-end pt-3">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

