import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ERVisit,
  ERObservationBed,
  ERVitalSign,
  ERNursingNote,
  ERMedicationAdmin,
  ERLabOrder,
  ERPharmacyOrder,
  EROrderedProcedure,
  TriageStatus,
  ERStatus,
  ERDisposition,
} from '../types/er';
import { useHMS } from './HMSContext';

interface ERContextType {
  erVisits: ERVisit[];
  erObservationBeds: ERObservationBed[];
  createERVisit: (visitData: Omit<ERVisit, 'id' | 'registrationStatus' | 'triageStatus' | 'currentLocation' | 'erStatus' | 'erDisposition' | 'timeline' | 'createdDate'>) => ERVisit;
  getERVisitById: (id: string) => ERVisit | undefined;
  getERVisitByUhid: (uhid: string) => ERVisit | undefined;
  updateERTriage: (erVisitId: string, triageStatus: TriageStatus, triageNotes: string, nurseName: string) => void;
  recordERVitals: (erVisitId: string, vitals: ERVitalSign, nurseName: string) => void;
  addERNursingNote: (erVisitId: string, noteText: string, nurseName: string) => void;
  administerERMedication: (erVisitId: string, medData: Omit<ERMedicationAdmin, 'id'>) => void;
  recordDoctorAssessment: (
    erVisitId: string,
    assessment: string,
    diagnosis: string,
    labOrders?: ERLabOrder[],
    pharmacyOrders?: ERPharmacyOrder[],
    procedures?: EROrderedProcedure[],
    doctorName?: string
  ) => void;
  setERDisposition: (
    erVisitId: string,
    disposition: ERDisposition,
    dispositionNotes?: string,
    requiredWard?: string,
    doctorName?: string
  ) => void;
  assignObservationBed: (erVisitId: string, bedId: string) => void;
  releaseObservationBed: (bedId: string) => void;
  coordinateIPDAdmission: (erVisitId: string) => void;
}

const INITIAL_OBSERVATION_BEDS: ERObservationBed[] = [
  {
    id: 'OBS-BED-101',
    bedNumber: 'OBS-01',
    roomNumber: 'OBS-ROOM-A',
    observationWard: 'ER Observation Unit 1',
    bedStatus: 'Available',
  },
  {
    id: 'OBS-BED-102',
    bedNumber: 'OBS-02',
    roomNumber: 'OBS-ROOM-A',
    observationWard: 'ER Observation Unit 1',
    bedStatus: 'Available',
  },
  {
    id: 'OBS-BED-103',
    bedNumber: 'OBS-03',
    roomNumber: 'OBS-ROOM-B',
    observationWard: 'ER Observation Unit 1',
    bedStatus: 'Available',
  },
  {
    id: 'OBS-BED-104',
    bedNumber: 'OBS-04',
    roomNumber: 'OBS-ROOM-B',
    observationWard: 'ER Observation Unit 1',
    bedStatus: 'Available',
  },
  {
    id: 'OBS-BED-105',
    bedNumber: 'OBS-05',
    roomNumber: 'OBS-CRITICAL-1',
    observationWard: 'ER Critical Care Obs',
    bedStatus: 'Available',
  },
  {
    id: 'OBS-BED-106',
    bedNumber: 'OBS-06',
    roomNumber: 'OBS-CRITICAL-1',
    observationWard: 'ER Critical Care Obs',
    bedStatus: 'Available',
  },
];

