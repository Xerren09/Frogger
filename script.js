var goalPoints = { current: 5, default: 5 };
var ScoreTimer = undefined;
var GameLevel = 0;
const gameFont = 'Press Start 2P';
var startGameState = true;
var endGameState = false;
var levelUpSpeedIncrease = 0;
var _score = 0;
var _hiScore = "";
var _scoreText = "00000";
var scoreUp = {
    uptime: 0,
    enabled: false
};
var _obstacles = [
    "turtly_bad", //intentionally misspelled, it's cuter this way
    "car1",
    "car2",
    "car3",
    "car4",
    "water"
];
var _overrides = [
    "EntityEngine_Boundary",
    "log",
    "turtly",
    "score-event",
    "safe-zone"
];
var playerdeath = {
    active: false,
    uptime: 0
}
var turtleData = {
    enabled: false,
    countTilEn: 0,
    groupID: 0,
    time: 0,
    animTag: "turtly_bad_event",
    badTag: "turtly_bad",
    goodTag: "turtly",
    turtleObjectNames: {
        one: ["turtle4", "turtle42", "turtle43"],
        two: ["turtle2", "turtle22"]
    },
}

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
    // does not work on most chromium based browsers
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
    cycleObjAnim(1.7, 0, "log1");
    cycleObjAnim(1.7, 0, "log2");
    cycleObjAnim(1.7, 0, "log3");
    // top row turtles
    cycleObjAnim(-1, 0, "turtle1");
    cycleObjAnim(-1, 0, "turtle12");
    cycleObjAnim(-1, 0, "turtle2");
    cycleObjAnim(-1, 0, "turtle22");
    cycleObjAnim(-1, 0, "turtle3");
    cycleObjAnim(-1, 0, "turtle32");
    // top second row logs
    cycleObjAnim(1, 0, "log7");
    cycleObjAnim(1, 0, "log8");
    cycleObjAnim(1, 0, "log9");
    // top third row logs
    cycleObjAnim(-1.8, 0, "log10");
    cycleObjAnim(-1.8, 0, "log11");
    cycleObjAnim(-1.8, 0, "log12");
    // bottom turtles
    cycleObjAnim(1.3, 0, "turtle4");
    cycleObjAnim(1.3, 0, "turtle42");
    cycleObjAnim(1.3, 0, "turtle43");
    cycleObjAnim(1.3, 0, "turtle5");
    cycleObjAnim(1.3, 0, "turtle52");
    cycleObjAnim(1.3, 0, "turtle53");
    cycleObjAnim(1.3, 0, "turtle6");
    cycleObjAnim(1.3, 0, "turtle62");
    cycleObjAnim(1.3, 0, "turtle63");
    // cars:
    cycleObjAnim(-1, 0, "truck1");
    cycleObjAnim(-1, 0, "truck12");
    cycleObjAnim(-1, 0, "truck13");
    //
    cycleObjAnim(0.7, 0, "bcar_right1");
    cycleObjAnim(0.7, 0, "bcar_right12");
    cycleObjAnim(0.7, 0, "bcar_right13");
    cycleObjAnim(0.7, 0, "bcar_right14");
    //
    cycleObjAnim(-1.3, 0, "pcar_left1");
    cycleObjAnim(-1.3, 0, "pcar_left12");
    cycleObjAnim(-1.3, 0, "pcar_left13");
    //
    cycleObjAnim(1, 0, "truck2");
    cycleObjAnim(1, 0, "truck21");
    //
    cycleObjAnim(1.1, 0, "bcar_right2");
    cycleObjAnim(1.1, 0, "bcar_right21");
    cycleObjAnim(1.1, 0, "bcar_right22");
    //
    if (scoreUp.enabled == true) {
        EntityEngine.gameObject[EntityEngine.FindGameObject("scoreup200")].x = playerData.x;
        EntityEngine.gameObject[EntityEngine.FindGameObject("scoreup200")].y = playerData.y - 25;
    }
    //
    TurtleChangeEvent(true);
    //
    _moveEnabled = true;
    collisionEventHandler({ x: playerData.x + 10, y: playerData.y, width: playerData.width - 20, height: playerData.height });
}

