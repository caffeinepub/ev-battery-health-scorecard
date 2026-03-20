import { motion } from "motion/react";
import { useState } from "react";
import { StatusBadge } from "../components/StatusBadge";

type Status = "good" | "warning" | "fault";

function battVoltStatus(v: number): Status {
  if (v > 56) return "good";
  if (v >= 48) return "warning";
  return "fault";
}
function currentStatus(v: number): Status {
  if (v < 20) return "good";
  if (v <= 40) return "warning";
  return "fault";
}
function ctrlTempStatus(v: number): Status {
  if (v < 50) return "good";
  if (v <= 70) return "warning";
  return "fault";
}
function throttleStatus(v: number): Status {
  if (v >= 0.8 && v <= 4.2) return "good";
  return "warning";
}
function motorStatus(v: string): Status {
  if (v === "Running") return "good";
  if (v === "Stalled") return "fault";
  return "warning";
}
function phaseStatus(
  u: number,
  v: number,
  w: number,
  hasValues: boolean,
): Status {
  if (!hasValues) return "good";
  const vals = [u, v, w].filter((x) => x > 0);
  if (vals.length < 2) return "good";
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const diff = max - min;
  if (diff > 10) return "fault";
  if (diff > 5) return "warning";
  return "good";
}
function hallStatus(a: string, b: string, c: string): Status {
  if (!a && !b && !c) return "good";
  const vals = [a, b, c]
    .map((v) => Number.parseFloat(v))
    .filter((v) => !Number.isNaN(v));
  if (vals.length === 0) return "good";
  // If all are 0 or all are 5V static = fault
  const allZero = vals.every((v) => v < 0.5);
  const allHigh = vals.every((v) => v > 4.5);
  if (allZero || allHigh) return "fault";
  return "good";
}
function gateStatus(gateV: number, hasVal: boolean): Status {
  if (!hasVal) return "good";
  if (gateV >= 10 && gateV <= 15) return "good";
  if (gateV >= 8) return "warning";
  return "fault";
}
function throttleCalibStatus(
  idle: number,
  full: number,
  hasIdle: boolean,
  hasFull: boolean,
): Status {
  if (!hasIdle && !hasFull) return "good";
  if (hasIdle && (idle < 0.5 || idle > 4.8)) return "fault";
  if (hasFull && (full < 0.5 || full > 4.8)) return "fault";
  if (hasIdle && (idle < 0.8 || idle > 1.0)) return "warning";
  if (hasFull && (full < 4.0 || full > 4.5)) return "warning";
  return "good";
}

const ERROR_CODES: Record<string, { label: string; action: string }> = {
  E01: {
    label: "Overcurrent",
    action: "Check phase wires and motor winding resistance",
  },
  E02: {
    label: "Overvoltage",
    action: "Battery voltage too high, check charger output",
  },
  E03: {
    label: "Undervoltage",
    action: "Low battery, check pack voltage and main fuse",
  },
  E04: {
    label: "Controller Overheat",
    action: "Check heat sink thermal paste, airflow",
  },
  E05: {
    label: "Hall Sensor Error",
    action: "Check Hall A/B/C wiring and 5V supply",
  },
  E06: {
    label: "Phase Loss",
    action: "One/more phase wire open or shorted to ground",
  },
  E07: {
    label: "Throttle Fault",
    action: "Throttle out of 0.8\u20134.2V calibration range",
  },
  E08: {
    label: "Brake Signal Fault",
    action: "Brake cut-off signal stuck active",
  },
  E09: {
    label: "Communication Error",
    action: "CAN bus / BMS communication lost",
  },
  E10: {
    label: "MOSFET Fault",
    action: "Internal transistor short, controller likely needs replacement",
  },
  E11: {
    label: "Motor Stall",
    action: "Motor blocked or severe phase imbalance",
  },
  E12: {
    label: "Temperature Sensor Fault",
    action: "NTC sensor open or shorted",
  },
};

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

function SectionHeader({ title, tool }: { title: string; tool: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-sm" style={{ color: "#E7EAEE" }}>
        {title}
      </h3>
      <span
        className="text-xs px-2 py-0.5 rounded"
        style={{
          background: "rgba(74,158,255,0.1)",
          color: "#4A9EFF",
          border: "1px solid rgba(74,158,255,0.25)",
        }}
      >
        {tool}
      </span>
    </div>
  );
}

