// TODO: add sound
// TODO: add score board
// TODO: derive enemies and players from Entity common class, put all entities in an entity array?
// TODO: randomize location of bug creation and rates
// TODO: at advanced levels, bugs in some rows go in reverse
// TODO: allow users to specify png files, add their name, two person game
// TODO: have a timer for a time limit, show game over
// TODO: allow user to start a new game
// TODO: keep track of levels, make game harder as we progress
// TODO: don't allow player to just sit in initial spot or one spot for too long
// TODO: add a demo mode

// Enemies our player must avoid
var Enemy = function(startingRow, rate) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    var c = document.getElementsByTagName('canvas');
    this.x = -101;
    this.y = 225 - (startingRow - 2) * 83;
    this.row = startingRow;
    this.rate = rate;
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x < 505) {
        this.x += (this.rate * dt);
    } else {
        this.x = -101;
        this.rate = Math.random() * 40 + 20;
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/char-boy.png';

    var c = document.getElementsByTagName('canvas');
    this.x = 202;
    this.y = 403;
    this.row = 0;
}

// Update the player's position, required method for game
// Parameter: dt, a time delta between ticks
Player.prototype.update = function(dt) {
    // TODO: at advanced levels (drunk?) we could mess with the player's position
    if ((this.row > 1) || (this.row < 5))
    {
        // possibility of a collision
        for (var e in allEnemies) {
            if (allEnemies[e].row === this.row) {
                if (Math.abs(allEnemies[e].x - this.x) < 75) {
                    // collision
                    this.x = 202;
                    this.y = 403;
                    this.row = 0;
                }
            }
        }

    }
}

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Handle input from the keyboard
Player.prototype.handleInput = function(inputKey) {
    // TODO: remove hard-coded step sizes
    if (inputKey === 'left') {
        if (this.x > 100) {
            this.x -= 101;
        }
    } else if (inputKey === 'up') {
        if (this.y > 70) {
            this.y -= 83;
            this.row++;
        } else {
            // TODO: score points, you made it across
            this.x = 202;
            this.y = 403;
            this.row = 0;
        }
    } else if (inputKey === 'right') {
        if (this.x < 304) {
            this.x += 101;
        }
    } else if (inputKey === 'down') {
        if (this.y < 403) {
            this.y += 83;
            this.row--;
        }
    } else {
        // TODO: use character to show confusion
    }
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [
    new Enemy(2, Math.random() * 40 + 20),
    new Enemy(3, Math.random() * 40 + 20),
    new Enemy(4, Math.random() * 40 + 20)
];

// Place the player object in a variable called player
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

