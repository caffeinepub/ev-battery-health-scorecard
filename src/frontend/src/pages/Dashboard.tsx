import {
  Activity,
  AlertTriangle,
  Battery,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type { PageId } from "../components/Sidebar";
import { useDiagnosis } from "../context/DiagnosisContext";

const RECENT_ACTIVITY = [
  {
    id: 1,
    vehicle: "EV-2024-001",
    fault: "Battery not charging",
    status: "fault",
    time: "10:32 AM",
    tech: "Alex R.",
  },
  {
    id: 2,
    vehicle: "EV-2024-002",
    fault: "Low range",
    status: "warning",
    time: "09:15 AM",
    tech: "Ravi K.",
  },
  {
    id: 3,
    vehicle: "EV-2024-003",
    fault: "Overheating",
    status: "fault",
    time: "Yesterday",
    tech: "Priya S.",
  },
  {
    id: 4,
    vehicle: "EV-2024-004",
    fault: "Service complete",
    status: "good",
    time: "Yesterday",
    tech: "Alex R.",
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

const FAULT_SHORTCUTS = [
  { label: "Battery not charging", color: "#F5A623" },
  { label: "Low range", color: "#F5C84B" },
  { label: "Vehicle not starting", color: "#E25555" },
  { label: "Overheating", color: "#F5A623" },
  { label: "No acceleration", color: "#F5C84B" },
  { label: "Error code issue", color: "#4A9EFF" },
];

interface DashboardProps {
  onNavigate: (page: PageId) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { setCurrentFault } = useDiagnosis();

  const handleQuickStart = (fault: string) => {
    setCurrentFault(fault);
    onNavigate("start-diagnosis");
  };

  const stats = [
    {
      label: "Sessions Today",
      value: "7",
      icon: Activity,
      color: "#4A9EFF",
      sub: "+2 from yesterday",
    },
    {
      label: "Tests Run",
      value: "34",
      icon: TrendingUp,
      color: "#2ED47A",
      sub: "This week",
    },
    {
      label: "Faults Found",
      value: "12",
      icon: AlertTriangle,
      color: "#E25555",
      sub: "3 critical",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07 }}
            className="rounded-xl p-5"
            style={{ background: "#1B222A", border: "1px solid #2B3540" }}
            data-ocid={`dashboard.stat.${i + 1}.card`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: "#A8B0BA" }}>
                {s.label}
              </span>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}18` }}
              >
                <s.icon size={18} style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-3xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{ color: "#A8B0BA" }}>
              {s.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="rounded-xl p-5"
        style={{ background: "#1B222A", border: "1px solid #2B3540" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} style={{ color: "#4A9EFF" }} />
          <h2 className="font-semibold text-sm" style={{ color: "#E7EAEE" }}>
            Quick Start Diagnosis
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {FAULT_SHORTCUTS.map((f, i) => (
            <button
              key={f.label}
              type="button"
              onClick={() => handleQuickStart(f.label)}
              className="text-left px-3 py-2.5 rounded-lg text-sm transition-all hover:opacity-90"
              style={{
                background: `${f.color}12`,
                border: `1px solid ${f.color}30`,
                color: f.color,
                fontWeight: 500,
              }}
              data-ocid={`dashboard.fault_shortcut.${i + 1}.button`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onNavigate("start-diagnosis")}
          className="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: "#4A9EFF", color: "white" }}
          data-ocid="dashboard.start_diagnosis.primary_button"
        >
          → Start Full Diagnosis
        </button>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="rounded-xl p-5"
        style={{ background: "#1B222A", border: "1px solid #2B3540" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} style={{ color: "#A8B0BA" }} />
          <h2 className="font-semibold text-sm" style={{ color: "#E7EAEE" }}>
            Recent Activity
          </h2>
        </div>
        <div className="space-y-2">
          {RECENT_ACTIVITY.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: "#0E1116", border: "1px solid #2B3540" }}
              data-ocid={`dashboard.activity.item.${i + 1}`}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: STATUS_COLOR[item.status],
                  boxShadow: `0 0 5px ${STATUS_COLOR[item.status]}`,
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#E7EAEE" }}
                  >
                    {item.vehicle}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      color: STATUS_COLOR[item.status],
                      background: STATUS_BG[item.status],
                    }}
                  >
                    {item.fault}
                  </span>
                </div>
                <div className="text-xs" style={{ color: "#A8B0BA" }}>
                  {item.tech}
                </div>
              </div>
              <div
                className="text-xs flex-shrink-0"
                style={{ color: "#A8B0BA" }}
              >
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
          className="rounded-xl p-5"
          style={{ background: "#1B222A", border: "1px solid #2B3540" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Battery size={16} style={{ color: "#2ED47A" }} />
            <h2 className="font-semibold text-sm" style={{ color: "#E7EAEE" }}>
              Fleet Status
            </h2>
          </div>
          {[
            { label: "Healthy", count: 18, color: "#2ED47A" },
            { label: "Needs Attention", count: 5, color: "#F5C84B" },
            { label: "Critical", count: 2, color: "#E25555" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 mb-2">
              <div className="flex-1 text-xs" style={{ color: "#A8B0BA" }}>
                {s.label}
              </div>
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(s.count / 25) * 100}%`,
                  minWidth: 20,
                  background: s.color,
                }}
              />
              <div
                className="text-xs font-bold w-6 text-right"
                style={{ color: s.color }}
              >
                {s.count}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.45 }}
          className="rounded-xl p-5"
          style={{ background: "#1B222A", border: "1px solid #2B3540" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} style={{ color: "#2ED47A" }} />
            <h2 className="font-semibold text-sm" style={{ color: "#E7EAEE" }}>
              Today's Summary
            </h2>
          </div>
          {[
            { label: "Diagnostics Complete", value: "5", color: "#2ED47A" },
            { label: "Awaiting Parts", value: "2", color: "#F5C84B" },
            { label: "In Progress", value: "3", color: "#4A9EFF" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between py-1.5"
              style={{ borderBottom: "1px solid #2B3540" }}
            >
              <span className="text-xs" style={{ color: "#A8B0BA" }}>
                {s.label}
              </span>
              <span className="text-sm font-bold" style={{ color: s.color }}>
                {s.value}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
