// Hex neighbor offsets (same as C++ dx[], dy[])
export const DX = [-1, -1, 0, 0, 1, 1] as const;
export const DY = [0, 1, -1, 1, -1, 0] as const;

export const BOARD_SIZES = [5, 7, 9, 11] as const;

export const HEX_SIZE = 24; // radius for SVG rendering
