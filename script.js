var goalPoints = { current: 5, default: 5 };
var ScoreTimer = undefined;
var GameLevel = 0;
const gameFont = 'Press Start 2P';
var startGameState = true;
var endGameState = false;
var levelUpSpeedIncrease = 0;
var scoreUp = {
    uptime: 0,
    enabled: false
};

function Initialize() {
    try {
        if ((sessionStorage.getItem("_hiScore")) != null) {
            _hiScore = (sessionStorage.getItem("_hiScore"));
        }
        else {
            _hiScore = "00000";
        }
    }
    catch {
        // Fixes a bug that occurs on overly secure web-browsers (looking at you Brave)
        // where sessionStorage access may be denied to scripts for no apparent reason.
        _hiScore = "00000";
    }
    _score = 0;
    // font loading
    EntityEngine.renderer.font = `10px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'red';
    EntityEngine.renderer.fillText('ABCDEFGHIJKLMNOPQRSTUVWXYZ', (25), (25));
    EntityEngine.renderer.fillText('abcdefghijklmnopqrstuvwxyz', (25), (50));
    EntityEngine.renderer.fillText('0123456789/*-+', (25), (75));
    //
    levelUpSpeedIncrease = 0;
    LoadGameObjects();
    LoadSpriteData();
    StartGameScreen();
}

function Update() {
    // top row logs
    cycleObjAnim(1.7, "x", "+", "log1");
    cycleObjAnim(1.7, "x", "+", "log2");
    cycleObjAnim(1.7, "x", "+", "log3");
    // top row turtles
    cycleObjAnim(1, "x", "-", "turtle1");
    cycleObjAnim(1, "x", "-", "turtle12");
    cycleObjAnim(1, "x", "-", "turtle2");
    cycleObjAnim(1, "x", "-", "turtle22");
    cycleObjAnim(1, "x", "-", "turtle3");
    cycleObjAnim(1, "x", "-", "turtle32");
    // top second row logs
    cycleObjAnim(1, "x", "+", "log7");
    cycleObjAnim(1, "x", "+", "log8");
    cycleObjAnim(1, "x", "+", "log9");
    // top third row logs
    cycleObjAnim(1.8, "x", "-", "log10");
    cycleObjAnim(1.8, "x", "-", "log11");
    cycleObjAnim(1.8, "x", "-", "log12");
    // bottom turtles
    cycleObjAnim(1.3, "x", "+", "turtle4");
    cycleObjAnim(1.3, "x", "+", "turtle42");
    cycleObjAnim(1.3, "x", "+", "turtle43");
    cycleObjAnim(1.3, "x", "+", "turtle5");
    cycleObjAnim(1.3, "x", "+", "turtle52");
    cycleObjAnim(1.3, "x", "+", "turtle53");
    cycleObjAnim(1.3, "x", "+", "turtle6");
    cycleObjAnim(1.3, "x", "+", "turtle62");
    cycleObjAnim(1.3, "x", "+", "turtle63");
    // cars:
    cycleObjAnim(1, "x", "-", "truck1");
    cycleObjAnim(1, "x", "-", "truck12");
    cycleObjAnim(1, "x", "-", "truck13");
    //
    cycleObjAnim(0.7, "x", "+", "bcar_right1");
    cycleObjAnim(0.7, "x", "+", "bcar_right12");
    cycleObjAnim(0.7, "x", "+", "bcar_right13");
    cycleObjAnim(0.7, "x", "+", "bcar_right14");
    //
    cycleObjAnim(1.3, "x", "-", "pcar_left1");
    cycleObjAnim(1.3, "x", "-", "pcar_left12");
    cycleObjAnim(1.3, "x", "-", "pcar_left13");
    //
    cycleObjAnim(1, "x", "+", "truck2");
    cycleObjAnim(1, "x", "+", "truck21");
    //
    cycleObjAnim(1.1, "x", "+", "bcar_right2");
    cycleObjAnim(1.1, "x", "+", "bcar_right21");
    cycleObjAnim(1.1, "x", "+", "bcar_right22");
    //
    if (scoreUp.enabled == true)
    {
        EntityEngine.gameObjectStorage[gameObjectLookUp("scoreup200")][0].x = playerData.x;
        EntityEngine.gameObjectStorage[gameObjectLookUp("scoreup200")][0].y = playerData.y-25;
    }
}

function playerCollisionPenalty() {
    EntityEngine.engineExecutionEnabled = false;
    playerData.remainingLives = playerData.remainingLives - 1;
    EntityEngine.gameObjectStorage[gameObjectLookUp("playerlivebar")][0].sizex = playerData.remainingLives * EntityEngine.spriteSheet.tileSize;
    renderObjects();
    AwaitEngineExec(500);
    respawnPlayer();
    resetTimer();
    EntityEngine.engineExecutionEnabled = true;
    if (playerData.remainingLives <= 0) {
        endGameCollapse();
    }
}

// used to load in all gameobject at the start of the game
function LoadGameObjects() {
    //
    addGameObject({ x: 0, y: 50, sizex: EntityEngine.canvas.width, sizey: EntityEngine.canvas.height, tag: "asphalt", sprite: ["asphalt", 0], objName: "asphalt1" });
    addGameObject({ x: 0, y: 250, sizex: EntityEngine.canvas.width, sizey: 125, tag: "asphalt", sprite: ["highway", 0], objName: "asphalt" });
    //
    addGameObject({ x: 0, y: 50, sizex: EntityEngine.canvas.width, sizey: 200, tag: "water", sprite: ["water", 0], objName: "water1" });
    addGameObject({ x: 0, y: 375, sizex: EntityEngine.canvas.width, sizey: 25, tag: "safe-zone", sprite: ["safe-zone", 0], objName: "safezone-bottom" });
    addGameObject({ x: 0, y: 225, sizex: EntityEngine.canvas.width, sizey: 25, tag: "safe-zone", sprite: ["safe-zone", 0], objName: "safezone-top" });
    //
    addGameObject({ x: 0, y: 50, sizex: EntityEngine.canvas.width, sizey: 25, tag: "bound", sprite: ["bound", 0], objName: "bound-top" });
    //addGameObject({ x: 0, y: 50, sizex: 75, sizey: 25, tag: "bound", sprite: ["bound6", 0], objName: "bound-top" });
    addGameObject({ x: 0, y: 75, sizex: 50, sizey: 25, tag: "bound", sprite: ["bound2", 0], objName: "bound-top2" });
    addGameObject({ x: 75, y: 75, sizex: 75, sizey: 25, tag: "bound", sprite: ["bound3", 0], objName: "bound-top3" });
    addGameObject({ x: 175, y: 75, sizex: 50, sizey: 25, tag: "bound", sprite: ["bound4", 0], objName: "bound-top4" });
    addGameObject({ x: 250, y: 75, sizex: 50, sizey: 25, tag: "bound", sprite: ["bound4", 0], objName: "bound-top5" });
    addGameObject({ x: 325, y: 75, sizex: 75, sizey: 25, tag: "bound", sprite: ["bound3", 0], objName: "bound-top6" });
    addGameObject({ x: 425, y: 75, sizex: 50, sizey: 25, tag: "bound", sprite: ["bound5", 0], objName: "bound-top7" });
    //
    addGameObject({ x: 50, y: 75, sizex: 25, sizey: 25, tag: "score-event", sprite: ["score-event", 0], objName: "score1" });
    addGameObject({ x: 150, y: 75, sizex: 25, sizey: 25, tag: "score-event", sprite: ["score-event", 0], objName: "score2" });
    addGameObject({ x: 225, y: 75, sizex: 25, sizey: 25, tag: "score-event", sprite: ["score-event", 0], objName: "score3" });
    addGameObject({ x: 300, y: 75, sizex: 25, sizey: 25, tag: "score-event", sprite: ["score-event", 0], objName: "score4" });
    addGameObject({ x: 400, y: 75, sizex: 25, sizey: 25, tag: "score-event", sprite: ["score-event", 0], objName: "score5" });
    //
    addGameObject({ x: 50, y: 250, sizex: 50, sizey: 25, tag: "car1", sprite: ["truck", 0], objName: "truck1" });
    addGameObject({ x: 250, y: 250, sizex: 50, sizey: 25, tag: "car1", sprite: ["truck", 0], objName: "truck12" });
    addGameObject({ x: 400, y: 250, sizex: 50, sizey: 25, tag: "car1", sprite: ["truck", 0], objName: "truck13" });
    //
    addGameObject({ x: 25, y: 275, sizex: 25, sizey: 25, tag: "car1", sprite: ["car_blue_right", 0], objName: "bcar_right1" });
    addGameObject({ x: 150, y: 275, sizex: 25, sizey: 25, tag: "car1", sprite: ["car_purple_right", 0], objName: "bcar_right12" });
    addGameObject({ x: 250, y: 275, sizex: 25, sizey: 25, tag: "car1", sprite: ["car_blue_right", 0], objName: "bcar_right13" });
    addGameObject({ x: 390, y: 275, sizex: 25, sizey: 25, tag: "car1", sprite: ["truck2_right", 0], objName: "bcar_right14" });
    //
    addGameObject({ x: 50, y: 300, sizex: 25, sizey: 25, tag: "car1", sprite: ["car_purple_left", 0], objName: "pcar_left1" });
    addGameObject({ x: 250, y: 300, sizex: 25, sizey: 25, tag: "car1", sprite: ["truck2_left", 0], objName: "pcar_left12" });
    addGameObject({ x: 400, y: 300, sizex: 25, sizey: 25, tag: "car1", sprite: ["car_blue_left", 0], objName: "pcar_left13" });
    //
    addGameObject({ x: 50, y: 325, sizex: 25, sizey: 25, tag: "car1", sprite: ["truck2_right", 0], objName: "truck2" });
    addGameObject({ x: 360, y: 325, sizex: 25, sizey: 25, tag: "car1", sprite: ["truck2_right", 0], objName: "truck21" });
    //
    addGameObject({ x: 50, y: 350, sizex: 25, sizey: 25, tag: "car1", sprite: ["car_blue_right", 0], objName: "bcar_right2" });
    addGameObject({ x: 275, y: 350, sizex: 25, sizey: 25, tag: "car1", sprite: ["car_purple_right", 0], objName: "bcar_right21" });
    addGameObject({ x: 400, y: 350, sizex: 25, sizey: 25, tag: "car1", sprite: ["truck2_right", 0], objName: "bcar_right22" });
    //
    addGameObject({ x: 25, y: 100, sizex: 100, sizey: 25, tag: "log", sprite: ["log_right", 0], objName: "log1" });
    addGameObject({ x: 200, y: 100, sizex: 100, sizey: 25, tag: "log", sprite: ["log_right", 0], objName: "log2" });
    addGameObject({ x: 375, y: 100, sizex: 100, sizey: 25, tag: "log", sprite: ["log_right", 0], objName: "log3" });
    //
    addGameObject({ x: 25, y: 125, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_left", 0], objName: "turtle1" });
    addGameObject({ x: 50, y: 125, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_left", 0], objName: "turtle12" });
    //
    addGameObject({ x: 200, y: 125, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_left", 0], objName: "turtle2" });
    addGameObject({ x: 225, y: 125, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_left", 0], objName: "turtle22" });
    //
    addGameObject({ x: 375, y: 125, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_left", 0], objName: "turtle3" });
    addGameObject({ x: 400, y: 125, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_left", 0], objName: "turtle32" });
    //
    addGameObject({ x: 25, y: 150, sizex: 125, sizey: 25, tag: "log", sprite: ["log_right", 0], objName: "log7" });
    addGameObject({ x: 200, y: 150, sizex: 125, sizey: 25, tag: "log", sprite: ["log_right", 0], objName: "log8" });
    addGameObject({ x: 375, y: 150, sizex: 125, sizey: 25, tag: "log", sprite: ["log_right", 0], objName: "log9" });
    //
    addGameObject({ x: 25, y: 175, sizex: 75, sizey: 25, tag: "log", sprite: ["log_right", 0], objName: "log10" });
    addGameObject({ x: 200, y: 175, sizex: 75, sizey: 25, tag: "log", sprite: ["log_right", 0], objName: "log11" });
    addGameObject({ x: 375, y: 175, sizex: 75, sizey: 25, tag: "log", sprite: ["log_right", 0], objName: "log12" });
    //
    addGameObject({ x: 25, y: 200, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_right", 0], objName: "turtle4" });
    addGameObject({ x: 50, y: 200, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_right", 0], objName: "turtle42" });
    addGameObject({ x: 75, y: 200, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_right", 0], objName: "turtle43" });
    //
    addGameObject({ x: 200, y: 200, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_right", 0], objName: "turtle5" });
    addGameObject({ x: 225, y: 200, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_right", 0], objName: "turtle52" });
    addGameObject({ x: 250, y: 200, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_right", 0], objName: "turtle53" });
    //
    addGameObject({ x: 375, y: 200, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_right", 0], objName: "turtle6" });
    addGameObject({ x: 400, y: 200, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_right", 0], objName: "turtle62" });
    addGameObject({ x: 425, y: 200, sizex: 25, sizey: 25, tag: "turtly", sprite: ["turtlyanim_right", 0], objName: "turtle63" });
    //
    addGameObject({ x: (EntityEngine.canvas.width / 3), y: 400, sizex: 240, sizey: 25, tag: "timer", sprite: ["timer", 0], objName: "timer" });
    addGameObject({ x: 0, y: 400, sizex: 75, sizey: 25, tag: "playerlivebar", sprite: ["playerlives", 0], objName: "playerlivebar" });
    addGameObject({ x: -50, y: -50, sizex: 25, sizey: 25, tag: "scoreup", sprite: ["scoreup", 0], objName: "scoreup200" });
}

// used to load in all sprites and materials at the start of the game
function LoadSpriteData() {
    // Animated sprites:
    
    addSpriteTiles({ objTag: "player", list: [14], isMaterial: false, isAnimated: true });
    addSpriteTiles({ objTag: "turtlyanim_right", list: [15, 16, 15, 16], isMaterial: false, isAnimated: true });
    addSpriteTiles({ objTag: "turtlyanim_left", list: [17, 18, 17, 18], isMaterial: false, isAnimated: true });
    
    // Normal sprites:
    addSpriteTiles({ objTag: "water", start: 30, middle: [30], end: 30, isMaterial: false, isAnimated: false });
    //
    addSpriteTiles({ objTag: "turtly_bad", start: 1, middle: [1], end: 1, isMaterial: false, isAnimated: false });
    //
    addSpriteTiles({ objTag: "car_blue_left", start: 22, middle: [22], end: 22, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "truck", start: 27, middle: [26], end: 26, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "car_blue_right", start: 23, middle: [23], end: 23, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "car_purple_right", start: 24, middle: [24], end: 24, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "car_purple_left", start: 25, middle: [25], end: 25, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "truck2_right", start: 29, middle: [29], end: 29, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "truck2_left", start: 28, middle: [28], end: 28, isMaterial: false, isAnimated: false });
    //
    addSpriteTiles({ objTag: "log_right", start: 11, middle: [13], end: 12, isMaterial: false, isAnimated: false });
    //
    addSpriteTiles({ objTag: "score-event", start: 19, middle: [19], end: 19, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "score-disabled", start: 20, middle: [20], end: 20, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "safe-zone", start: 2, middle: [2], end: 2, isMaterial: false, isAnimated: false });
    //
    addSpriteTiles({ objTag: "bound", start: 3, middle: [5,4,7,3,5,4,7,5,4,7,5,4,7,3,5,4,7,1], end: 3, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "bound2", start: 4, middle: [3], end: 6, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "bound3", start: 8, middle: [4], end: 6, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "bound4", start: 8, middle: [3], end: 6, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "bound5", start: 8, middle: [4], end: 4, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "bound6", start: 3, middle: [5], end: 4, isMaterial: false, isAnimated: false });
    //
    addSpriteTiles({ objTag: "highway", start: 10, middle: [10], end: 10, isMaterial: false, isAnimated: false });
    //
    addSpriteTiles({ objTag: "scoreup", start: 21, middle: [21], end: 21, isMaterial: false, isAnimated: false });
    addSpriteTiles({ objTag: "playerlives", start: 14, middle: [14], end: 14, isMaterial: false, isAnimated: false });

    // Materials:

    //addSpriteTiles({ objTag: "water", materialColor: "#000080", isMaterial: true, isAnimated: false });
    addSpriteTiles({ objTag: "asphalt", materialColor: "#000000", isMaterial: true, isAnimated: false });
    addSpriteTiles({ objTag: "timer", materialColor: "#00FF00", isMaterial: true, isAnimated: false });
}

function RenderCustomData() {
    //TIME text:
    EntityEngine.renderer.font = `20px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText('TIME', ((EntityEngine.gameObjectStorage[gameObjectLookUp("timer")][0].x + EntityEngine.gameObjectStorage[gameObjectLookUp("timer")][0].sizex)), (EntityEngine.gameObjectStorage[gameObjectLookUp("timer")][0].y + 25));
    //Level up and score text:
    EntityEngine.renderer.font = `15px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText((GameLevel + "-UP"), 15, 25);
    EntityEngine.renderer.fillStyle = 'darkred';
    EntityEngine.renderer.fillText((_scoreText), 15, 45);
    //Hi-Score text:
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText('HI-SCORE', (EntityEngine.canvas.width - EntityEngine.renderer.measureText('HI-SCORE').width - 15), 25);
    EntityEngine.renderer.fillStyle = 'darkred';
    EntityEngine.renderer.fillText((_hiScore), (EntityEngine.canvas.width - EntityEngine.renderer.measureText(_hiScore).width - 15), 45);
}

//
//Create custom game functions here
//

function scoreTimer() {
    let objID = gameObjectLookUp("timer");
    EntityEngine.gameObjectStorage[objID][0].sizex = (EntityEngine.gameObjectStorage[objID][0].sizex - 6);
    EntityEngine.gameObjectStorage[objID][0].x = (EntityEngine.gameObjectStorage[objID][0].x + 6);
    if (EntityEngine.gameObjectStorage[objID][0].sizex == 0) {
        playerCollisionPenalty();
    }
    if (scoreUp.enabled == true)
    {
        scoreUp.uptime++;
    }
    if (scoreUp.uptime > 1)
    {
        scoreUp.enabled = false;
        scoreUp.uptime = 0;
        EntityEngine.gameObjectStorage[gameObjectLookUp("scoreup200")][0].x = -50;
        EntityEngine.gameObjectStorage[gameObjectLookUp("scoreup200")][0].y = -50;
    }
}

function scoreEvent(objData) {
    scoreIncrease(200);
    respawnPlayer();
    resetTimer();
    //
    scoreUp.enabled = true;
    //
    objData[0].tag = "bound";
    objData[0].sprite[0] = "score-disabled";
    goalPoints.current--;
    if (goalPoints.current == 0) {
        triggerNewLevel();
    }
}

function resetTimer() {
    EntityEngine.gameObjectStorage[gameObjectLookUp("timer")][0].sizex = 240;
    EntityEngine.gameObjectStorage[gameObjectLookUp("timer")][0].x = (EntityEngine.canvas.width / 3);
}

function respawnPlayer() {
    playerData.y = 375;
    playerData.x = 225;
}

function triggerNewLevel() {
    //renderObjects();
    clearInterval(EntityEngine.timer);
    scoreIncrease(2000);
    let objID = gameObjectLookUp("timer");
    let bonusscore = EntityEngine.gameObjectStorage[objID][0].sizex / 6;
    scoreIncrease(bonusscore*10);
    AwaitEngineExec(500);
    GameLevel++;
    respawnPlayer();
    playerData.remainingLives = 3;
    levelUpSpeedIncrease += 0.5;
    resetGoalPoints();
    EntityEngine.engineExecutionEnabled = false;
    EntityEngine.gameObjectStorage.length = 0;
    respawnPlayer();
    LoadGameObjects();
    ScoreTimer = window.setInterval(scoreTimer, 1000);
    EntityEngine.engineExecutionEnabled = true;
}

function resetGoalPoints() {
    goalPoints.current = goalPoints.default;
    let ID = gameObjectLookUp("score1");
    EntityEngine.gameObjectStorage[ID][0].tag = "score-event";
    EntityEngine.gameObjectStorage[ID][0].sprite[0] = "score-event";
    ID = gameObjectLookUp("score2");
    EntityEngine.gameObjectStorage[ID][0].tag = "score-event";
    EntityEngine.gameObjectStorage[ID][0].sprite[0] = "score-event";
    ID = gameObjectLookUp("score3");
    EntityEngine.gameObjectStorage[ID][0].tag = "score-event";
    EntityEngine.gameObjectStorage[ID][0].sprite[0] = "score-event";
    ID = gameObjectLookUp("score4");
    EntityEngine.gameObjectStorage[ID][0].tag = "score-event";
    EntityEngine.gameObjectStorage[ID][0].sprite[0] = "score-event";
    ID = gameObjectLookUp("score5");
    EntityEngine.gameObjectStorage[ID][0].tag = "score-event";
    EntityEngine.gameObjectStorage[ID][0].sprite[0] = "score-event";
}

function cycleObjAnim(step, axis, dir, objName) {
    step = step + levelUpSpeedIncrease;
    let objID = gameObjectLookUp(objName);
    objTranslate(step, axis, dir, objID);
    movePlayer(step, axis, dir, objID);
    if (axis == "x") {
        if (dir == "+") {
            if (EntityEngine.gameObjectStorage[objID][0].x > EntityEngine.canvas.width) {
                EntityEngine.gameObjectStorage[objID][0].x = (0 - EntityEngine.gameObjectStorage[objID][0].sizex);
            }
        }
        else if (dir == "-") {
            if (EntityEngine.gameObjectStorage[objID][0].x < (0 - EntityEngine.gameObjectStorage[objID][0].sizex)) {
                EntityEngine.gameObjectStorage[objID][0].x = (EntityEngine.canvas.width + 1);
            }
        }
    }
    else if (axis == "y") {
        if (dir == "+") {
            if (EntityEngine.gameObjectStorage[objID][0].y < (0 - EntityEngine.gameObjectStorage[objID][0].sizey)) {
                EntityEngine.gameObjectStorage[objID][0].y = (EntityEngine.canvas.height + 1);
            }
        }
        else if (dir == "-") {
            if (EntityEngine.gameObjectStorage[objID][0].y > EntityEngine.canvas.height) {
                EntityEngine.gameObjectStorage[objID][0].y = (0 - EntityEngine.gameObjectStorage[objID][0].sizey);
            }
        }
    }
}

var _moveEnabled = true;
function movePlayer(step, axis, dir, objID) {
    if (obstacleCollisionOverride_Single([playerData.x, playerData.y], objID) == true) {
        if (_moveEnabled == true) {
            _moveEnabled = false;
            if (axis == "x") {
                if (dir == "+") {
                    playerData.x += step;
                }
                else if (dir == "-") {
                    playerData.x -= step;
                }
            }
            else if (axis == "y") {
                if (dir == "+") {
                    playerData.y -= step;
                }
                else if (dir == "-") {
                    playerData.y += step;
                }
            }
            if (BoundCheck([playerData.x, playerData.y]) == true) {
                playerCollisionPenalty();
            }
        }
    }
}

function StartGameScreen() {
    EntityEngine.engineExecutionEnabled = false;
    EntityEngine.renderer.beginPath();
    EntityEngine.renderer.rect(0, 0, EntityEngine.canvas.width, EntityEngine.canvas.height);
    EntityEngine.renderer.fillStyle = "#000000";
    EntityEngine.renderer.fill();
    EntityEngine.renderer.closePath();
    //
    EntityEngine.renderer.font = `30px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'green';
    EntityEngine.renderer.fillText('FROGGER', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('FROGGER').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) - 50));
    EntityEngine.renderer.font = `8px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText('Get the frog from the highway to the lilypads.', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('Get the frog from the highway to the lillypads.').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2)));
    EntityEngine.renderer.fillStyle = 'darkred';
    EntityEngine.renderer.fillText('Use WASD to move.', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('Use WASD to move.').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) + 30));
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText('Avoid obstacles.', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('Avoid obstacles.').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) + 50));
    //
}

function endGameCollapse() {
    //renderObjects();
    clearInterval(ScoreTimer);
    AwaitEngineExec(1500);
    EntityEngine.engineExecutionEnabled = false;
    EntityEngine.renderer.clearRect(0, 0, EntityEngine.canvas.width, EntityEngine.canvas.height);
    EntityEngine.renderer.beginPath();
    EntityEngine.renderer.rect(0, 0, EntityEngine.canvas.width, EntityEngine.canvas.height);
    EntityEngine.renderer.fillStyle = "#000000";
    EntityEngine.renderer.fill();
    EntityEngine.renderer.closePath();
    //
    EntityEngine.renderer.font = `30px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText('GAME OVER', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('GAME OVER').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2)));
    //
    EntityEngine.renderer.font = `10px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText('Press [any] key to restart.', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('Press [any] key to restart.').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) + 50));
    //
    _hiScore = _scoreText;
    try {
        sessionStorage.setItem("_hiScore", _hiScore.toString());
    }
    catch {
        // Fixes a bug that occurs on overly secure web-browsers (looking at you Brave)
        // where sessionStorage access may be denied to scripts for no apparent reason.
    }
    endGameState = true;
}

function resetGame() {
    //variable resets:
    GameLevel = 0;
    resetGoalPoints();
    respawnPlayer();
    playerData.remainingLives = 3;
    EntityEngine.gameObjectStorage.length = 0;
    EntityEngine.spriteTiles.length = 0;
    levelUpSpeedIncrease = 0;
    _score = 0;
    _moveEnabled = true;
    startGameState = true;
    //
    //AwaitEngineExec(3500);
    Initialize();
}