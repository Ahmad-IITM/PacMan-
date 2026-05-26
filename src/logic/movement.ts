import { CONTROL_ORDER, Direction, MOVE_DELTAS, Position, isWalkable } from '@/maps/levels';

export function getReverse(direction: Direction) {
  if (direction === 'up') return 'down';
  if (direction === 'down') return 'up';
  if (direction === 'left') return 'right';
  return 'left';
}

export function movePosition(position: Position, direction: Direction) {
  return {
    row: position.row + MOVE_DELTAS[direction].row,
    col: position.col + MOVE_DELTAS[direction].col,
  };
}

export function isSamePosition(a: Position, b: Position) {
  return a.row === b.row && a.col === b.col;
}

export function canTurn(rows: string[], position: Position, direction: Direction, currentDirection: Direction) {
  const next = movePosition(position, direction);
  return isWalkable(rows, next.row, next.col);
}

export function getCandidateDirections(rows: string[], position: Position, currentDirection: Direction) {
  return CONTROL_ORDER.filter((direction) => canTurn(rows, position, direction, currentDirection));
}

export function getDistanceToTarget(a: Position, b: Position) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getTileCenterProgress(progress: number, direction: Direction) {
  if (direction === 'right') return progress;
  if (direction === 'down') return progress;
  if (direction === 'left') return 1 - progress;
  return 1 - progress;
}

export function getRenderOffset(progress: number, direction: Direction) {
  if (direction === 'right') return progress;
  if (direction === 'down') return progress;
  if (direction === 'left') return 1 - progress;
  return 1 - progress;
}

export function isIntersection(rows: string[], position: Position) {
  const available = CONTROL_ORDER.filter((direction) => {
    const next = movePosition(position, direction);
    return isWalkable(rows, next.row, next.col);
  });

  return available.length >= 3;
}
