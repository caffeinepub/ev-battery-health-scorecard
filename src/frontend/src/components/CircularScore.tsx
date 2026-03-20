import { useMemo } from "react";

interface CircularScoreProps {
  score: number;
  max: number;
}

export default function CircularScore({ score, max }: CircularScoreProps) {
  const percentage = max > 0 ? Math.round((score / max) * 100) : 0;

  const { color, label } = useMemo(() => {
    if (percentage >= 80) return { color: "#35C46A", label: "EXCELLENT" };
    if (percentage >= 50) return { color: "#F2C43B", label: "NEEDS ATTENTION" };
    return { color: "#E25555", label: "CRITICAL" };
  }, [percentage]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg
          width={140}
          height={140}
          viewBox="0 0 140 140"
          role="img"
          aria-label={`Battery health score: ${score} out of ${max}`}
        >
          <circle cx={70} cy={70} r={radius} className="circular-score-track" />
          <circle
            cx={70}
            cy={70}
            r={radius}
            className="circular-score-fill"
            style={{
              stroke: color,
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              transform: "rotate(-90deg)",
              transformOrigin: "70px 70px",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            / {max}
          </span>
        </div>
      </div>
      <span
        className="mt-2 text-xs font-bold tracking-widest px-3 py-1 rounded-full"
        style={{
          color,
          background: `${color}22`,
          border: `1px solid ${color}55`,
        }}
      >
        {label}
      </span>
    </div>
  );
}
