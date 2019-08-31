const app = {}

app.firebaseConfig = {
    apiKey: "AIzaSyBAv24JoMcciV5kqz_XL5Gim14jRSL__hw",
    authDomain: "space-attack-de8e9.firebaseapp.com",
    databaseURL: "https://space-attack-de8e9.firebaseio.com",
    projectId: "space-attack-de8e9",
    storageBucket: "",
    messagingSenderId: "968811862965",
    appId: "1:968811862965:web:728b3574c0fd7aee"
};

firebase.initializeApp(app.firebaseConfig);

app.game = {
    area: document.querySelector(".game-area"),
    width: 600,
    height: 600,
    screen: window.matchMedia("(max-width: 800px)")
}

app.keyCodes = {
    left: 37,
    right: 39,
    spaceBar: 32
}

app.player = {
    width: 10,
    speed: 500,
    delay: 0.3
}

app.laser = {
    speed: 300,
    delay: 0.3
}

app.state = {
    startGame: undefined,
    lastTime: Date.now(),
    playerX: 0,
    playerY: 0,
    isLeftKeyDown: false,
    isRightKeyDown: false,
    isSpaceKeyDown: false,
    lasers: [],
    enemies: [],
    rebootEnemies: [],
    score: 0,
    timer: 20,
    userName: '',
    highScores: [],
    screenControls: false,
    peaceMode: false
}

app.start = () => {
    if (app.state.startGame) {
        app.timer()
        app.removeInstructions()
    }
}

app.createGrid = () => {
    for (let row = 1; row <= 3; row++) {
        const y = row * 90
        for (let column = 0; column < 8; column++) {
            const x = column * 90
            app.createEnemies(app.game.area, x, y)
        }
    }
}

app.isKeyDown = (e) => {
    if (e.keyCode === app.keyCodes.left) {
        app.state.isLeftKeyDown = true
    } 
    
    if (e.keyCode === app.keyCodes.right) {
        app.state.isRightKeyDown = true
    } 
    
    if (e.keyCode === app.keyCodes.spaceBar) {
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
    } 

    if (e.keyCode === app.keyCodes.right) {
        app.state.isRightKeyDown = false
    }

    if (e.keyCode === app.keyCodes.spaceBar) {
        e.preventDefault()
        app.state.isSpaceKeyDown = false
    }
}

app.setPosition = (element, x, y) => {
    element.style.transform = `translate(${x}px, ${y}px)`
}

app.collisionDetection = (rect1, rect2) => {
    return !(rect2.left > rect1.right ||
        rect2.right < rect1.left ||
        rect2.top > rect1.bottom ||
        rect2.bottom < rect1.top) 
        
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
    playerInstructions.innerHTML = "Hit space bar to begin";
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

    const countdownTimer = setInterval(() => {
        countdownContainer.innerHTML = `Time: ${timeRemaining}`
        timeRemaining -= 1

        if (timeRemaining <= 0 && app.state.startGame === true) {
            app.state.startGame = false
            clearInterval(countdownTimer)
            countdownContainer.innerHTML = `TIMES UP!`
            app.resultsModule()
            
        } 
    }, 1000);
}

app.resultsModule = () => {
    const header = document.querySelector('header');

    const module = document.createElement('div')
    module.className = 'module'

    const highScoresContainer = document.createElement('div')
    highScoresContainer.className = 'highScores'

    const resultsContainer = document.createElement('div')
    resultsContainer.className = 'results'

    resultsContainer.innerHTML = `
        <h2>Nice!</h2>
        <p>You hit ${app.state.score} alien spacecrafts!</p>
        <form action="" class="form">
            <legend>Submit your score!</legend>
            <label for="userName" class="visuallyHidden">Name</label>
            <input type="text" name="userName" placeholder="Name" id="userName" maxlength="10" required>
            <input type="submit" id='restart-button' value="Submit">
        </form>
        <button id='restart-button' onclick="app.restart()">Play Again?</button>
        `;

    let currentScores = []

    app.state.highScores.map(users => {
        return users.map(user => {
            const userDetails = `<li>${user.name} - ${user.score} Hits </li>`
            currentScores.push(userDetails)
        })
    })

    highScoresContainer.innerHTML = 
        `<h2>High Scores</h2>
        <div class="leader-boards">
            <ol>` + currentScores.join(" ") + `</ol>
        </div>
        `

    module.appendChild(highScoresContainer)
    module.appendChild(resultsContainer)
    header.appendChild(module)

    app.submitForm()
}

