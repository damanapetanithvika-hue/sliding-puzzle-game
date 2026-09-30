class SlidingPuzzle {
    constructor() {
        this.gridSize = 4;
        this.tiles = [];
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isGameWon = false;
        this.isSolving = false;

        this.gameBoard = document.getElementById('gameBoard');
        this.movesDisplay = document.getElementById('moves');
        this.timerDisplay = document.getElementById('timer');
        this.statusMessage = document.getElementById('status');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.solveBtn = document.getElementById('solveBtn');

        this.attachEventListeners();
        this.initGame();
    }

    attachEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.initGame());
        this.shuffleBtn.addEventListener('click', () => this.shuffle());
        this.solveBtn.addEventListener('click', () => this.solve());
    }

    initGame() {
        this.tiles = Array.from({ length: this.gridSize * this.gridSize }, (_, i) => i);
        this.moves = 0;
        this.isGameWon = false;
        this.isSolving = false;
        this.clearTimer();
        this.updateDisplay();
        this.shuffle();
        this.statusMessage.textContent = 'Game started! Shuffle and start sliding.';
        this.statusMessage.className = 'status-message info';
    }

    shuffle() {
        if (this.isGameWon || this.isSolving) return;

        for (let i = 0; i < 200; i++) {
            const emptyIndex = this.tiles.indexOf(0);
            const neighbors = this.getNeighbors(emptyIndex);
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            [this.tiles[emptyIndex], this.tiles[randomNeighbor]] = [
                this.tiles[randomNeighbor],
                this.tiles[emptyIndex]
            ];
        }

        this.render();
        this.moves = 0;
        this.updateDisplay();
    }

    getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / this.gridSize);
        const col = index % this.gridSize;

        if (row > 0) neighbors.push(index - this.gridSize); // Up
        if (row < this.gridSize - 1) neighbors.push(index + this.gridSize); // Down
        if (col > 0) neighbors.push(index - 1); // Left
        if (col < this.gridSize - 1) neighbors.push(index + 1); // Right

        return neighbors;
    }

    moveTile(index) {
        if (this.isGameWon || this.isSolving) return;

        const emptyIndex = this.tiles.indexOf(0);

        if (this.getNeighbors(emptyIndex).includes(index)) {
            [this.tiles[index], this.tiles[emptyIndex]] = [
                this.tiles[emptyIndex],
                this.tiles[index]
            ];
            this.moves++;

            if (!this.startTime) {
                this.startTime = Date.now();
                this.startTimer();
            }

            this.updateDisplay();
            this.render();

            if (this.checkWin()) {
                this.winGame();
            }
        }
    }

    checkWin() {
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== i + 1) return false;
        }
        return this.tiles[this.tiles.length - 1] === 0;
    }

    winGame() {
        this.isGameWon = true;
        this.clearTimer();
        this.statusMessage.textContent = `🎉 You won in ${this.moves} moves! Time: ${this.timerDisplay.textContent}`;
        this.statusMessage.className = 'status-message success';
        this.shuffleBtn.disabled = true;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateDisplay() {
        this.movesDisplay.textContent = this.moves;
    }

    render() {
        this.gameBoard.innerHTML = '';

        this.tiles.forEach((tile, index) => {
            const tileElement = document.createElement('button');
            tileElement.className = 'tile';

            if (tile === 0) {
                tileElement.classList.add('empty');
                tileElement.textContent = '';
            } else {
                tileElement.textContent = tile;
                tileElement.addEventListener('click', () => this.moveTile(index));
            }

            this.gameBoard.appendChild(tileElement);
        });
    }

    solve() {
        if (this.isGameWon) {
            this.statusMessage.textContent = 'Already solved!';
            this.statusMessage.className = 'status-message success';
            return;
        }

        this.isSolving = true;
        this.statusMessage.textContent = 'Solving puzzle...';
        this.statusMessage.className = 'status-message info';

        // Use IDA* algorithm to find solution
        const solution = this.idaStar();

        if (solution) {
            this.executeSolution(solution);
        } else {
            this.statusMessage.textContent = 'No solution found!';
            this.statusMessage.className = 'status-message error';
            this.isSolving = false;
        }
    }

    idaStar() {
        const goal = Array.from({ length: this.gridSize * this.gridSize }, (_, i) =>
            i === this.gridSize * this.gridSize - 1 ? 0 : i + 1
        );

        const goalString = goal.join(',');
        const initialString = this.tiles.join(',');

        if (initialString === goalString) return [];

        let threshold = this.heuristic(this.tiles, goal);
        let path = [];

        while (true) {
            const result = this.search(this.tiles.slice(), goal, 0, threshold, path, new Set([initialString]));

            if (Array.isArray(result)) return result;
            if (result === Infinity) return null;

            threshold = result;
        }
    }

    search(tiles, goal, g, threshold, path, visited) {
        const h = this.heuristic(tiles, goal);
        const f = g + h;

        if (f > threshold) return f;
        if (tiles.join(',') === goal.join(',')) return path;

        const emptyIndex = tiles.indexOf(0);
        const neighbors = this.getNeighbors(emptyIndex);

        for (const neighborIndex of neighbors) {
            [tiles[emptyIndex], tiles[neighborIndex]] = [tiles[neighborIndex], tiles[emptyIndex]];
            const tileString = tiles.join(',');

            if (!visited.has(tileString)) {
                visited.add(tileString);
                path.push(neighborIndex);

                const result = this.search(tiles.slice(), goal, g + 1, threshold, path, visited);
                if (Array.isArray(result)) return result;

                path.pop();
                visited.delete(tileString);
            }

            [tiles[emptyIndex], tiles[neighborIndex]] = [tiles[neighborIndex], tiles[emptyIndex]];
        }

        return Infinity;
    }

    heuristic(tiles, goal) {
        let distance = 0;
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i] !== 0) {
                const goalIndex = goal.indexOf(tiles[i]);
                const currentRow = Math.floor(i / this.gridSize);
                const currentCol = i % this.gridSize;
                const goalRow = Math.floor(goalIndex / this.gridSize);
                const goalCol = goalIndex % this.gridSize;
                distance += Math.abs(currentRow - goalRow) + Math.abs(currentCol - goalCol);
            }
        }
        return distance;
    }

    executeSolution(solution) {
        let stepIndex = 0;

        const executeStep = () => {
            if (stepIndex < solution.length && this.isSolving) {
                this.moveTile(solution[stepIndex]);
                stepIndex++;
                setTimeout(executeStep, 200);
            } else if (stepIndex === solution.length && this.isSolving) {
                this.isSolving = false;
            }
        };

        executeStep();
    }
}

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SlidingPuzzle();
});
