import { GHOST_META, GhostType, Position } from '@/maps/levels';
import { getCandidateDirections, getDistanceToTarget, movePosition } from '@/logic/movement';

export type GhostAIState = {
  type: GhostType;
  row: number;
  col: number;
  direction: 'up' | 'down' | 'left' | 'right';
  nextDirection?: 'up' | 'down' | 'left' | 'right';
  progress: number;
  speed: number;
};

export function chooseGhostDirection(
  ghost: GhostAIState,
  target: Position,
  rows: string[],
  randomChance: number,
) {
  const candidates = getCandidateDirections(rows, { row: ghost.row, col: ghost.col }, ghost.direction);

  if (candidates.length === 0) {
    return ghost.direction;
  }

  if (Math.random() < randomChance) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const sorted = candidates
    .map((direction) => ({
      direction,
      next: movePosition({ row: ghost.row, col: ghost.col }, direction),
    }))
    .sort((a, b) => {
      const scoreA = getDistanceToTarget(a.next, target);
      const scoreB = getDistanceToTarget(b.next, target);
      return scoreA - scoreB;
    });

  return sorted[0]?.direction ?? ghost.direction;
}

export function getGhostTarget(ghost: GhostAIState, pacman: Position, tick: number) {
  if (Math.random() < 0.18) {
    return GHOST_META[ghost.type].scatter;
  }

  const offset = tick % 3;
  const target = {
    row: pacman.row + (offset === 0 ? 0 : offset === 1 ? 1 : -1),
    col: pacman.col + (offset === 2 ? -1 : 1),
  };

  return target;
}