app.displayHighScores = () => {
    const header = document.querySelector('header');

    const highScoresContainer = document.createElement('div')
    highScoresContainer.className = 'high-scores-module'

    let currentScores = []

    app.state.highScores.map(users => {
        return users.map(user => {
            const userDetails = `<li>${user.name} - ${user.score} Hits </li>`
            currentScores.push(userDetails)
        })
    })

    highScoresContainer.innerHTML =
        `<span onclick="app.closeModule()">˟</span>
        <h2>High Scores</h2 >
        <div class="leader-boards">
            <ol>` + currentScores.join(" ") + `</ol>
        </div>`

    header.appendChild(highScoresContainer)

}

app.closeModule = () => {
    const header = document.querySelector('header');  
    const module = document.querySelector('.high-scores-module');
    header.removeChild(module)
}

app.restart = () => {
    location.reload(true)
}

app.submitForm = (e) => {
    const resultsContainer = document.querySelector('.results')
    const form = document.querySelector('.form')

    form.addEventListener('submit', function (e) {
        e.preventDefault()
        const userInput = document.getElementById('userName').value

        const userResults = {
            name: userInput,
            score: app.state.score
        }

        dbRef.push(userResults);

        resultsContainer.innerHTML = `
        <h2>Nice!</h2>
        <p>You shot down ${app.state.score} alien spacecrafts!</p>
        <form action="" class="form">
            <p>Thank you! You're score has been added!</p>
            <button id='restart-button' onclick="app.restart()">Play Again?</button>
        </form>`;
    })

}

app.getHighScores = () => {
    const dbRef = firebase.database().ref()

    dbRef.on('value', (response) => {
        const data = response.val()

        let highScores = []

        for (let key in data) {
            highScores.push({
                name: data[key].name,
                score: data[key].score
            })
        }

        highScores.sort(function (a, b) {
            if (a.score > b.score) {
                return -1;;
            } else if (b.score > a.score) {
                return 1;;
            } else {
                return 0;
            }
        });

        highScores = highScores.splice(0,10)

        app.state.highScores.push(highScores)

    })

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

app.createLaser = (gameArea, x, y) => {
    const container = document.createElement('div');

    if (app.state.peaceMode) {
        container.className = 'flower'
    } else {
        container.className = 'laser'
    }

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
    const lasers = app.state.lasers
    const enemies = app.state.enemies;

    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        const rect1 = laser.container.getBoundingClientRect();

        laser.y -= delta * app.laser.speed;

        if (laser.y < -10) {
            element.removeChild(laser.container)
            laser.isExpired = true
            app.state.lasers = lasers.filter(laser => !laser.isExpired)
        }

        app.setPosition(laser.container, laser.x, laser.y)

        for (let a = 0; a < enemies.length; a++) {
            const enemy = enemies[a];

            if (enemy.isExpired) continue;

            const rect2 = enemy.container.getBoundingClientRect();

            if (app.collisionDetection(rect1, rect2) || enemy.isExpired) {
                app.state.score = app.state.score + 1

                element.removeChild(laser.container)
                laser.isExpired = true
                app.state.lasers = lasers.filter(laser => !laser.isExpired)

                element.removeChild(enemy.container)
                enemy.isExpired = true
                app.state.enemies = enemies.filter(enemy => !enemy.isExpired)

                app.state.rebootEnemies.push(enemy)

                app.printScore()
                app.rebootEnemies()

                break;
            }
        }
    }
}

