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
function spreadStatus(spread: number): Status {
  if (spread < 0.1) return "good";
  if (spread <= 0.2) return "warning";
  return "fault";
}
function insulationStatus(pos: number, neg: number): Status {
  if (pos < 0.5 || neg < 0.5) return "fault";
  if (pos < 1 || neg < 1) return "warning";
  return "good";
}
function chargingCircuitStatus(
  chargerV: number,
  portV: number,
  chargerVRaw: string,
): Status {
  if (!chargerVRaw) return "good";
  if (chargerV < 54 || chargerV > 58.8) return "warning";
  if (portV > 0 && chargerV - portV > 3) return "fault";
  return "good";
}

const FAULT_TEST_MAP: Record<string, string[]> = {
  "Battery not charging": ["voltage", "voltageDrop", "bms", "chargingCircuit"],
  "Low range": ["voltage", "ir", "temperature", "cellBalance"],
  "Vehicle not starting": ["voltage", "voltageDrop", "bms"],
  "Sudden power cut": ["voltage", "bms", "ir"],
  Overheating: ["temperature", "bms", "ir"],
  "No acceleration": ["voltage", "bms"],
  "Error code issue": ["bms", "voltage"],
  "Cell Imbalance": ["voltage", "cellBalance", "ir"],
  "Charging Stops Midway": ["voltage", "bms", "chargingCircuit"],
  "Battery Swelling": ["temperature", "ir", "insulation"],
  "Idle Drain / Parasitic Loss": ["voltage", "insulation", "bms"],
  "BMS Communication Failure": ["bms", "voltage"],
  "Contactor / Relay Failure": ["voltage", "voltageDrop", "bms"],
  // New battery faults
  "Voltage Sag Under Load": ["voltage", "voltageDrop", "ir"],
  "Cell Reversal Detected": ["voltage", "cellBalance", "bms"],
  "Pack Imbalance After Full Charge": ["cellBalance", "voltage", "ir"],
  "Charger Not Recognized by BMS": ["bms", "chargingCircuit"],
  "Regenerative Braking Fault": ["voltage", "bms"],
  "Battery Disconnects Under Acceleration": ["voltage", "voltageDrop", "ir"],
  "High Self-Discharge Rate": ["voltage", "insulation", "bms"],
  "Sulfation / Deep Discharge Damage": ["voltage", "ir", "cellBalance"],
  "Cell Short Circuit": ["voltage", "ir", "insulation", "temperature"],
  "Battery Capacity Below 60%": ["voltage", "ir", "cellBalance"],
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
  "Cell Imbalance":
    "One or more cells significantly off average voltage — possible cell degradation or BMS balancing failure",
  "Charging Stops Midway":
    "BMS overtemperature, overvoltage cutoff, or charger communication fault",
  "Battery Swelling":
    "Overcharge, internal short, or electrolyte breakdown — physical inspection required",
  "Idle Drain / Parasitic Loss":
    "BMS wake current, wiring leakage, or parasitic load from accessories",
  "BMS Communication Failure":
    "Faulty BMS module, broken CAN/UART wire, or power supply issue to BMS",
  "Contactor / Relay Failure":
    "Welded contacts, coil failure, or driver circuit fault — check with multimeter",
  "Voltage Sag Under Load":
    "High internal resistance or degraded cells dropping voltage under current draw",
  "Cell Reversal Detected":
    "One or more cells deeply discharged below 0V — cell permanently damaged, pack must be rebuilt",
  "Pack Imbalance After Full Charge":
    "Passive balancing insufficient, active balancer needed, or one group has high self-discharge",
  "Charger Not Recognized by BMS":
    "BMS communication port fault, charger protocol mismatch, or damaged charge connector",
  "Regenerative Braking Fault":
    "Controller regen parameter misconfigured, or BMS rejecting charge current during regen",
  "Battery Disconnects Under Acceleration":
    "BMS overcurrent protection triggering, or high IR causing voltage sag below cutoff threshold",
  "High Self-Discharge Rate":
    "Internal cell micro-short, BMS parasitic drain, or wiring insulation breakdown to chassis",
  "Sulfation / Deep Discharge Damage":
    "Pack left discharged for extended period — cells may be unrecoverable, check individual cell voltages",
  "Cell Short Circuit":
    "Manufacturing defect or physical damage causing internal short — immediate isolation required",
  "Battery Capacity Below 60%":
    "Normal aging past end-of-life threshold, or accelerated degradation from deep cycles/heat",
};