export default function ControllerDiagnostics() {
  const [battV, setBattV] = useState("");
  const [currentDraw, setCurrentDraw] = useState("");
  const [ctrlTemp, setCtrlTemp] = useState("");
  const [throttle, setThrottle] = useState("");
  const [motor, setMotor] = useState("Running");

  // Phase Output
  const [phaseU, setPhaseU] = useState("");
  const [phaseV, setPhaseV] = useState("");
  const [phaseW, setPhaseW] = useState("");

  // Hall Sensor
  const [hallA, setHallA] = useState("");
  const [hallB, setHallB] = useState("");
  const [hallC, setHallC] = useState("");

  // MOSFET
  const [gateV, setGateV] = useState("");
  const [supplyV, setSupplyV] = useState("");

  // Throttle Calibration
  const [throttleIdle, setThrottleIdle] = useState("");
  const [throttleFull, setThrottleFull] = useState("");

  // Error Code Lookup
  const [errorCode, setErrorCode] = useState("");

  const bvNum = Number.parseFloat(battV) || 0;
  const cdNum = Number.parseFloat(currentDraw) || 0;
  const ctNum = Number.parseFloat(ctrlTemp) || 0;
  const thNum = Number.parseFloat(throttle) || 0;

  const bvSt = battV ? battVoltStatus(bvNum) : "good";
  const cdSt = currentDraw ? currentStatus(cdNum) : "good";
  const ctSt = ctrlTemp ? ctrlTempStatus(ctNum) : "good";
  const thSt = throttle ? throttleStatus(thNum) : "good";
  const motorSt = motorStatus(motor);

  const phaseUNum = Number.parseFloat(phaseU) || 0;
  const phaseVNum = Number.parseFloat(phaseV) || 0;
  const phaseWNum = Number.parseFloat(phaseW) || 0;
  const hasPhaseVals = !!(phaseU || phaseV || phaseW);
  const phaseSt = phaseStatus(phaseUNum, phaseVNum, phaseWNum, hasPhaseVals);
  const phaseMax = hasPhaseVals ? Math.max(phaseUNum, phaseVNum, phaseWNum) : 0;
  const phaseMin = hasPhaseVals
    ? Math.min(
        ...[phaseUNum, phaseVNum, phaseWNum].filter(
          (_x, i) => [phaseU, phaseV, phaseW][i] !== "",
        ),
      )
    : 0;
  const phaseDiff = hasPhaseVals ? phaseMax - phaseMin : 0;

  const hallSt = hallStatus(hallA, hallB, hallC);
  const gateNum = Number.parseFloat(gateV) || 0;
  const gateSt = gateStatus(gateNum, !!gateV);
  const throttleIdleNum = Number.parseFloat(throttleIdle) || 0;
  const throttleFullNum = Number.parseFloat(throttleFull) || 0;
  const throttleCalSt = throttleCalibStatus(
    throttleIdleNum,
    throttleFullNum,
    !!throttleIdle,
    !!throttleFull,
  );

  const allStatuses = [
    bvSt,
    cdSt,
    ctSt,
    thSt,
    motorSt,
    phaseSt,
    hallSt,
    gateSt,
    throttleCalSt,
  ];
  const hasFault = allStatuses.includes("fault");
  const hasWarning = allStatuses.includes("warning");
  const overallColor = hasFault
    ? "#E25555"
    : hasWarning
      ? "#F5C84B"
      : "#2ED47A";
  const overallLabel = hasFault
    ? "Fault Detected"
    : hasWarning
      ? "Needs Attention"
      : "Normal";

  const METRICS = [
    {
      label: "Battery Voltage",
      unit: "V",
      value: battV,
      setter: setBattV,
      status: bvSt,
      hint: "Normal: >56V | Warning: 48\u201356V | Fault: <48V",
      ocid: "ctrl.battery_voltage.input",
    },
    {
      label: "Current Draw",
      unit: "A",
      value: currentDraw,
      setter: setCurrentDraw,
      status: cdSt,
      hint: "Normal: <20A | Warning: 20\u201340A | Fault: >40A",
      ocid: "ctrl.current_draw.input",
    },
    {
      label: "Controller Temperature",
      unit: "\u00b0C",
      value: ctrlTemp,
      setter: setCtrlTemp,
      status: ctSt,
      hint: "Normal: <50\u00b0C | Warning: 50\u201370\u00b0C | Fault: >70\u00b0C",
      ocid: "ctrl.temp.input",
    },
    {
      label: "Throttle Signal",
      unit: "V",
      value: throttle,
      setter: setThrottle,
      status: thSt,
      hint: "Normal: 0.8\u20134.2V | Warning: outside range",
      ocid: "ctrl.throttle.input",
    },
  ];

  const lookupCode = errorCode.trim().toUpperCase();
  const matchedCode = ERROR_CODES[lookupCode];

  return (
    <div className="flex gap-5">
      {/* Left: Input Cards */}
      <div className="flex-1 min-w-0 space-y-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#E7EAEE" }}>
            Controller Diagnostics
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#A8B0BA" }}>
            Enter measured values to assess controller and motor health
          </p>
        </div>

        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl p-5"
            style={{ background: "#1B222A", border: "1px solid #2B3540" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3
                className="font-semibold text-sm"
                style={{ color: "#E7EAEE" }}
              >
                {m.label}
              </h3>
              <StatusBadge status={m.status} />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                className="diag-input"
                style={{ maxWidth: 160 }}
                placeholder={`Enter value (${m.unit})`}
                value={m.value}
                onChange={(e) => m.setter(e.target.value)}
                data-ocid={m.ocid}
              />
              <span className="text-sm" style={{ color: "#A8B0BA" }}>
                {m.unit}
              </span>
            </div>
            <p className="text-xs mt-2" style={{ color: "#4B5563" }}>
              {m.hint}
            </p>
          </motion.div>
        ))}

        {/* Motor Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="rounded-xl p-5"
          style={{ background: "#1B222A", border: "1px solid #2B3540" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: "#E7EAEE" }}>
              Motor Status
            </h3>
            <StatusBadge status={motorSt} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Running", "Stalled", "No Signal", "Intermittent"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setMotor(opt)}
                className="px-3 py-2 rounded-lg text-sm transition-all"
                style={{
                  background:
                    motor === opt
                      ? opt === "Running"
                        ? "rgba(46,212,122,0.15)"
                        : opt === "Stalled"
                          ? "rgba(226,85,85,0.15)"
                          : "rgba(245,200,75,0.15)"
                      : "#0E1116",
                  border:
                    motor === opt
                      ? `2px solid ${opt === "Running" ? "#2ED47A" : opt === "Stalled" ? "#E25555" : "#F5C84B"}`
                      : "1px solid #2B3540",
                  color:
                    motor === opt
                      ? opt === "Running"
                        ? "#2ED47A"
                        : opt === "Stalled"
                          ? "#E25555"
                          : "#F5C84B"
                      : "#A8B0BA",
                }}
                data-ocid={`ctrl.motor_${opt.toLowerCase().replace(" ", "_")}.toggle`}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── NEW: Phase Output Test ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="rounded-xl p-5"
          style={{ background: "#1B222A", border: "1px solid #2B3540" }}
          data-ocid="ctrl.phase_output.card"
        >
          <div className="flex items-center justify-between mb-1">
            <SectionHeader
              title="Phase Output Test"
              tool="Multimeter (AC) / Oscilloscope"
            />
            <StatusBadge status={phaseSt} />
          </div>
          <StepList
            steps={[
              "Set multimeter to AC voltage mode.",
              "Measure between controller U–V, V–W, W–U terminals while motor is running at low speed.",
              "Record all three phase voltages.",
              "Normal = balanced 3-phase output (all within 5V of each other).",
              "Flag yellow if diff >5V, red if diff >10V — indicates open/shorted phase wire.",
            ]}
          />
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              {
                label: "U-Phase (V)",
                val: phaseU,
                set: setPhaseU,
                ocid: "ctrl.phase_u.input",
              },
              {
                label: "V-Phase (V)",
                val: phaseV,
                set: setPhaseV,
                ocid: "ctrl.phase_v.input",
              },
              {
                label: "W-Phase (V)",
                val: phaseW,
                set: setPhaseW,
                ocid: "ctrl.phase_w.input",
              },
            ].map((p) => (
              <div key={p.label}>
                <div
                  className="text-xs font-medium mb-1"
                  style={{ color: "#A8B0BA" }}
                >
                  {p.label}
                </div>
                <input
                  type="number"
                  className="diag-input"
                  placeholder="e.g. 48"
                  value={p.val}
                  onChange={(e) => p.set(e.target.value)}
                  data-ocid={p.ocid}
                />
              </div>
            ))}
          </div>
          {hasPhaseVals && (
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{
                background:
                  phaseSt === "fault"
                    ? "rgba(226,85,85,0.1)"
                    : phaseSt === "warning"
                      ? "rgba(245,200,75,0.1)"
                      : "rgba(46,212,122,0.1)",
                border: `1px solid ${
                  phaseSt === "fault"
                    ? "#E25555"
                    : phaseSt === "warning"
                      ? "#F5C84B"
                      : "#2ED47A"
                }44`,
              }}
            >
              <span className="text-xs" style={{ color: "#A8B0BA" }}>
                Max deviation:
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  color:
                    phaseSt === "fault"
                      ? "#E25555"
                      : phaseSt === "warning"
                        ? "#F5C84B"
                        : "#2ED47A",
                }}
              >
                {phaseDiff.toFixed(1)}V
              </span>
              <span className="text-xs ml-auto" style={{ color: "#A8B0BA" }}>
                {phaseSt === "fault"
                  ? "FAULT: >10V"
                  : phaseSt === "warning"
                    ? "WARNING: >5V"
                    : "Normal: <5V"}
              </span>
            </div>
          )}
        </motion.div>

        {/* ─── NEW: Hall Sensor Test ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="rounded-xl p-5"
          style={{ background: "#1B222A", border: "1px solid #2B3540" }}
          data-ocid="ctrl.hall_sensor.card"
        >
          <div className="flex items-center justify-between mb-1">
            <SectionHeader
              title="Hall Sensor Test"
              tool="Multimeter DC / Oscilloscope"
            />
            <StatusBadge status={hallSt} />
          </div>
          <StepList
            steps={[
              "Measure hall sensor signal wires while slowly rotating rear wheel by hand.",
              "Each hall wire (A/B/C) should toggle between 0V and 5V as wheel turns.",
              "Normal: 4.5\u20135.5V high, 0\u20130.5V low.",
              "If all three read 0V: check 5V supply to hall sensor connector.",
              "If all three read 5V static: sensor stuck or wheel not turning far enough.",
            ]}
          />
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              {
                label: "Hall A (V)",
                val: hallA,
                set: setHallA,
                ocid: "ctrl.hall_a.input",
              },
              {
                label: "Hall B (V)",
                val: hallB,
                set: setHallB,
                ocid: "ctrl.hall_b.input",
              },
              {
                label: "Hall C (V)",
                val: hallC,
                set: setHallC,
                ocid: "ctrl.hall_c.input",
              },
            ].map((h) => (
              <div key={h.label}>
                <div
                  className="text-xs font-medium mb-1"
                  style={{ color: "#A8B0BA" }}
                >
                  {h.label}
                </div>
                <input
                  type="number"
                  className="diag-input"
                  placeholder="0 or 5"
                  value={h.val}
                  onChange={(e) => h.set(e.target.value)}
                  data-ocid={h.ocid}
                />
              </div>
            ))}
          </div>
          {(hallA || hallB || hallC) && (
            <div
              className="text-xs px-3 py-2 rounded-lg"
              style={{
                background:
                  hallSt === "fault"
                    ? "rgba(226,85,85,0.1)"
                    : "rgba(46,212,122,0.1)",
                border: `1px solid ${hallSt === "fault" ? "#E25555" : "#2ED47A"}44`,
                color: hallSt === "fault" ? "#E25555" : "#2ED47A",
              }}
            >
              {hallSt === "fault"
                ? "FAULT: All signals identical \u2014 check 5V supply and wiring"
                : "Signals vary \u2014 sensors responding normally"}
            </div>
          )}
        </motion.div>

        {/* ─── NEW: MOSFET / Gate Drive Check ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="rounded-xl p-5"
          style={{ background: "#1B222A", border: "1px solid #2B3540" }}
          data-ocid="ctrl.mosfet.card"
        >
          <div className="flex items-center justify-between mb-1">
            <SectionHeader
              title="MOSFET / Gate Drive Check"
              tool="Multimeter DC"
            />
            <StatusBadge status={gateSt} />
          </div>
          <StepList
            steps={[
              "Power on the controller (do NOT apply throttle yet).",
              "Locate gate drive pins on the controller PCB (refer to service manual).",
              "Set multimeter to DC voltage and measure gate drive output voltage.",
              "Normal gate drive: 10\u201315V. <10V = dead gate driver IC.",
              "Also measure main supply voltage at controller input terminals.",
              "If gate drive is 0V with supply present = gate driver fault \u2014 controller likely needs replacement.",
            ]}
          />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div
                className="text-xs font-medium mb-1"
                style={{ color: "#A8B0BA" }}
              >
                Gate Drive Voltage (V)
              </div>
              <input
                type="number"
                className="diag-input"
                placeholder="e.g. 12"
                value={gateV}
                onChange={(e) => setGateV(e.target.value)}
                data-ocid="ctrl.gate_drive.input"
              />
              <div className="text-xs mt-1" style={{ color: "#4B5563" }}>
                Normal: 10\u201315V
              </div>
            </div>
            <div>
              <div
                className="text-xs font-medium mb-1"
                style={{ color: "#A8B0BA" }}
              >
                Controller Supply Voltage (V)
              </div>
              <input
                type="number"
                className="diag-input"
                placeholder="e.g. 48"
                value={supplyV}
                onChange={(e) => setSupplyV(e.target.value)}
                data-ocid="ctrl.supply_voltage.input"
              />
            </div>
          </div>
          {gateV && (
            <div
              className="text-xs px-3 py-2 rounded-lg"
              style={{
                background:
                  gateSt === "fault"
                    ? "rgba(226,85,85,0.1)"
                    : gateSt === "warning"
                      ? "rgba(245,200,75,0.1)"
                      : "rgba(46,212,122,0.1)",
                border: `1px solid ${gateSt === "fault" ? "#E25555" : gateSt === "warning" ? "#F5C84B" : "#2ED47A"}44`,
                color:
                  gateSt === "fault"
                    ? "#E25555"
                    : gateSt === "warning"
                      ? "#F5C84B"
                      : "#2ED47A",
              }}
            >
              {gateSt === "fault"
                ? `FAULT: Gate drive ${gateV}V \u2014 dead gate driver, controller replacement likely needed`
                : gateSt === "warning"
                  ? `WARNING: Gate drive ${gateV}V \u2014 slightly low, check power supply`
                  : `Normal: Gate drive ${gateV}V \u2014 gate driver functional`}
            </div>
          )}
        </motion.div>

        {/* ─── NEW: Throttle Calibration Check ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
          className="rounded-xl p-5"
          style={{ background: "#1B222A", border: "1px solid #2B3540" }}
          data-ocid="ctrl.throttle_cal.card"
        >
          <div className="flex items-center justify-between mb-1">
            <SectionHeader
              title="Throttle Calibration Check"
              tool="Multimeter DC"
            />
            <StatusBadge status={throttleCalSt} />
          </div>
          <StepList
            steps={[
              "Backprobe throttle signal wire at controller input connector (use thin probe tip).",
              "Set multimeter to DC voltage, GND probe to battery negative.",
              "Record voltage with throttle at full rest position.",
              "Slowly open throttle to maximum and record full-throttle voltage.",
              "Idle normal: 0.8\u20131.0V. Full normal: 4.0\u20134.5V.",
              "Out of 0.5\u20134.8V range = fault, throttle needs replacement or recalibration.",
            ]}
          />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div
                className="text-xs font-medium mb-1"
                style={{ color: "#A8B0BA" }}
              >
                Throttle Idle Voltage (V)
              </div>
              <input
                type="number"
                className="diag-input"
                placeholder="e.g. 0.85"
                value={throttleIdle}
                onChange={(e) => setThrottleIdle(e.target.value)}
                data-ocid="ctrl.throttle_idle.input"
              />
              <div className="text-xs mt-1" style={{ color: "#4B5563" }}>
                Normal idle: 0.8\u20131.0V
              </div>
            </div>
            <div>
              <div
                className="text-xs font-medium mb-1"
                style={{ color: "#A8B0BA" }}
              >
                Throttle Full Voltage (V)
              </div>
              <input
                type="number"
                className="diag-input"
                placeholder="e.g. 4.2"
                value={throttleFull}
                onChange={(e) => setThrottleFull(e.target.value)}
                data-ocid="ctrl.throttle_full.input"
              />
              <div className="text-xs mt-1" style={{ color: "#4B5563" }}>
                Normal full: 4.0\u20134.5V
              </div>
            </div>
          </div>
          {(throttleIdle || throttleFull) && (
            <div
              className="text-xs px-3 py-2 rounded-lg"
              style={{
                background:
                  throttleCalSt === "fault"
                    ? "rgba(226,85,85,0.1)"
                    : throttleCalSt === "warning"
                      ? "rgba(245,200,75,0.1)"
                      : "rgba(46,212,122,0.1)",
                border: `1px solid ${throttleCalSt === "fault" ? "#E25555" : throttleCalSt === "warning" ? "#F5C84B" : "#2ED47A"}44`,
                color:
                  throttleCalSt === "fault"
                    ? "#E25555"
                    : throttleCalSt === "warning"
                      ? "#F5C84B"
                      : "#2ED47A",
              }}
            >
              {throttleCalSt === "fault"
                ? "FAULT: Voltage out of safe range (0.5\u20134.8V) \u2014 replace or recalibrate throttle"
                : throttleCalSt === "warning"
                  ? "WARNING: Slightly off spec \u2014 monitor, recalibrate if symptoms persist"
                  : "Normal: Throttle calibration within spec"}
            </div>
          )}
        </motion.div>

        {/* ─── NEW: Error Code Lookup ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-5"
          style={{ background: "#1B222A", border: "1px solid #2B3540" }}
          data-ocid="ctrl.error_lookup.card"
        >
          <SectionHeader title="Error Code Lookup" tool="Controller Display" />
          <div className="mb-4">
            <div
              className="text-xs font-medium mb-1"
              style={{ color: "#A8B0BA" }}
            >
              Enter error code from controller display
            </div>
            <input
              className="diag-input"
              style={{ maxWidth: 200 }}
              placeholder="e.g. E01, E05"
              value={errorCode}
              onChange={(e) => setErrorCode(e.target.value)}
              data-ocid="ctrl.error_code.input"
            />
          </div>

          {/* Highlighted match */}
          {errorCode && matchedCode && (
            <div
              className="mb-3 rounded-lg px-4 py-3"
              style={{
                background: "rgba(226,85,85,0.12)",
                border: "1px solid rgba(226,85,85,0.4)",
              }}
              data-ocid="ctrl.error_match.card"
            >
              <div
                className="text-sm font-bold mb-0.5"
                style={{ color: "#E25555" }}
              >
                {lookupCode}: {matchedCode.label}
              </div>
              <div className="text-xs" style={{ color: "#E7EAEE" }}>
                {matchedCode.action}
              </div>
            </div>
          )}
          {errorCode && !matchedCode && (
            <div
              className="mb-3 rounded-lg px-4 py-2 text-xs"
              style={{
                background: "rgba(245,200,75,0.08)",
                border: "1px solid rgba(245,200,75,0.3)",
                color: "#F5C84B",
              }}
            >
              Code not in lookup table \u2014 refer to manufacturer service
              manual
            </div>
          )}

          {/* Full table */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #2B3540" }}
          >
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "#0E1116" }}>
                  <th
                    className="px-3 py-2 text-left font-semibold"
                    style={{ color: "#A8B0BA", width: 50 }}
                  >
                    Code
                  </th>
                  <th
                    className="px-3 py-2 text-left font-semibold"
                    style={{ color: "#A8B0BA", width: 140 }}
                  >
                    Fault
                  </th>
                  <th
                    className="px-3 py-2 text-left font-semibold"
                    style={{ color: "#A8B0BA" }}
                  >
                    Recommended Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ERROR_CODES).map(([code, info], i) => {
                  const isMatch = lookupCode === code && !!errorCode;
                  return (
                    <tr
                      key={code}
                      style={{
                        background: isMatch
                          ? "rgba(226,85,85,0.12)"
                          : i % 2 === 0
                            ? "transparent"
                            : "rgba(255,255,255,0.02)",
                        borderLeft: isMatch
                          ? "3px solid #E25555"
                          : "3px solid transparent",
                      }}
                      data-ocid={`ctrl.error_table.item.${i + 1}`}
                    >
                      <td
                        className="px-3 py-2 font-bold"
                        style={{ color: isMatch ? "#E25555" : "#4A9EFF" }}
                      >
                        {code}
                      </td>
                      <td
                        className="px-3 py-2 font-medium"
                        style={{ color: isMatch ? "#E25555" : "#E7EAEE" }}
                      >
                        {info.label}
                      </td>
                      <td
                        className="px-3 py-2"
                        style={{ color: isMatch ? "#E7EAEE" : "#A8B0BA" }}
                      >
                        {info.action}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Right: Result Panel */}
      <div className="w-72 flex-shrink-0">
        <div
          className="sticky top-6 rounded-xl p-4 space-y-4"
          style={{ background: "#1B222A", border: "1px solid #2B3540" }}
          data-ocid="ctrl.result.panel"
        >
          <h3 className="font-semibold text-sm" style={{ color: "#E7EAEE" }}>
            Controller Status
          </h3>

          <div
            className="text-center py-3"
            style={{ borderBottom: "1px solid #2B3540" }}
          >
            <div
              className="text-lg font-bold py-3 px-4 rounded-xl"
              style={{
                color: overallColor,
                background: `${overallColor}15`,
                border: `1px solid ${overallColor}44`,
              }}
            >
              {overallLabel}
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                label: "Battery Voltage",
                value: battV ? `${battV}V` : "\u2014",
                status: bvSt,
              },
              {
                label: "Current Draw",
                value: currentDraw ? `${currentDraw}A` : "\u2014",
                status: cdSt,
              },
              {
                label: "Ctrl Temperature",
                value: ctrlTemp ? `${ctrlTemp}\u00b0C` : "\u2014",
                status: ctSt,
              },
              {
                label: "Throttle Signal",
                value: throttle ? `${throttle}V` : "\u2014",
                status: thSt,
              },
              { label: "Motor Status", value: motor, status: motorSt },
              {
                label: "Phase Balance",
                value: hasPhaseVals
                  ? `${phaseDiff.toFixed(1)}V diff`
                  : "\u2014",
                status: phaseSt,
              },
              {
                label: "Hall Sensors",
                value:
                  hallA || hallB || hallC
                    ? hallSt === "fault"
                      ? "Fault"
                      : "OK"
                    : "\u2014",
                status: hallSt,
              },
              {
                label: "Gate Drive",
                value: gateV ? `${gateV}V` : "\u2014",
                status: gateSt,
              },
              {
                label: "Throttle Cal",
                value:
                  throttleIdle || throttleFull
                    ? throttleCalSt === "good"
                      ? "Pass"
                      : throttleCalSt === "warning"
                        ? "Off spec"
                        : "Out of range"
                    : "\u2014",
                status: throttleCalSt,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-1.5"
                style={{ borderBottom: "1px solid #1F2937" }}
              >
                <span className="text-xs" style={{ color: "#A8B0BA" }}>
                  {row.label}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#E7EAEE" }}
                  >
                    {row.value}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background:
                        row.status === "good"
                          ? "#2ED47A"
                          : row.status === "warning"
                            ? "#F5C84B"
                            : "#E25555",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs" style={{ color: "#A8B0BA", lineHeight: 1.5 }}>
            {hasFault
              ? "\u26a0 Fault detected. Inspect marked parameters and check wiring."
              : hasWarning
                ? "\u26a1 Some parameters are outside optimal range. Monitor closely."
                : "\u2713 All parameters within normal operating range."}
          </p>
        </div>
      </div>
    </div>
  );
}
