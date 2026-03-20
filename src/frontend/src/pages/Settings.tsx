import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { VehicleType } from "../context/DiagnosisContext";
import { useDiagnosis } from "../context/DiagnosisContext";

export default function Settings() {
  const { technicianName, setTechnicianName, vehicleType, setVehicleType } =
    useDiagnosis();
  const [workshopName, setWorkshopName] = useState("AutoTech EV Workshop");
  const [localTech, setLocalTech] = useState(technicianName);
  const [localVehicle, setLocalVehicle] = useState<VehicleType>(vehicleType);
  const [localWorkshop, setLocalWorkshop] = useState(workshopName);

  const handleSave = () => {
    setTechnicianName(localTech);
    setVehicleType(localVehicle);
    setWorkshopName(localWorkshop);
    toast.success("Settings saved");
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#E7EAEE" }}>
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#A8B0BA" }}>
          Configure your diagnostic preferences
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6 space-y-5"
        style={{ background: "#1B222A", border: "1px solid #2B3540" }}
      >
        <h2 className="font-semibold" style={{ color: "#E7EAEE" }}>
          Preferences
        </h2>

        <div>
          <div
            className="text-xs font-medium block mb-1.5"
            style={{ color: "#A8B0BA" }}
          >
            Default Technician Name
          </div>
          <input
            className="diag-input"
            placeholder="Enter your name"
            value={localTech}
            onChange={(e) => setLocalTech(e.target.value)}
            data-ocid="settings.technician_name.input"
          />
        </div>

        <div>
          <div
            className="text-xs font-medium block mb-1.5"
            style={{ color: "#A8B0BA" }}
          >
            Workshop Name
          </div>
          <input
            className="diag-input"
            placeholder="Enter workshop name"
            value={localWorkshop}
            onChange={(e) => setLocalWorkshop(e.target.value)}
            data-ocid="settings.workshop_name.input"
          />
        </div>

        <div>
          <div
            className="text-xs font-medium block mb-2"
            style={{ color: "#A8B0BA" }}
          >
            Default Vehicle Type
          </div>
          <div className="flex gap-3">
            {(["2-wheeler", "3-wheeler"] as VehicleType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setLocalVehicle(t)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background:
                    localVehicle === t ? "rgba(74,158,255,0.15)" : "#0E1116",
                  border:
                    localVehicle === t
                      ? "2px solid #4A9EFF"
                      : "1px solid #2B3540",
                  color: localVehicle === t ? "#4A9EFF" : "#A8B0BA",
                }}
                data-ocid={`settings.vehicle_type_${t.replace("-", "_")}.toggle`}
              >
                {t === "2-wheeler" ? "🛵 2-Wheeler" : "🛺 3-Wheeler"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: "#2ED47A", color: "#0E1116" }}
          data-ocid="settings.save.primary_button"
        >
          Save Settings
        </button>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl p-6"
        style={{ background: "#1B222A", border: "1px solid #2B3540" }}
      >
        <h2 className="font-semibold mb-4" style={{ color: "#E7EAEE" }}>
          About
        </h2>
        <div className="space-y-2">
          {[
            { label: "App Name", value: "Battery Diagnosis" },
            { label: "Version", value: "1.0.0" },
            { label: "Platform", value: "EV 2-Wheeler & 3-Wheeler" },
            { label: "Build", value: "2026.03" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between py-1.5"
              style={{ borderBottom: "1px solid #2B3540" }}
            >
              <span className="text-xs" style={{ color: "#A8B0BA" }}>
                {row.label}
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: "#E7EAEE" }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
