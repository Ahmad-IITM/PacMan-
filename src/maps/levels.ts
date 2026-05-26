export type Direction = 'up' | 'down' | 'left' | 'right';

export type Position = {
  row: number;
  col: number;
};

export type GhostType = 'blinky' | 'pinky' | 'inky' | 'clyde';

export type LevelConfig = {
  id: number;
  rows: string[];
  spawn: Position;
  ghostCount: number;
  ghostSpeed: number;
  pacmanSpeed: number;
};

export const CONTROL_ORDER: Direction[] = ['up', 'down', 'left', 'right'];

export const DIRECTION_LABELS: Record<Direction, string> = {
  up: '▲',
  down: '▼',
  left: '◀',
  right: '▶',
};

export const MOVE_DELTAS: Record<Direction, Position> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

export const GHOST_TYPES: GhostType[] = ['blinky', 'pinky', 'inky', 'clyde'];

export const GHOST_META: Record<GhostType, { color: string; scatter: Position; accent: string }> = {
  blinky: { color: '#fb7185', scatter: { row: 1, col: 13 }, accent: '#ffe4e6' },
  pinky: { color: '#f9a8d4', scatter: { row: 1, col: 1 }, accent: '#fdf2f8' },
  inky: { color: '#67e8f9', scatter: { row: 13, col: 13 }, accent: '#ecfeff' },
  clyde: { color: '#fdba74', scatter: { row: 13, col: 1 }, accent: '#fff7ed' },
};

export const START_POSITION: Position = { row: 7, col: 2 };

export const CHERRY_POSITIONS = [
  { row: 1, col: 1 },
  { row: 1, col: 13 },
  { row: 13, col: 1 },
  { row: 13, col: 13 },
] as const;

export const EXTRA_SPAWN_POINTS: Position[] = [
  { row: 3, col: 3 },
  { row: 3, col: 11 },
  { row: 11, col: 3 },
  { row: 11, col: 11 },
];

export const LEVEL_ROWS = [
  '###############',
  '#C...........C#',
  '#.###.#####.#.#',
  '#.#.....#...#.#',
  '#.#.###.#.###.#',
  '#...#...#.....#',
  '###.#.###.###.#',
  '#...#.....#...#',
  '#.###.###.###.#',
  '#.....#.....#.#',
  '#.###.#.###.#.#',
  '#.....#...#...#',
  '#.###.###.###.#',
  '#C...........C#',
  '###############',
] as const;

export const DOT_POSITIONS = LEVEL_ROWS.flatMap((row, rowIndex) =>
  row
    .split('')
    .map((cell, colIndex) => ({ row: rowIndex, col: colIndex, cell }))
    .filter((cell) => cell.cell === '.'),
);

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    rows: [...LEVEL_ROWS],
    spawn: START_POSITION,
    ghostCount: 2,
    ghostSpeed: 4.35,
    pacmanSpeed: 4.8,
  },
  {
    id: 2,
    rows: [...LEVEL_ROWS],
    spawn: START_POSITION,
    ghostCount: 3,
    ghostSpeed: 4.6,
    pacmanSpeed: 4.9,
  },
  {
    id: 3,
    rows: [...LEVEL_ROWS],
    spawn: START_POSITION,
    ghostCount: 4,
    ghostSpeed: 4.85,
    pacmanSpeed: 5.0,
  },
];

export function getCell(rows: string[], row: number, col: number) {
  return rows[row]?.[col] ?? '#';
}

export function isWalkable(rows: string[], row: number, col: number) {
  return getCell(rows, row, col) !== '#';
}

export function isCherry(position: Position) {
  return CHERRY_POSITIONS.some(
    (item) => item.row === position.row && item.col === position.col,
  );
}

export function keyForPosition(position: Position) {
  return `${position.row}:${position.col}`;
}
