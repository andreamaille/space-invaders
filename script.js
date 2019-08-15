const app = {}

app.gameWidth = 700;
app.gameHeight = 600;

app.playerWidth = 80;
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
    timer: 20
}

app.setPosition = (element, x, y) => {
    element.style.transform = `translate(${x}px, ${y}px)`
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
    if (app.state.startGame) {
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
    app.state.playerX = app.gameWidth / 2
    app.state.playerY = app.gameHeight - 20

    const player = document.createElement('div')
    player.className = 'player'
    gameArea.appendChild(player)
    app.setPosition(player, app.state.playerX, app.state.playerY)
}

app.movePlayer = (delta, element) => {
    if (app.state.isLeftKeyDown) {
        app.state.playerX -= delta * app.playerSpeed
    } else if (app.state.isRightKeyDown) {
        app.state.playerX += delta * app.playerSpeed
    }

    const player = document.querySelector('.player')
    app.setPosition(player, app.state.playerX, app.state.playerY)

    app.state.playerX = app.clamp(app.state.playerX, app.playerWidth, app.gameWidth - app.playerWidth)

    if (app.state.isSpaceKeyDown && app.state.playerCoolDown <= 0 && app.state.startGame) {
        app.createLaser(element, app.state.playerX, app.state.playerY)
        app.state.playerCoolDown = app.laserCoolDown
    }

    if (app.state.playerCoolDown > 0) {
        app.state.playerCoolDown -= delta
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
app.createLaser = (element, x, y) => {
    const newLaser = document.createElement('div');
    const currentLasers = app.state.lasers
    newLaser.className = 'laser'

    element.appendChild(newLaser)

    const laser = {
        x, 
        y, 
        newLaser
    };

    currentLasers.push(laser)

    app.setPosition(newLaser, x, y)
}

app.moveLasers = (delta, element) => { 
    const lasers = app.state.lasers

    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];

        laser.y -= delta * app.laserSpeed;
        
        if (laser.y < 0) {
            element.removeChild(laser.newLaser)
            laser.isDead = true
            app.state.lasers = lasers.filter(laser => !laser.isDead)
        }

        app.setPosition(laser.newLaser, laser.x, laser.y)


        const rect1 = laser.newLaser.getBoundingClientRect();

        const enemies = app.state.enemies;
        
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];

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
app.moveEnemies = () => {
    const deltaX = Math.sin(app.state.lastTime / 1000.0) * 70;
    
    const deltaY = Math.cos(app.state.lastTime / 1000.0) * 20;

    const enemies = app.state.enemies

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i]
        const x = enemy.x + deltaX
        const y = enemy.y + deltaY
        
        app.setPosition(enemy.container, x, y)
    }
}

app.createEnemies = (element, x, y) => {
    const container = document.createElement('div');
    container.className = 'enemy'
    element.appendChild(container)

    const enemy = {
        x,
        y,
        container
    }

    app.state.enemies.push(enemy)

    app.setPosition(container, x, y)
}

app.addEnemies = () => {
    const element = document.querySelector('.game-area')
    const newTargets = app.state.newEnemies 

    if (app.state.newEnemies.length > 10) {
        console.log('cool')

        for (let i = 0; i < newTargets.length; i++) {
            let newEnemy = newTargets[i]
            app.createEnemies(element, newEnemy.x, newEnemy.y)
        }

        app.state.newEnemies = []
    }
}

app.setEnemies = () => {
    const gameArea = document.querySelector(".game-area");
    const perRow = app.enemies.perRow
    const margin = app.enemies.margin
    const padding = app.enemies.padding
    const spacing = (app.gameWidth - margin * 2 ) / (perRow - 1)

    for (let j = 0; j<3; j++) {
        const y = padding + j * padding
        for (let i =0; i < perRow; i++) {
            const x = i * spacing + margin
            app.createEnemies(gameArea, x, y)
        }
    }
    
}

app.update = () => {
    const element = document.querySelector('.game-area')

    const currentTime = Date.now();

    const delta = (currentTime - app.state.lastTime) / 1000

    app.state.lastTime = currentTime;

    app.movePlayer(delta, element)

    app.moveEnemies()

    app.moveLasers(delta, element)
    
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
// https://isaacsukin.com/news/2015/01 detailed-explanation-javascript-game-loops-and-timing#timing-problems
// Frederik De Bleser's youtube tutorials on Creating Space Invaders 
// Academy Space Invaders - https://github.com/keephopealive/academy-space-invaders