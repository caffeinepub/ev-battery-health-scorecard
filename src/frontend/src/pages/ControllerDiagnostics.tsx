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

export default function ControllerDiagnostics() {
  const [battV, setBattV] = useState("");
  const [currentDraw, setCurrentDraw] = useState("");
  const [ctrlTemp, setCtrlTemp] = useState("");
  const [throttle, setThrottle] = useState("");
  const [motor, setMotor] = useState("Running");

  const bvNum = Number.parseFloat(battV) || 0;
  const cdNum = Number.parseFloat(currentDraw) || 0;
  const ctNum = Number.parseFloat(ctrlTemp) || 0;
  const thNum = Number.parseFloat(throttle) || 0;

  const bvSt = battV ? battVoltStatus(bvNum) : "good";
  const cdSt = currentDraw ? currentStatus(cdNum) : "good";
  const ctSt = ctrlTemp ? ctrlTempStatus(ctNum) : "good";
  const thSt = throttle ? throttleStatus(thNum) : "good";
  const motorSt = motorStatus(motor);

  const allStatuses = [bvSt, cdSt, ctSt, thSt, motorSt];
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
      hint: "Normal: >56V | Warning: 48–56V | Fault: <48V",
      ocid: "ctrl.battery_voltage.input",
    },
    {
      label: "Current Draw",
      unit: "A",
      value: currentDraw,
      setter: setCurrentDraw,
      status: cdSt,
      hint: "Normal: <20A | Warning: 20–40A | Fault: >40A",
      ocid: "ctrl.current_draw.input",
    },
    {
      label: "Controller Temperature",
      unit: "°C",
      value: ctrlTemp,
      setter: setCtrlTemp,
      status: ctSt,
      hint: "Normal: <50°C | Warning: 50–70°C | Fault: >70°C",
      ocid: "ctrl.temp.input",
    },
    {
      label: "Throttle Signal",
      unit: "V",
      value: throttle,
      setter: setThrottle,
      status: thSt,
      hint: "Normal: 0.8–4.2V | Warning: outside range",
      ocid: "ctrl.throttle.input",
    },
  ];

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
                value: battV ? `${battV}V` : "—",
                status: bvSt,
              },
              {
                label: "Current Draw",
                value: currentDraw ? `${currentDraw}A` : "—",
                status: cdSt,
              },
              {
                label: "Ctrl Temperature",
                value: ctrlTemp ? `${ctrlTemp}°C` : "—",
                status: ctSt,
              },
              {
                label: "Throttle Signal",
                value: throttle ? `${throttle}V` : "—",
                status: thSt,
              },
              { label: "Motor Status", value: motor, status: motorSt },
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
              ? "⚠ Fault detected. Inspect marked parameters and check wiring."
              : hasWarning
                ? "⚡ Some parameters are outside optimal range. Monitor closely."
                : "✓ All parameters within normal operating range."}
          </p>
        </div>
      </div>
    </div>
  );
}
