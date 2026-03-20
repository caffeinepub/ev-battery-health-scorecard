import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { StatusBadge, ToolBadge } from "../components/StatusBadge";
import { useDiagnosis } from "../context/DiagnosisContext";

type Status = "good" | "warning" | "fault";

function voltageStatus(v: number): Status {
  if (v > 48) return "good";
  if (v >= 42) return "warning";
  return "fault";
}
function dropStatus(d: number): Status {
  if (d < 2) return "good";
  if (d <= 5) return "warning";
  return "fault";
}
function irStatus(v: number): Status {
  if (v < 50) return "good";
  if (v <= 100) return "warning";
  return "fault";
}
function tempStatus(avg: number): Status {
  if (avg < 40) return "good";
  if (avg <= 60) return "warning";
  return "fault";
}

const FAULT_TEST_MAP: Record<string, string[]> = {
  "Battery not charging": ["voltage", "voltageDrop", "bms"],
  "Low range": ["voltage", "ir", "temperature"],
  "Vehicle not starting": ["voltage", "voltageDrop", "bms"],
  "Sudden power cut": ["voltage", "bms", "ir"],
  Overheating: ["temperature", "bms", "ir"],
  "No acceleration": ["voltage", "bms"],
  "Error code issue": ["bms", "voltage"],
};

function getTests(fault: string): string[] {
  return (
    FAULT_TEST_MAP[fault] ?? [
      "voltage",
      "voltageDrop",
      "ir",
      "temperature",
      "bms",
    ]
  );
}

const FAULT_CAUSES: Record<string, string> = {
  "Battery not charging":
    "Possible BMS fault, charger incompatibility, or broken charge circuit",
  "Low range": "Cell degradation, imbalanced pack, or high internal resistance",
  "Vehicle not starting":
    "Low pack voltage, BMS protection triggered, or contactor failure",
  "Sudden power cut":
    "BMS over-temperature or over-current protection, loose connection",
  Overheating: "Blocked cooling, high ambient temp, or cell internal short",
  "No acceleration":
    "Throttle signal issue, controller fault, or low battery voltage",
  "Error code issue":
    "BMS fault stored in memory, sensor failure, or firmware issue",
};

const BMS_FLAG_LABELS = [
  { key: "overvoltage" as const, label: "Overvoltage" },
  { key: "undervoltage" as const, label: "Undervoltage" },
  { key: "overcurrent" as const, label: "Overcurrent" },
  { key: "temperatureFault" as const, label: "Temp Fault" },
];

