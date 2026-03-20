import type { PageId } from "./Sidebar";

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: "Dashboard",
  "start-diagnosis": "Start Diagnosis",
  "battery-tests": "Battery Tests",
  "controller-diagnostics": "Controller Diagnostics",
  "service-checklist": "Service Checklist",
  reports: "Reports",
  settings: "Settings",
};

interface HeaderProps {
  activePage: PageId;
  technicianName: string;
}

export default function Header({ activePage, technicianName }: HeaderProps) {
  const initials = technicianName
    ? technicianName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "T";

  return (
    <header
      className="no-print fixed top-0 right-0 flex items-center justify-between px-6 h-14 z-30"
      style={{
        left: 240,
        background: "#141A20",
        borderBottom: "1px solid #2B3540",
      }}
    >
      <div>
        <h1 className="font-semibold text-base" style={{ color: "#E7EAEE" }}>
          {PAGE_TITLES[activePage]}
        </h1>
        <p className="text-xs" style={{ color: "#A8B0BA" }}>
          EV Battery Diagnostic System
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm" style={{ color: "#A8B0BA" }}>
          Tech:{" "}
          <span style={{ color: "#E7EAEE", fontWeight: 500 }}>
            {technicianName || "Technician"}
          </span>
        </span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #4A9EFF, #1A7ADF)",
            color: "white",
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
