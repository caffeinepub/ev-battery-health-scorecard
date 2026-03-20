import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Header from "./components/Header";
import Sidebar, { type PageId } from "./components/Sidebar";
import { DiagnosisProvider, useDiagnosis } from "./context/DiagnosisContext";
import BatteryTests from "./pages/BatteryTests";
import ControllerDiagnostics from "./pages/ControllerDiagnostics";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import ServiceChecklist from "./pages/ServiceChecklist";
import Settings from "./pages/Settings";
import StartDiagnosis from "./pages/StartDiagnosis";

function AppShell() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const { technicianName } = useDiagnosis();

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onNavigate={setActivePage} />;
      case "start-diagnosis":
        return <StartDiagnosis onNavigate={setActivePage} />;
      case "battery-tests":
        return <BatteryTests />;
      case "controller-diagnostics":
        return <ControllerDiagnostics />;
      case "service-checklist":
        return <ServiceChecklist />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0E1116" }}>
      <Toaster />
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <Header activePage={activePage} technicianName={technicianName} />

      {/* Main content area */}
      <main
        className="min-h-screen"
        style={{
          marginLeft: 240,
          paddingTop: 56,
        }}
      >
        <div className="p-6">{renderPage()}</div>

        {/* Footer */}
        <footer
          className="mt-8 px-6 py-5 text-center text-xs"
          style={{ borderTop: "1px solid #2B3540", color: "#A8B0BA" }}
        >
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "#4A9EFF" }}
          >
            caffeine.ai
          </a>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DiagnosisProvider>
      <AppShell />
    </DiagnosisProvider>
  );
}
