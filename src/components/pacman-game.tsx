import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameBoard } from '@/components/game-board';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { createInitialGameState, requestDirection, resetGameState, snapshotGame, stepGame } from '@/logic/game';
import { playSfx } from '@/logic/sound';
import { CONTROL_ORDER, DIRECTION_LABELS, Direction } from '@/maps/levels';

function getRaf() {
  if (typeof requestAnimationFrame === 'function') {
    return requestAnimationFrame.bind(globalThis);
  }

  return (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 16) as unknown as number;
}

function cancelRaf(handle: number | ReturnType<typeof setTimeout>) {
  if (typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(handle as number);
    return;
  }

  clearTimeout(handle as ReturnType<typeof setTimeout>);
}

export function PacManGame() {
  const gameRef = useRef(createInitialGameState(1));
  const lastFrameRef = useRef(Date.now());
  const [uiState, setUiState] = useState(() => snapshotGame(gameRef.current));
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    let rafId = 0;

    const frame = () => {
      const now = Date.now();
      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.033);
      lastFrameRef.current = now;

      const previous = snapshotGame(gameRef.current);
      stepGame(gameRef.current, dt);
      const next = snapshotGame(gameRef.current);

      const moved =
        previous.pacman.row !== next.pacman.row ||
        previous.pacman.col !== next.pacman.col ||
        previous.pacman.direction !== next.pacman.direction;

      const collected =
        previous.eatenPellets.size !== next.eatenPellets.size ||
        previous.foundCherries.size !== next.foundCherries.size;

      const ghostChanged = previous.ghosts.some((ghost, index) => {
        const nextGhost = next.ghosts[index];
        return ghost.row !== nextGhost.row || ghost.col !== nextGhost.col || ghost.direction !== nextGhost.direction;
      });

      const shouldRender =
        previous.score !== next.score ||
        previous.lives !== next.lives ||
        previous.status !== next.status ||
        previous.tick !== next.tick ||
        moved ||
        collected ||
        ghostChanged;

      if (shouldRender) {
        if (moved) {
          playSfx('move');
        }

        if (collected) {
          playSfx('eat');
        }

        if (previous.status !== next.status) {
          if (next.status === 'game-over') {
            playSfx('death');
          }

          if (next.status === 'won') {
            playSfx('win');
          }
        }

        setUiState(next);
      }

      rafId = getRaf()(frame);
    };

    rafId = getRaf()(frame);

    return () => cancelRaf(rafId);
  }, []);

  const boardSize = Math.min(windowWidth - 32, 380);
  const tileSize = boardSize / gameRef.current.rows[0].length;

  const handleDirection = (direction: Direction) => {
    requestDirection(gameRef.current, direction);
    setUiState(snapshotGame(gameRef.current));
  };

  const handleRestart = () => {
    lastFrameRef.current = Date.now();
    gameRef.current = resetGameState(1);
    setUiState(snapshotGame(gameRef.current));
  };

  const statusText =
    uiState.status === 'won'
      ? 'You cleared the maze!'
      : uiState.status === 'game-over'
        ? 'Game over — tap restart to try again.'
        : `Level ${uiState.level} • Tap the D-pad to move`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.headerCard}>
          <ThemedText type="subtitle">Pac-Man Arcade</ThemedText>
          <ThemedText type="small">{statusText}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.scoreCard}>
          <View style={styles.statRow}>
            <ThemedText type="smallBold">Score</ThemedText>
            <ThemedText type="smallBold">{uiState.score}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="smallBold">Cherries</ThemedText>
            <ThemedText type="smallBold">{uiState.foundCherries.size}/4</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="smallBold">Lives</ThemedText>
            <ThemedText type="smallBold">{uiState.lives}</ThemedText>
          </View>
        </ThemedView>

        <GameBoard
          tileSize={tileSize}
          pacman={uiState.pacman}
          ghosts={uiState.ghosts}
          eatenPellets={uiState.eatenPellets}
          foundCherries={uiState.foundCherries}
          rows={gameRef.current.rows}
        />

        <ThemedView style={styles.controlsCard}>
          <ThemedText type="smallBold">Controls</ThemedText>
          <View style={styles.directionRow}>
            {CONTROL_ORDER.map((direction) => (
              <Pressable
                key={direction}
                onPress={() => handleDirection(direction)}
                style={({ pressed }) => [styles.controlButton, pressed && styles.controlButtonPressed]}
              >
                <ThemedText type="smallBold">{DIRECTION_LABELS[direction]}</ThemedText>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={handleRestart}
            style={({ pressed }) => [styles.restartButton, pressed && styles.controlButtonPressed]}
          >
            <ThemedText type="smallBold">Restart</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  headerCard: {
    borderRadius: 24,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  scoreCard: {
    borderRadius: 24,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlsCard: {
    borderRadius: 24,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  directionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    padding: Spacing.two,
    borderRadius: 999,
    minWidth: 56,
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
  },
  controlButtonPressed: {
    opacity: 0.7,
  },
  restartButton: {
    paddingVertical: Spacing.two,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#fde68a',
  },
});