function playerCollisionPenalty() {
    EntityEngine.engineExecutionEnabled = false;
    playerData.spriteIndex = 31;
    playerdeath.active = true;
    playerData.remainingLives = playerData.remainingLives - 1;
    EntityEngine.gameObject[EntityEngine.FindGameObject("playerlivebar")].width = playerData.remainingLives * EntityEngine.spriteSheet.tileSize;
    //renderPlayer();
    EntityGraphics.RenderPlayer();
    if (playerData.remainingLives <= 0) {
        endGameCollapse();
    }
}

// used to load in all gameobject at the start of the game
function LoadGameObjects() {
    //
    EntityEngine.CreateGameObject(0, 0, EntityEngine.canvas.width, EntityEngine.canvas.height, "asphalt", "asphalt", "asphalt1");
    EntityEngine.CreateGameObject(0, 250, EntityEngine.canvas.width, 125, "asphalt", "highway", "asphalt");
    EntityEngine.CreateGameObject(0, 400, EntityEngine.canvas.width, 25, "EntityEngine_Boundary", "asphalt", "bound-bottomarea");
    //
    EntityEngine.CreateGameObject(0, 50, EntityEngine.canvas.width, 200, "water", "water", "water1");
    EntityEngine.CreateGameObject(0, 375, EntityEngine.canvas.width, 25, "safe-zone", "safe-zone", "safezone-bottom");
    EntityEngine.CreateGameObject(0, 225, EntityEngine.canvas.width, 25, "safe-zone", "safe-zone", "safezone-top");
    //
    EntityEngine.CreateGameObject(0, 50, EntityEngine.canvas.width, 25, "EntityEngine_Boundary", "bound", "bound-top");
    EntityEngine.CreateGameObject(0, 75, 50, 25, "EntityEngine_Boundary", "bound2", "bound-top2");
    EntityEngine.CreateGameObject(75, 75, 75, 25, "EntityEngine_Boundary", "bound3", "bound-top3");
    EntityEngine.CreateGameObject(175, 75, 50, 25, "EntityEngine_Boundary", "bound4", "bound-top4");
    EntityEngine.CreateGameObject(250, 75, 50, 25, "EntityEngine_Boundary", "bound4", "bound-top5");
    EntityEngine.CreateGameObject(325, 75, 75, 25, "EntityEngine_Boundary", "bound3", "bound-top6");
    EntityEngine.CreateGameObject(425, 75, 50, 25, "EntityEngine_Boundary", "bound5", "bound-top7");
    //
    EntityEngine.CreateGameObject(50, 75, 25, 25, "score-event", "score-event", "score1");
    EntityEngine.CreateGameObject(150, 75, 25, 25, "score-event", "score-event", "score2");
    EntityEngine.CreateGameObject(225, 75, 25, 25, "score-event", "score-event", "score3");
    EntityEngine.CreateGameObject(300, 75, 25, 25, "score-event", "score-event", "score4");
    EntityEngine.CreateGameObject(400, 75, 25, 25, "score-event", "score-event", "score5");
    //
    EntityEngine.CreateGameObject(50, 250, 50, 25, "car1", "truck", "truck1");
    EntityEngine.CreateGameObject(250, 250, 50, 25, "car1", "truck", "truck12");
    EntityEngine.CreateGameObject(400, 250, 50, 25, "car1", "truck", "truck13");
    //
    EntityEngine.CreateGameObject(25, 275, 25, 25, "car1", "car_blue_right", "bcar_right1");
    EntityEngine.CreateGameObject(150, 275, 25, 25, "car1", "car_purple_right", "bcar_right12");
    EntityEngine.CreateGameObject(250, 275, 25, 25, "car1", "car_blue_right", "bcar_right13");
    EntityEngine.CreateGameObject(390, 275, 25, 25, "car1", "truck2_right", "bcar_right14");
    //
    EntityEngine.CreateGameObject(50, 300, 25, 25, "car1", "car_purple_left", "pcar_left1");
    EntityEngine.CreateGameObject(250, 300, 25, 25, "car1", "truck2_left", "pcar_left12");
    EntityEngine.CreateGameObject(400, 300, 25, 25, "car1", "car_blue_left", "pcar_left13");
    //
    EntityEngine.CreateGameObject(50, 325, 25, 25, "car1", "truck2_right", "truck2");
    EntityEngine.CreateGameObject(360, 325, 25, 25, "car1", "truck2_right", "truck21");
    //
    EntityEngine.CreateGameObject(50, 350, 25, 25, "car1", "car_blue_right", "bcar_right2");
    EntityEngine.CreateGameObject(275, 350, 25, 25, "car1", "car_purple_right", "bcar_right21");
    EntityEngine.CreateGameObject(400, 350, 25, 25, "car1", "truck2_right", "bcar_right22");
    //
    EntityEngine.CreateGameObject(25, 100, 100, 25, "log", "log_right", "log1");
    EntityEngine.CreateGameObject(200, 100, 100, 25, "log", "log_right", "log2");
    EntityEngine.CreateGameObject(375, 100, 100, 25, "log", "log_right", "log3");
    //
    EntityEngine.CreateGameObject(25, 125, 25, 25, "turtly", "turtlyanim_left", "turtle1");
    EntityEngine.CreateGameObject(50, 125, 25, 25, "turtly", "turtlyanim_left", "turtle12");
    //
    EntityEngine.CreateGameObject(200, 125, 25, 25, "turtly", "turtlyanim_left", "turtle2");
    EntityEngine.CreateGameObject(225, 125, 25, 25, "turtly", "turtlyanim_left", "turtle22");
    //
    EntityEngine.CreateGameObject(375, 125, 25, 25, "turtly", "turtlyanim_left", "turtle3");
    EntityEngine.CreateGameObject(400, 125, 25, 25, "turtly", "turtlyanim_left", "turtle32");
    //
    EntityEngine.CreateGameObject(25, 150, 125, 25, "log", "log_right", "log7");
    EntityEngine.CreateGameObject(200, 150, 125, 25, "log", "log_right", "log8");
    EntityEngine.CreateGameObject(375, 150, 125, 25, "log", "log_right", "log9");
    //
    EntityEngine.CreateGameObject(25, 175, 75, 25, "log", "log_right", "log10");
    EntityEngine.CreateGameObject(200, 175, 75, 25, "log", "log_right", "log11");
    EntityEngine.CreateGameObject(375, 175, 75, 25, "log", "log_right", "log12");
    //
    EntityEngine.CreateGameObject(25, 200, 25, 25, "turtly", "turtlyanim_right", "turtle4");
    EntityEngine.CreateGameObject(50, 200, 25, 25, "turtly", "turtlyanim_right", "turtle42");
    EntityEngine.CreateGameObject(75, 200, 25, 25, "turtly", "turtlyanim_right", "turtle43");
    //
    EntityEngine.CreateGameObject(200, 200, 25, 25, "turtly", "turtlyanim_right", "turtle5");
    EntityEngine.CreateGameObject(225, 200, 25, 25, "turtly", "turtlyanim_right", "turtle52");
    EntityEngine.CreateGameObject(250, 200, 25, 25, "turtly", "turtlyanim_right", "turtle53");
    //
    EntityEngine.CreateGameObject(375, 200, 25, 25, "turtly", "turtlyanim_right", "turtle6");
    EntityEngine.CreateGameObject(400, 200, 25, 25, "turtly", "turtlyanim_right", "turtle62");
    EntityEngine.CreateGameObject(425, 200, 25, 25, "turtly", "turtlyanim_right", "turtle63");
    //
    EntityEngine.CreateGameObject((EntityEngine.canvas.width / 3), 400, 240, 25, "timer", "timer", "timer");
    EntityEngine.CreateGameObject(0, 400, 75, 25, "playerlivebar", "playerlives", "playerlivebar");
    EntityEngine.CreateGameObject(-50, -50, 25, 25, "scoreup", "scoreup", "scoreup200");
}

