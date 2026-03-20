import { cn } from "@/lib/utils";

type Status = "good" | "warning" | "fault" | "normal" | "info";

const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bg: string; dot: string }
> = {
  good: {
    label: "Normal",
    color: "#2ED47A",
    bg: "rgba(46,212,122,0.12)",
    dot: "#2ED47A",
  },
  normal: {
    label: "Normal",
    color: "#2ED47A",
    bg: "rgba(46,212,122,0.12)",
    dot: "#2ED47A",
  },
  warning: {
    label: "Warning",
    color: "#F5C84B",
    bg: "rgba(245,200,75,0.12)",
    dot: "#F5C84B",
  },
  fault: {
    label: "Fault",
    color: "#E25555",
    bg: "rgba(226,85,85,0.12)",
    dot: "#E25555",
  },
  info: {
    label: "Info",
    color: "#4A9EFF",
    bg: "rgba(74,158,255,0.12)",
    dot: "#4A9EFF",
  },
};

export function StatusBadge({
  status,
  label,
  className,
}: { status: Status; label?: string; className?: string }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        className,
      )}
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}33`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      {label ?? cfg.label}
    </span>
  );
}

export function StatusDot({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="w-2.5 h-2.5 rounded-full flex-shrink-0 inline-block"
      style={{ background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }}
    />
  );
}

export function ToolBadge({ tool }: { tool: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{
        color: "#4A9EFF",
        background: "rgba(74,158,255,0.12)",
        border: "1px solid rgba(74,158,255,0.25)",
      }}
    >
      {tool}
    </span>
  );
}
