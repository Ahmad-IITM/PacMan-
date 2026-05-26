import { chooseGhostDirection, getGhostTarget } from '@/logic/ai';
import { canTurn, getReverse, isIntersection, movePosition } from '@/logic/movement';
import {
  CHERRY_POSITIONS,
  Direction,
  EXTRA_SPAWN_POINTS,
  GHOST_TYPES,
  LEVELS,
  Position,
  START_POSITION,
  getCell,
  isCherry,
  isWalkable,
  keyForPosition,
} from '@/maps/levels';

export type GameStatus = 'playing' | 'won' | 'game-over';

export type Actor = {
  row: number;
  col: number;
  direction: Direction;
  nextDirection?: Direction;
  progress: number;
  speed: number;
};

export type GhostActor = Actor & {
  type: 'blinky' | 'pinky' | 'inky' | 'clyde';
};

export type GameSnapshot = {
  pacman: Actor;
  ghosts: GhostActor[];
  eatenPellets: Set<string>;
  foundCherries: Set<string>;
  score: number;
  lives: number;
  status: GameStatus;
  level: number;
  tick: number;
};

export type GameState = GameSnapshot & {
  rows: string[];
};

const GHOST_SAFE_SPAWN_POINTS: Position[] = [
  { row: 11, col: 3 },
  { row: 11, col: 11 },
  { row: 7, col: 10 },
  { row: 5, col: 7 },
];

function getGhostSpawn(rows: string[], index: number) {
  const preferred = GHOST_SAFE_SPAWN_POINTS[index];

  if (preferred && isWalkable(rows, preferred.row, preferred.col)) {
    return preferred;
  }

  const fallback = GHOST_SAFE_SPAWN_POINTS.find((spawn) => isWalkable(rows, spawn.row, spawn.col));

  return fallback ?? { row: 7, col: 2 };
}

function createGhosts(rows: string[], level: number): GhostActor[] {
  const baseCount = Math.min(LEVELS[level - 1]?.ghostCount ?? 2, GHOST_TYPES.length);
  const ghostTypes = GHOST_TYPES.slice(0, baseCount);

  return ghostTypes.map((type, index): GhostActor => {
    const direction: Direction = index % 2 === 0 ? 'down' : 'up';
    const spawn = getGhostSpawn(rows, index);

    return {
      type,
      row: spawn.row,
      col: spawn.col,
      direction,
      progress: 0,
      speed: 4.35 + 0.15 * (level - 1),
    };
  });
}

export function createInitialGameState(level = 1): GameState {
  const rows = LEVELS[Math.min(level - 1, LEVELS.length - 1)].rows;

  return {
    rows,
    pacman: {
      row: START_POSITION.row,
      col: START_POSITION.col,
      direction: 'right',
      progress: 0,
      speed: LEVELS[Math.min(level - 1, LEVELS.length - 1)].pacmanSpeed,
    },
    ghosts: createGhosts(rows, level),
    eatenPellets: new Set<string>(),
    foundCherries: new Set<string>(),
    score: 0,
    lives: 3,
    status: 'playing',
    level,
    tick: 0,
  };
}

function cloneSet<T>(set: Set<T>) {
  return new Set(set);
}

function actorAtTile(actor: Actor) {
  return { row: actor.row, col: actor.col };
}

function canAdvance(rows: string[], actor: Actor) {
  const next = movePosition(actorAtTile(actor), actor.direction);
  return isWalkable(rows, next.row, next.col);
}

function applyBufferedDirection(state: GameState, actor: Actor) {
  if (!actor.nextDirection) {
    return;
  }

  if (!canTurn(state.rows, actorAtTile(actor), actor.nextDirection, actor.direction)) {
    return;
  }

  actor.direction = actor.nextDirection;
  actor.nextDirection = undefined;
}

function processPelletAndCherry(state: GameState, position: Position) {
  const cell = keyForPosition(position);

  if (!state.eatenPellets.has(cell) && getCell(state.rows, position.row, position.col) === '.') {
    state.eatenPellets.add(cell);
    state.score += 10;
  }

  if (!state.foundCherries.has(cell) && isCherry(position)) {
    state.foundCherries.add(cell);
    state.score += 50;
  }
}

