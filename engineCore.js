//-----------------Engine Variables-----------------//
var EntityEngine = {
    //engineConfigurationPath: "./engineConfig.entityCon",
    canvas: undefined,
    renderer: undefined,
    engineExecutionEnabled: true,
    gameObjectStorage: [],
    spriteTiles: [],
    FixedUpdateTimer: undefined,
    timer: undefined,
    AnimationTimer: undefined,
    //
    spriteSheet: {
        spriteSheetSource: "https://raw.githubusercontent.com/Xerren09/Frogger/main/assets/spritesheet.png", // ./spritesheet.png //https://raw.githubusercontent.com/Xerren09/Frogger/main/assets/spritesheet.png
        tileSize: 25,
        height: 25,
        width: 25,
        img: undefined
    }
};
//
var _score = 0;
var _hiScore = "";
var _scoreText = "00000";
//
var EnginePerformance = {
    performanceRenderingAverage : 0,
    executionCount: 0,
    operationStart: 0,
    operationEnd: 0,
    EnginePerformanceDisplayEnabled: false,
    startTimer: function() {
        EnginePerformance.operationStart = performance.now();
    },
    endTimer: function () {
        EnginePerformance.operationEnd = performance.now();
        let runTime = (EnginePerformance.operationEnd - EnginePerformance.operationStart);
        EnginePerformance.executionCount++;
        EnginePerformance.performanceRenderingAverage += runTime;
        //
        //console.log("Current operation speed:  " + (runTime) + " ms.  Average operation speed: " + (EnginePerformance.performanceRenderingAverage / EnginePerformance.executionCount) + " ms.   Executions / second: " + (1000/runTime));
        //
        let displayPerformance = ("Current operation speed:  " + (runTime) + " ms.\n Average operation speed: " + (EnginePerformance.performanceRenderingAverage / EnginePerformance.executionCount).toFixed(2) + " ms.\n Executions / second: " + (1000 / runTime).toFixed(2));
        EntityEngine.renderer.font = '7px Arial';
        EntityEngine.renderer.fillStyle = 'white';
        EntityEngine.renderer.fillText(displayPerformance, (0), (EntityEngine.canvas.height - (EntityEngine.renderer.measureText('M').width * 6)));
    },
};
//
var playerData = {
    x: 225,
    y: 375,
    sizex: EntityEngine.spriteSheet.tileSize,
    sizey: EntityEngine.spriteSheet.tileSize,
    step: 25,
    lives: 3,
    remainingLives: 3,
    spriteTag: "player",
    spriteIndex: 14,
};
//
var _obstacles = [
    "turtly_bad", //intentionally misspelled, it's cuter this way
    "car1",
    "car2",
    "car3",
    "car4",
    "water"
];

var _overrides = [
    "bound",
    "log",
    "turtly",
    "score-event",
    "safe-zone"
];
//--------------------------------------------------//

// Use this for initialization
function InitializeEngine() {
    EntityEngine.canvas = document.getElementById("gameArea");
    EntityEngine.renderer = EntityEngine.canvas.getContext("2d");
    //
    // loads in graphics
    initializeGraphicsEngine();
    // loads in set variables from the script.js file
    Initialize();
    // sets timers for the for the core update loops FixedUpdate and AnimationLoop
    EntityEngine.FixedUpdateTimer = window.setInterval(CoreUpdateLoop_Fixed, 20);
    EntityEngine.AnimationTimer = window.setInterval(animationLoop, 700);
    // this first call starts the core update loop which runs all the internal game logic
    //CoreUpdateLoop();
}

// Core update loop for calculations done every milliseconds specified.
// This loop is regulated! All calculations done here will be executed after the specified interval has elapsed.
// Please note however that the exact execution time may not be guaranteed, since the timer used may delay execution
// based on performance needs.
function CoreUpdateLoop_Fixed() {
    if (EntityEngine.engineExecutionEnabled == true) {
        try {
            FixedUpdate();
        }
        catch {  /* function is not present */ }

        _moveEnabled = true;
    }
}

// Core update loop for calculations done every frame
// This loop is non-regulated! All calculations done here will be executed in a non-guaranteed timeframe.
// Execution times are heavily dependent on performance and their execution intervals is not fixed.
function CoreUpdateLoop() {
    if (EntityEngine.engineExecutionEnabled == true) {
        try {
            Update();
        }
        catch {  /* function is not present */ }
        gameObjectBoundCheck([playerData.x, playerData.y]);
        if (EntityEngine.engineExecutionEnabled == true) {
            renderObjects();
        }
    }
    if (endGameState == false)
    {
        window.requestAnimationFrame(CoreUpdateLoop);
    }
}

