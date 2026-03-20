import {
  Battery,
  ClipboardCheck,
  Cpu,
  FileText,
  LayoutDashboard,
  Settings,
  Zap,
} from "lucide-react";

export type PageId =
  | "dashboard"
  | "start-diagnosis"
  | "battery-tests"
  | "controller-diagnostics"
  | "service-checklist"
  | "reports"
  | "settings";

const NAV_ITEMS: {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "start-diagnosis", label: "Start Diagnosis", icon: Zap },
  { id: "battery-tests", label: "Battery Tests", icon: Battery },
  { id: "controller-diagnostics", label: "Controller Diagnostics", icon: Cpu },
  { id: "service-checklist", label: "Service Checklist", icon: ClipboardCheck },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="no-print fixed left-0 top-0 h-full flex flex-col z-40"
      style={{
        width: 240,
        background: "#141A20",
        borderRight: "1px solid #2B3540",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-5"
        style={{ borderBottom: "1px solid #2B3540" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #4A9EFF, #1A7ADF)" }}
        >
          <Zap size={16} color="white" fill="white" />
        </div>
        <div>
          <div className="font-bold text-sm text-white leading-tight">
            Battery
          </div>
          <div
            className="font-bold text-sm leading-tight"
            style={{ color: "#4A9EFF" }}
          >
            Diagnosis
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150"
              style={{
                color: isActive ? "#E7EAEE" : "#A8B0BA",
                background: isActive ? "#1B222A" : "transparent",
                borderLeft: isActive
                  ? "2px solid #2ED47A"
                  : "2px solid transparent",
                fontWeight: isActive ? 600 : 400,
              }}
              data-ocid={`nav.${item.id}.link`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom version */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid #2B3540" }}>
        <div className="text-xs" style={{ color: "#A8B0BA" }}>
          Battery Diagnosis v1.0
        </div>
        <div className="text-xs" style={{ color: "#4B5563" }}>
          EV Diagnostic Tool
        </div>
      </div>
    </aside>
  );
}