function resolveGhostCollision(state: GameState) {
  const pacmanTile = actorAtTile(state.pacman);

  for (const ghost of state.ghosts) {
    if (ghost.row === pacmanTile.row && ghost.col === pacmanTile.col) {
      state.lives -= 1;

      if (state.lives <= 0) {
        state.status = 'game-over';
        return true;
      }

      const resetLevel = state.level;
      state.pacman = createInitialGameState(resetLevel).pacman;
      state.ghosts = createGhosts(state.rows, resetLevel);
      state.eatenPellets = new Set<string>();
      state.foundCherries = new Set<string>();
      return false;
    }
  }

  return false;
}

function shouldAdvanceLevel(state: GameState) {
  const pellets = state.rows.flatMap((row, rowIndex) =>
    row
      .split('')
      .map((cell, colIndex) => ({ row: rowIndex, col: colIndex, cell }))
      .filter((cell) => cell.cell === '.'),
  );

  const allPellets = pellets.every((cell) => state.eatenPellets.has(keyForPosition(cell)));
  const allCherries = CHERRY_POSITIONS.every((cherry) => state.foundCherries.has(keyForPosition(cherry)));

  return allPellets && allCherries;
}

function updateActor(actor: Actor, rows: string[]) {
  actor.progress += 1 / 60;

  if (actor.progress < 1) {
    return;
  }

  actor.progress = 0;

  if (!canAdvance(rows, actor)) {
    return;
  }

  const next = movePosition(actorAtTile(actor), actor.direction);
  actor.row = next.row;
  actor.col = next.col;

  if (actor.nextDirection && canTurn(rows, actorAtTile(actor), actor.nextDirection, actor.direction)) {
    actor.direction = actor.nextDirection;
    actor.nextDirection = undefined;
  }
}

function updateGhosts(state: GameState, dt: number) {
  for (const ghost of state.ghosts) {
    ghost.progress += dt * ghost.speed;

    if (ghost.progress < 1) {
      continue;
    }

    ghost.progress = 0;

    const target = getGhostTarget(ghost, actorAtTile(state.pacman), state.tick);
    ghost.nextDirection = chooseGhostDirection(ghost, target, state.rows, 0.13);

    if (ghost.nextDirection && canTurn(state.rows, actorAtTile(ghost), ghost.nextDirection, ghost.direction)) {
      ghost.direction = ghost.nextDirection;
      ghost.nextDirection = undefined;
    }

    if (!canAdvance(state.rows, ghost)) {
      continue;
    }

    const next = movePosition(actorAtTile(ghost), ghost.direction);
    ghost.row = next.row;
    ghost.col = next.col;
  }
}

export function stepGame(state: GameState, dt: number) {
  if (state.status !== 'playing') {
    return state;
  }

  const step = Math.min(dt, 0.033);

  applyBufferedDirection(state, state.pacman);

  if (!canAdvance(state.rows, state.pacman)) {
    updateGhosts(state, step);

    if (resolveGhostCollision(state)) {
      return state;
    }

    state.tick += 1;
    return state;
  }

  state.pacman.progress += step * state.pacman.speed;

  if (state.pacman.progress >= 1) {
    state.pacman.progress = 0;

    const next = movePosition(actorAtTile(state.pacman), state.pacman.direction);
    state.pacman.row = next.row;
    state.pacman.col = next.col;
    processPelletAndCherry(state, { row: state.pacman.row, col: state.pacman.col });

    applyBufferedDirection(state, state.pacman);
  }

  updateGhosts(state, step);

  if (resolveGhostCollision(state)) {
    return state;
  }

  if (shouldAdvanceLevel(state)) {
    if (state.level >= LEVELS.length) {
      state.status = 'won';
      return state;
    }

    const nextLevel = state.level + 1;
    const nextState = createInitialGameState(nextLevel);
    nextState.score = state.score;
    nextState.lives = state.lives;
    nextState.status = 'playing';
    nextState.tick = state.tick + 1;
    return nextState;
  }

  state.tick += 1;

  return state;
}

export function snapshotGame(state: GameState): GameSnapshot {
  return {
    pacman: { ...state.pacman },
    ghosts: state.ghosts.map((ghost) => ({ ...ghost })),
    eatenPellets: cloneSet(state.eatenPellets),
    foundCherries: cloneSet(state.foundCherries),
    score: state.score,
    lives: state.lives,
    status: state.status,
    level: state.level,
    tick: state.tick,
  };
}

export function requestDirection(state: GameState, direction: Direction) {
  state.pacman.nextDirection = direction;
}

export function resetGameState(level = 1) {
  return createInitialGameState(level);
}
