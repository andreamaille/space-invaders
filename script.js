const app = {}

app.game = {
    area: document.querySelector(".game-area"),
    width: 700,
    height: 600
}

app.keyCodes = {
    left: 37,
    right: 39,
    spaceBar: 32
}

app.player = {
    width: 80,
    speed: 500,
    delay: 0
}

app.laser = {
    speed: 300,
    delay: 0.3
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
    isLeftKeyDown: false,
    isRightKeyDown: false,
    isSpaceKeyDown: false,
    lasers:[],
    enemies: [],
    rebootEnemies: [],
    score: 0,
    timer: 20
}

app.start = () => {
    if (app.state.startGame) {
        app.timer()
        app.removeInstructions()
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

app.bind = (value, min, max) => {
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

app.createInstructions = () => {
    const playerInstructions = document.createElement('div')
    playerInstructions.innerHTML = "Click space bar to begin";
    playerInstructions.className = 'player-instructions'
    
    app.game.area.appendChild(playerInstructions)
}

app.removeInstructions = () => {
    const instructions = document.querySelector('.player-instructions');
    app.game.area.removeChild(instructions)
}

app.timer = () => {
    let timeRemaining = app.state.timer;
    
    const countdownContainer = document.getElementById('countdown');

    setInterval(() => {
        if (timeRemaining === 0 && app.state.startGame === true) {
            app.state.startGame = false
            countdownContainer.innerHTML = `TIMES UP!`
            app.resultsModule()
        } else {
            countdownContainer.innerHTML = `Time: ${timeRemaining}`
            timeRemaining--;
        }
    }, 1000);
}

app.resultsModule = () => {
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

app.createPlayer = () => {

    // initial position
    app.state.playerX = app.game.width / 2
    app.state.playerY = app.game.height - 30

    const playerContainer = document.createElement('div')
    playerContainer.className = 'player'
    app.game.area.appendChild(playerContainer)
    app.setPosition(playerContainer, app.state.playerX, app.state.playerY)
}

app.movePlayer = (delta, gameArea) => {
    const player = document.querySelector('.player')

    if (app.state.isLeftKeyDown) {
        app.state.playerX -= delta * app.player.speed
    } else if (app.state.isRightKeyDown) {
        app.state.playerX += delta * app.player.speed
    }

    app.state.playerX = app.bind(app.state.playerX, app.player.width, app.game.width - app.player.width)

    if (app.state.isSpaceKeyDown && app.player.delay <= 0 && app.state.startGame) {
        app.createLaser(gameArea, app.state.playerX, app.state.playerY)
        app.player.delay = app.laser.delay
    }

    if (app.player.delay > 0) {
        app.player.delay -= delta
    }

    app.setPosition(player, app.state.playerX, app.state.playerY)
}


// Lasers
app.createLaser = (gameArea, x, y) => {
    const container = document.createElement('div');

    container.className = 'laser'

    gameArea.appendChild(container)

    const laser = {
        x, 
        y, 
        container
    };

    app.state.lasers.push(laser)

    app.setPosition(container, x, y)
}

app.moveLasers = (delta, element) => { 
    app.state.lasers.map(laser => {
        const rect1 = laser.container.getBoundingClientRect();

        laser.y -= delta * app.laser.speed;

        if (laser.y < 0) {
            element.removeChild(laser.container)
            laser.isExpired = true
            app.state.lasers = app.state.lasers.filter(laser => !laser.isExpired)
        }

        app.setPosition(laser.container, laser.x, laser.y)

        app.state.enemies.map(enemy => {
            const rect2 = enemy.container.getBoundingClientRect();

            if (app.collisionDetection(rect1, rect2)) {
                app.state.score += 1
                
                element.removeChild(laser.container)
                laser.isExpired = true
                app.state.lasers = app.state.lasers.filter(laser => !laser.isExpired)
                app.state.rebootEnemies.push(enemy)

                element.removeChild(enemy.container)
                enemy.isExpired = true
                app.state.enemies = app.state.enemies.filter(enemy => !enemy.isExpired)
            }
        })
    })
}



app.moveEnemies = () => {
    const deltaX = Math.sin(app.state.lastTime / 1000.0) * 20;
    const deltaY = Math.cos(app.state.lastTime / 1000.0) * 50;



    app.state.enemies.map(enemy => {
        const x = enemy.x + deltaX
        const y = enemy.y + deltaY
        app.setPosition(enemy.container, x, y)
        
    })

}

app.setEnemies = () => {
    const spacing = (app.game.width - app.enemies.margin * 2) / (app.enemies.perRow - 1)

    for (let j = 0; j < 3; j++) {
        const y = app.enemies.padding + j * app.enemies.padding

        for (let i = 0; i < app.enemies.perRow; i++) {
            const x = i * spacing + app.enemies.margin
            app.createEnemies(app.game.area, x, y)
        }
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

app.rebootEnemies = () => {
    const newTargets = app.state.rebootEnemies 

    if (app.state.rebootEnemies.length > 10) {

        for (let i = 0; i < newTargets.length; i++) {
            let newEnemy = newTargets[i]
            app.createEnemies(app.game.area, newEnemy.x, newEnemy.y)
        }

        app.state.rebootEnemies = []
    }
}



app.update = () => {
    const currentTime = Date.now();

    const delta = (currentTime - app.state.lastTime) / 1000

    app.state.lastTime = currentTime;

    app.movePlayer(delta, app.game.area)

    
    app.rebootEnemies()
    app.printScore()

  
    app.moveEnemies()
    


    app.moveLasers(delta, app.game.area)
    
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





// Resources/Credits: 
// https://isaacsukin.com/news/2015/01 detailed-explanation-javascript-game-loops-and-timing#timing-problems
// Frederik De Bleser's youtube tutorials on Creating Space Invaders 
// Academy Space Invaders - https://github.com/keephopealive/academy-space-invaders