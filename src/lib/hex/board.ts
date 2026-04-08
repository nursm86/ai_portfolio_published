import { Cell, RED, BLUE, PlayerColor, CellValue } from './types';
import { DX, DY } from './constants';

export class Board {
  private boardSize: number;
  private turn: PlayerColor;
  private grid: number[];
  private availableMoves: Cell[];

  constructor(bs: number) {
    this.boardSize = bs;
    this.grid = new Array(bs * bs).fill(0);
    this.availableMoves = [];

    for (let i = 0; i < bs; i++) {
      for (let j = 0; j < bs; j++) {
        this.availableMoves.push({ x: i, y: j, heuristic_p1: 0, heuristic_p2: 0 });
      }
    }

    this.turn = RED;
  }

  /**
   * Deep-copy constructor equivalent.
   * Returns a new Board that is an independent clone of this one.
   */
  clone(): Board {
    const copy = Object.create(Board.prototype) as Board;
    copy.boardSize = this.boardSize;
    copy.grid = this.grid.slice();
    copy.turn = this.turn;

    copy.availableMoves = [];
    const bs = this.boardSize;
    for (let i = 0; i < bs; i++) {
      for (let j = 0; j < bs; j++) {
        if (copy.grid[i * bs + j] === 0) {
          copy.availableMoves.push({ x: i, y: j, heuristic_p1: 0, heuristic_p2: 0 });
        }
      }
    }

    return copy;
  }

  getBoardSize(): number {
    return this.boardSize;
  }

  getGrid(x: number, y: number): CellValue {
    return this.grid[x * this.boardSize + y] as CellValue;
  }

  getTurn(): PlayerColor {
    return this.turn;
  }

