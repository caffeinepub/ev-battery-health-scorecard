import { ChevronDown, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useDiagnosis } from "../context/DiagnosisContext";

const SECTIONS = [
  {
    id: "safety",
    label: "Safety",
    icon: "🦺",
    items: [
      "Technician wearing HV-rated insulated gloves (1000V min)",
      "Safety glasses and anti-static wrist strap in use",
      "Battery main switch / service disconnect isolated",
      "Lockout/Tagout (LOTO) applied on HV connectors",
      "Fire extinguisher (Class D) accessible within 3 meters",
      "Work area ventilated (no gas buildup risk)",
    ],
  },
  {
    id: "battery",
    label: "Battery",
    icon: "🔋",
    items: [
      "Battery pack visually inspected for swelling or cracks",
      "All cell group connectors tight and clean (no corrosion)",
      "BMS connector pins checked (no bent/burnt pins)",
      "Battery terminal bolt torque verified (per spec)",
      "Pack voltage measured and recorded (nominal ±5%)",
      "Cell group voltages within 50mV of each other",
      "Vent holes / pressure relief unobstructed",
      "Battery enclosure IP seal intact (no water ingress)",
      "Battery mount bolts tight and anti-vibration pads present",
      "Temperature at rest below 35°C (IR gun check)",
    ],
  },
  {
    id: "wiring",
    label: "Wiring",
    icon: "🔌",
    items: [
      "All HV cable insulation intact (no cracking/rubbing)",
      "Cable routing clear of sharp edges and hot surfaces",
      "Connector locking tabs engaged on all HV connectors",
      "Phase wires (U/V/W) insulation checked at motor end",
      "Ground/earth connections clean and tight",
      "Fuse/contactor integrity verified (continuity test)",
      "Wiring harness free from moisture entry points",
      "CAN/signal wire shielding not damaged",
    ],
  },
  {
    id: "motor",
    label: "Motor",
    icon: "⚙️",
    items: [
      "Motor mounting bolts tight (no play/vibration)",
      "Motor body temperature below 80°C after run",
      "Winding resistance measured: U-V, V-W, W-U within 5% of each other",
      "Insulation resistance to chassis >1MΩ (Megger test)",
      "Phase balance checked (all three phases symmetrical)",
      "Hall sensor signals verified: A, B, C = 5V square wave",
      "No unusual bearing noise during rotation",
      "Motor shaft free-spin smooth (no drag or roughness)",
    ],
  },
  {
    id: "controller",
    label: "Controller",
    icon: "🖥️",
    items: [
      "Controller heat sink temperature below 70°C after run",
      "Controller mounting secure (no vibration looseness)",
      "All controller connector plugs fully seated and locked",
      "No burnt smell or visible burn marks on PCB",
      "Phase output voltages balanced: U/V/W within 5V of each other",
      "Throttle signal voltage: 0.8–4.2V range at controller input",
      "Regen/brake signal wire continuity verified",
      "Error codes cleared after repair (no active codes)",
    ],
  },
  {
    id: "brakes",
    label: "Brakes",
    icon: "🛑",
    items: [
      "Brake pad thickness >3mm on both wheels",
      "Brake disc runout <0.3mm (dial gauge)",
      "Brake lever free play within spec",
      "Hydraulic brake fluid level at MAX mark (if applicable)",
      "Brake cut-off switch functionality confirmed",
      "Brake signal wire: continuity and no short to ground",
    ],
  },
  {
    id: "lights",
    label: "Lights & Electrics",
    icon: "💡",
    items: [
      "Headlight, tail light, brake light all functional",
      "Turn signals (all 4) working",
      "Instrument cluster / dashboard all indicators normal",
      "Horn functioning",
      "Charging port connector clean and undamaged",
      "Onboard charger indicator light functional",
    ],
  },
  {
    id: "road",
    label: "Road Test",
    icon: "🛣️",
    items: [
      "Vehicle accelerates smoothly from standstill",
      "No sudden power cuts or hesitation mid-ride",
      "Regenerative braking active and progressive",
      "Top speed within rated spec (±5 km/h)",
      "Range under test conditions meets expected baseline",
      "No abnormal noise from motor or drivetrain",
      "Instrument cluster shows correct SOC/range reading",
      "Vehicle handles correctly with no pull/vibration",
    ],
  },
];

