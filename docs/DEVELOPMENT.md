# Development Guide

## Project Setup

This project is set up with Expo, which simplifies React Native development.

### Development Environment

- **Framework**: React Native with Expo SDK 56
- **Node.js**: v14 or higher
- **Package Manager**: npm

## Code Organization

### `/src/components`
Reusable UI and game components that are used across multiple screens.

Example components to build:
- GameBoard
- PacMan
- Ghost
- Pellet
- ScoreDisplay

### `/src/screens`
Full-screen views for different game states.

Example screens:
- HomeScreen (main menu)
- GameScreen (active gameplay)
- GameOverScreen
- HighScoresScreen
- SettingsScreen

### `/src/utils`
Helper functions and game logic utilities.

Example utilities:
- gameEngine.js (game loop, collision detection)
- pathfinding.js (ghost AI algorithms)
- constants.js (game constants and configuration)

### `/src/assets`
Static assets including images and audio files.

- **images/**: Sprites for Pac-Man, ghosts, pellets, etc.
- **sounds/**: Game audio files for effects and background music

### `/src/config`
Configuration files for the application.

- theme.js (colors, fonts, styling)
- constants.js (game configuration values)

## Development Workflow

1. Create a feature branch for your work
2. Build components and screens in `/src`
3. Test functionality using Expo Go or web preview
4. Commit changes regularly
5. Push to repository

## Testing

Place test files in the `/tests` directory following the same structure as `/src`.

## Building and Deployment

Refer to the main README.md for build and deployment instructions.
