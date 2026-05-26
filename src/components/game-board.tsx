import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { GhostActor, GameSnapshot } from '@/logic/game';
import { CHERRY_POSITIONS, DOT_POSITIONS, GHOST_META, Position, keyForPosition } from '@/maps/levels';

function getEntityPosition(tileSize: number, position: Position, direction: 'up' | 'down' | 'left' | 'right', progress: number) {
  if (direction === 'right') {
    return {
      top: position.row * tileSize,
      left: position.col * tileSize + progress * tileSize,
    };
  }

  if (direction === 'left') {
    return {
      top: position.row * tileSize,
      left: position.col * tileSize + (1 - progress) * tileSize,
    };
  }

  if (direction === 'down') {
    return {
      top: position.row * tileSize + progress * tileSize,
      left: position.col * tileSize,
    };
  }

  return {
    top: position.row * tileSize + (1 - progress) * tileSize,
    left: position.col * tileSize,
  };
}

function WallTile({ row, col, tileSize }: { row: number; col: number; tileSize: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        top: row * tileSize,
        left: col * tileSize,
        width: tileSize,
        height: tileSize,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: Math.max(2, tileSize - 2),
          height: Math.max(2, tileSize - 2),
          borderRadius: 6,
          backgroundColor: '#1d4ed8',
        }}
      />
    </View>
  );
}

const MemoWallTile = memo(WallTile);
const MemoPacmanSprite = memo(PacmanSprite);
const MemoGhostSprite = memo(GhostSprite);

function PacmanSprite({ tileSize, pacman }: { tileSize: number; pacman: GameSnapshot['pacman'] }) {
  const position = getEntityPosition(tileSize, { row: pacman.row, col: pacman.col }, pacman.direction, pacman.progress);
  const mouthOpen = 0.3 + 0.2 * Math.abs(Math.sin((Date.now() / 100) % (Math.PI * 2)));

  return (
    <View
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: tileSize * 0.75,
        height: tileSize * 0.75,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: tileSize * 0.72,
          height: tileSize * 0.72,
          borderRadius: 999,
          backgroundColor: '#facc15',
          transform: [{ scaleX: 1 - mouthOpen * 0.05 }, { scaleY: 1 - mouthOpen * 0.05 }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: tileSize * 0.42,
          height: tileSize * 0.42,
          borderRadius: 999,
          borderBottomWidth: 2,
          borderBottomColor: '#0f172a',
          opacity: 0.4,
        }}
      />
    </View>
  );
}

function GhostSprite({ tileSize, ghost }: { tileSize: number; ghost: GhostActor }) {
  const position = getEntityPosition(tileSize, { row: ghost.row, col: ghost.col }, ghost.direction, ghost.progress);
  const ghostStyle = GHOST_META[ghost.type];

  return (
    <View
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: tileSize * 0.72,
        height: tileSize * 0.72,
        borderTopLeftRadius: 999,
        borderTopRightRadius: 999,
        borderBottomLeftRadius: 999,
        borderBottomRightRadius: 999,
        backgroundColor: ghostStyle.color,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: tileSize * 0.2,
          height: tileSize * 0.2,
          borderRadius: 999,
          backgroundColor: '#ffffff',
          position: 'absolute',
          top: tileSize * 0.15,
          left: tileSize * 0.14,
        }}
      />
      <View
        style={{
          width: tileSize * 0.08,
          height: tileSize * 0.08,
          borderRadius: 999,
          backgroundColor: '#0f172a',
          position: 'absolute',
          top: tileSize * 0.18,
          left: tileSize * 0.18,
        }}
      />
      <View
        style={{
          width: tileSize * 0.2,
          height: tileSize * 0.2,
          borderRadius: 999,
          backgroundColor: '#ffffff',
          position: 'absolute',
          top: tileSize * 0.15,
          right: tileSize * 0.14,
        }}
      />
      <View
        style={{
          width: tileSize * 0.08,
          height: tileSize * 0.08,
          borderRadius: 999,
          backgroundColor: '#0f172a',
          position: 'absolute',
          top: tileSize * 0.18,
          right: tileSize * 0.18,
        }}
      />
    </View>
  );
}

export function GameBoard({
  tileSize,
  pacman,
  ghosts,
  eatenPellets,
  foundCherries,
  rows,
}: {
  tileSize: number;
  pacman: GameSnapshot['pacman'];
  ghosts: GhostActor[];
  eatenPellets: Set<string>;
  foundCherries: Set<string>;
  rows: string[];
}) {
  const walls = useMemo(
    () =>
      rows.flatMap((row, rowIndex) =>
        row.split('').map((cell, colIndex) => ({ row: rowIndex, col: colIndex, cell })),
      ),
    [rows],
  );

  const visibleDots = useMemo(
    () => DOT_POSITIONS.filter((dot) => !eatenPellets.has(keyForPosition(dot))),
    [eatenPellets],
  );

  const visibleCherries = useMemo(
    () => CHERRY_POSITIONS.filter((cherry) => !foundCherries.has(keyForPosition(cherry))),
    [foundCherries],
  );

  return (
    <View style={[styles.board, { width: tileSize * rows[0].length, height: tileSize * rows.length }]}>
      {walls
        .filter((cell) => cell.cell === '#')
        .map((cell) => (
          <MemoWallTile key={`${cell.row}-${cell.col}`} row={cell.row} col={cell.col} tileSize={tileSize} />
        ))}

      {visibleDots.map((dot) => (
        <View
          key={`dot-${dot.row}-${dot.col}`}
          style={{
            position: 'absolute',
            top: dot.row * tileSize + tileSize * 0.42,
            left: dot.col * tileSize + tileSize * 0.42,
            width: Math.max(3, tileSize * 0.12),
            height: Math.max(3, tileSize * 0.12),
            borderRadius: 999,
            backgroundColor: '#facc15',
          }}
        />
      ))}

      {visibleCherries.map((cherry) => (
        <View
          key={`cherry-${cherry.row}-${cherry.col}`}
          style={{
            position: 'absolute',
            top: cherry.row * tileSize + tileSize * 0.3,
            left: cherry.col * tileSize + tileSize * 0.3,
            width: Math.max(6, tileSize * 0.28),
            height: Math.max(6, tileSize * 0.28),
            borderRadius: 999,
            backgroundColor: '#f43f5e',
          }}
        />
      ))}

      <MemoPacmanSprite tileSize={tileSize} pacman={pacman} />

      {ghosts.map((ghost) => (
        <MemoGhostSprite key={`${ghost.type}-${ghost.row}-${ghost.col}`} tileSize={tileSize} ghost={ghost} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#0f172a',
  },
});
