const app = {}

const gameWidth = 700;
const gameHeight = 600;
const playerWidth = 80;

app.playerSpeed = 500;
app.laserSpeed = 300;
app.laserCoolDown = 0.3;

app.keyCodes = {
    left: 37,
    right: 39,
    spaceBar: 32
}

app.enemies = {
    perRow: 8,  
    margin: 20, 
    padding: 100
}

app.state = {
    startGame: undefined,
    lastTime: Date.now(),
    playerX:0,
    playerY:0,
    playerCoolDown:0,
    isLeftKeyDown: false,
    isRightKeyDown: false,
    isSpaceKeyDown: false,
    lasers:[],
    enemies: [],
    newEnemies: [],
    score: 0,
    timer: 30
}

app.setPosition = (element, positionX, positionY) => {
    element.style.transform = `translate(${positionX}px, ${positionY}px)`
}

app.collisionDetection = (rect1, rect2) => {
    return !(
        rect2.left > rect1.right ||
        rect2.right < rect1.left ||
        rect2.top > rect1.bottom ||
        rect2.bottom < rect1.top
    )
}

app.clamp = (value, min, max) => {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
}

app.printScore = () => {
    const element = document.getElementById('score')
    element.innerHTML = `Score: ${app.state.score}`;
}

app.start = () => {
    if (app.state.startGame === true) {
        event.preventDefault();
        app.timer()
        app.removeInstructions()
    }
}

app.createInstructions = () => {
    const gameArea = document.querySelector('.game-area');
    const startGame = document.createElement('div')
    startGame.innerHTML = "Click space bar to begin";
    startGame.className = 'start-game'
    gameArea.appendChild(startGame)
}

app.removeInstructions = () => {
    const gameArea = document.querySelector('.game-area');
    const instructions = document.querySelector('.start-game');
    gameArea.removeChild(instructions)
}

app.timer = () => {
    let timeRemaining = app.state.timer;
    const countdownContainer = document.getElementById('countdown');

    setInterval(() => {
        if (timeRemaining === 0 && app.state.startGame === true) {
            app.state.startGame = false
            countdownContainer.innerHTML = `TIMES UP!`
            app.results()
        } else {
            countdownContainer.innerHTML = `Time: ${timeRemaining}`
            timeRemaining--;
        }
    }, 1000);

}

app.results = () => {
    const header = document.querySelector('header');
    const resultsContainer = document.createElement('div')

    resultsContainer.innerHTML = `
        <h2>Nice!</h2>
        <p>You shot down ${app.state.score} alien spacecrafts!</p>
        <button id='restart-button' onclick="app.restart()">Play Again?</button>`;

    resultsContainer.className = 'results'

    header.appendChild(resultsContainer)

}

app.restart = () => {
    location.reload(true)
}

// Player Controls
app.createPlayer = () => {
    const gameArea = document.querySelector('.game-area');

    // initial position of player
    app.state.playerX = gameWidth / 2
    app.state.playerY = gameHeight - 20

    const player = document.createElement('div')
    player.className = 'player'
    gameArea.appendChild(player)
    app.setPosition(player, app.state.playerX, app.state.playerY)
}

app.movePlayer = (deltaTime, element) => {
    if (app.state.isLeftKeyDown) {
        app.state.playerX -= deltaTime * app.playerSpeed
    } else if (app.state.isRightKeyDown) {
        app.state.playerX += deltaTime * app.playerSpeed
    }

    const player = document.querySelector('.player')
    app.setPosition(player, app.state.playerX, app.state.playerY)

    app.state.playerX = app.clamp(app.state.playerX, playerWidth, gameWidth - playerWidth)

    if (app.state.isSpaceKeyDown && app.state.playerCoolDown <= 0 && app.state.startGame) {
        app.shootLaser(element, app.state.playerX, app.state.playerY)
        app.state.playerCoolDown = app.laserCoolDown
    }

    if (app.state.playerCoolDown > 0) {
        app.state.playerCoolDown -= deltaTime
    }
}

app.isKeyDown = (e) => {
    if (e.keyCode === app.keyCodes.left) {
        app.state.isLeftKeyDown = true
    } else if (e.keyCode === app.keyCodes.right) {
        app.state.isRightKeyDown = true
    } else if (e.keyCode === app.keyCodes.spaceBar) {
        e.preventDefault()
        app.state.isSpaceKeyDown = true
    }

    if (e.keyCode === app.keyCodes.spaceBar && app.state.startGame === undefined) {
        app.state.startGame = true
        app.start()
    }
}