// used to load in all sprites and materials at the start of the game
function LoadSpriteData() {
    // Animated sprites:
    EntityEngine.CreateSpriteMap({ objTag: "player", list: [1], isMaterial: false, isAnimated: true });
    EntityEngine.CreateSpriteMap({ objTag: "turtlyanim_right", list: [15, 16, 15, 16], isMaterial: false, isAnimated: true });
    EntityEngine.CreateSpriteMap({ objTag: "turtlyanim_left", list: [17, 18, 17, 18], isMaterial: false, isAnimated: true });
    EntityEngine.CreateSpriteMap({ objTag: "turtly_bad_right", list: [32, 33, 34, 35, 36, 35, 34, 33, 32, 15], isMaterial: false, isAnimated: true });
    EntityEngine.CreateSpriteMap({ objTag: "turtly_bad_left", list: [37, 38, 39, 40, 41, 40, 39, 38, 37, 18], isMaterial: false, isAnimated: true });

    // Normal sprites:
    EntityEngine.CreateSpriteMap({ objTag: "water", start: 30, middle: [30], end: 30, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "turtly_bad_event_right", start: 42, middle: [42], end: 42, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "turtly_bad_event_left", start: 43, middle: [43], end: 43, isMaterial: false, isAnimated: false });
    //
    EntityEngine.CreateSpriteMap({ objTag: "car_blue_left", start: 22, middle: [22], end: 22, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "truck", start: 27, middle: [26], end: 26, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "car_blue_right", start: 23, middle: [23], end: 23, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "car_purple_right", start: 24, middle: [24], end: 24, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "car_purple_left", start: 25, middle: [25], end: 25, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "truck2_right", start: 29, middle: [29], end: 29, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "truck2_left", start: 28, middle: [28], end: 28, isMaterial: false, isAnimated: false });
    //
    EntityEngine.CreateSpriteMap({ objTag: "log_right", start: 11, middle: [13], end: 12, isMaterial: false, isAnimated: false });
    //
    EntityEngine.CreateSpriteMap({ objTag: "score-event", start: 19, middle: [19], end: 19, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "score-disabled", start: 20, middle: [20], end: 20, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "safe-zone", start: 2, middle: [2], end: 2, isMaterial: false, isAnimated: false });
    //
    EntityEngine.CreateSpriteMap({ objTag: "bound", start: 3, middle: [5, 4, 7, 3, 5, 4, 7, 5, 4, 7, 5, 4, 7, 3, 5, 4, 7, 3], end: 3, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "bound2", start: 4, middle: [3], end: 6, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "bound3", start: 8, middle: [4], end: 6, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "bound4", start: 8, middle: [3], end: 6, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "bound5", start: 8, middle: [4], end: 4, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "bound6", start: 3, middle: [5], end: 4, isMaterial: false, isAnimated: false });
    //
    EntityEngine.CreateSpriteMap({ objTag: "highway", start: 10, middle: [10], end: 10, isMaterial: false, isAnimated: false });
    //
    EntityEngine.CreateSpriteMap({ objTag: "scoreup", start: 21, middle: [21], end: 21, isMaterial: false, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "playerlives", start: 14, middle: [14], end: 14, isMaterial: false, isAnimated: false });

    // Materials:

    //EntityEngine.CreateSpriteMap({ objTag: "water", materialColor: "#000080", isMaterial: true, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "asphalt", materialColor: "#000000", isMaterial: true, isAnimated: false });
    EntityEngine.CreateSpriteMap({ objTag: "timer", materialColor: "#00FF00", isMaterial: true, isAnimated: false });
}