app.moveEnemies = () => {
    const updateX = Math.sin(app.state.lastTime / 1000.0) * app.game.width / 10;
    const updateY = Math.cos(app.state.lastTime / 1000.0) * app.game.height / 8;

    app.state.enemies.forEach(enemy => {
        const x = enemy.x + updateX
        const y = enemy.y + updateY
        app.setPosition(enemy.container, x, y)
    })
}

app.createEnemies = (gameArea, x, y) => {
    const container = document.createElement('div');
    container.className = 'enemy'
    
    gameArea.appendChild(container)

    const enemy = {
        x,
        y,
        container
    }

    app.state.enemies.push(enemy)

    app.setPosition(container, x, y)
}

app.rebootEnemies = () => {
    if (app.state.rebootEnemies.length > 10) {
        app.state.rebootEnemies.forEach(reboot => {
            app.createEnemies(app.game.area, reboot.x, reboot.y)
        })

        app.state.rebootEnemies = []
    }
}

app.showControls = () => {
    const checkbox = document.getElementById("show-controls")

    if (checkbox.checked) {
        app.state.screenControls = true
        app.mediaQuery(app.game.screen)
    } 

    if (checkbox.checked === false) {
        app.state.screenControls = false

        const controls = document.querySelector('.controls');

        app.game.area.removeChild(controls)
    }
    
}

app.peaceMode = () => {
    const checkbox = document.getElementById("peace-mode")

    if (checkbox.checked) {
        app.state.peaceMode = true
    } else {
        app.state.peaceMode = false
    }
}

app.mediaQuery = (screen) => {
    if (screen.matches || app.state.screenControls) { 
        const controls = document.createElement('div')
        controls.className = 'controls'

        controls.innerHTML = `
        <button class='left' id='left'>⇦</button>
        <button class='space' id='space'>Shoot!</button>
        <button class='right' id='right'>⇨</button>
        `

        app.game.area.appendChild(controls)

        app.screenControls()
    } 

    if (screen.matches) {
        app.removeInstructions()
    }
}

app.screenControls = () => {
    const right = document.getElementById("right")
    right.addEventListener("click", () => {
        app.state.playerX += 30
    })

    const left = document.getElementById("left")
    left.addEventListener("click", () => {
        app.state.playerX -= 30
        app.state.playerX = app.bind(app.state.playerX, app.player.width / 2, app.game.width - app.player.width)
    })

    const space = document.getElementById("space")
    space.addEventListener("click", () => {
        app.state.startGame = true
        app.createLaser(app.game.area, app.state.playerX, app.state.playerY)
        app.player.delay = app.laser.delay
        app.start()
    }) 
}

app.update = () => {
    const currentTime = Date.now();

    const delta = (currentTime - app.state.lastTime) / 900

    app.state.lastTime = currentTime;

    app.movePlayer(delta, app.game.area)

    app.moveLasers(delta, app.game.area)

    app.moveEnemies()

    app.rebootEnemies()

    app.printScore()

    requestAnimationFrame(app.update)

}

app.init = function () {
    app.createPlayer()
    app.createGrid()
    app.createInstructions()
    app.getHighScores()
}

app.init()


app.mediaQuery(app.game.screen)
app.game.screen.addListener(app.mediaQuery)

window.addEventListener("keydown", app.isKeyDown)
window.addEventListener("keyup", app.isKeyUp)

window.requestAnimationFrame(app.update)





// Resources: 
// Gaming Loops - https://isaacsukin.com/news/2015/01 detailed-explanation-javascript-game-loops-and-timing#timing-problems
// Frederik De Bleser's Youtube tutorials - Creating Space Invaders - https://www.youtube.com/watch?v=H5Stvl_kzag
// Math.sin and Math.cos — The creative coder’s best friend - https://hackernoon.com/math-sin-and-math-cos-the-creative-coders-best-friend-597d69000644
// Academy's Space Invaders - https://github.com/keephopealive/academy-space-invaders
// Hit Testing - https://en.wikipedia.org/wiki/Hit-testing
// Creating grids with JavaScript - https://codepen.io/nakessler/pen/qOdJWm
// High Performance Animations - https://www.html5rocks.com/en/tutorials/speed/high-performance-animations/