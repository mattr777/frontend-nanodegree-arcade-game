// TODO: allow user to start a new game
// TODO: keep track of levels, make game harder as we progress, but user scores more points
// TODO: at advanced levels, bugs in some rows go in reverse
// TODO: have a timer for a time limit, show game over
// TODO: allow users to specify png files, add their name, two person game
// TODO: don't allow player to just sit in initial spot or one spot for too long
// TODO: add a demo mode
// TODO: add sound

var score = 0;

var updateScore = function(newScore) {
    $('#scoreBoard').text("Current Score: " + score);
};

/**
 * This is the constructor for the base class for all entities in the game.  Enemies and
 * the player are derived from Entity.
 *
 * @param sprite: The image used to graphically represent this entity
 * @param row: The row where the entity should start out
 * @param col: The column where the entity should start out. A value less than zero indicates off
 * screen to the left.
 * @constructor
 */
var Entity = function(sprite, row, col){
    // The image/sprite for our entities, this uses
    // a helper we've provided to easily load images
    this.sprite = sprite;
    this.setRow(row);   // updates our y value
    this.setCol(col);   // updates our x value
};

Entity.prototype.maxRow = 5;
Entity.prototype.maxCol = 4;
Entity.prototype.maxX = 505;
Entity.prototype.rowHeight = 83;
Entity.prototype.colWidth = 101;
Entity.prototype.collisionDistance = 75;    // the x distance defined for a collision
Entity.prototype.minRate = 20;
Entity.prototype.maxRate = 80;
Entity.prototype.minEnemyRow = 2;
Entity.prototype.maxEnemyRow = 4;

/**
 * Draw the entity on the screen, required method for game
 */
Entity.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Get a random rate between the min and max
 * @returns {number}
 */
Entity.prototype.getRandomRate = function() {
    return Math.random() * (Entity.prototype.maxRate - Entity.prototype.minRate) + Entity.prototype.minRate;
};

/**
 * Get a random enemy row between the min and max
 * @returns {number}
 */
Entity.prototype.getRandomEnemyRow = function() {
    var range = Entity.prototype.maxEnemyRow - Entity.prototype.minEnemyRow + 1;
    return Math.min(Math.floor(Math.random() * range) + Entity.prototype.minEnemyRow, Entity.prototype.maxEnemyRow);
};

/**
 * Update an entity's row with the given value.  This controls the y value.
 * If an entity tries to move off the top of the map, that is interpreted as
 * successfully traversing the game and points are scored.
 *
 * @param row: 0 to max rows in game.
 */
Entity.prototype.setRow = function (row) {
    if (row < 0) {
        row = 0;
    } else if (row > Entity.prototype.maxRow) {
        row = 0;
        score++;
        updateScore(score);
    }
    this.row = row;
    this.y = 403 - this.row * Entity.prototype.rowHeight;
};

/**
 * Are we in a row that enemies can be in?
 * @returns {boolean}
 */
Entity.prototype.inEnemyRow = function () {
    return ((this.row > 1) && (this.row < Entity.prototype.maxRow));
};

/**
 * Update an entity's column with the given value.  This sets the x value.
 * The x value is also updated by the setX function if finer control is needed.
 *
 * @param col: -1 to max columns in game. -1 is off screen to the left.
 */
Entity.prototype.setCol = function (col) {
    if (col < 0) {
        col = -1;
    } else if (col > Entity.prototype.maxCol) {
        col = Entity.prototype.maxCol;
    }
    this.col = col;
    this.x = this.col * Entity.prototype.colWidth;
};

Entity.prototype.moveUp = function() {
    this.setRow(this.row + 1);
};

Entity.prototype.moveDown = function() {
    this.setRow(this.row - 1);
};

Entity.prototype.moveLeft = function () {
    // don't allow movement off the screen with this function
    // col === -1 is legal in other contexts and is allowed by setCol
    if (this.col > 0) {
        this.setCol(this.col - 1);
    }
};

Entity.prototype.moveRight = function () {
    this.setCol(this.col + 1);
};

/**
 * Raw ability to set the x value for motion purposes, no error checking
 * @param x: the new x value for the Entity
 */
Entity.prototype.setX = function(x) {
    this.x = x;
};

/**
 * Enemies our player must avoid. They are derived from Entity.
 * @param sprite: The image used to graphically represent this entity
 * @param startingRow: The row where we will start out
 * @constructor
 */
var Enemy = function(sprite, startingRow) {
    Entity.call(this, sprite, startingRow, -1);
    this.setRate(Entity.prototype.getRandomRate());
};
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * Update the enemy's rate with the given value.
 * @param rate: The number of pixels we should move with each time slice, limited to the range
 * Entity.prototype.minRate to Entity.prototype.maxRate.
 */
Enemy.prototype.setRate = function (rate) {
    if (rate < Entity.prototype.minRate) {
        rate = Entity.prototype.minRate;
    } else if (rate > Entity.prototype.maxRate) {
        rate = Entity.prototype.maxRate;
    }
    this.rate = rate;
};

/**
 * Update the enemy's position, required method for game
 * @param dt a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    this.setX(this.x + this.rate * dt);
    if (this.x > Entity.prototype.maxX) {
        // when we run off the right side of the game, start over with a random rate and row
        this.setRate(Entity.prototype.getRandomRate());
        this.setRow(Entity.prototype.getRandomEnemyRow());
        this.setCol(-1);
    }
};





/**
 * Player class represents the player in the game.  It is derived from Entity.
 * It always starts in row 0 column 2.
 * @param sprite
 * @constructor
 */
var Player = function(sprite) {
    Entity.call(this, sprite, 0, 2);
};
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

/**
 * Update the player's position, required method for game.
 * All we do is check for collisions.  The player's position is only updated by
 * input from the user. (Except when there is a collision.)
 * TODO: in other modes (drunk?) we could mess with the player's position
 */
Player.prototype.update = function() {
    if (this.inEnemyRow()) {
        // we are in a row where enemies travel, possibility of a collision
        for (var i = 0, n = allEntities.length; i < n; i++) {
            if ((allEntities[i] !== this) && (allEntities[i].row === this.row)) {
                // we are in the same row as the other guy, and we are not the other guy
                if (Math.abs(allEntities[i].x - this.x) < Entity.prototype.collisionDistance) {
                    // collision
                    this.setRow(0);
                    this.setCol(2);
                }
            }
        }
    }
};

/**
 * Handle input from the keyboard
 * @param inputKey
 */
Player.prototype.handleInput = function(inputKey) {
    if (inputKey === 'left') {
        this.moveLeft();
    } else if (inputKey === 'up') {
        this.moveUp();
    } else if (inputKey === 'right') {
        this.moveRight();
    } else if (inputKey === 'down') {
        this.moveDown();
    }
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};




/*
 * Create entities and wire it all together
 */


// Place the player object in a variable called player
// We only have to provide the file for the sprite
var player = new Player('images/char-boy.png');

// Now instantiate objects.
// Place all enemy objects and player in an array called allEntities
// Start with one enemy in each row
// For the enemies, specify sprite file and starting row
var allEntities = [
    new Enemy('images/enemy-bug.png', 2),
    new Enemy('images/enemy-bug.png', 3),
    new Enemy('images/enemy-bug.png', 4),
    player
];

/**
 * This listens for key presses and sends the keys to the
 * Player.handleInput() method.
 */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