function RenderCustomData() {
    //TIME text:
    EntityEngine.renderer.font = `20px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText('TIME', ((EntityEngine.gameObject[EntityEngine.FindGameObject("timer")].x + EntityEngine.gameObject[EntityEngine.FindGameObject("timer")].width)), (EntityEngine.gameObject[EntityEngine.FindGameObject("timer")].y + 25));
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

function TurtleChangeEvent(isFromUpdate = false) {
    if (turtleData.enabled == false && isFromUpdate != true) {
        turtleData.enabled = true;
        turtleData.countTilEn++;
        turtleData.time = Math.floor(Math.random() * (20 - 5)) + 5;
        turtleData.groupID = Math.floor(Math.random() * 2) + 1;
    }
    else if (turtleData.enabled == true && isFromUpdate != true) {
        turtleData.countTilEn++;
        if (turtleData.countTilEn == turtleData.time) {
            if (turtleData.groupID == 1) {
                turtleData.turtleObjectNames.one.forEach(element => {
                    let objID = EntityEngine.FindGameObject(element);
                    EntityEngine.gameObject[objID].sprite.name = "turtly_bad_right";
                    EntityEngine.gameObject[objID].sprite.index = 0;
                    EntityEngine.gameObject[objID].tag = turtleData.badTag;
                });
            }
            else if (turtleData.groupID == 2) {
                turtleData.turtleObjectNames.two.forEach(element => {
                    let objID = EntityEngine.FindGameObject(element);
                    EntityEngine.gameObject[objID].sprite.name = "turtly_bad_left";
                    EntityEngine.gameObject[objID].sprite.index = 0;
                    EntityEngine.gameObject[objID].tag = turtleData.badTag;
                });
            }
        }
    }
    if (turtleData.countTilEn == (turtleData.time - 1)) {
        if (turtleData.groupID == 1) {
            turtleData.turtleObjectNames.one.forEach(element => {
                let objID = EntityEngine.FindGameObject(element);
                EntityEngine.gameObject[objID].sprite.name = "turtly_bad_event_right";
                EntityEngine.gameObject[objID].sprite.index = 0;
                EntityEngine.gameObject[objID].tag = turtleData.goodTag;
            });
        }
        else if (turtleData.groupID == 2) {
            turtleData.turtleObjectNames.two.forEach(element => {
                let objID = EntityEngine.FindGameObject(element);
                EntityEngine.gameObject[objID].sprite.name = "turtly_bad_event_left";
                EntityEngine.gameObject[objID].sprite.index = 0;
                EntityEngine.gameObject[objID].tag = turtleData.goodTag;
            });
        }
    }
    if (((EntityEngine.gameObject[EntityEngine.FindGameObject("turtle4")].sprite.index == 9) || (EntityEngine.gameObject[EntityEngine.FindGameObject("turtle2")].sprite.index == 9)) && turtleData.enabled == true && isFromUpdate == true) {
        turtleData.enabled = false;
        turtleData.countTilEn = 0;
        if (turtleData.groupID == 1) {
            turtleData.turtleObjectNames.one.forEach(element => {
                let objID = EntityEngine.FindGameObject(element);
                EntityEngine.gameObject[objID].sprite.name = "turtlyanim_right";
                EntityEngine.gameObject[objID].sprite.index = 0;
                EntityEngine.gameObject[objID].tag = turtleData.goodTag;
            });
        }
        else if (turtleData.groupID == 2) {
            turtleData.turtleObjectNames.two.forEach(element => {
                let objID = EntityEngine.FindGameObject(element);
                EntityEngine.gameObject[objID].sprite.name = "turtlyanim_left";
                EntityEngine.gameObject[objID].sprite.index = 0;
                EntityEngine.gameObject[objID].tag = turtleData.goodTag;
            });
        }
        turtleData.groupID = 0;
    }
}

function scoreTimer() {
    let objID = EntityEngine.FindGameObject("timer");
    if (EntityEngine.gameObject[objID].width == 0) {
        playerCollisionPenalty();
        resetTimer();
    }
    else {
        EntityEngine.gameObject[objID].width -= 6;
        EntityEngine.gameObject[objID].x += 6;
    }
    //
    if (scoreUp.enabled == true) {
        scoreUp.uptime++;
        if (scoreUp.uptime > 1) {
            scoreUp.enabled = false;
            scoreUp.uptime = 0;
            EntityEngine.gameObject[EntityEngine.FindGameObject("scoreup200")].x = -50;
            EntityEngine.gameObject[EntityEngine.FindGameObject("scoreup200")].y = -50;
        }
    }
    if (playerdeath.active == true) {
        playerdeath.uptime++;
        playerData.spriteIndex = 31;
        if (playerdeath.uptime > 1) {
            respawnPlayer();
            resetTimer();
            playerdeath.active = false;
            playerdeath.uptime = 0;
            playerData.spriteIndex = 14;
            EntityEngine.engineExecutionEnabled = true;
        }
    }
    TurtleChangeEvent();
}

// Handles scoring and displaying the score
function scoreIncrease(scoreUp) {
    _score += scoreUp;
    if (_score <= 99999) {
        let scr = "00000";
        _scoreText = scr.substring(0, (scr.length - _score.toString().length)) + _score.toString();
    }
}

function scoreEvent(objData) {
    scoreIncrease(200);
    respawnPlayer();
    resetTimer();
    scoreUp.enabled = true;
    objData.tag = "EntityEngine_Boundary";
    objData.sprite.name = "score-disabled";
    goalPoints.current--;
    if (goalPoints.current == 0) {
        triggerNewLevel();
    }
}

function resetTimer() {
    scoreIncrease(((EntityEngine.gameObject[EntityEngine.FindGameObject("timer")].width / 6) * 10));
    EntityEngine.gameObject[EntityEngine.FindGameObject("timer")].width = 240;
    EntityEngine.gameObject[EntityEngine.FindGameObject("timer")].x = (EntityEngine.canvas.width / 3);
}

function respawnPlayer() {
    playerData.y = 375;
    playerData.x = 225;
}

function triggerNewLevel() {
    clearInterval(ScoreTimer);
    scoreIncrease(((EntityEngine.gameObject[EntityEngine.FindGameObject("timer")].width / 6) * 10) + 2000);
    EntityEngine.WaitForSeconds(500);
    GameLevel++;
    respawnPlayer();
    playerData.remainingLives = 3;
    levelUpSpeedIncrease += 0.25;
    resetGoalPoints();
    EntityEngine.gameObject.length = 0;
    respawnPlayer();
    LoadGameObjects();
    ScoreTimer = window.setInterval(scoreTimer, 1000);
}

function resetGoalPoints() {
    goalPoints.current = goalPoints.default;
    var scorenames = ["score1", "score2", "score3", "score4", "score5"];
    for (const element of scorenames) {
        let ID = EntityEngine.FindGameObject(element);
        EntityEngine.gameObject[ID].tag = "score-event";
        EntityEngine.gameObject[ID].sprite[0] = "score-event";
    }
}

function cycleObjAnim(translateX, translateY, objName) {
    translateX = translateX * (1+levelUpSpeedIncrease);
    EntityEngine.TranslateObj(translateX, translateY, objName);
    movePlayer(translateX, translateY, objName);
    let objID = EntityEngine.FindGameObject(objName);
    if ((EntityEngine.gameObject[objID].x > EntityEngine.canvas.width) && (translateX > 0)) {
        EntityEngine.gameObject[objID].x = (0 - EntityEngine.gameObject[objID].width);
    }
    if (EntityEngine.gameObject[objID].x < (0 - EntityEngine.gameObject[objID].width) && (translateX < 0)) {
        EntityEngine.gameObject[objID].x = (EntityEngine.canvas.width + 1);
    }
}

var _moveEnabled = true;
function movePlayer(translateX, translateY, objName) {
    if (ObstacleCollisionOverride(playerData, objName) == true) {
        if (_moveEnabled == true) {
            //
            playerData.x += translateX;
            playerData.y += translateY;
            //
            _moveEnabled = false;
            if (EntityEngine.CollisionBound(playerData) == true) {
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
    EntityEngine.renderer.font = `40px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'green';
    EntityEngine.renderer.fillText('FROGGER', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('FROGGER').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) - 50));
    EntityEngine.renderer.font = `9px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText('Get the frog from the highway to the lilypads.', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('Get the frog from the highway to the lillypads.').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2)));
    //
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText('Avoid obstacles.', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('Avoid obstacles.').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) + 20));
    //
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText('- Point Table -', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('- Point Table -').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) + 50));
    //
    EntityEngine.renderer.fillStyle = 'yellow';
    EntityEngine.renderer.fillText('10PTS for every step', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('0PTS for every step').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) + 75));
    //
    EntityEngine.renderer.fillStyle = 'yellow';
    EntityEngine.renderer.fillText('200PTS for every frog at safety', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('200PTS for every frog at safety').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) + 100));
    //
    EntityEngine.renderer.fillStyle = 'yellow';
    EntityEngine.renderer.fillText('Plus Bonus - 10PTS X seconds remaining', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('Plus Bonus - 10PTS X seconds remaining').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) + 125));
    //
    EntityEngine.renderer.font = `12px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'darkred';
    EntityEngine.renderer.fillText('Use WASD to move.', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('Use WASD to move.').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) + 175));
    //
}

