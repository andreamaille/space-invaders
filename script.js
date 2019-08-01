const app = {}

const gameWidth = 800;
const gameHeight = 600;
const playerWidth = 20;

const keyCodes = {
    left: 37,
    right: 39,
    spaceBar: 32
}

const state = {
    playerX:0,
    playerY:0,
    isLeftKeyDown: false,
    isRightKeyDown: false,
    isSpaceKeyDown: false
}


function setPosition (element, positionX, positionY) {
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
    state.playerX = gameWidth / 2
    state.playerY = gameHeight - 50

    const player = document.createElement('div')
    player.className = 'player'
    gameArea.appendChild(player)
    setPosition(player, state.playerX, state.playerY)
}


app.isKeyDown = (e) => {
    if (e.keyCode === keyCodes.left) {
        state.isLeftKeyDown = true
    } else if (e.keyCode === keyCodes.right) {
        state.isRightKeyDown = true
    } else if (e.keyCode === keyCodes.spaceBar){
        state.isSpaceKeyDown = true
    }
}

app.isKeyUp = (e) => {
    if (e.keyCode === keyCodes.left) {
        state.isLeftKeyDown = false
    } else if (e.keyCode === keyCodes.right) {
        state.isRightKeyDown = false
    } else if (e.keyCode === keyCodes.spaceBar) {
        state.isSpaceKeyDown = false
    }
}

app.movePlayer = () => {
    if (state.isLeftKeyDown) {
        state.playerX -= 5
    } else if (state.isRightKeyDown) {
        state.playerX += 5
    } 

    const player = document.querySelector('.player')
    setPosition(player, state.playerX, state.playerY)

    state.playerX = app.clamp(state.playerX, playerWidth, gameWidth - playerWidth)
}

app.update = () => {
    app.movePlayer()
    window.requestAnimationFrame(app.update)
}

app.init = function () {
    app.createPlayer()
}

app.init()
window.addEventListener("keydown", app.isKeyDown)
window.addEventListener("keyup", app.isKeyUp)
window.requestAnimationFrame(app.update)