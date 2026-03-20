import { ChevronDown, ChevronUp, Download, FileText } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const MOCK_REPORTS = [
  {
    id: 1,
    vehicleId: "EV-2024-001",
    technician: "Alex Rodriguez",
    date: "2026-03-19",
    fault: "Battery not charging",
    status: "fault" as const,
    tests: [
      { name: "Pack Voltage", value: "38.2V", status: "fault" as const },
      { name: "Voltage Drop", value: "6.8V", status: "fault" as const },
      {
        name: "BMS Error Code",
        value: "E004 - CHG_OPEN",
        status: "fault" as const,
      },
    ],
    recommendation: "Replace",
    notes:
      "BMS charge circuit open. Cell group 3 has internal short. Battery pack replacement required.",
  },
  {
    id: 2,
    vehicleId: "EV-2024-002",
    technician: "Ravi Kumar",
    date: "2026-03-19",
    fault: "Low range",
    status: "warning" as const,
    tests: [
      { name: "Pack Voltage", value: "48.4V", status: "warning" as const },
      { name: "Pack IR", value: "78mΩ", status: "warning" as const },
      { name: "Average Temp", value: "44°C", status: "warning" as const },
    ],
    recommendation: "Repair",
    notes:
      "Elevated internal resistance. Cell balancing required. Cooling inspection recommended.",
  },
  {
    id: 3,
    vehicleId: "EV-2024-003",
    technician: "Priya Sharma",
    date: "2026-03-18",
    fault: "Overheating",
    status: "fault" as const,
    tests: [
      { name: "Max Temperature", value: "72°C", status: "fault" as const },
      { name: "BMS Fault", value: "TEMP_OVR", status: "fault" as const },
      { name: "Pack IR", value: "95mΩ", status: "warning" as const },
    ],
    recommendation: "Replace",
    notes:
      "Thermal runaway risk. Cell group 2 at 72°C. Immediate battery replacement required.",
  },
  {
    id: 4,
    vehicleId: "EV-2024-004",
    technician: "Alex Rodriguez",
    date: "2026-03-18",
    fault: "No acceleration",
    status: "good" as const,
    tests: [
      { name: "Pack Voltage", value: "52.1V", status: "good" as const },
      { name: "BMS Faults", value: "None", status: "good" as const },
      { name: "Throttle Signal", value: "3.2V", status: "good" as const },
    ],
    recommendation: "Monitor",
    notes:
      "Loose throttle connector. Reconnected and tested. Vehicle operating normally.",
  },
];

const STATUS_COLOR: Record<string, string> = {
  fault: "#E25555",
  warning: "#F5C84B",
  good: "#2ED47A",
};
const STATUS_BG: Record<string, string> = {
  fault: "rgba(226,85,85,0.12)",
  warning: "rgba(245,200,75,0.12)",
  good: "rgba(46,212,122,0.12)",
};

export default function Reports() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#E7EAEE" }}>
            Diagnostic Reports
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#A8B0BA" }}>
            {MOCK_REPORTS.length} reports available
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {MOCK_REPORTS.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl overflow-hidden"
            style={{ background: "#1B222A", border: "1px solid #2B3540" }}
            data-ocid={`reports.item.${i + 1}`}
          >
            {/* Card Header */}
            <button
              type="button"
              className="w-full flex items-center gap-4 px-5 py-4 text-left"
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              data-ocid={`reports.expand_${i + 1}.button`}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: STATUS_BG[r.status] }}
              >
                <FileText size={18} style={{ color: STATUS_COLOR[r.status] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-semibold text-sm"
                    style={{ color: "#E7EAEE" }}
                  >
                    {r.vehicleId}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: STATUS_COLOR[r.status],
                      background: STATUS_BG[r.status],
                    }}
                  >
                    {r.fault}
                  </span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#A8B0BA" }}>
                  {r.technician} · {r.date}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-bold px-2 py-1 rounded"
                  style={{
                    color: STATUS_COLOR[r.status],
                    background: STATUS_BG[r.status],
                  }}
                >
                  {r.recommendation}
                </span>
                {expanded === r.id ? (
                  <ChevronUp size={16} style={{ color: "#A8B0BA" }} />
                ) : (
                  <ChevronDown size={16} style={{ color: "#A8B0BA" }} />
                )}
              </div>
            </button>

            {/* Expanded Report */}
            {expanded === r.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-5 pb-5"
                style={{ borderTop: "1px solid #2B3540" }}
                data-ocid={`reports.detail_${i + 1}.panel`}
              >
                <div className="pt-4 space-y-4">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Vehicle ID", value: r.vehicleId },
                      { label: "Technician", value: r.technician },
                      { label: "Date", value: r.date },
                      { label: "Fault Type", value: r.fault },
                    ].map((f) => (
                      <div
                        key={f.label}
                        className="p-3 rounded-lg"
                        style={{ background: "#0E1116" }}
                      >
                        <div className="text-xs" style={{ color: "#A8B0BA" }}>
                          {f.label}
                        </div>
                        <div
                          className="text-sm font-medium mt-0.5"
                          style={{ color: "#E7EAEE" }}
                        >
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tests Table */}
                  <div>
                    <div
                      className="text-xs font-semibold mb-2"
                      style={{ color: "#A8B0BA" }}
                    >
                      TEST RESULTS
                    </div>
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{ border: "1px solid #2B3540" }}
                    >
                      <table className="w-full">
                        <thead>
                          <tr style={{ background: "#0E1116" }}>
                            {["Test", "Value", "Status"].map((h) => (
                              <th
                                key={h}
                                className="px-3 py-2 text-left text-xs font-medium"
                                style={{ color: "#A8B0BA" }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {r.tests.map((t, j) => (
                            <tr
                              key={t.name}
                              style={{ borderTop: "1px solid #2B3540" }}
                              data-ocid={`reports.test_row.${j + 1}.row`}
                            >
                              <td
                                className="px-3 py-2 text-xs"
                                style={{ color: "#E7EAEE" }}
                              >
                                {t.name}
                              </td>
                              <td
                                className="px-3 py-2 text-xs font-mono"
                                style={{ color: "#E7EAEE" }}
                              >
                                {t.value}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{
                                    color: STATUS_COLOR[t.status],
                                    background: STATUS_BG[t.status],
                                  }}
                                >
                                  {t.status.charAt(0).toUpperCase() +
                                    t.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Notes */}
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: "#0E1116",
                      border: "1px solid #2B3540",
                    }}
                  >
                    <div
                      className="text-xs font-semibold mb-1"
                      style={{ color: "#A8B0BA" }}
                    >
                      TECHNICIAN NOTES
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "#E7EAEE", lineHeight: 1.6 }}
                    >
                      {r.notes}
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "#A8B0BA" }}>
                        Final Recommendation:
                      </span>
                      <span
                        className="px-3 py-1.5 rounded-full text-sm font-bold"
                        style={{
                          color: STATUS_COLOR[r.status],
                          background: STATUS_BG[r.status],
                          border: `1px solid ${STATUS_COLOR[r.status]}44`,
                        }}
                      >
                        {r.recommendation}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: "#2B3540",
                        color: "#E7EAEE",
                        border: "1px solid #3B4550",
                      }}
                      data-ocid={`reports.download_${i + 1}.button`}
                    >
                      <Download size={14} />
                      Download Report
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