function endGameCollapse() {
    playerData.spriteIndex = 31;
    EntityGraphics.RenderPlayer();
    clearInterval(ScoreTimer);
    _hiScore = _scoreText;
    //
    EntityEngine.WaitForSeconds(1500);
    //
    EntityEngine.engineExecutionEnabled = false;
    EntityEngine.renderer.clearRect(0, 0, EntityEngine.canvas.width, EntityEngine.canvas.height);
    EntityEngine.renderer.beginPath();
    EntityEngine.renderer.rect(0, 0, EntityEngine.canvas.width, EntityEngine.canvas.height);
    EntityEngine.renderer.fillStyle = "#000000";
    EntityEngine.renderer.fill();
    EntityEngine.renderer.closePath();
    //
    EntityEngine.renderer.font = `30px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'darkred';
    EntityEngine.renderer.fillText('GAME OVER', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('GAME OVER').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2)));
    //
    EntityEngine.renderer.font = `10px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText('Press [any] key to restart.', ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText('Press [any] key to restart.').width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) + 50));
    //
    EntityEngine.renderer.font = `10px "${gameFont}"`;
    EntityEngine.renderer.fillStyle = 'white';
    EntityEngine.renderer.fillText(('Score: ' + _scoreText), ((EntityEngine.canvas.width / 2) - (EntityEngine.renderer.measureText(('Score: ' + _scoreText)).width / 2)), (EntityEngine.canvas.height / 2 - (EntityEngine.renderer.measureText('M').width / 2) + 15));
    //
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
    resetGoalPoints();
    respawnPlayer();
    GameLevel = 0;
    playerData.remainingLives = 3;
    EntityEngine.gameObject.length = 0;
    EntityEngine.sprites.length = 0;
    levelUpSpeedIncrease = 0;
    _score = 0;
    _scoreText = "00000"
    _moveEnabled = true;
    startGameState = true;
    endGameState = false;
    //
    playerdeath.active = false;
    playerdeath.uptime = 0;
    playerData.spriteIndex = 14;
    //
    EntityEngine.engineExecutionEnabled = true;
    Initialize();
}

