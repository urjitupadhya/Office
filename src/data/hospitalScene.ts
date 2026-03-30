export type HospitalPatientPlacement = {
  id: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  status?: 'critical' | 'warning' | 'stable' | 'recovering';
  problem?: string;
  points?: number;
  contributor?: {
    login: string;
    avatarUrl: string;
    lastCommitAt: string;
    commits: number;
  };
};

export const hospitalScene = {
  title: "CI CD Health Clinic",
  subtitle:
    "The clinic view fills each visible hospital bed with the patient sprite based on the sidebar patient count.",
  aspectRatio: "1024 / 554",
  backgroundSrc: "/raw_assets/hospital/hospital background.png",
  patientSpriteSrc: "/raw_assets/hospital/CRITICAL PATIENT ONE.png",
  maxPatients: 12,
  patientPlacements: [
    {
      id: "ward-top-left-01",
      label: "North Ward Bed 01",
      left: 5,
      top: 47.2,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      rotation: 180,
    },
    {
      id: "ward-top-left-02",
      label: "North Ward Bed 02",
      left: 8.1+5,
      top: 47.4,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      rotation: 180,   },
    {
      id: "ward-top-right-01",
      label: "East Ward Bed 01",
      left: 81.6 - 7,
      top: 47.4,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      rotation: 180,
    },
    {
      id: "ward-top-right-02",
      label: "East Ward Bed 02",
      left: 87.2 - 4.5,
      top: 47.4,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      rotation: 180,
    },
    {
      id: "ward-top-right-03",
      label: "East Ward Bed 03",
      left: 92.0,
      top: 47.4,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      rotation: 180,
    },
    {
      id: "ward-bottom-left-01",
      label: "South Wing Bed 01",
      left: 2.9,
      top: 78.4+4.4,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      
    },
    {
      id: "ward-bottom-left-02",
      label: "South Wing Bed 02",
      left: 6.6 + 13.5,
      top: 78.4 +6.6,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      rotation: 360,   },
    {
      id: "ward-bottom-center-01",
      label: "Recovery Bed 01",
      left: 20.8 + 13.9,
      top: 84.1+2,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      rotation: 360,
    },
    {
      id: "ward-bottom-center-02",
      label: "Recovery Bed 02",
      left: 36.9+11,
      top: 84.1+2,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      rotation: 360,
    },
    {
      id: "ward-bottom-center-03",
      label: "Recovery Bed 03",
      left: 49.7+12.5,
      top: 84.1+2,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      rotation: 360,
    },
    {
      id: "ward-bottom-right-01",
      label: "Recovery Bed 04",
      left: 78.0-1.5,
      top: 84.1+2,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      rotation: 360,
    },
    {
      id: "ward-bottom-right-02",
      label: "Recovery Bed 05",
      left: 91.1-1.5,
      top: 84.1+2,
      width: 4.2,
      height: 10.0,
      zIndex: 4,
      rotation: 360,
    },
  ] satisfies HospitalPatientPlacement[],
} as const;