export default function BatteryTests() {
  const {
    currentFault,
    customFault,
    vehicleId,
    testResults,
    updateTestResult,
  } = useDiagnosis();
  const fault = currentFault || customFault || "Unknown Fault";
  const tests = getTests(currentFault);

  // Voltage
  const packV = Number.parseFloat(testResults.packVoltage) || 0;
  const packVStatus = testResults.packVoltage ? voltageStatus(packV) : "good";

  // Drop
  const idle = Number.parseFloat(testResults.idleVoltage) || 0;
  const load = Number.parseFloat(testResults.loadVoltage) || 0;
  const drop = idle > 0 && load > 0 ? idle - load : 0;
  const dropSt = idle > 0 && load > 0 ? dropStatus(drop) : "good";

  // IR
  const packIRVal = Number.parseFloat(testResults.packIR) || 0;
  const irSt = testResults.packIR ? irStatus(packIRVal) : "good";

  // Temp
  const tempVals = testResults.temps
    .map((t) => Number.parseFloat(t))
    .filter((v) => !Number.isNaN(v) && v > 0);
  const avgTemp = tempVals.length
    ? tempVals.reduce((a, b) => a + b, 0) / tempVals.length
    : 0;
  const tempSt = tempVals.length ? tempStatus(avgTemp) : "good";

  // BMS
  const anyBmsFlag = Object.values(testResults.bmsFlags).some(Boolean);
  const bmsSt: Status = anyBmsFlag ? "fault" : "good";

  // Health score
  const healthScore = useMemo(() => {
    const statuses = [packVStatus, dropSt, irSt, tempSt, bmsSt];
    let score = 100;
    for (const s of statuses) {
      if (s === "fault") score -= 20;
      else if (s === "warning") score -= 8;
    }
    return Math.max(0, score);
  }, [packVStatus, dropSt, irSt, tempSt, bmsSt]);

  const healthColor =
    healthScore >= 70 ? "#2ED47A" : healthScore >= 40 ? "#F5C84B" : "#E25555";
  const healthLabel =
    healthScore >= 70 ? "Good" : healthScore >= 40 ? "Fair" : "Poor";

  const detectedIssues = useMemo(() => {
    const issues: string[] = [];
    if (packVStatus !== "good")
      issues.push(`Pack voltage ${packVStatus}: ${packV}V`);
    if (dropSt !== "good")
      issues.push(`Voltage drop ${dropSt}: ${drop.toFixed(2)}V`);
    if (irSt !== "good")
      issues.push(`Internal resistance ${irSt}: ${packIRVal}mΩ`);
    if (tempSt !== "good")
      issues.push(`Avg temperature ${tempSt}: ${avgTemp.toFixed(1)}°C`);
    if (anyBmsFlag) {
      const flags = BMS_FLAG_LABELS.filter(
        (f) => testResults.bmsFlags[f.key],
      ).map((f) => f.label);
      issues.push(`BMS faults: ${flags.join(", ")}`);
    }
    return issues;
  }, [
    packVStatus,
    packV,
    dropSt,
    drop,
    irSt,
    packIRVal,
    tempSt,
    avgTemp,
    anyBmsFlag,
    testResults.bmsFlags,
  ]);

  const recommendation =
    healthScore >= 70 ? "Monitor" : healthScore >= 40 ? "Repair" : "Replace";
  const recColor = recommendation === "Monitor" ? "#F5C84B" : "#E25555";

  return (
    <div className="flex gap-5">
      {/* Main test area */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Fault badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium" style={{ color: "#A8B0BA" }}>
            Diagnosing:
          </span>
          <span
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{
              background: "rgba(74,158,255,0.15)",
              color: "#4A9EFF",
              border: "1px solid rgba(74,158,255,0.3)",
            }}
          >
            {fault}
          </span>
          {vehicleId && (
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                background: "#1B222A",
                color: "#A8B0BA",
                border: "1px solid #2B3540",
              }}
            >
              {vehicleId}
            </span>
          )}
        </div>

        {/* Voltage Test */}
        {tests.includes("voltage") && (
          <TestCard title="Voltage Test" tool="Multimeter" status={packVStatus}>
            <p className="text-xs mb-4" style={{ color: "#A8B0BA" }}>
              Measure pack voltage with multimeter across main terminals. Check
              individual cell voltages for balance.
            </p>
            <div className="mb-4">
              <div
                className="text-xs font-medium block mb-1"
                style={{ color: "#A8B0BA" }}
              >
                Pack Voltage (V)
              </div>
              <input
                type="number"
                className="diag-input"
                style={{ maxWidth: 180 }}
                placeholder="e.g. 52.4"
                value={testResults.packVoltage}
                onChange={(e) =>
                  updateTestResult("packVoltage", e.target.value)
                }
                data-ocid="voltage.pack_voltage.input"
              />
            </div>
            <div>
              <div
                className="text-xs font-medium block mb-2"
                style={{ color: "#A8B0BA" }}
              >
                Cell Voltages — 12 Cells (V)
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {testResults.cellVoltages.map((v, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length array
                  <div key={`cv-${i}`} className="space-y-0.5">
                    <div
                      className="text-xs text-center"
                      style={{ color: "#4B5563" }}
                    >
                      C{i + 1}
                    </div>
                    <input
                      type="number"
                      className="cell-input"
                      placeholder="3.7"
                      value={v}
                      onChange={(e) => {
                        const next = [...testResults.cellVoltages];
                        next[i] = e.target.value;
                        updateTestResult("cellVoltages", next);
                      }}
                      data-ocid={`voltage.cell.${i + 1}.input`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TestCard>
        )}

        {/* Voltage Drop Test */}
        {tests.includes("voltageDrop") && (
          <TestCard title="Voltage Drop Test" tool="Multimeter" status={dropSt}>
            <p className="text-xs mb-4" style={{ color: "#A8B0BA" }}>
              Measure voltage at idle and under load (full throttle). Excessive
              drop indicates high resistance or weak cells.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#A8B0BA" }}
                >
                  Idle Voltage (V)
                </div>
                <input
                  type="number"
                  className="diag-input"
                  placeholder="e.g. 52.4"
                  value={testResults.idleVoltage}
                  onChange={(e) =>
                    updateTestResult("idleVoltage", e.target.value)
                  }
                  data-ocid="drop.idle_voltage.input"
                />
              </div>
              <div>
                <div
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#A8B0BA" }}
                >
                  Load Voltage (V)
                </div>
                <input
                  type="number"
                  className="diag-input"
                  placeholder="e.g. 49.8"
                  value={testResults.loadVoltage}
                  onChange={(e) =>
                    updateTestResult("loadVoltage", e.target.value)
                  }
                  data-ocid="drop.load_voltage.input"
                />
              </div>
            </div>
            {idle > 0 && load > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#A8B0BA" }}>
                  Calculated Drop:
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{
                    color:
                      dropSt === "good"
                        ? "#2ED47A"
                        : dropSt === "warning"
                          ? "#F5C84B"
                          : "#E25555",
                    background:
                      dropSt === "good"
                        ? "rgba(46,212,122,0.12)"
                        : dropSt === "warning"
                          ? "rgba(245,200,75,0.12)"
                          : "rgba(226,85,85,0.12)",
                    border: `1px solid ${dropSt === "good" ? "#2ED47A" : dropSt === "warning" ? "#F5C84B" : "#E25555"}44`,
                  }}
                >
                  {drop.toFixed(2)}V
                </span>
              </div>
            )}
          </TestCard>
        )}

        {/* IR Test */}
        {tests.includes("ir") && (
          <TestCard
            title="Internal Resistance Test"
            tool="IR Tester"
            status={irSt}
          >
            <p className="text-xs mb-4" style={{ color: "#A8B0BA" }}>
              High internal resistance causes voltage sag and heat. Measure at
              50% SOC for accuracy.
            </p>
            <div className="mb-4">
              <div
                className="text-xs font-medium block mb-1"
                style={{ color: "#A8B0BA" }}
              >
                Pack IR (mΩ)
              </div>
              <input
                type="number"
                className="diag-input"
                style={{ maxWidth: 180 }}
                placeholder="e.g. 45"
                value={testResults.packIR}
                onChange={(e) => updateTestResult("packIR", e.target.value)}
                data-ocid="ir.pack_ir.input"
              />
            </div>
            <div>
              <div
                className="text-xs font-medium block mb-2"
                style={{ color: "#A8B0BA" }}
              >
                Cell IR Values — 12 Cells (mΩ)
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {testResults.cellIR.map((v, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length array
                  <div key={`ci-${i}`} className="space-y-0.5">
                    <div
                      className="text-xs text-center"
                      style={{ color: "#4B5563" }}
                    >
                      C{i + 1}
                    </div>
                    <input
                      type="number"
                      className="cell-input"
                      placeholder="30"
                      value={v}
                      onChange={(e) => {
                        const next = [...testResults.cellIR];
                        next[i] = e.target.value;
                        updateTestResult("cellIR", next);
                      }}
                      data-ocid={`ir.cell.${i + 1}.input`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TestCard>
        )}

        {/* Temperature Test */}
        {tests.includes("temperature") && (
          <TestCard title="Temperature Test" tool="Thermal Gun" status={tempSt}>
            <p className="text-xs mb-4" style={{ color: "#A8B0BA" }}>
              Scan battery surface at 6 points. Temperature spread &gt;5°C may
              indicate failing cells.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {testResults.temps.map((v, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length array
                <div key={`tmp-${i}`}>
                  <div
                    className="text-xs font-medium block mb-1"
                    style={{ color: "#A8B0BA" }}
                  >
                    Point {i + 1} (°C)
                  </div>
                  <input
                    type="number"
                    className="diag-input"
                    placeholder="e.g. 35"
                    value={v}
                    onChange={(e) => {
                      const next = [...testResults.temps];
                      next[i] = e.target.value;
                      updateTestResult("temps", next);
                    }}
                    data-ocid={`temp.point.${i + 1}.input`}
                  />
                </div>
              ))}
            </div>
            {tempVals.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: "#A8B0BA" }}>
                    Average: {avgTemp.toFixed(1)}°C
                  </span>
                  <span className="text-xs" style={{ color: "#A8B0BA" }}>
                    Max: {Math.max(...tempVals).toFixed(1)}°C
                  </span>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ background: "#0E1116" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (avgTemp / 80) * 100)}%`,
                      background:
                        tempSt === "good"
                          ? "#2ED47A"
                          : tempSt === "warning"
                            ? "#F5C84B"
                            : "#E25555",
                    }}
                  />
                </div>
              </div>
            )}
          </TestCard>
        )}

        {/* BMS Diagnostics */}
        {tests.includes("bms") && (
          <TestCard title="BMS Diagnostics" tool="BMS Tool" status={bmsSt}>
            <p className="text-xs mb-4" style={{ color: "#A8B0BA" }}>
              Connect BMS diagnostic tool to read fault codes and check
              protection triggers.
            </p>
            <div className="mb-4">
              <div
                className="text-xs font-medium block mb-1"
                style={{ color: "#A8B0BA" }}
              >
                Error Code
              </div>
              <input
                className="diag-input"
                style={{ maxWidth: 240 }}
                placeholder="e.g. E001, OVP, UVP..."
                value={testResults.errorCode}
                onChange={(e) => updateTestResult("errorCode", e.target.value)}
                data-ocid="bms.error_code.input"
              />
            </div>
            <div>
              <div
                className="text-xs font-medium block mb-2"
                style={{ color: "#A8B0BA" }}
              >
                Active Faults — Toggle if detected
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BMS_FLAG_LABELS.map((f, i) => {
                  const isOn = testResults.bmsFlags[f.key];
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() =>
                        updateTestResult("bmsFlags", {
                          ...testResults.bmsFlags,
                          [f.key]: !isOn,
                        })
                      }
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all"
                      style={{
                        background: isOn ? "rgba(226,85,85,0.15)" : "#0E1116",
                        border: isOn
                          ? "1px solid #E25555"
                          : "1px solid #2B3540",
                        color: isOn ? "#E25555" : "#A8B0BA",
                      }}
                      data-ocid={`bms.fault_${i + 1}.toggle`}
                    >
                      <AlertTriangle
                        size={14}
                        style={{ color: isOn ? "#E25555" : "#4B5563" }}
                      />
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </TestCard>
        )}
      </div>

      {/* Live Results Panel */}
      <div className="w-72 flex-shrink-0">
        <div
          className="sticky top-6 rounded-xl p-4 space-y-4"
          style={{ background: "#1B222A", border: "1px solid #2B3540" }}
          data-ocid="results.panel"
        >
          <h3 className="font-semibold text-sm" style={{ color: "#E7EAEE" }}>
            Live Results
          </h3>

          {/* Health Score */}
          <div
            className="text-center py-3"
            style={{ borderBottom: "1px solid #2B3540" }}
          >
            <div
              className="text-5xl font-bold mb-1"
              style={{ color: healthColor }}
            >
              {healthScore}
            </div>
            <div className="text-xs" style={{ color: "#A8B0BA" }}>
              Battery Health Score
            </div>
            <div
              className="text-sm font-semibold mt-1"
              style={{ color: healthColor }}
            >
              {healthLabel}
            </div>
          </div>

          {/* Detected Issues */}
          <div>
            <div
              className="text-xs font-semibold mb-2"
              style={{ color: "#A8B0BA" }}
            >
              DETECTED ISSUES
            </div>
            {detectedIssues.length === 0 ? (
              <div className="text-xs" style={{ color: "#2ED47A" }}>
                ✓ No issues detected
              </div>
            ) : (
              <div className="space-y-1" data-ocid="results.issues.list">
                {detectedIssues.map((issue, i) => (
                  <div
                    key={issue}
                    className="flex items-start gap-1.5 text-xs"
                    style={{ color: "#E25555" }}
                    data-ocid={`results.issue.${i + 1}.item`}
                  >
                    <span className="mt-0.5 flex-shrink-0">⚠</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Cause */}
          <div style={{ borderTop: "1px solid #2B3540", paddingTop: 12 }}>
            <div
              className="text-xs font-semibold mb-1.5"
              style={{ color: "#A8B0BA" }}
            >
              SUGGESTED CAUSE
            </div>
            <p
              className="text-xs"
              style={{ color: "#E7EAEE", lineHeight: 1.5 }}
            >
              {FAULT_CAUSES[currentFault] ??
                "Perform all tests to determine root cause."}
            </p>
          </div>

          {/* Recommendation */}
          <div style={{ borderTop: "1px solid #2B3540", paddingTop: 12 }}>
            <div
              className="text-xs font-semibold mb-2"
              style={{ color: "#A8B0BA" }}
            >
              RECOMMENDED ACTION
            </div>
            <span
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold"
              style={{
                background: `${recColor}20`,
                color: recColor,
                border: `1px solid ${recColor}44`,
              }}
              data-ocid="results.recommendation.button"
            >
              {recommendation === "Monitor" ? "🟡" : "🔴"} {recommendation}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestCard({
  title,
  tool,
  status,
  children,
}: {
  title: string;
  tool: string;
  status: Status;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5"
      style={{ background: "#1B222A", border: "1px solid #2B3540" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h3 className="font-semibold text-sm" style={{ color: "#E7EAEE" }}>
            {title}
          </h3>
          <ToolBadge tool={tool} />
        </div>
        <StatusBadge status={status} />
      </div>
      {children}
    </motion.div>
  );
}