//--------------------------------------------------------------------------------------------------------------------
// Handles all the collision checks; if there was a collision returns false, otherwise true
function collisionEventHandler(Obj) {
    let collision = false;
    let score = false;
    let scoreObj = undefined;
    let override = false;
    //
    let CollisionList = EntityEngine.Collision(Obj);
    //
    CollisionList.gameObjects.forEach(element => {
        _overrides.forEach(element_o => {
            if (element_o == element.tag) {
                override = true;
            }
        })
        if (override == false) {
            for (const element_o of _obstacles) {
                if (element_o == element.tag) {
                    collision = true;
                    break;
                }
            }
        }
        else if (element.tag == "score-event") {
            score = true;
            scoreObj = element;
        }
    })
    //
    if (override == true) {
        collision = false;
        if (score == true) {
            scoreEvent(scoreObj);
        }
    }
    else if (collision == true) {
        playerCollisionPenalty();
    }
    if (EntityEngine.CollisionBound(Obj) == true) { collision = true; }
    //
    if (collision == true) { return true } else { return false }
}

// An override for the collision system for when objects are overlapping
function ObstacleCollisionOverride(pos, objectName = "NoObjectNameSpecified") {
    let override = false;
    for (const element of EntityEngine.gameObject) {
        if (element.objName == objectName && element.x < pos.x + pos.width && element.x + element.width > pos.x && element.y < pos.y + pos.height && element.y + element.height > pos.y) {
            for (const element_o of _overrides) {
                if (element_o == element.tag) {
                    override = true;
                    break;
                }
            }
        }
    }
    //
    if (override == true) { return true } else { return false }
}

