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
      "PPE worn properly",
      "Area is clear of hazards",
      "Fire extinguisher nearby",
      "Insulated tools used",
    ],
  },
  {
    id: "battery",
    label: "Battery",
    icon: "🔋",
    items: [
      "All connections tight",
      "No physical swelling",
      "BMS active and responsive",
      "No electrolyte leakage",
    ],
  },
  {
    id: "wiring",
    label: "Wiring",
    icon: "🔌",
    items: [
      "No exposed wires",
      "All connectors secure",
      "No corrosion on terminals",
      "Harness intact and clipped",
    ],
  },
  {
    id: "motor",
    label: "Motor",
    icon: "⚙️",
    items: [
      "No unusual noise",
      "Bearings in good condition",
      "Shaft properly aligned",
      "No signs of overheating",
    ],
  },
  {
    id: "brakes",
    label: "Brakes",
    icon: "🛑",
    items: [
      "Front brake functional",
      "Rear brake functional",
      "Brake lights working",
    ],
  },
  {
    id: "lights",
    label: "Lights",
    icon: "💡",
    items: [
      "Headlight working",
      "Tail light working",
      "Turn indicators working",
    ],
  },
  {
    id: "roadTest",
    label: "Road Test",
    icon: "🛣️",
    items: [
      "Acceleration normal",
      "No power cuts observed",
      "Range test completed",
      "ABS functional (if equipped)",
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