const INITIAL_ER_VISITS: ERVisit[] = [
  {
    id: 'ERV-2026-101',
    patientUhid: 'UHID-2026-1001',
    patientName: 'Rahul Sharma',
    age: 45,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    emergencyContactName: 'Priya Sharma',
    emergencyContactPhone: '+91 98765 43211',
    emergencyRelationship: 'Wife',
    allergies: 'Penicillin',
    existingDiseases: 'Hypertension',
    arrivalDate: '2026-08-18',
    arrivalTime: '10:15 AM',
    arrivalMode: 'Ambulance',
    ambulanceInfo: {
      ambulanceNumber: 'KA-01-EM-9912',
      referralHospital: 'City Care Hospital',
      paramedicName: 'Suresh Paramedic',
      arrivalTime: '10:15 AM',
    },
    emergencyType: 'Cardiac',
    accompaniedBy: 'Priya Sharma (Wife)',
    emergencyContact: 'Priya Sharma (+91 98765 43211)',
    initialComplaint: 'Severe chest pressure radiating to left arm and sweating for 40 minutes.',
    registrationStatus: 'Registered',
    registeredBy: 'Reception Staff',
    triageStatus: 'Priority 1 (Red - Critical)',
    triageTime: '10:20 AM',
    triagedBy: 'Nurse Anjali Rao',
    triageNotes: 'Acute ST-segment elevation suspicion, vital unstable',
    currentLocation: 'ER Resuscitation Bay 01',
    erStatus: 'Under Doctor Assessment',
    assignedDoctor: 'Dr. Vikram Malhotra',
    vitals: {
      temperature: 98.4,
      bpSys: 160,
      bpDia: 100,
      bloodPressure: '160/100',
      pulseRate: 110,
      respiratoryRate: 24,
      spO2: 94,
      painScale: 9,
      recordedBy: 'Nurse Anjali Rao',
      recordedAt: '10:20 AM',
    },
    nursingNotes: [
      {
        id: 'ernn-1',
        note: 'Oxygen administered @ 4L/min via nasal cannula. ECG performed immediately.',
        recordedBy: 'Nurse Anjali Rao',
        time: '10:22 AM',
      },
    ],
    doctorAssessment: 'Acute Coronary Syndrome (STEMI suspect). Needs immediate troponin, ECG review & ICU admission.',
    diagnosis: 'Acute ST-Elevation Myocardial Infarction (STEMI)',
    labOrders: [
      { id: 'lab-1', testName: 'Troponin I STAT', priority: 'STAT', status: 'Sample Collected' },
      { id: 'lab-2', testName: 'ECG 12 Lead', priority: 'Emergency', status: 'Result Ready' },
    ],
    pharmacyOrders: [
      { id: 'ph-1', medicineName: 'Aspirin 300mg STAT', dosage: '300mg oral', quantity: 1, status: 'Dispensed' },
      { id: 'ph-2', medicineName: 'Clopidogrel 300mg STAT', dosage: '300mg oral', quantity: 1, status: 'Dispensed' },
    ],
    erDisposition: 'IPD',
    dispositionNotes: 'Urgent transfer to Cardiac ICU Bed required.',
    requiredWard: 'ICU',
    ipdAdmissionStatus: 'Pending Coordination',
    timeline: [
      { id: 't-1', timestamp: '10:15 AM', title: 'Emergency Visit Registered', actor: 'Reception Staff', role: 'Reception', description: 'Patient arrived via Ambulance KA-01-EM-9912' },
      { id: 't-2', timestamp: '10:20 AM', title: 'Triage Completed', actor: 'Nurse Anjali Rao', role: 'Nurse', description: 'Priority 1 (Red - Critical) assigned' },
      { id: 't-3', timestamp: '10:25 AM', title: 'Doctor Assessment', actor: 'Dr. Vikram Malhotra', role: 'Doctor', description: 'Initial evaluation for chest pain completed' },
      { id: 't-4', timestamp: '10:35 AM', title: 'ER Disposition Set to IPD', actor: 'Dr. Vikram Malhotra', role: 'Doctor', description: 'Recommended immediate Cardiac ICU Admission' },
    ],
    createdDate: '2026-08-18',
  },
  {
    id: 'ERV-2026-102',
    patientUhid: 'UHID-2026-1002',
    patientName: 'Sunita Patel',
    age: 32,
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+91 98123 45678',
    emergencyContactName: 'Ramesh Patel',
    emergencyContactPhone: '+91 98123 45679',
    emergencyRelationship: 'Husband',
    allergies: 'None',
    existingDiseases: 'Asthma',
    arrivalDate: '2026-08-18',
    arrivalTime: '11:00 AM',
    arrivalMode: 'Walk-in',
    emergencyType: 'Respiratory',
    accompaniedBy: 'Ramesh Patel (Husband)',
    emergencyContact: 'Ramesh Patel (+91 98123 45679)',
    initialComplaint: 'Acute breathlessness and wheezing after dust exposure.',
    registrationStatus: 'Registered',
    registeredBy: 'Reception Staff',
    triageStatus: 'Priority 2 (Yellow - Urgent)',
    triageTime: '11:05 AM',
    triagedBy: 'Nurse Anjali Rao',
    triageNotes: 'Moderate respiratory distress with wheezing.',
    currentLocation: 'ER Triage Room',
    erStatus: 'Waiting for Doctor',
    assignedDoctor: 'Dr. Vikram Malhotra',
    vitals: {
      temperature: 98.6,
      bpSys: 130,
      bpDia: 85,
      bloodPressure: '130/85',
      pulseRate: 98,
      respiratoryRate: 22,
      spO2: 95,
      painScale: 4,
      recordedBy: 'Nurse Anjali Rao',
      recordedAt: '11:05 AM',
    },
    erDisposition: 'Pending',
    timeline: [
      { id: 't-1', timestamp: '11:00 AM', title: 'Emergency Visit Registered', actor: 'Reception Staff', role: 'Reception', description: 'Walk-in emergency visit created.' },
      { id: 't-2', timestamp: '11:05 AM', title: 'Triage Completed', actor: 'Nurse Anjali Rao', role: 'Nurse', description: 'Assigned Priority 2 (Yellow - Urgent).' },
    ],
    createdDate: '2026-08-18',
  },
];

