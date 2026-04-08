'use client';

import { RED, BLUE, EMPTY, type CellValue, type PlayerColor } from '@/lib/hex/types';

interface HexCellProps {
  row: number;
  col: number;
  value: CellValue;
  cx: number;
  cy: number;
  size: number;
  isLastMove: boolean;
  isWinningCell: boolean;
  isClickable: boolean;
  currentPlayer: PlayerColor;
  onCellClick: (row: number, col: number) => void;
}

function hexPoints(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 30 + 60 * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    points.push(`${cx + size * Math.cos(angleRad)},${cy + size * Math.sin(angleRad)}`);
  }
  return points.join(' ');
}

export default function HexCell({
  row,
  col,
  value,
  cx,
  cy,
  size,
  isLastMove,
  isWinningCell,
  isClickable,
  currentPlayer,
  onCellClick,
}: HexCellProps) {
  const points = hexPoints(cx, cy, size);

  // Winning cells get a brighter version of their color
  let fill: string;
  if (isWinningCell) {
    fill = value === RED ? '#fca5a5' : '#93c5fd'; // brighter red/blue
  } else if (value === RED) {
    fill = '#ef4444';
  } else if (value === BLUE) {
    fill = '#3b82f6';
  } else {
    fill = 'rgba(64, 64, 64, 0.4)';
  }

  let stroke = 'rgba(100, 100, 100, 0.5)';
  let strokeWidth = 1;
  if (isWinningCell) {
    stroke = '#fbbf24'; // golden
    strokeWidth = 3;
  } else if (isLastMove) {
    stroke = '#22c55e';
    strokeWidth = 2.5;
  }

  const canClick = isClickable && value === EMPTY;

  // Unique filter ID for glow
  const filterId = `glow-${row}-${col}`;

  return (
    <>
      {isWinningCell && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feFlood floodColor={value === RED ? '#ef4444' : '#3b82f6'} floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        filter={isWinningCell ? `url(#${filterId})` : undefined}
        style={{
          cursor: canClick ? 'pointer' : 'default',
          transition: 'fill 0.15s ease, stroke 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (canClick) {
            e.currentTarget.setAttribute('fill',
              currentPlayer === RED ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)'
            );
          }
        }}
        onMouseLeave={(e) => {
          if (canClick) {
            e.currentTarget.setAttribute('fill', fill);
          }
        }}
        onClick={() => {
          if (canClick) onCellClick(row, col);
        }}
      />
    </>
  );
}