// Core animation loop. Cycles through animated sprites every specified miliseconds and bumps their ID up by one.
function animationLoop() {
    EntityEngine.gameObjectStorage.forEach(element => {
        let objSpriteTag = element[0].sprite[0];
        EntityEngine.spriteTiles.forEach(spriteElement => {
            if (spriteElement[0].isAnimated == true)
            {
                if (spriteElement[0].objTag == objSpriteTag) {
                    element[0].sprite[1] += 1;
                    if (element[0].sprite[1] == spriteElement[0].list.length) {
                        element[0].sprite[1] = 0;
                    }
                    return;
                }
            }
        });
    });
}

//-----------------Core Engine Code-----------------//

// Handles scoring and displaying the score
function scoreIncrease(scoreUp) {
    _score += scoreUp;
    //code to achieve that cool retro 5 digit score counter
    if (_score <= 99999) {
        let scr = "00000";
        _scoreText = scr.substring(0, (scr.length - _score.toString().length)) + _score.toString();
    }
}

function initializeGraphicsEngine() {
    EntityEngine.spriteSheet.img = new Image();
    EntityEngine.spriteSheet.img.src = EntityEngine.spriteSheet.spriteSheetSource;
    //
    EntityEngine.spriteSheet.img.onload = function () {
        EntityEngine.spriteSheet.height = this.height;
        EntityEngine.spriteSheet.width = this.width;
    }
    //
    EntityEngine.renderer.drawImage(EntityEngine.spriteSheet.img, 0, 0);
}

function collisionPenalty() {
    try {
        playerCollisionPenalty();
    }
    catch { /* function is not present */ }
}

function gameObjectLookUp(objLookUpName) {
    let ID = 0;
    EntityEngine.gameObjectStorage.forEach((element, index) => {
        if (element[0].objName == objLookUpName)
        {
            ID = index;
        }
    });
    return ID;
}

//var tempObjectStorage;
function addGameObject(objData) {
    let interID = EntityEngine.gameObjectStorage.length;
    EntityEngine.gameObjectStorage.push([objData, interID]);
    //{ x: 0, y: 0, sizex: EntityEngine.canvas.width, sizey: EntityEngine.canvas.height, color: "#000000", tag: "asphalt", sprite: ["asphalt", 0], objName: "asphalt1" }
    //EntityEngine.gameObjectStorage.push([objData.objName]: objData);
}

function addSpriteTiles(objData) {
    let interID = EntityEngine.spriteTiles.length;
    EntityEngine.spriteTiles.push([objData, interID]);
}

function renderObjects() {
    EnginePerformance.startTimer();
    EntityEngine.renderer.clearRect(0, 0, EntityEngine.canvas.width, EntityEngine.canvas.height);
    //
    EntityEngine.renderer.beginPath();
    EntityEngine.renderer.rect(0, 0, EntityEngine.canvas.width, EntityEngine.canvas.height);
    EntityEngine.renderer.fillStyle = "#000000";
    EntityEngine.renderer.fill();
    //
    EntityEngine.gameObjectStorage.forEach(element => {
        let objectSpriteList = constructSpriteList(element);
        if (objectSpriteList.isMaterial == true) //render object as material
        {
            EntityEngine.renderer.beginPath();
            EntityEngine.renderer.rect(element[0].x, element[0].y, element[0].sizex, element[0].sizey);
            EntityEngine.renderer.fillStyle = objectSpriteList.sprites[0];
            EntityEngine.renderer.fill();
            EntityEngine.renderer.closePath();
        }
        else //render object as spritetile
        {
            let tsize = EntityEngine.spriteSheet.tileSize;
            objectSpriteList.sprites.forEach((spriteElement, index) => {
                let spriteSheetLocation = spriteSheetIndexer(parseInt(spriteElement));
                for (let i = 0; i < (element[0].sizey/tsize); i++)
                {
                    EntityEngine.renderer.drawImage(EntityEngine.spriteSheet.img, spriteSheetLocation.columnIndex, spriteSheetLocation.rowIndex, tsize, tsize, element[0].x + ((index) * EntityEngine.spriteSheet.tileSize), element[0].y + (i * tsize), tsize, tsize);
                }
            });
        }
    });
    //
    try {
        RenderCustomData();
    }
    catch { /* function is not present */ }
    //
    renderplayer();
    //
    if (EntityEngine.EnginePerformanceDisplayEnabled == true)
    {
        EnginePerformance.endTimer();
    }
}

function renderplayer() {
    let tsize = EntityEngine.spriteSheet.tileSize;
    let spriteSheetLocation = spriteSheetIndexer(parseInt(playerData.spriteIndex));
    EntityEngine.renderer.drawImage(EntityEngine.spriteSheet.img, spriteSheetLocation.columnIndex, spriteSheetLocation.rowIndex, tsize, tsize, playerData.x, playerData.y, tsize, tsize);
}