app.isKeyUp = (e) => {
    if (e.keyCode === app.keyCodes.left) {
        app.state.isLeftKeyDown = false
    } else if (e.keyCode === app.keyCodes.right) {
        app.state.isRightKeyDown = false
    } else if (e.keyCode === app.keyCodes.spaceBar) {
        e.preventDefault()
        app.state.isSpaceKeyDown = false
    }


}

// Lasers
app.shootLaser = (element, positionX, positionY) => {
    const newLaser = document.createElement('div');
    const currentLasers = app.state.lasers
    newLaser.className = 'laser'
    element.appendChild(newLaser)
    const laser = {positionX, positionY, newLaser};
    currentLasers.push(laser)
    app.setPosition(newLaser, positionX, positionY)
}

app.moveLasers = (deltaTime, element) => { 
    const lasers = app.state.lasers

    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];

        laser.positionY -= deltaTime * app.laserSpeed;
        
        if (laser.positionY < 0) {
            element.removeChild(laser.newLaser)
            laser.isDead = true
            app.state.lasers = lasers.filter(laser => !laser.isDead)
        }

        app.setPosition(laser.newLaser, laser.positionX, laser.positionY)


        const rect1 = laser.newLaser.getBoundingClientRect();

        const enemies = app.state.enemies;
        

        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];

            // if (enemy.isDead) continue;
            
            const rect2 = enemy.container.getBoundingClientRect();

            if (app.collisionDetection(rect1, rect2)) {
                app.state.score = app.state.score + 1
                app.printScore()
                app.addEnemies()

                // Enemy was hit

                element.removeChild(laser.newLaser)
                laser.isDead = true
                app.state.lasers = lasers.filter(laser => !laser.isDead)
                app.state.newEnemies.push(enemy)


                element.removeChild(enemy.container)
                enemy.isDead = true
                app.state.enemies = enemies.filter(enemy => !enemy.isDead)

                break;
            }    
        }
    }
}

// Enemies 
app.moveEnemies = (deltaTime, element) => {
    // move enemies in a circle 
    const deltaX = Math.sin(app.state.lastTime / 1000.0) * 50;
    const deltaY = Math.cos(app.state.lastTime / 1000.0) * 10;

    const enemies = app.state.enemies

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i]
        const x = enemy.positionX + deltaX
        const y = enemy.positionY + deltaY
        
        app.setPosition(enemy.container, x, y)
    }
}

app.createEnemies = (element, positionX, positionY) => {
    const container = document.createElement('div');
    container.className = 'enemy'
    element.appendChild(container)

    const enemy = {
        positionX,
        positionY,
        container
    }

    app.state.enemies.push(enemy)

    app.setPosition(container, positionX, positionY)
}

app.addEnemies = () => {
    const element = document.querySelector('.game-area')
    const newTargets = app.state.newEnemies 

    if (app.state.newEnemies.length > 10) {
        console.log('cool')

        for (let i = 0; i < newTargets.length; i++) {
            let newEnemy = newTargets[i]
            app.createEnemies(element, newEnemy.positionX, newEnemy.positionY)
        }

        app.state.newEnemies = []
    }
}

app.setEnemies = () => {
    const gameArea = document.querySelector(".game-area");
    const perRow = app.enemies.perRow
    const margin = app.enemies.margin
    const padding = app.enemies.padding
    const spacing = (gameWidth - margin * 2 ) / (perRow - 1)

    for (let j = 0; j<3; j++) {
        const positionY = padding + j * padding
        for (let i =0; i < perRow; i++) {
            const positionX = i * spacing + margin
            app.createEnemies(gameArea, positionX, positionY)
        }
    }
}

app.update = () => {
    const element = document.querySelector('.game-area')
    const currentTime = Date.now();
    const deltaTime = (currentTime - app.state.lastTime) / 1000

    app.state.lastTime = currentTime;

    app.movePlayer(deltaTime, element)
    app.moveEnemies(deltaTime, element)
    app.moveLasers(deltaTime, element)

    window.requestAnimationFrame(app.update)
}

app.init = function () {
    app.createPlayer()
    app.setEnemies()
    app.createInstructions()
}

app.init()

window.addEventListener("keydown", app.isKeyDown) 
window.addEventListener("keyup", app.isKeyUp) 
window.requestAnimationFrame(app.update) 


// Credits 
// Gotta give credit to Frederik De Bleser's youtube tutorials on Creating Space Invaders in helping me learn to build my first game app while   my own functionality