  validInput(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.boardSize || y >= this.boardSize) {
      return false;
    }
    if (this.grid[x * this.boardSize + y] !== 0) {
      return false;
    }
    return true;
  }

  addMove(playerType: PlayerColor, x: number, y: number): boolean {
    if (playerType !== this.turn) {
      return false;
    }

    if (!this.validInput(x, y)) {
      return false;
    }

    this.grid[x * this.boardSize + y] = playerType;

    for (let i = 0; i < this.availableMoves.length; i++) {
      if (this.availableMoves[i].x === x && this.availableMoves[i].y === y) {
        this.availableMoves.splice(i, 1);
        break;
      }
    }

    this.turn = (this.turn === RED ? BLUE : RED) as PlayerColor;
    return true;
  }

  /**
   * DFS-based win check.
   * Red checks top row -> bottom row (row 0 to row boardSize-1).
   * Blue checks left col -> right col (col 0 to col boardSize-1).
   * Returns the playerType value if that player has won, otherwise 0.
   */
  checkWin(playerType: PlayerColor): number {
    const bs = this.boardSize;
    const visited = new Array(bs * bs).fill(false);
    const stack: number[] = [];

    if (playerType === BLUE) {
      // Blue: left to right (col 0 -> col boardSize-1)
      for (let r = 0; r < bs; r++) {
        if (this.grid[r * bs] === playerType) {
          const idx = r * bs;
          stack.push(idx);
          visited[idx] = true;
        }
      }

      while (stack.length > 0) {
        const idx = stack.pop()!;
        const x = Math.floor(idx / bs);
        const y = idx % bs;

        if (y === bs - 1) {
          return playerType;
        }

        const neighbours = this.getNeighbours(playerType, x, y);
        for (const nidx of neighbours) {
          if (!visited[nidx]) {
            visited[nidx] = true;
            stack.push(nidx);
          }
        }
      }
    } else if (playerType === RED) {
      // Red: top to bottom (row 0 -> row boardSize-1)
      for (let c = 0; c < bs; c++) {
        if (this.grid[c] === playerType) {
          const idx = c;
          stack.push(idx);
          visited[idx] = true;
        }
      }

      while (stack.length > 0) {
        const idx = stack.pop()!;
        const x = Math.floor(idx / bs);
        const y = idx % bs;

        if (x === bs - 1) {
          return playerType;
        }

        const neighbours = this.getNeighbours(playerType, x, y);
        for (const nidx of neighbours) {
          if (!visited[nidx]) {
            visited[nidx] = true;
            stack.push(nidx);
          }
        }
      }
    }

    return 0;
  }

  /**
   * Returns the winning path as an array of flat indices, or empty if no win.
   * Uses BFS with parent tracking to reconstruct the shortest winning path.
   */
  getWinningPath(playerType: PlayerColor): number[] {
    const bs = this.boardSize;
    const parent = new Int32Array(bs * bs).fill(-1);
    const visited = new Uint8Array(bs * bs);
    const queue: number[] = [];

    if (playerType === RED) {
      // Red: top → bottom
      for (let c = 0; c < bs; c++) {
        if (this.grid[c] === playerType) {
          queue.push(c);
          visited[c] = 1;
          parent[c] = c; // self = start node
        }
      }
      let head = 0;
      while (head < queue.length) {
        const idx = queue[head++];
        const x = Math.floor(idx / bs);
        const y = idx % bs;

        if (x === bs - 1) {
          // Reconstruct path
          const path: number[] = [];
          let cur = idx;
          while (parent[cur] !== cur) {
            path.push(cur);
            cur = parent[cur];
          }
          path.push(cur);
          return path;
        }

        for (let i = 0; i < 6; i++) {
          const nx = x + DX[i];
          const ny = y + DY[i];
          if (nx >= 0 && ny >= 0 && nx < bs && ny < bs) {
            const nidx = nx * bs + ny;
            if (!visited[nidx] && this.grid[nidx] === playerType) {
              visited[nidx] = 1;
              parent[nidx] = idx;
              queue.push(nidx);
            }
          }
        }
      }
    } else {
      // Blue: left → right
      for (let r = 0; r < bs; r++) {
        const idx = r * bs;
        if (this.grid[idx] === playerType) {
          queue.push(idx);
          visited[idx] = 1;
          parent[idx] = idx;
        }
      }
      let head = 0;
      while (head < queue.length) {
        const idx = queue[head++];
        const x = Math.floor(idx / bs);
        const y = idx % bs;

        if (y === bs - 1) {
          const path: number[] = [];
          let cur = idx;
          while (parent[cur] !== cur) {
            path.push(cur);
            cur = parent[cur];
          }
          path.push(cur);
          return path;
        }

        for (let i = 0; i < 6; i++) {
          const nx = x + DX[i];
          const ny = y + DY[i];
          if (nx >= 0 && ny >= 0 && nx < bs && ny < bs) {
            const nidx = nx * bs + ny;
            if (!visited[nidx] && this.grid[nidx] === playerType) {
              visited[nidx] = 1;
              parent[nidx] = idx;
              queue.push(nidx);
            }
          }
        }
      }
    }

    return [];
  }

  /**
   * Returns flat-array indices of all neighbors of (x, y) that match playerType.
   */
  getNeighbours(playerType: PlayerColor, x: number, y: number): number[] {
    const result: number[] = [];
    const bs = this.boardSize;

    for (let i = 0; i < 6; i++) {
      const nx = x + DX[i];
      const ny = y + DY[i];

      if (nx >= 0 && ny >= 0 && nx < bs && ny < bs) {
        if (this.grid[nx * bs + ny] === playerType) {
          result.push(nx * bs + ny);
        }
      }
    }

    return result;
  }

  getNeighboursCount(playerType: PlayerColor, x: number, y: number): number {
    let neighbours = 0;
    const bs = this.boardSize;

    for (let i = 0; i < 6; i++) {
      const nx = x + DX[i];
      const ny = y + DY[i];

      if (nx >= 0 && ny >= 0 && nx < bs && ny < bs) {
        if (this.grid[nx * bs + ny] === playerType) {
          neighbours++;
        }
      }
    }

    return neighbours;
  }

  isBoardFull(): boolean {
    return this.availableMoves.length === 0;
  }

  getAvailableMoves(): ReadonlyArray<Cell> {
    return this.availableMoves;
  }

  getAvailableMovesRef(): Cell[] {
    return this.availableMoves;
  }

  availableMovesValue(x: number, y: number, red: boolean): number {
    for (const c of this.availableMoves) {
      if (c.x === x && c.y === y) {
        return red ? c.heuristic_p1 : c.heuristic_p2;
      }
    }
    return 0;
  }

  /** Place a stone without turn validation (for rebuilding board state) */
  forcePlace(player: PlayerColor, x: number, y: number): void {
    this.grid[x * this.boardSize + y] = player;
    this.availableMoves = this.availableMoves.filter(
      (c) => !(c.x === x && c.y === y)
    );
  }

  /** Override available moves (for rebuilding board state) */
  setAvailableMoves(moves: Cell[]): void {
    this.availableMoves = moves.map((c) => ({ ...c }));
  }

  /** Override current turn */
  setTurn(player: PlayerColor): void {
    this.turn = player;
  }
}
