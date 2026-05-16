import { useMemo } from 'react';

interface SkillRadarProps {
  labels: string[];
  playerScores: number[];
  requirementScores?: number[];
  size?: number;
}

export default function SkillRadar({ labels, playerScores, requirementScores, size = 220 }: SkillRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const sides = labels.length;

  const points = useMemo(() => {
    if (sides < 3) return [];
    const angleStep = (2 * Math.PI) / sides;
    const offset = -Math.PI / 2;
    return Array.from({ length: sides }, (_, i) => {
      const angle = offset + i * angleStep;
      return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });
  }, [sides, cx, cy, radius]);

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const labelOffset = 20;

  function polygonPath(values: number[]) {
    if (values.length !== sides) return '';
    const angleStep = (2 * Math.PI) / sides;
    const offset = -Math.PI / 2;
    return values
      .map((v, i) => {
        const angle = offset + i * angleStep;
        const r = (Math.min(Math.max(v, 0), 100) / 100) * radius;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ') + 'Z';
  }

  if (sides < 3) return null;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {/* Grid rings */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={points.map((p) => {
            const x = cx + (p.x - cx) * level;
            const y = cy + (p.y - cy) * level;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {points.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}

      {/* Requirement polygon */}
      {requirementScores && requirementScores.length === sides && (
        <polygon
          points={requirementScores.map((v, i) => {
            const angle = (-Math.PI / 2) + i * (2 * Math.PI) / sides;
            const r = (Math.min(Math.max(v, 0), 100) / 100) * radius;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
          }).join(' ')}
          fill="rgba(255,107,107,0.15)"
          stroke="#FF6B6B"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}

      {/* Player polygon */}
      <polygon
        d={polygonPath(playerScores)}
        fill="rgba(209,255,0,0.12)"
        stroke="#D1FF00"
        strokeWidth="2"
        className="drop-shadow-[0_0_8px_rgba(209,255,0,0.15)]"
      />

      {/* Score dots */}
      {playerScores.map((score, i) => {
        if (sides === 0 || score == null) return null;
        const angle = (-Math.PI / 2) + i * (2 * Math.PI) / sides;
        const r = (Math.min(Math.max(score, 0), 100) / 100) * radius;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3.5" fill="#D1FF00" />
            <circle cx={x} cy={y} r="6" fill="rgba(209,255,0,0.2)" />
            <text x={x} y={y - 10} textAnchor="middle" fill="#D1FF00" fontSize="8" fontFamily="monospace" fontWeight="bold">
              {score}
            </text>
          </g>
        );
      })}

      {/* Labels */}
      {labels.map((label, i) => {
        const angle = (-Math.PI / 2) + i * (2 * Math.PI) / sides;
        const lx = cx + (radius + labelOffset) * Math.cos(angle);
        const ly = cy + (radius + labelOffset) * Math.sin(angle);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="8"
            fontFamily="sans-serif"
            fontWeight="bold"
            textLength={48}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