const BMS_FLAG_LABELS = [
  { key: "overvoltage" as const, label: "Overvoltage" },
  { key: "undervoltage" as const, label: "Undervoltage" },
  { key: "overcurrent" as const, label: "Overcurrent" },
  { key: "temperatureFault" as const, label: "Temp Fault" },
  { key: "cellImbalance" as const, label: "Cell Imbalance" },
  { key: "communicationFault" as const, label: "Comm Failure" },
  { key: "contactorFault" as const, label: "Contactor Fault" },
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

  // Cell Balance
  const cellBalVals = testResults.cellBalanceVoltages
    .map((v) => Number.parseFloat(v))
    .filter((v) => !Number.isNaN(v) && v > 0);
  const cellBalMin = cellBalVals.length ? Math.min(...cellBalVals) : 0;
  const cellBalMax = cellBalVals.length ? Math.max(...cellBalVals) : 0;
  const cellBalSpread = cellBalVals.length ? cellBalMax - cellBalMin : 0;
  const cellBalSt: Status = cellBalVals.length
    ? spreadStatus(cellBalSpread)
    : "good";

  // Insulation
  const insulPosVal =
    Number.parseFloat(testResults.insulationResistancePosGnd) || 0;
  const insulNegVal =
    Number.parseFloat(testResults.insulationResistanceNegGnd) || 0;
  const insulSt: Status =
    testResults.insulationResistancePosGnd ||
    testResults.insulationResistanceNegGnd
      ? insulationStatus(insulPosVal, insulNegVal)
      : "good";

  // Charging Circuit
  const chargerVVal = Number.parseFloat(testResults.chargerOutputVoltage) || 0;
  const chargingPortVVal =
    Number.parseFloat(testResults.chargingPortVoltage) || 0;
  const chargingCircuitSt: Status = chargingCircuitStatus(
    chargerVVal,
    chargingPortVVal,
    testResults.chargerOutputVoltage,
  );

  // Health score
  const healthScore = useMemo(() => {
    const statuses = [
      packVStatus,
      dropSt,
      irSt,
      tempSt,
      bmsSt,
      cellBalSt,
      insulSt,
      chargingCircuitSt,
    ];
    let score = 100;
    for (const s of statuses) {
      if (s === "fault") score -= 20;
      else if (s === "warning") score -= 8;
    }
    return Math.max(0, score);
  }, [
    packVStatus,
    dropSt,
    irSt,
    tempSt,
    bmsSt,
    cellBalSt,
    insulSt,
    chargingCircuitSt,
  ]);

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
    if (cellBalSt !== "good" && cellBalVals.length > 0)
      issues.push(
        `Cell imbalance ${cellBalSt}: spread ${cellBalSpread.toFixed(3)}V`,
      );
    if (insulSt !== "good" && (insulPosVal > 0 || insulNegVal > 0))
      issues.push(
        `Insulation resistance ${insulSt}: +${insulPosVal}MΩ / -${insulNegVal}MΩ`,
      );
    if (chargingCircuitSt !== "good" && testResults.chargerOutputVoltage)
      issues.push(
        `Charging circuit ${chargingCircuitSt}: ${chargerVVal}V output`,
      );
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
    cellBalSt,
    cellBalVals.length,
    cellBalSpread,
    insulSt,
    insulPosVal,
    insulNegVal,
    chargingCircuitSt,
    testResults.chargerOutputVoltage,
    chargerVVal,
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
            <StepList
              steps={[
                "Set multimeter to DC Voltage (600V range for HV packs, 200V for 48V systems).",
                "Connect RED probe to B+ terminal, BLACK to B- terminal of battery pack.",
                "Record pack voltage at rest — no load, 5 min after charging stops.",
                "Accept: within ±5% of nominal. Reject: >10% deviation or reverse polarity reading.",
                "Check cell group voltages via balance connector — all groups should be within 50mV of each other.",
              ]}
            />
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
            <StepList
              steps={[
                "Measure idle pack voltage with motor off — record as V_idle.",
                "Apply load: run motor at 50% throttle for 30 seconds continuously.",
                "Measure pack voltage under load — record as V_load.",
                "Calculate: Drop = V_idle − V_load.",
                "Accept: drop <5% of nominal. Warning: 5–10%. Reject: >10% = high internal resistance.",
              ]}
            />
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
                    border: `1px solid ${
                      dropSt === "good"
                        ? "#2ED47A"
                        : dropSt === "warning"
                          ? "#F5C84B"
                          : "#E25555"
                    }44`,
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
            <StepList
              steps={[
                "Use dedicated battery IR tester (e.g. Hioki BT3554 or equivalent).",
                "Connect to pack B+ and B- with kelvin (4-wire) probes for accuracy.",
                "Record pack IR in milliohms (mΩ) — test at 50% SOC for best accuracy.",
                "Accept: <100mΩ. Warning: 100–300mΩ. Reject: >300mΩ — severe degradation.",
                "Test individual cells via balance connector. All cells should be within ±10% of the average cell IR.",
              ]}
            />
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
            <StepList
              steps={[
                "Use IR thermal gun — set emissivity to 0.95 for plastic/composite battery casing.",
                "Scan full battery surface in a grid pattern: top, sides, and bottom panels.",
                "Record: hottest point, coolest point, and average temperature.",
                "Accept: <45°C at rest, <60°C under load.",
                ">65°C on any cell group = immediate stop — isolate pack and check cooling path for blockage.",
              ]}
            />
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
            <StepList
              steps={[
                "Connect BMS diagnostic tool or Bluetooth OBD reader to the BMS communication port.",
                "Read all active fault codes and record each one before clearing.",
                "Check cell group voltages from BMS readout — flag any group with >50mV spread.",
                "Verify overcurrent protection threshold matches spec sheet value.",
                "Clear codes, apply 5-minute test load, then verify no codes return.",
              ]}
            />
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

        {/* Cell Balance Test */}
        {tests.includes("cellBalance") && (
          <TestCard
            title="Cell Balance Test"
            tool="Multimeter"
            status={cellBalSt}
          >
            <StepList
              steps={[
                "Fully charge pack to 100% SOC before testing — ensure charger CC-CV transition is complete.",
                "Connect balance tester or BMS reader to the balance connector harness.",
                "Read all cell group voltages simultaneously and enter below.",
                "Calculate: Spread = Max cell V − Min cell V.",
                "Accept: <50mV spread. Warning: 50–150mV. Reject: >150mV — active balancing required.",
                "Flag: any cell >3.65V (overcharged risk) or <3.0V (deep discharge damage).",
              ]}
            />
            <div>
              <div
                className="text-xs font-medium block mb-2"
                style={{ color: "#A8B0BA" }}
              >
                Cell Voltages — 16 Cells (V)
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-4">
                {testResults.cellBalanceVoltages.map((v, i) => {
                  const val = Number.parseFloat(v);
                  const isMin =
                    cellBalVals.length > 1 && val === cellBalMin && v !== "";
                  const isMax =
                    cellBalVals.length > 1 && val === cellBalMax && v !== "";
                  return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length array
                    <div key={`cb-${i}`} className="space-y-0.5">
                      <div
                        className="text-xs text-center font-medium"
                        style={{
                          color: isMin
                            ? "#E25555"
                            : isMax
                              ? "#F5C84B"
                              : "#4B5563",
                        }}
                      >
                        C{i + 1}
                        {isMin ? " ▼" : isMax ? " ▲" : ""}
                      </div>
                      <input
                        type="number"
                        className="cell-input"
                        placeholder="3.7"
                        value={v}
                        onChange={(e) => {
                          const next = [...testResults.cellBalanceVoltages];
                          next[i] = e.target.value;
                          updateTestResult("cellBalanceVoltages", next);
                        }}
                        style={{
                          borderColor: isMin
                            ? "#E25555"
                            : isMax
                              ? "#F5C84B"
                              : undefined,
                        }}
                        data-ocid={`cellbalance.cell.${i + 1}.input`}
                      />
                    </div>
                  );
                })}
              </div>
              {cellBalVals.length >= 2 && (
                <div
                  className="rounded-lg p-3 flex items-center gap-6"
                  style={{ background: "#0E1116", border: "1px solid #2B3540" }}
                >
                  <div className="text-center">
                    <div className="text-xs" style={{ color: "#E25555" }}>
                      MIN
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: "#E25555" }}
                    >
                      {cellBalMin.toFixed(3)}V
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs" style={{ color: "#F5C84B" }}>
                      MAX
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: "#F5C84B" }}
                    >
                      {cellBalMax.toFixed(3)}V
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs" style={{ color: "#A8B0BA" }}>
                      SPREAD
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{
                        color:
                          cellBalSt === "good"
                            ? "#2ED47A"
                            : cellBalSt === "warning"
                              ? "#F5C84B"
                              : "#E25555",
                      }}
                    >
                      {cellBalSpread.toFixed(3)}V
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: "#A8B0BA" }}>
                    {cellBalSt === "good" && "✓ Balanced"}
                    {cellBalSt === "warning" && "⚠ Slight imbalance"}
                    {cellBalSt === "fault" && "✕ Imbalance detected"}
                  </div>
                </div>
              )}
            </div>
          </TestCard>
        )}

        {/* Insulation Resistance Test */}
        {tests.includes("insulation") && (
          <TestCard
            title="Insulation Resistance Test"
            tool="Megger / Insulation Tester"
            status={insulSt}
          >
            <StepList
              steps={[
                "Disconnect battery pack from vehicle completely — isolate both B+ and B- poles.",
                "Set Megger insulation tester to 500V DC test voltage.",
                "Connect positive probe to B+ terminal, negative probe to chassis/frame ground.",
                "Hold test for 60 seconds — record the final stable reading.",
                "Repeat: B- terminal to chassis/frame ground.",
                "Accept: >10MΩ. Warning: 1–10MΩ. Reject: <1MΩ = insulation breakdown — do NOT use.",
              ]}
            />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#A8B0BA" }}
                >
                  Positive to GND (MΩ)
                </div>
                <input
                  type="number"
                  className="diag-input"
                  placeholder="e.g. 2.5"
                  value={testResults.insulationResistancePosGnd}
                  onChange={(e) =>
                    updateTestResult(
                      "insulationResistancePosGnd",
                      e.target.value,
                    )
                  }
                  data-ocid="insulation.pos_gnd.input"
                />
              </div>
              <div>
                <div
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#A8B0BA" }}
                >
                  Negative to GND (MΩ)
                </div>
                <input
                  type="number"
                  className="diag-input"
                  placeholder="e.g. 2.5"
                  value={testResults.insulationResistanceNegGnd}
                  onChange={(e) =>
                    updateTestResult(
                      "insulationResistanceNegGnd",
                      e.target.value,
                    )
                  }
                  data-ocid="insulation.neg_gnd.input"
                />
              </div>
            </div>
            {(insulPosVal > 0 || insulNegVal > 0) && (
              <div
                className="rounded-lg p-3 space-y-1"
                style={{ background: "#0E1116", border: "1px solid #2B3540" }}
              >
                <InsulationRow label="+ Terminal" value={insulPosVal} />
                <InsulationRow label="− Terminal" value={insulNegVal} />
                <div
                  className="text-xs pt-1"
                  style={{
                    color:
                      insulSt === "good"
                        ? "#2ED47A"
                        : insulSt === "warning"
                          ? "#F5C84B"
                          : "#E25555",
                    borderTop: "1px solid #2B3540",
                    paddingTop: 6,
                    marginTop: 4,
                  }}
                >
                  {insulSt === "good" && "✓ Insulation integrity good"}
                  {insulSt === "warning" && "⚠ Marginal insulation — monitor"}
                  {insulSt === "fault" &&
                    "✕ Insulation breakdown — immediate action required"}
                </div>
              </div>
            )}
          </TestCard>
        )}

        {/* Charging Circuit Test */}
        {tests.includes("chargingCircuit") && (
          <TestCard
            title="Charging Circuit Test"
            tool="Multimeter"
            status={chargingCircuitSt}
          >
            <StepList
              steps={[
                "Connect charger to vehicle charging port — do not start charging yet.",
                "Measure charger output voltage at charging port pins (not at charger brick output).",
                "Measure charging current with a clamp meter around the main charge wire.",
                "Wiring drop = Charger output V − Charging port V.",
                "Accept: drop <1V. Reject: >2V drop = bad wiring, corroded connector, or undersized cable.",
                "Verify current tapers down as pack approaches 100% SOC (CC→CV phase transition).",
              ]}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#A8B0BA" }}
                >
                  Charger Output Voltage (V)
                </div>
                <input
                  type="number"
                  className="diag-input"
                  placeholder="e.g. 58.0"
                  value={testResults.chargerOutputVoltage}
                  onChange={(e) =>
                    updateTestResult("chargerOutputVoltage", e.target.value)
                  }
                  data-ocid="charging.charger_output_voltage.input"
                />
              </div>
              <div>
                <div
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#A8B0BA" }}
                >
                  Charger Output Current (A)
                </div>
                <input
                  type="number"
                  className="diag-input"
                  placeholder="e.g. 10.0"
                  value={testResults.chargerOutputCurrent}
                  onChange={(e) =>
                    updateTestResult("chargerOutputCurrent", e.target.value)
                  }
                  data-ocid="charging.charger_output_current.input"
                />
              </div>
              <div>
                <div
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#A8B0BA" }}
                >
                  Charging Port Voltage (V)
                </div>
                <input
                  type="number"
                  className="diag-input"
                  placeholder="e.g. 57.5"
                  value={testResults.chargingPortVoltage}
                  onChange={(e) =>
                    updateTestResult("chargingPortVoltage", e.target.value)
                  }
                  data-ocid="charging.port_voltage.input"
                />
              </div>
            </div>
            {testResults.chargerOutputVoltage && (
              <div
                className="rounded-lg p-3 space-y-2"
                style={{ background: "#0E1116", border: "1px solid #2B3540" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#A8B0BA" }}>
                    Charger Output
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color:
                        chargerVVal >= 54 && chargerVVal <= 58.8
                          ? "#2ED47A"
                          : "#F5C84B",
                    }}
                  >
                    {chargerVVal}V
                    {chargerVVal >= 54 && chargerVVal <= 58.8
                      ? " ✓ In range"
                      : " ⚠ Out of range"}
                  </span>
                </div>
                {chargingPortVVal > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#A8B0BA" }}>
                      Voltage drop (charger→port)
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color:
                          chargerVVal - chargingPortVVal > 3
                            ? "#E25555"
                            : "#2ED47A",
                      }}
                    >
                      {(chargerVVal - chargingPortVVal).toFixed(2)}V
                      {chargerVVal - chargingPortVVal > 3
                        ? " ✕ Wiring fault"
                        : " ✓ OK"}
                    </span>
                  </div>
                )}
              </div>
            )}
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

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-1.5 mb-4">
      {steps.map((s, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed list
        <li key={i} className="flex gap-2 text-xs" style={{ color: "#A8B0BA" }}>
          <span
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "#0E1116", color: "#4A9EFF", minWidth: 20 }}
          >
            {i + 1}
          </span>
          <span style={{ lineHeight: 1.5 }}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function InsulationRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const status: Status = value < 0.5 ? "fault" : value < 1 ? "warning" : "good";
  const color =
    status === "good"
      ? "#2ED47A"
      : status === "warning"
        ? "#F5C84B"
        : "#E25555";
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: "#A8B0BA" }}>
        {label}
      </span>
      <span className="text-xs font-bold" style={{ color }}>
        {value > 0 ? `${value} MΩ` : "—"}
        {value > 0 &&
          (status === "good" ? " ✓" : status === "warning" ? " ⚠" : " ✕")}
      </span>
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