// Handles player movement. Calls collisionEventHandler to check against collisions to ensure player steps are valid
window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return;
    }
    let newV = 0;
    if (EntityEngine.engineExecutionEnabled == true) {
        switch (event.code) {
            case "KeyW":
                newV = (playerData.y - playerData.step);
                let posCheck = playerData.x;
                if (collisionEventHandler({ x: playerData.x + 10, y: newV, width: playerData.width - 20, height: playerData.height }) == false) {
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
                if (collisionEventHandler({ x: playerData.x + 10, y: newV, width: playerData.width - 20, height: playerData.height }) == false) {
                    playerData.y = newV;
                }
                break;
            case "KeyA":
                newV = (playerData.x - playerData.step);
                if (collisionEventHandler({ x: newV + 10, y: playerData.y, width: playerData.width - 20, height: playerData.height }) == false) {
                    playerData.x = newV;
                }
                break;
            case "KeyD":
                newV = (playerData.x + playerData.step);
                if (collisionEventHandler({ x: newV + 10, y: playerData.y, width: playerData.width - 20, height: playerData.height }) == false) {
                    playerData.x = newV;
                }
                break;
        }
    }
    else if (startGameState == true) {
        startGameState = false;
        EntityEngine.engineExecutionEnabled = true;
        ScoreTimer = window.setInterval(scoreTimer, 1000);
    }
    else if (endGameState == true) {
        resetGame();
    }
    event.preventDefault();
}, true);