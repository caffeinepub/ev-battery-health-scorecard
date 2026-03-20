import {
  AlertOctagon,
  AlertTriangle,
  BarChart2,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  CircuitBoard,
  Cpu,
  Gauge,
  PowerOff,
  Thermometer,
  TrendingDown,
  Wifi,
  WifiOff,
  Zap,
  ZapOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { PageId } from "../components/Sidebar";
import { useDiagnosis } from "../context/DiagnosisContext";
import type { VehicleType } from "../context/DiagnosisContext";

const BATTERY_FAULTS = [
  {
    id: "battery-not-charging",
    label: "Battery not charging",
    desc: "Pack not accepting charge from charger",
    icon: BatteryCharging,
    color: "#F5A623",
  },
  {
    id: "low-range",
    label: "Low range",
    desc: "Vehicle not achieving expected range",
    icon: TrendingDown,
    color: "#F5C84B",
  },
  {
    id: "vehicle-not-starting",
    label: "Vehicle not starting",
    desc: "Motor not engaging on throttle input",
    icon: PowerOff,
    color: "#E25555",
  },
  {
    id: "sudden-power-cut",
    label: "Sudden power cut",
    desc: "Power cuts off unexpectedly while riding",
    icon: Zap,
    color: "#E25555",
  },
  {
    id: "overheating",
    label: "Overheating",
    desc: "Battery or controller temperature too high",
    icon: Thermometer,
    color: "#F5A623",
  },
  {
    id: "no-acceleration",
    label: "No acceleration",
    desc: "Throttle response sluggish or absent",
    icon: Gauge,
    color: "#F5C84B",
  },
  {
    id: "error-code-issue",
    label: "Error code issue",
    desc: "BMS or controller reporting fault codes",
    icon: AlertTriangle,
    color: "#4A9EFF",
  },
  {
    id: "cell-imbalance",
    label: "Cell Imbalance",
    desc: "Large voltage spread between cells detected",
    icon: BarChart2,
    color: "#F5A623",
  },
  {
    id: "charging-stops-midway",
    label: "Charging Stops Midway",
    desc: "Charging starts but stops before full charge",
    icon: BatteryCharging,
    color: "#E25555",
  },
  {
    id: "battery-swelling",
    label: "Battery Swelling",
    desc: "Physical expansion of cells or pack casing",
    icon: AlertOctagon,
    color: "#E25555",
  },
  {
    id: "idle-drain",
    label: "Idle Drain / Parasitic Loss",
    desc: "Battery drains while vehicle is off",
    icon: Battery,
    color: "#F5C84B",
  },
  {
    id: "bms-comm-failure",
    label: "BMS Communication Failure",
    desc: "No communication from BMS module",
    icon: WifiOff,
    color: "#E25555",
  },
  {
    id: "contactor-failure",
    label: "Contactor / Relay Failure",
    desc: "Main contactor not engaging or welded shut",
    icon: CircuitBoard,
    color: "#F5A623",
  },
  {
    id: "voltage-sag-under-load",
    label: "Voltage Sag Under Load",
    desc: "Pack voltage drops sharply during acceleration",
    icon: TrendingDown,
    color: "#F5A623",
  },
  {
    id: "cell-reversal-detected",
    label: "Cell Reversal Detected",
    desc: "One or more cells measuring negative voltage",
    icon: AlertOctagon,
    color: "#E25555",
  },
  {
    id: "pack-imbalance-after-full-charge",
    label: "Pack Imbalance After Full Charge",
    desc: "Cell spread remains high even at 100% SOC",
    icon: BarChart2,
    color: "#F5A623",
  },
  {
    id: "charger-not-recognized-by-bms",
    label: "Charger Not Recognized by BMS",
    desc: "BMS rejects charger handshake signal",
    icon: Wifi,
    color: "#E25555",
  },
  {
    id: "regenerative-braking-fault",
    label: "Regenerative Braking Fault",
    desc: "Regen not functioning or causing jerky deceleration",
    icon: ZapOff,
    color: "#F5C84B",
  },
  {
    id: "battery-disconnects-under-acceleration",
    label: "Battery Disconnects Under Acceleration",
    desc: "Pack cuts out when high current demand occurs",
    icon: PowerOff,
    color: "#E25555",
  },
  {
    id: "high-self-discharge-rate",
    label: "High Self-Discharge Rate",
    desc: "Battery loses charge rapidly when not in use",
    icon: BatteryLow,
    color: "#F5C84B",
  },
  {
    id: "sulfation-deep-discharge-damage",
    label: "Sulfation / Deep Discharge Damage",
    desc: "Pack cannot hold charge, very low capacity",
    icon: BatteryLow,
    color: "#E25555",
  },
  {
    id: "cell-short-circuit",
    label: "Cell Short Circuit",
    desc: "Internal short in cell causing heat or zero voltage",
    icon: Zap,
    color: "#E25555",
  },
  {
    id: "battery-capacity-below-60",
    label: "Battery Capacity Below 60%",
    desc: "SOH degraded, range significantly reduced",
    icon: BatteryFull,
    color: "#F5A623",
  },
];

const CONTROLLER_FAULTS = [
  {
    id: "controller-overheating",
    label: "Controller Overheating",
    desc: "Controller heat sink exceeds safe temperature",
    icon: Thermometer,
    color: "#F5A623",
  },
  {
    id: "phase-wire-short-open",
    label: "Phase Wire Short / Open",
    desc: "U/V/W phase wiring has short or open circuit",
    icon: Zap,
    color: "#E25555",
  },
  {
    id: "mosfet-failure",
    label: "MOSFET Failure",
    desc: "Internal transistor short or open in controller",
    icon: Cpu,
    color: "#E25555",
  },
  {
    id: "throttle-signal-error",
    label: "Throttle Signal Error",
    desc: "Throttle voltage out of calibration range",
    icon: Gauge,
    color: "#F5A623",
  },
  {
    id: "hall-sensor-fault",
    label: "Hall Sensor Fault",
    desc: "Motor position sensor A/B/C signal missing or wrong",
    icon: AlertTriangle,
    color: "#F5A623",
  },
  {
    id: "controller-no-output",
    label: "Controller No Output (Motor Not Spinning)",
    desc: "Controller receives throttle but motor doesn't spin",
    icon: PowerOff,
    color: "#E25555",
  },
  {
    id: "error-code-on-display",
    label: "Error Code on Controller Display",
    desc: "Controller shows E-code on LCD or LED display",
    icon: AlertOctagon,
    color: "#4A9EFF",
  },
  {
    id: "sudden-cutoff-during-ride",
    label: "Sudden Cut-off During Ride",
    desc: "Controller shuts down mid-ride unexpectedly",
    icon: ZapOff,
    color: "#E25555",
  },
  {
    id: "low-speed-reduced-pwm",
    label: "Low Speed / Reduced PWM Output",
    desc: "Motor runs but significantly below rated speed",
    icon: TrendingDown,
    color: "#F5C84B",
  },
  {
    id: "brake-signal-fault",
    label: "Brake Signal Fault (Cutting Power)",
    desc: "Brake cut-off signal stuck active, killing throttle",
    icon: AlertTriangle,
    color: "#E25555",
  },
];

interface StartDiagnosisProps {
  onNavigate: (page: PageId) => void;
}

export default function StartDiagnosis({ onNavigate }: StartDiagnosisProps) {
  const {
    currentFault,
    customFault,
    vehicleId,
    technicianName,
    vehicleType,
    setCurrentFault,
    setCustomFault,
    setVehicleId,
    setTechnicianName,
    setVehicleType,
  } = useDiagnosis();

  const [step, setStep] = useState<1 | 2>(1);

  const canProceed = currentFault !== "" || customFault.trim() !== "";

  const isControllerFault = CONTROLLER_FAULTS.some(
    (f) => f.label === currentFault,
  );

  const handleStart = () => {
    if (!canProceed) return;
    if (isControllerFault) {
      onNavigate("controller-diagnostics");
    } else {
      onNavigate("battery-tests");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#E7EAEE" }}>
          Start Battery Diagnosis
        </h1>
        <p className="text-sm mt-1" style={{ color: "#A8B0BA" }}>
          Enter vehicle details and select the fault to begin guided testing
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[1, 2].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s as 1 | 2)}
            className="flex items-center gap-2"
            data-ocid={`diagnosis.step_${s}.button`}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: step >= s ? "#4A9EFF" : "#2B3540",
                color: step >= s ? "white" : "#A8B0BA",
              }}
            >
              {s}
            </div>
            <span
              className="text-sm"
              style={{ color: step >= s ? "#E7EAEE" : "#A8B0BA" }}
            >
              {s === 1 ? "Vehicle Info" : "Select Fault"}
            </span>
          </button>
        ))}
        <div className="flex-1 h-px" style={{ background: "#2B3540" }} />
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl p-6 space-y-5"
          style={{ background: "#1B222A", border: "1px solid #2B3540" }}
        >
          <h2 className="font-semibold" style={{ color: "#E7EAEE" }}>
            Step 1: Vehicle Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div
                className="text-xs font-medium block mb-1.5"
                style={{ color: "#A8B0BA" }}
              >
                Vehicle ID *
              </div>
              <input
                className="diag-input"
                placeholder="e.g. VH-2024-001"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                data-ocid="diagnosis.vehicle_id.input"
              />
            </div>
            <div>
              <div
                className="text-xs font-medium block mb-1.5"
                style={{ color: "#A8B0BA" }}
              >
                Technician Name *
              </div>
              <input
                className="diag-input"
                placeholder="Enter your name"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                data-ocid="diagnosis.technician_name.input"
              />
            </div>
          </div>

          <div>
            <div
              className="text-xs font-medium block mb-2"
              style={{ color: "#A8B0BA" }}
            >
              Vehicle Type
            </div>
            <div className="flex gap-3">
              {(["2-wheeler", "3-wheeler"] as VehicleType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setVehicleType(t)}
                  className="flex-1 py-3 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background:
                      vehicleType === t ? "rgba(74,158,255,0.15)" : "#0E1116",
                    border:
                      vehicleType === t
                        ? "2px solid #4A9EFF"
                        : "1px solid #2B3540",
                    color: vehicleType === t ? "#4A9EFF" : "#A8B0BA",
                  }}
                  data-ocid={`diagnosis.vehicle_type_${t.replace("-", "_")}.toggle`}
                >
                  {t === "2-wheeler" ? "🛵 2-Wheeler" : "🛺 3-Wheeler"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: "#4A9EFF", color: "white" }}
            data-ocid="diagnosis.next_step.button"
          >
            Next: Select Fault →
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          <div
            className="rounded-xl p-6"
            style={{ background: "#1B222A", border: "1px solid #2B3540" }}
          >
            <h2 className="font-semibold mb-1" style={{ color: "#E7EAEE" }}>
              Step 2: Select Fault Type
            </h2>
            <p className="text-xs mb-5" style={{ color: "#A8B0BA" }}>
              Battery faults → Battery Tests. Controller faults → Controller
              Diagnostics.
            </p>

            {/* Battery Faults */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#4A9EFF" }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#4A9EFF" }}
                >
                  Battery Faults
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "rgba(74,158,255,0.2)" }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BATTERY_FAULTS.map((f, i) => {
                  const isSelected = currentFault === f.label;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCurrentFault(isSelected ? "" : f.label)}
                      className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                      style={{
                        background: isSelected ? `${f.color}14` : "#0E1116",
                        border: isSelected
                          ? `2px solid ${f.color}`
                          : "1px solid #2B3540",
                        boxShadow: isSelected
                          ? `0 0 16px ${f.color}28`
                          : "none",
                      }}
                      data-ocid={`diagnosis.battery_fault.${i + 1}.button`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${f.color}20` }}
                      >
                        <f.icon size={20} style={{ color: f.color }} />
                      </div>
                      <div className="min-w-0">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: isSelected ? f.color : "#E7EAEE" }}
                        >
                          {f.label}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#A8B0BA" }}
                        >
                          {f.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controller Faults */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#F5A623" }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#F5A623" }}
                >
                  Controller Faults
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "rgba(245,166,35,0.2)" }}
                />
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(245,166,35,0.1)",
                    color: "#F5A623",
                    border: "1px solid rgba(245,166,35,0.3)",
                  }}
                >
                  → Controller Diagnostics
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CONTROLLER_FAULTS.map((f, i) => {
                  const isSelected = currentFault === f.label;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCurrentFault(isSelected ? "" : f.label)}
                      className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                      style={{
                        background: isSelected ? `${f.color}14` : "#0E1116",
                        border: isSelected
                          ? `2px solid ${f.color}`
                          : "1px solid #2B3540",
                        boxShadow: isSelected
                          ? `0 0 16px ${f.color}28`
                          : "none",
                      }}
                      data-ocid={`diagnosis.controller_fault.${i + 1}.button`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${f.color}20` }}
                      >
                        <f.icon size={20} style={{ color: f.color }} />
                      </div>
                      <div className="min-w-0">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: isSelected ? f.color : "#E7EAEE" }}
                        >
                          {f.label}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#A8B0BA" }}
                        >
                          {f.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <div
                className="text-xs font-medium block mb-1.5"
                style={{ color: "#A8B0BA" }}
              >
                Or enter custom fault description
              </div>
              <input
                className="diag-input"
                placeholder="Describe the issue..."
                value={customFault}
                onChange={(e) => setCustomFault(e.target.value)}
                data-ocid="diagnosis.custom_fault.input"
              />
            </div>
          </div>

          {/* Selected Fault Routing Indicator */}
          {isControllerFault && (
            <div
              className="rounded-lg px-4 py-3 flex items-center gap-3"
              style={{
                background: "rgba(245,166,35,0.1)",
                border: "1px solid rgba(245,166,35,0.35)",
              }}
            >
              <Cpu size={16} style={{ color: "#F5A623" }} />
              <span className="text-sm" style={{ color: "#F5A623" }}>
                Controller fault selected — Start Diagnosis will open{" "}
                <strong>Controller Diagnostics</strong>
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: "#2B3540", color: "#A8B0BA" }}
              data-ocid="diagnosis.back.button"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleStart}
              disabled={!canProceed}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: canProceed
                  ? isControllerFault
                    ? "linear-gradient(135deg, #F5A623, #E08A10)"
                    : "linear-gradient(135deg, #2ED47A, #1AB862)"
                  : "#2B3540",
                color: canProceed ? "white" : "#A8B0BA",
                cursor: canProceed ? "pointer" : "not-allowed",
              }}
              data-ocid="diagnosis.start.primary_button"
            >
              {isControllerFault
                ? "Open Controller Diagnostics →"
                : "Start Battery Diagnosis →"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