export default function ServiceChecklist() {
  const { checklistState, toggleChecklist } = useDiagnosis();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    safety: true,
    battery: true,
  });

  const totalItems = useMemo(
    () => SECTIONS.reduce((s, sec) => s + sec.items.length, 0),
    [],
  );
  const totalChecked = useMemo(
    () =>
      SECTIONS.reduce(
        (s, sec) =>
          s +
          sec.items.filter((_, i) => checklistState[`${sec.id}-${i}`]).length,
        0,
      ),
    [checklistState],
  );

  const pct =
    totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;
  const statusLabel =
    pct === 100
      ? "Complete"
      : pct >= 80
        ? "Almost Done"
        : pct >= 50
          ? "In Progress"
          : "Incomplete";
  const statusColor =
    pct === 100 ? "#2ED47A" : pct >= 50 ? "#F5C84B" : "#E25555";

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#E7EAEE" }}>
          Service Checklist
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#A8B0BA" }}>
          Complete all sections before finalizing the service report
        </p>
      </div>

      {/* Progress */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#1B222A", border: "1px solid #2B3540" }}
        data-ocid="checklist.progress.card"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold" style={{ color: statusColor }}>
              {pct}%
            </span>
            <span className="text-sm ml-2" style={{ color: statusColor }}>
              {statusLabel}
            </span>
          </div>
          <span className="text-sm" style={{ color: "#A8B0BA" }}>
            {totalChecked} / {totalItems} items
          </span>
        </div>
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ background: "#0E1116" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: statusColor }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Accordion sections */}
      <div className="space-y-2">
        {SECTIONS.map((sec, secIdx) => {
          const sectionChecked = sec.items.filter(
            (_, i) => checklistState[`${sec.id}-${i}`],
          ).length;
          const isOpen = !!expanded[sec.id];

          return (
            <motion.div
              key={sec.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: secIdx * 0.04 }}
              className="rounded-xl overflow-hidden"
              style={{ background: "#1B222A", border: "1px solid #2B3540" }}
              data-ocid={`checklist.section.${secIdx + 1}.panel`}
            >
              <button
                type="button"
                className="w-full flex items-center gap-3 px-5 py-3.5"
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [sec.id]: !isOpen }))
                }
                data-ocid={`checklist.section_${sec.id}.toggle`}
              >
                <span className="text-lg">{sec.icon}</span>
                <span
                  className="flex-1 text-left font-semibold text-sm"
                  style={{ color: "#E7EAEE" }}
                >
                  {sec.label}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    color:
                      sectionChecked === sec.items.length
                        ? "#2ED47A"
                        : "#A8B0BA",
                    background:
                      sectionChecked === sec.items.length
                        ? "rgba(46,212,122,0.12)"
                        : "rgba(255,255,255,0.05)",
                  }}
                >
                  {sectionChecked}/{sec.items.length}
                </span>
                {isOpen ? (
                  <ChevronDown size={16} style={{ color: "#A8B0BA" }} />
                ) : (
                  <ChevronRight size={16} style={{ color: "#A8B0BA" }} />
                )}
              </button>

              {isOpen && (
                <div
                  className="px-5 pb-4"
                  style={{ borderTop: "1px solid #2B3540" }}
                >
                  <div className="space-y-2 pt-3">
                    {sec.items.map((item, i) => {
                      const itemKey = `${sec.id}-${i}`;
                      const checked = !!checklistState[itemKey];
                      return (
                        <button
                          key={itemKey}
                          type="button"
                          onClick={() => toggleChecklist(itemKey)}
                          className="flex items-center gap-3 cursor-pointer w-full text-left"
                          data-ocid={`checklist.${sec.id}.checkbox.${i + 1}`}
                        >
                          <div
                            className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all"
                            style={{
                              background: checked ? "#2ED47A" : "#0E1116",
                              border: checked
                                ? "2px solid #2ED47A"
                                : "2px solid #2B3540",
                            }}
                          >
                            {checked && (
                              <svg
                                viewBox="0 0 10 8"
                                className="w-3 h-3"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M1 4l2.5 3L9 1"
                                  stroke="white"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className="text-sm"
                            style={{
                              color: checked ? "#A8B0BA" : "#E7EAEE",
                              textDecoration: checked ? "line-through" : "none",
                            }}
                          >
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
