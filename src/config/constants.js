// Game Configuration Constants

export const GAME_CONFIG = {
  // Board dimensions
  BOARD_WIDTH: 19,
  BOARD_HEIGHT: 21,
  CELL_SIZE: 20,
  
  // Game speeds (ms)
  PACMAN_SPEED: 150,
  GHOST_SPEED: 180,
  GAME_TICK: 100,
  
  // Scoring
  PELLET_POINTS: 10,
  POWER_PELLET_POINTS: 50,
  GHOST_POINTS: [200, 400, 800, 1600],
  
  // Ghosts
  GHOST_NAMES: ['Blinky', 'Pinky', 'Inky', 'Clyde'],
  GHOST_COLORS: ['#FF0000', '#FFB8D4', '#00FFFF', '#FFB847'],
};

export const DIRECTIONS = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  NONE: 'NONE',
};

export const GAME_STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
};