// creates a list of Indexes of the sprites making up the gameObject
function constructSpriteList(obj) {
    let spriteCount = (obj[0].sizex / EntityEngine.spriteSheet.tileSize);
    let spriteList = [];
    let objTag = obj[0].sprite[0];
    let midCount = 0;
    let isMat = false;
    //
    EntityEngine.spriteTiles.forEach(element => {
        if (element[0].objTag == objTag)
        {
            if (element[0].isMaterial == true) // the sprite is a material
            {
                isMat = true;
                spriteList.push(element[0].materialColor);
                return;
            }
            else // the sprite is not a material
            {
                if (element[0].isAnimated == true){ // The sprite is animated
                    spriteList.push(element[0].list[obj[0].sprite[1]]);
                    return;
                }
                else // The sprite is not animated
                {
                    midCount = 0;
                    for (let i = 1; i <= spriteCount; i++) {
                        switch (i) {
                            case 1:
                                //gameObject start
                                spriteList.push(element[0].start);
                                break;
                            case spriteCount:
                                //gameObject end
                                spriteList.push(element[0].end);
                                break;
                            default:
                                //gameObject middle
                                if (midCount < (element[0].middle.length)) {
                                    spriteList.push(element[0].middle[midCount]);
                                    midCount++;
                                }
                                if (midCount >= (element[0].middle.length)) {
                                    midCount = 0;
                                }
                                break;
                        }
                    }
                }
            }
            return;
        }
    });
    return {
        sprites: spriteList,
        isMaterial: isMat
    };
}

// returns the position of a given index on the spritesheet
function spriteSheetIndexer(indexNum) {
    let indexWidth = EntityEngine.spriteSheet.width / EntityEngine.spriteSheet.tileSize;
    let rowNumber = Math.ceil(indexNum / indexWidth)-1;
    let columnNumber = (indexNum - ((rowNumber) * (indexWidth)))-1;
    //
    let returnIndex_row = (rowNumber * EntityEngine.spriteSheet.tileSize);
    let returnIndex_column = (columnNumber * EntityEngine.spriteSheet.tileSize);
    //
    return {
        rowIndex: returnIndex_row,
        columnIndex: returnIndex_column
    };
}

function objTranslate(step, axis, dir, objID) {
    if (axis == "x")
    {
        if (dir == "+")
        {
            EntityEngine.gameObjectStorage[objID][0].x += step;
        }
        else if(dir == "-")
        {
            EntityEngine.gameObjectStorage[objID][0].x -= step;
        }
    }
    else if (axis == "y")
    {
        if (dir == "+")
        {
            EntityEngine.gameObjectStorage[objID][0].y -= step;
        }
        else if (dir == "-")
        {
            EntityEngine.gameObjectStorage[objID][0].y += step;
        }
    }
}

// Handles all the collision checks; if there was a collision returns false, otherwise true
function collisionEventHandler(pos) {
    let collision = false;
    //
    if (BoundCheck(pos) == true) { collision = true; }
    if (gameObjectBoundCheck(pos) == true) { collision = true;}
    //
    if (collision == true) { return true } else { return false }
}

// Main collision validator, checks if the player's coordinate is inside any other gameObject
function gameObjectBoundCheck(pos) {
    let collision = false;
    // Some modification to the player size so the hitboxes are more forgiving.
    let modifiedX = playerData.sizex - 20;
    let modifiedPosX = pos[0] + 10;
    //
    EntityEngine.gameObjectStorage.forEach(element => {
        if (element[0].x < modifiedPosX + modifiedX && element[0].x + element[0].sizex > modifiedPosX && element[0].y < pos[1] + playerData.sizey && element[0].y + element[0].sizey > pos[1])
        {
            // collision between player and another object
            if (obstacleCollisionOverride(pos) == false) {
                // collision wasn't overridden
                if (ObstacleCheck(element[0].tag) == true) {
                    // object the collision happened with is an obstacle
                    if (collision == false)
                    {
                        collision = true;
                        collisionPenalty();
                        //return;
                    }
                }
            }
            else
            {
                if (element[0].tag == "score-event") {
                    scoreEvent(element);
                    //collision = true;
                }
                return;
            }
        }
    });
    //
    if (collision == true) { return true } else { return false }
}

