import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type VehicleType = "2-wheeler" | "3-wheeler";

export interface TestResults {
  // Voltage
  packVoltage: string;
  cellVoltages: string[];
  // Voltage Drop
  idleVoltage: string;
  loadVoltage: string;
  // IR
  packIR: string;
  cellIR: string[];
  // Temperature
  temps: string[];
  // BMS
  errorCode: string;
  bmsFlags: {
    overvoltage: boolean;
    undervoltage: boolean;
    overcurrent: boolean;
    temperatureFault: boolean;
  };
}

function defaultTestResults(): TestResults {
  return {
    packVoltage: "",
    cellVoltages: Array(12).fill(""),
    idleVoltage: "",
    loadVoltage: "",
    packIR: "",
    cellIR: Array(12).fill(""),
    temps: Array(6).fill(""),
    errorCode: "",
    bmsFlags: {
      overvoltage: false,
      undervoltage: false,
      overcurrent: false,
      temperatureFault: false,
    },
  };
}

export interface DiagnosisState {
  currentFault: string;
  customFault: string;
  vehicleId: string;
  technicianName: string;
  vehicleType: VehicleType;
  testResults: TestResults;
  checklistState: Record<string, boolean>;
  setCurrentFault: (v: string) => void;
  setCustomFault: (v: string) => void;
  setVehicleId: (v: string) => void;
  setTechnicianName: (v: string) => void;
  setVehicleType: (v: VehicleType) => void;
  updateTestResult: <K extends keyof TestResults>(
    key: K,
    val: TestResults[K],
  ) => void;
  toggleChecklist: (key: string) => void;
  resetDiagnosis: () => void;
}

const DiagnosisContext = createContext<DiagnosisState | null>(null);

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const [currentFault, setCurrentFault] = useState("");
  const [customFault, setCustomFault] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [technicianName, setTechnicianName] = useState("Alex Rodriguez");
  const [vehicleType, setVehicleType] = useState<VehicleType>("2-wheeler");
  const [testResults, setTestResults] =
    useState<TestResults>(defaultTestResults);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(
    {},
  );

  const updateTestResult = <K extends keyof TestResults>(
    key: K,
    val: TestResults[K],
  ) => {
    setTestResults((prev) => ({ ...prev, [key]: val }));
  };

  const toggleChecklist = (key: string) => {
    setChecklistState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetDiagnosis = () => {
    setCurrentFault("");
    setCustomFault("");
    setVehicleId("");
    setTestResults(defaultTestResults());
  };

  return (
    <DiagnosisContext.Provider
      value={{
        currentFault,
        customFault,
        vehicleId,
        technicianName,
        vehicleType,
        testResults,
        checklistState,
        setCurrentFault,
        setCustomFault,
        setVehicleId,
        setTechnicianName,
        setVehicleType,
        updateTestResult,
        toggleChecklist,
        resetDiagnosis,
      }}
    >
      {children}
    </DiagnosisContext.Provider>
  );
}

export function useDiagnosis(): DiagnosisState {
  const ctx = useContext(DiagnosisContext);
  if (!ctx)
    throw new Error("useDiagnosis must be used within DiagnosisProvider");
  return ctx;
}