const ERContext = createContext<ERContextType | undefined>(undefined);

export const ERProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useHMS();

  const [erVisits, setErVisits] = useState<ERVisit[]>(() => {
    try {
      const saved = localStorage.getItem('hms_er_visits');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return INITIAL_ER_VISITS;
  });

  const [erObservationBeds, setErObservationBeds] = useState<ERObservationBed[]>(() => {
    try {
      const saved = localStorage.getItem('hms_er_beds');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return INITIAL_OBSERVATION_BEDS;
  });

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem('hms_er_visits', JSON.stringify(erVisits));
    } catch { /* ignore */ }
  }, [erVisits]);

  useEffect(() => {
    try {
      localStorage.setItem('hms_er_beds', JSON.stringify(erObservationBeds));
    } catch { /* ignore */ }
  }, [erObservationBeds]);

  const createERVisit = (visitData: Omit<ERVisit, 'id' | 'registrationStatus' | 'triageStatus' | 'currentLocation' | 'erStatus' | 'erDisposition' | 'timeline' | 'createdDate'>): ERVisit => {
    const newId = `ERV-2026-${100 + erVisits.length + 1}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toISOString().split('T')[0];

    const newVisit: ERVisit = {
      ...visitData,
      id: newId,
      registrationStatus: 'Registered',
      triageStatus: 'Pending Triage',
      currentLocation: 'ER Triage Queue',
      erStatus: 'Waiting for Triage',
      erDisposition: 'Pending',
      createdDate: today,
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          timestamp: visitData.arrivalTime || timestamp,
          title: 'Emergency Visit Registered',
          actor: visitData.registeredBy || 'Reception Staff',
          role: 'Reception',
          description: `Registered ER visit via ${visitData.arrivalMode} for ${visitData.emergencyType}.`,
        },
      ],
    };

    setErVisits((prev) => [newVisit, ...prev]);
    addToast('success', 'Emergency Visit Registered', `ER Visit ID: ${newId} created for ${visitData.patientName}`);
    return newVisit;
  };

  const getERVisitById = (id: string): ERVisit | undefined => {
    return erVisits.find((v) => v.id.toLowerCase() === id.toLowerCase() || v.patientUhid.toLowerCase() === id.toLowerCase());
  };

  const getERVisitByUhid = (uhid: string): ERVisit | undefined => {
    return erVisits.find((v) => v.patientUhid.toLowerCase() === uhid.toLowerCase() && v.erStatus !== 'Discharged' && v.erStatus !== 'Transferred');
  };

  const updateERTriage = (erVisitId: string, triageStatus: TriageStatus, triageNotes: string, nurseName: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setErVisits((prev) =>
      prev.map((v) => {
        if (v.id === erVisitId) {
          const updatedTimeline = [
            ...v.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp,
              title: 'Triage Completed',
              actor: nurseName,
              role: 'Nurse' as const,
              description: `Classification: ${triageStatus}. ${triageNotes}`,
            },
          ];
          return {
            ...v,
            triageStatus,
            triageTime: timestamp,
            triagedBy: nurseName,
            triageNotes,
            erStatus: 'Waiting for Doctor',
            currentLocation: 'ER Assessment Room',
            timeline: updatedTimeline,
          };
        }
        return v;
      })
    );
    addToast('info', 'Triage Status Updated', `Patient triage classified as ${triageStatus}`);
  };

  const recordERVitals = (erVisitId: string, vitals: ERVitalSign, nurseName: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setErVisits((prev) =>
      prev.map((v) => {
        if (v.id === erVisitId) {
          const updatedTimeline = [
            ...v.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp,
              title: 'Clinical Vitals Recorded',
              actor: nurseName,
              role: 'Nurse' as const,
              description: `BP: ${vitals.bloodPressure || `${vitals.bpSys}/${vitals.bpDia}`}, Pulse: ${vitals.pulseRate}, SpO2: ${vitals.spO2}%`,
            },
          ];
          return {
            ...v,
            vitals: { ...vitals, recordedBy: nurseName, recordedAt: timestamp },
            timeline: updatedTimeline,
          };
        }
        return v;
      })
    );
    addToast('success', 'Vitals Saved', 'Emergency vitals updated successfully.');
  };

  const addERNursingNote = (erVisitId: string, noteText: string, nurseName: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNote: ERNursingNote = {
      id: `ernn-${Date.now()}`,
      note: noteText,
      recordedBy: nurseName,
      time: timestamp,
    };
    setErVisits((prev) =>
      prev.map((v) => {
        if (v.id === erVisitId) {
          const existingNotes = v.nursingNotes || [];
          return {
            ...v,
            nursingNotes: [newNote, ...existingNotes],
            timeline: [
              ...v.timeline,
              {
                id: `tl-${Date.now()}`,
                timestamp,
                title: 'Nursing Note Recorded',
                actor: nurseName,
                role: 'Nurse',
                description: noteText.slice(0, 60) + '...',
              },
            ],
          };
        }
        return v;
      })
    );
    addToast('success', 'Note Added', 'Emergency nursing observation logged.');
  };

  const administerERMedication = (erVisitId: string, medData: Omit<ERMedicationAdmin, 'id'>) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMed: ERMedicationAdmin = {
      ...medData,
      id: `ermed-${Date.now()}`,
      timeGiven: timestamp,
    };
    setErVisits((prev) =>
      prev.map((v) => {
        if (v.id === erVisitId) {
          return {
            ...v,
            medicationsAdministered: [newMed, ...(v.medicationsAdministered || [])],
            timeline: [
              ...v.timeline,
              {
                id: `tl-${Date.now()}`,
                timestamp,
                title: 'Medication Administered',
                actor: medData.givenBy,
                role: 'Nurse',
                description: `${medData.medicineName} (${medData.dosage}) given via ${medData.route}`,
              },
            ],
          };
        }
        return v;
      })
    );
    addToast('success', 'Medication Given', `${medData.medicineName} recorded as administered.`);
  };

  const recordDoctorAssessment = (
    erVisitId: string,
    assessment: string,
    diagnosis: string,
    labOrders?: ERLabOrder[],
    pharmacyOrders?: ERPharmacyOrder[],
    procedures?: EROrderedProcedure[],
    doctorName: string = 'Dr. Vikram Malhotra'
  ) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setErVisits((prev) =>
      prev.map((v) => {
        if (v.id === erVisitId) {
          const updatedTimeline = [
            ...v.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp,
              title: 'Doctor Assessment & Diagnosis',
              actor: doctorName,
              role: 'Doctor' as const,
              description: `Diagnosis: ${diagnosis}. Assessment completed.`,
            },
          ];
          return {
            ...v,
            doctorAssessment: assessment,
            diagnosis,
            labOrders: labOrders || v.labOrders,
            pharmacyOrders: pharmacyOrders || v.pharmacyOrders,
            emergencyProcedures: procedures || v.emergencyProcedures,
            erStatus: 'Under Doctor Assessment',
            assignedDoctor: doctorName,
            timeline: updatedTimeline,
          };
        }
        return v;
      })
    );
    addToast('success', 'Doctor Assessment Saved', 'Diagnosis and consultation notes saved.');
  };

  const setERDisposition = (
    erVisitId: string,
    disposition: ERDisposition,
    dispositionNotes?: string,
    requiredWard?: string,
    doctorName: string = 'Dr. Vikram Malhotra'
  ) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setErVisits((prev) =>
      prev.map((v) => {
        if (v.id === erVisitId) {
          let nextErStatus: ERStatus = v.erStatus;
          if (disposition === 'Observation') nextErStatus = 'Observation';
          else if (disposition === 'IPD') nextErStatus = 'IPD Admission Pending';
          else if (disposition === 'Discharge') nextErStatus = 'Discharged';
          else if (disposition === 'Transferred') nextErStatus = 'Transferred';

          const updatedTimeline = [
            ...v.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp,
              title: `ER Disposition Set: ${disposition}`,
              actor: doctorName,
              role: 'Doctor' as const,
              description: dispositionNotes || `Decision: ${disposition}`,
            },
          ];

          return {
            ...v,
            erDisposition: disposition,
            dispositionNotes,
            requiredWard: requiredWard || v.requiredWard,
            erStatus: nextErStatus,
            ipdAdmissionStatus: disposition === 'IPD' ? 'Pending Coordination' : v.ipdAdmissionStatus,
            timeline: updatedTimeline,
          };
        }
        return v;
      })
    );
    addToast('info', 'ER Disposition Updated', `Disposition set to ${disposition}`);
  };

  const assignObservationBed = (erVisitId: string, bedId: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetBed = erObservationBeds.find((b) => b.id === bedId);
    const targetVisit = erVisits.find((v) => v.id === erVisitId);
    if (!targetBed || !targetVisit) return;

    // Update bed status
    setErObservationBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              bedStatus: 'Occupied',
              currentPatientUhid: targetVisit.patientUhid,
              currentPatientName: targetVisit.patientName,
              erVisitId: targetVisit.id,
              assignmentTime: timestamp,
            }
          : b
      )
    );

    // Update patient visit location & status
    const newLocation = `ER Observation - Room ${targetBed.roomNumber}, Bed ${targetBed.bedNumber}`;
    setErVisits((prev) =>
      prev.map((v) => {
        if (v.id === erVisitId) {
          return {
            ...v,
            currentLocation: newLocation,
            erStatus: 'Observation',
            erDisposition: 'Observation',
            timeline: [
              ...v.timeline,
              {
                id: `tl-${Date.now()}`,
                timestamp,
                title: 'Assigned Observation Bed',
                actor: 'Reception Staff',
                role: 'Reception',
                description: `Assigned to ${targetBed.observationWard} (${targetBed.bedNumber})`,
              },
            ],
          };
        }
        return v;
      })
    );
    addToast('success', 'Observation Bed Assigned', `${targetVisit.patientName} assigned to Bed ${targetBed.bedNumber}`);
  };

  const releaseObservationBed = (bedId: string) => {
    setErObservationBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              bedStatus: 'Available',
              currentPatientUhid: undefined,
              currentPatientName: undefined,
              erVisitId: undefined,
              assignmentTime: undefined,
            }
          : b
      )
    );
    addToast('info', 'Observation Bed Released', `Bed is now available.`);
  };

  const coordinateIPDAdmission = (erVisitId: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setErVisits((prev) =>
      prev.map((v) => {
        if (v.id === erVisitId) {
          return {
            ...v,
            erStatus: 'Transferred',
            ipdAdmissionStatus: 'Admitted',
            timeline: [
              ...v.timeline,
              {
                id: `tl-${Date.now()}`,
                timestamp,
                title: 'Transferred to IPD Ward',
                actor: 'Reception Staff',
                role: 'Reception',
                description: 'Coordinated IPD Admission & Ward Bed Allocation.',
              },
            ],
          };
        }
        return v;
      })
    );
    addToast('success', 'IPD Coordination Complete', 'ER Visit marked as transferred to IPD Admission.');
  };

  return (
    <ERContext.Provider
      value={{
        erVisits,
        erObservationBeds,
        createERVisit,
        getERVisitById,
        getERVisitByUhid,
        updateERTriage,
        recordERVitals,
        addERNursingNote,
        administerERMedication,
        recordDoctorAssessment,
        setERDisposition,
        assignObservationBed,
        releaseObservationBed,
        coordinateIPDAdmission,
      }}
    >
      {children}
    </ERContext.Provider>
  );
};

export const useER = () => {
  const context = useContext(ERContext);
  if (!context) {
    throw new Error('useER must be used within an ERProvider');
  }
  return context;
};
