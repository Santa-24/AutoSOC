import React from "react";

interface SparklineProps {
  data: number[];
  color?: "lime" | "alert" | "mineral";
  height?: number;
  width?: number;
  showFill?: boolean;
}

export function Sparkline({
  data,
  color = "lime",
  height = 36,
  width = 120,
  showFill = true,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <div style={{ height, width }} className="bg-charcoal-800/40" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 2;
  const innerHeight = height - padding * 2;
  const step = width / (data.length - 1);

  const points = data.map((val, idx) => {
    const x = idx * step;
    const y = height - padding - ((val - min) / range) * innerHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const colorConfig = {
    lime: {
      stroke: "#C7F36B",
      fill: "url(#lime-gradient)",
      gradientStart: "rgba(199, 243, 107, 0.25)",
      gradientStop: "rgba(199, 243, 107, 0.0)",
    },
    alert: {
      stroke: "#FF4747",
      fill: "url(#alert-gradient)",
      gradientStart: "rgba(255, 71, 71, 0.3)",
      gradientStop: "rgba(255, 71, 71, 0.0)",
    },
    mineral: {
      stroke: "#7D8475",
      fill: "url(#mineral-gradient)",
      gradientStart: "rgba(125, 132, 117, 0.2)",
      gradientStop: "rgba(125, 132, 117, 0.0)",
    },
  };

  const current = colorConfig[color];

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${color}-gradient`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={current.gradientStart} />
          <stop offset="100%" stopColor={current.gradientStop} />
        </linearGradient>
      </defs>
      {showFill && <path d={areaD} fill={current.fill} />}
      <path
        d={pathD}
        fill="none"
        stroke={current.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last value dot indicator */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(",")[0]}
          cy={points[points.length - 1].split(",")[1]}
          r="2.5"
          fill={current.stroke}
        />
      )}
    </svg>
  );
}