// An override for the collision system for when objects are overlapping
function obstacleCollisionOverride(pos) {
    let override = false;
    EntityEngine.gameObjectStorage.forEach(element => {
        if (element[0].x < pos[0] + playerData.sizex && element[0].x + element[0].sizex > pos[0] && element[0].y < pos[1] + playerData.sizey && element[0].y + element[0].sizey > pos[1]) {
            _overrides.forEach(element_o => {
                if (element_o == element[0].tag) {
                    override = true;
                }
            });
        }
        if (override == true) {
            return;
        }
    });
    //
    if (override == true) { return true } else { return false }
}

// An override for the collision system for when objects with different types are overlapping
function obstacleCollisionOverride_Single(pos, objID) {
    let override = false;
    if (EntityEngine.gameObjectStorage[objID][0].x < pos[0] + playerData.sizex && EntityEngine.gameObjectStorage[objID][0].x + EntityEngine.gameObjectStorage[objID][0].sizex > pos[0] && EntityEngine.gameObjectStorage[objID][0].y < pos[1] + playerData.sizey && EntityEngine.gameObjectStorage[objID][0].y + EntityEngine.gameObjectStorage[objID][0].sizey > pos[1]) {
        _overrides.forEach(element_o => {
            if (element_o == EntityEngine.gameObjectStorage[objID][0].tag) {
                override = true;
                return;
            }
        });
    }
    //
    if (override == true) { return true } else { return false }
}

// Sub-function of the collision system, checks if the collided object is an obstacle or not
function ObstacleCheck(tag){
    let isObstacle = false;
    _obstacles.forEach(element => {
        if (element == tag) {
            isObstacle = true;
            return;
        }
    });
    //
    if (isObstacle == true) { return true } else { return false }
}

// Checks for collisions against canvas bounds. Returns false on collision
function BoundCheck(pos) {
    let isAtBound = false;
    switch(true) {
        case (pos[1] > (EntityEngine.canvas.height - EntityEngine.spriteSheet.tileSize)):
            isAtBound = true;
            break;
        case (pos[1] < 0):
            isAtBound = true;
            break;
        case (pos[0] > (EntityEngine.canvas.width - EntityEngine.spriteSheet.tileSize)):
            isAtBound = true;
            break;
        case (pos[0] < 0):
            isAtBound = true;
            break;
    }
    EntityEngine.gameObjectStorage.forEach(element => {
        if ((element[0].x < pos[0] + playerData.sizex) && (element[0].x + element[0].sizex > pos[0]) && (element[0].y < pos[1] + playerData.sizey) && (element[0].y + element[0].sizey > pos[1])) {
            if (element[0].tag == "bound") {
                isAtBound = true;
                return;
            }
        }
    });
    if (isAtBound == true) { return true } else { return false }
}

// Halts engine execution for a specified amount of miliseconds
function AwaitEngineExec(ms) {
    const startTime = Date.now();
    let currentTime = null;
    do { currentTime = Date.now(); } while (currentTime - startTime < ms);
}

// Handles player movement. Calls collisionEventHandler to check against collisions to ensure player steps are valid
window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return;
    }
    let newV = 0;
    if (EntityEngine.engineExecutionEnabled == true)
    {
        switch (event.code) {
            case "KeyW":
                newV = (playerData.y - playerData.step);
                let posCheck = playerData.x;
                if (collisionEventHandler([playerData.x, newV]) == false) {
                    scoreIncrease(10);
                    if (posCheck == playerData.x) {
                        //Fixes a bug that would occur when the player position is overwritten during collisionEventHandler's calculations,
                        //causing the player to be rendered in the position calculated here for a single frame. This could
                        //sometimes cause the collision system to calculate a false result, letting the player proceed while also
                        //triggering a possible collision penalty.
                        playerData.y = newV;
                    }
                }
                break;
            case "KeyS":
                newV = (playerData.y + playerData.step);
                if (collisionEventHandler([playerData.x, newV]) == false) {
                    playerData.y = newV;
                }
                break;
            case "KeyA":
                newV = (playerData.x - playerData.step);
                if (collisionEventHandler([newV, playerData.y]) == false) {
                    playerData.x = newV;
                }
                break;
            case "KeyD":
                newV = (playerData.x + playerData.step);
                if (collisionEventHandler([newV, playerData.y]) == false) {
                    playerData.x = newV;
                }
                break;
        }
    }
    else if (startGameState == true)
    {
        startGameState = false;
        EntityEngine.engineExecutionEnabled = true;
        ScoreTimer = window.setInterval(scoreTimer, 1000);
        CoreUpdateLoop();
    }
    else if (startGameState == true) {
        startGameState = false;
        EntityEngine.engineExecutionEnabled = true;
        ScoreTimer = window.setInterval(scoreTimer, 1000);
        CoreUpdateLoop();
    }
    else if (endGameState == true) {
        resetGame();
    }
    event.preventDefault();
}, true);
