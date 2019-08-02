const app = {}

const gameWidth = 800;
const gameHeight = 600;
const playerWidth = 20;

app.playerSpeed = 500;

app.laserSpeed = 300;
app.laserCoolDown = 0.5;

app.keyCodes = {
    left: 37,
    right: 39,
    spaceBar: 32
}

app.enemies = {
    perRow: 10,
    margin: 80, 
    padding: 80
}

app.state = {
    lastTime: Date.now(),
    playerX:0,
    playerY:0,
    playerCoolDown:0,
    isLeftKeyDown: false,
    isRightKeyDown: false,
    isSpaceKeyDown: false,
    lasers:[],
    enemies: []
}


app.setPosition = (element, positionX, positionY) => {
    element.style.transform = `translate(${positionX}px, ${positionY}px)`
}

// keeps player on game board
app.clamp = (value, min, max) => {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
}

app.createPlayer = () => {
    const gameArea = document.querySelector('.game-area');

    // initial position of player
    app.state.playerX = gameWidth / 2
    app.state.playerY = gameHeight - 50

    const player = document.createElement('div')
    player.className = 'player'
    gameArea.appendChild(player)
    app.setPosition(player, app.state.playerX, app.state.playerY)
}

app.shootLaser = (element, positionX, positionY) => {
    const newLaser = document.createElement('div');
    newLaser.className = 'laser'
    element.appendChild(newLaser)
    const laser = {positionX, positionY, newLaser};
    app.state.lasers.push(laser)
    app.setPosition(newLaser, positionX, positionY)
}

app.isKeyDown = (e) => {
    if (e.keyCode === app.keyCodes.left) {
        app.state.isLeftKeyDown = true
    } else if (e.keyCode === app.keyCodes.right) {
        app.state.isRightKeyDown = true
    } else if (e.keyCode === app.keyCodes.spaceBar){
        app.state.isSpaceKeyDown = true
    }
}

app.isKeyUp = (e) => {
    if (e.keyCode === app.keyCodes.left) {
        app.state.isLeftKeyDown = false
    } else if (e.keyCode === app.keyCodes.right) {
        app.state.isRightKeyDown = false
    } else if (e.keyCode === app.keyCodes.spaceBar) {
        app.state.isSpaceKeyDown = false
    }
}

app.movePlayer = (deltaTime,element) => {
    if (app.state.isLeftKeyDown) {
        app.state.playerX -= deltaTime * app.playerSpeed
    } else if (app.state.isRightKeyDown) {
        app.state.playerX += deltaTime * app.playerSpeed
    } 

    const player = document.querySelector('.player')
    app.setPosition(player, app.state.playerX, app.state.playerY)

    app.state.playerX = app.clamp(app.state.playerX, playerWidth, gameWidth - playerWidth)

    if (app.state.isSpaceKeyDown && app.state.playerCoolDown <= 0) {
        app.shootLaser(element, app.state.playerX, app.state.playerY)
        app.state.playerCoolDown = app.laserCoolDown
    }

    if (app.state.playerCoolDown > 0) {
        app.state.playerCoolDown -= deltaTime
    }
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
    }
}

app.update = () => {
    const element = document.querySelector('.game-area')

    const currentTime = Date.now();

    const deltaTime = (currentTime - app.state.lastTime) / 1000


    app.movePlayer(deltaTime, element)

    app.state.lastTime = currentTime;

    window.requestAnimationFrame(app.update)

    // lasers
    app.moveLasers(deltaTime,element)


}

app.createEnemies = (element, positionX, positionY) => {
    const container = document.createElement('div');
    container.className = 'enemy'
    element.appendChild(container)

    const enemy = {
        positionX,
        positionY,
        element
    }

    console.log(enemy)

    app.state.enemies.push(enemy)

    app.setPosition(container, positionX, positionY)
    
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




app.init = function () {
    app.createPlayer()
    app.setEnemies()
}

app.init()

window.addEventListener("keydown", app.isKeyDown)
window.addEventListener("keyup", app.isKeyUp)
window.requestAnimationFrame(app.update)