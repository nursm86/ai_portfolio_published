'use client';

import { RED, BLUE, EMPTY, type CellValue, type PlayerColor } from '@/lib/hex/types';
import HexCell from './HexCell';

interface HexBoardProps {
  board: number[];
  boardSize: number;
  currentPlayer: PlayerColor;
  humanPlayer: PlayerColor;
  lastMove: { row: number; col: number } | null;
  winningPath: number[];
  isClickable: boolean;
  onCellClick: (row: number, col: number) => void;
}

const HEX_SIZE = 22;

export default function HexBoard({
  board,
  boardSize,
  currentPlayer,
  humanPlayer,
  lastMove,
  winningPath,
  isClickable,
  onCellClick,
}: HexBoardProps) {
  const hexWidth = Math.sqrt(3) * HEX_SIZE;
  const hexHeight = 2 * HEX_SIZE;
  const vertSpacing = hexHeight * 0.75;

  // Calculate SVG dimensions
  const totalWidth = hexWidth * boardSize + (hexWidth / 2) * (boardSize - 1) + HEX_SIZE * 2;
  const totalHeight = vertSpacing * (boardSize - 1) + hexHeight + HEX_SIZE * 2;

  const offsetX = HEX_SIZE + hexWidth / 2;
  const offsetY = HEX_SIZE + hexHeight / 2;

  const getCellCenter = (row: number, col: number) => {
    const cx = offsetX + col * hexWidth + row * (hexWidth / 2);
    const cy = offsetY + row * vertSpacing;
    return { cx, cy };
  };

  const winSet = new Set(winningPath);

  // Edge labels
  const renderEdgeLabels = () => {
    const labels: JSX.Element[] = [];
    // Top edge (Red)
    const topY = offsetY - hexHeight / 2 - 10;
    const topX = offsetX + ((boardSize - 1) * hexWidth) / 2;
    labels.push(
      <text key="top" x={topX} y={topY} textAnchor="middle" fill="#ef4444" fontSize={11} fontWeight="bold">
        RED
      </text>
    );
    // Bottom edge (Red)
    const botCenter = getCellCenter(boardSize - 1, Math.floor(boardSize / 2));
    labels.push(
      <text key="bottom" x={botCenter.cx} y={botCenter.cy + hexHeight / 2 + 16} textAnchor="middle" fill="#ef4444" fontSize={11} fontWeight="bold">
        RED
      </text>
    );
    // Left edge (Blue)
    const leftCenter = getCellCenter(Math.floor(boardSize / 2), 0);
    labels.push(
      <text key="left" x={leftCenter.cx - hexWidth / 2 - 14} y={leftCenter.cy} textAnchor="middle" fill="#3b82f6" fontSize={11} fontWeight="bold" transform={`rotate(-90, ${leftCenter.cx - hexWidth / 2 - 14}, ${leftCenter.cy})`}>
        BLUE
      </text>
    );
    // Right edge (Blue)
    const rightCenter = getCellCenter(Math.floor(boardSize / 2), boardSize - 1);
    labels.push(
      <text key="right" x={rightCenter.cx + hexWidth / 2 + 14} y={rightCenter.cy} textAnchor="middle" fill="#3b82f6" fontSize={11} fontWeight="bold" transform={`rotate(90, ${rightCenter.cx + hexWidth / 2 + 14}, ${rightCenter.cy})`}>
        BLUE
      </text>
    );
    return labels;
  };

  // Edge borders
  const renderEdgeBorders = () => {
    const borders: JSX.Element[] = [];
    // Top border (Red)
    for (let c = 0; c < boardSize; c++) {
      const { cx, cy } = getCellCenter(0, c);
      borders.push(
        <line key={`top-${c}`} x1={cx - hexWidth / 2} y1={cy - HEX_SIZE} x2={cx + hexWidth / 2} y2={cy - HEX_SIZE} stroke="#ef4444" strokeWidth={3} strokeOpacity={0.6} />
      );
    }
    // Bottom border (Red)
    for (let c = 0; c < boardSize; c++) {
      const { cx, cy } = getCellCenter(boardSize - 1, c);
      borders.push(
        <line key={`bot-${c}`} x1={cx - hexWidth / 2} y1={cy + HEX_SIZE} x2={cx + hexWidth / 2} y2={cy + HEX_SIZE} stroke="#ef4444" strokeWidth={3} strokeOpacity={0.6} />
      );
    }
    // Left border (Blue)
    for (let r = 0; r < boardSize; r++) {
      const { cx, cy } = getCellCenter(r, 0);
      borders.push(
        <line key={`left-${r}`} x1={cx - hexWidth / 2} y1={cy - HEX_SIZE * 0.5} x2={cx - hexWidth / 2} y2={cy + HEX_SIZE * 0.5} stroke="#3b82f6" strokeWidth={3} strokeOpacity={0.6} />
      );
    }
    // Right border (Blue)
    for (let r = 0; r < boardSize; r++) {
      const { cx, cy } = getCellCenter(r, boardSize - 1);
      borders.push(
        <line key={`right-${r}`} x1={cx + hexWidth / 2} y1={cy - HEX_SIZE * 0.5} x2={cx + hexWidth / 2} y2={cy + HEX_SIZE * 0.5} stroke="#3b82f6" strokeWidth={3} strokeOpacity={0.6} />
      );
    }
    return borders;
  };

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className="w-full max-w-[600px] mx-auto"
      style={{ maxHeight: '60vh' }}
    >
      {renderEdgeBorders()}
      {Array.from({ length: boardSize }, (_, row) =>
        Array.from({ length: boardSize }, (_, col) => {
          const { cx, cy } = getCellCenter(row, col);
          const idx = row * boardSize + col;
          const value = board[idx] as CellValue;
          const isLast = lastMove !== null && lastMove.row === row && lastMove.col === col;
          const isWin = winSet.has(idx);

          return (
            <HexCell
              key={`${row}-${col}`}
              row={row}
              col={col}
              value={value}
              cx={cx}
              cy={cy}
              size={HEX_SIZE}
              isLastMove={isLast}
              isWinningCell={isWin}
              isClickable={isClickable}
              currentPlayer={currentPlayer}
              onCellClick={onCellClick}
            />
          );
        })
      )}
      {renderEdgeLabels()}
    </svg>
  );
}
