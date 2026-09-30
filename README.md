# Sliding Puzzle Game

A fun and interactive sliding puzzle game built with vanilla JavaScript, HTML, and CSS.

## Features

🎮 **Core Gameplay**
- Classic 4x4 sliding puzzle mechanics
- Smooth tile animations and interactions
- Move counter and timer to track your performance

🎯 **Game Controls**
- **New Game** - Start a fresh game
- **Shuffle** - Randomly shuffle the tiles
- **Solve** - Automatic solver using IDA* algorithm

⚡ **Smart Solving**
- Implements the IDA* (Iterative Deepening A*) algorithm
- Manhattan distance heuristic for optimal pathfinding
- Watches the puzzle solve itself in real-time

📊 **Statistics**
- Real-time move counter
- Timer to track completion time
- Victory message with final stats

## How to Play

1. Click **Shuffle** to randomize the puzzle
2. Click on any tile adjacent to the empty space to move it
3. Arrange the numbers in order from 1 to 15
4. Leave the empty space in the bottom-right corner
5. Beat your personal record!

## Game Features

- **Responsive Design** - Works on desktop and mobile devices
- **Smooth Animations** - Polished UI with hover and click effects
- **Auto-Solve** - Watch the AI solve the puzzle using advanced algorithms
- **Win Detection** - Automatic detection when you've solved the puzzle

## Technologies Used

- **HTML5** - Game structure
- **CSS3** - Styling and animations
- **Vanilla JavaScript** - Game logic and algorithms
- **IDA* Algorithm** - Optimal puzzle solving

## How to Run

1. Clone the repository
2. Open `index.html` in your web browser
3. Start playing!

## Game Rules

- Click tiles adjacent to the empty space to slide them
- The goal is to arrange numbers 1-15 in order
- The empty space must end in the bottom-right corner
- Try to solve it in as few moves as possible!

## Algorithm Details

The **Solve** button uses the IDA* (Iterative Deepening A*) algorithm:
- Combines the benefits of depth-first and breadth-first search
- Uses Manhattan distance as a heuristic
- Memory efficient and finds optimal solutions
- Gradually increases depth threshold until solution is found

## Project Structure

```
sliding-puzzle-game/
├── index.html      # HTML structure
├── styles.css      # Styling and animations
├── game.js         # Game logic and algorithms
└── README.md       # This file
```

## Future Enhancements

- [ ] Different puzzle sizes (3x3, 5x5)
- [ ] Difficulty levels
- [ ] Leaderboard with local storage
- [ ] Image-based puzzles
- [ ] Sound effects and haptic feedback
- [ ] Hint system
- [ ] Undo/Redo functionality

## License

This project is open source and available under the MIT License.

---

Enjoy solving puzzles! 🧩
