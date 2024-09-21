document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const gridSize = 20; // Rozmiar siatki
    const pacManSize = 20;
    const ghostSize = 20;
    const pacManSpeed = 200; // ms - prędkość gry
    const ghostSpeed = 500; // ms - prędkość duszków
    const eatDuration = 5000; // ms - czas działania bonusu zjedzenia duszków
    const respawnTime = 5000; // ms - czas, po którym duszki wracają

    // Mapy
    const map = [
        'WWWWWWWWWWWWWWWWWWWWWW',
        'W                    W',
        'W WW W W WWW WWW W W W',
        'W W  W W   W   W W W W',
        'W W  W W W W W W W W W',
        'W W  W W   W W W W W W',
        'W W  W W W W W W W W W',
        'W W  W W W W W W W W W',
        'W W  W W   W   W W W W',
        'W WW W W WWW WWW W W W',
        'W   F     F       F   W',
        'W WW WWWW W W WWWWW W W',
        'W     F       F       W',
        'W W W WWW WWW W WWW W W',
        'W W F   W   F W   F W W',
        'W W W W W W W W W W W W',
        'W W F W F W F W F W W W',
        'W W W W W W W W W W W W',
        'W F F F F F F F F F F W',
        'WWWWWWWWWWWWWWWWWWWWWW'
    ];

    // Pozycje graczy
    let pacMan = { x: 1, y: 1 };
    let ghosts = [{ x: 10, y: 5 }, { x: 15, y: 5 }];
    let direction = 'right';
    let isEaten = false;
    let eatenCount = 0;
    let gameInterval, ghostInterval;
    let isGameOver = false;
    let foodInterval;

    function getRandomPosition() {
        let x, y;
        do {
            x = Math.floor(Math.random() * map[0].length);
            y = Math.floor(Math.random() * map.length);
        } while (map[y][x] !== ' ' && map[y][x] !== 'F');
        return { x, y };
    }

    function drawMap() {
        gameArea.innerHTML = ''; // Czyści obszar gry

        // Rysowanie mapy
        map.forEach((row, rowIndex) => {
            row.split('').forEach((cell, cellIndex) => {
                let element;
                switch (cell) {
                    case 'W':
                        element = document.createElement('div');
                        element.className = 'wall';
                        element.style.left = `${cellIndex * gridSize}px`;
                        element.style.top = `${rowIndex * gridSize}px`;
                        gameArea.appendChild(element);
                        break;
                    case 'F':
                        element = document.createElement('div');
                        element.className = 'food';
                        element.style.left = `${cellIndex * gridSize + (gridSize - 10) / 2}px`; // Wyśrodkowanie jedzenia
                        element.style.top = `${rowIndex * gridSize + (gridSize - 10) / 2}px`;
                        gameArea.appendChild(element);
                        break;
                }
            });
        });

        // Rysowanie Pac-Mana
        const pacManElement = document.createElement('div');
        pacManElement.className = 'pacman';
        pacManElement.style.left = `${pacMan.x * gridSize}px`;
        pacManElement.style.top = `${pacMan.y * gridSize}px`;
        gameArea.appendChild(pacManElement);

        // Rysowanie duszków
        ghosts.forEach(ghost => {
            const ghostElement = document.createElement('div');
            ghostElement.className = 'ghost';
            ghostElement.style.left = `${ghost.x * gridSize}px`;
            ghostElement.style.top = `${ghost.y * gridSize}px`;
            gameArea.appendChild(ghostElement);
        });
    }

    function update() {
        if (isGameOver) return;

        switch (direction) {
            case 'up':
                pacMan.y -= 1;
                break;
            case 'down':
                pacMan.y += 1;
                break;
            case 'left':
                pacMan.x -= 1;
                break;
            case 'right':
                pacMan.x += 1;
                break;
        }

        // Zawijanie na krawędziach
        if (pacMan.x < 0) pacMan.x = map[0].length - 1;
        if (pacMan.x >= map[0].length) pacMan.x = 0;
        if (pacMan.y < 0) pacMan.y = map.length - 1;
        if (pacMan.y >= map.length) pacMan.y = 0;

        // Sprawdzenie kolizji ze ścianami
        if (map[pacMan.y][pacMan.x] === 'W') {
            // Jeśli koliduje ze ścianą, wróć do poprzedniej pozycji
            switch (direction) {
                case 'up':
                    pacMan.y += 1;
                    break;
                case 'down':
                    pacMan.y -= 1;
                    break;
                case 'left':
                    pacMan.x += 1;
                    break;
                case 'right':
                    pacMan.x -= 1;
                    break;
            }
        }

        // Sprawdzenie kolizji z jedzeniem
        if (map[pacMan.y][pacMan.x] === 'F') {
            eatenCount++;
            if (eatenCount === 3) {
                isEaten = true;
                setTimeout(() => isEaten = false, eatDuration);
            }
            map[pacMan.y] = map[pacMan.y].substring(0, pacMan.x) + ' ' + map[pacMan.y].substring(pacMan.x + 1);
            drawMap();
        }

        // Sprawdzenie kolizji z duszkami
        ghosts.forEach(ghost => {
            if (pacMan.x === ghost.x && pacMan.y === ghost.y) {
                if (isEaten) {
                    ghost.x = getRandomPosition().x;
                    ghost.y = getRandomPosition().y;
                } else {
                    gameOver();
                }
            }
        });

        drawMap();
    }

    function moveGhosts() {
        ghosts.forEach(ghost => {
            let move = Math.random() < 0.5 ? 'x' : 'y';
            let delta = Math.random() < 0.5 ? -1 : 1;

            if (move === 'x') {
                ghost.x += delta;
            } else {
                ghost.y += delta;
            }

            // Zawijanie na krawędziach
            if (ghost.x < 0) ghost.x = map[0].length - 1;
            if (ghost.x >= map[0].length) ghost.x = 0;
            if (ghost.y < 0) ghost.y = map.length - 1;
            if (ghost.y >= map.length) ghost.y = 0;

            // Sprawdzenie kolizji z ścianami
            if (map[ghost.y][ghost.x] === 'W') {
                ghost.x -= delta;
                ghost.y -= delta;
            }
        });

        drawMap();
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(gameInterval);
        clearInterval(ghostInterval);
        clearInterval(foodInterval);
        alert('Game Over! Press OK to restart.');
        resetGame();
    }

    function resetGame() {
        pacMan = { x: 1, y: 1 };
        ghosts = [{ x: 10, y: 5 }, { x: 15, y: 5 }];
        direction = 'right';
        isEaten = false;
        eatenCount = 0;
        isGameOver = false;
        drawMap();
        gameInterval = setInterval(update, pacManSpeed);
        ghostInterval = setInterval(moveGhosts, ghostSpeed);
        foodInterval = setInterval(respawnFood, 3000); // Jedzenie pojawia się co 3 sekundy
    }

    function respawnFood() {
        let foodPosition = getRandomPosition();
        map[foodPosition.y] = map[foodPosition.y].substring(0, foodPosition.x) + 'F' + map[foodPosition.y].substring(foodPosition.x + 1);
        drawMap();
    }

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'w':
                if (direction !== 'down') direction = 'up';
                break;
            case 's':
                if (direction !== 'up') direction = 'down';
                break;
            case 'a':
                if (direction !== 'right') direction = 'left';
                break;
            case 'd':
                if (direction !== 'left') direction = 'right';
                break;
        }
    });

    // Rozpoczęcie gry
    gameInterval = setInterval(update, pacManSpeed);
    ghostInterval = setInterval(moveGhosts, ghostSpeed);
    foodInterval = setInterval(respawnFood, 3000); // Jedzenie pojawia się co 3 sekundy
});
