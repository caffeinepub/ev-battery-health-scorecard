import { Textarea } from "@/components/ui/textarea";
import type { LucideIcon } from "lucide-react";

interface ChecklistCardProps {
  title: string;
  subtitle: string;
  accent: string;
  icon: LucideIcon;
  items: string[];
  checkedItems: boolean[];
  score: number;
  notes: string;
  onToggleItem: (idx: number) => void;
  onScoreChange: (val: number) => void;
  onNotesChange: (val: string) => void;
}

export default function ChecklistCard({
  title,
  subtitle,
  accent,
  icon: Icon,
  items,
  checkedItems,
  score,
  notes,
  onToggleItem,
  onScoreChange,
  onNotesChange,
}: ChecklistCardProps) {
  const progressPct = (score / 10) * 100;
  const ocidBase = title.toLowerCase().replace(/\s+/g, "_");

  return (
    <div
      className="ev-card rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "oklch(0.20 0.03 230)",
        border: "1px solid oklch(0.29 0.04 230)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      data-ocid={`${ocidBase}.card`}
    >
      {/* Colored header band */}
      <div
        className="card-header-band px-4 py-3 flex items-center gap-3"
        style={{ background: accent }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ background: "rgba(0,0,0,0.25)" }}
        >
          <Icon size={18} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-semibold text-white text-sm leading-tight">
            {title}
          </div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
            {subtitle}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="flex items-center gap-1">
            <span
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Score
            </span>
            <input
              type="number"
              min={0}
              max={10}
              value={score}
              onChange={(e) =>
                onScoreChange(Math.min(10, Math.max(0, Number(e.target.value))))
              }
              className="w-10 text-center text-sm font-bold rounded text-white border-0 outline-none"
              style={{ background: "rgba(0,0,0,0.3)" }}
              data-ocid={`${ocidBase}.input`}
            />
            <span className="text-xs font-bold text-white">/10</span>
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="flex-1 px-4 pt-3 pb-2 space-y-2">
        {items.map((item, i) => (
          <label
            key={item}
            className="flex items-center gap-3 cursor-pointer group"
            data-ocid={`${ocidBase}.item.${i + 1}`}
          >
            <input
              type="checkbox"
              checked={checkedItems[i] ?? false}
              onChange={() => onToggleItem(i)}
              className="ev-checkbox rounded"
              style={{ accentColor: accent }}
              data-ocid={`${ocidBase}.checkbox.${i + 1}`}
            />
            <span
              className="text-sm leading-tight transition-colors"
              style={{
                color: checkedItems[i]
                  ? "oklch(0.72 0.025 220)"
                  : "oklch(0.93 0.02 220)",
                textDecoration: checkedItems[i] ? "line-through" : "none",
              }}
            >
              {item}
            </span>
          </label>
        ))}
      </div>

      {/* Notes */}
      <div className="px-4 pb-3">
        <Textarea
          placeholder="Notes..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          className="text-xs resize-none"
          style={{
            background: "oklch(0.15 0.025 240)",
            border: "1px solid oklch(0.29 0.04 230)",
            color: "oklch(0.93 0.02 220)",
          }}
          data-ocid={`${ocidBase}.textarea`}
        />
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: "oklch(0.24 0.035 228)" }}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${progressPct}%`,
            background: accent,
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>
    </div>
  );
}
