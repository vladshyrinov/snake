import Snake from "./models/Snake.js";
import GameBoard from "./models/GameBoard.js";
import Food from "./models/Food.js";
import { Direction } from "./enums/Direction.js";
import { FoodType } from "./enums/FoodType.js";
import { FoodBonus } from "./models/FoodBonus.js";
import { BonusType } from "./enums/BonusType.js";
import { SoundType } from "./enums/SoundType.js";
import { SoundFileName } from "./models/SoundFIleName.js";
import { swipeEvent } from "./helpers/swipeEvent.js";
import { keyDownEvent } from "./helpers/keyDownEvent.js";
import { getParam, saveParam, preloadImages, isIOS } from './utils.js'
import { GameOverMessage } from "./enums/GameOverMessage.js";
import { GameControlType } from "./enums/GameControlType.js";

/** GLOBAL VARIABLES DECLARATION BLOCK  */

// initialization of let variables is located in initializeGameVariables function except saved in the storage
let snake;
let addBonusFoodTimeoutId;
let moveSnakeTimeoutId;
let points;
let gameOver;
let snakeMoveInterval;
let isKeyAlreadyPressedInCycle; // variable to prevent changing direction twice per one movement cycle
let size; // size (width and height) of elements are equal to step of the snake
let isSoundOn = getParam("isSoundOn") !== null ? getParam("isSoundOn") : true;
let bestScore = getParam("bestScore") ? getParam("bestScore") : 0;

// game constants
const initialSnakeCellsAmount = 3;
const maxSnakeMoveInterval = 150;
const bonusFoodCreationInterval = 10000;
const minSwipeThreshold = 20;
const foodList = []; // apples food list 
const bonusFoodList = []; // other food list
const gameBoard = new GameBoard("game-board");
const pointsDomElem = document.querySelector(".points");
const bestScoreDomElem = document.querySelector(".best-score");
const gameOverDomElem = document.querySelector(".game-over");
const gameOverMessageDomElem = document.querySelector(".game-over-message");
const gameControlDomElems = {
    [GameControlType.START]: document.getElementById("start-button"),
    [GameControlType.PAUSE]: document.getElementById("pause-button"),
    [GameControlType.CONTINUE]: document.getElementById("continue-button")
};
const soundTogglerDomElem = document.getElementById("sound-toggler");

/** GLOBAL VARIABLES DECLARATION BLOCK END */


/** FOOD AND BONUSES MANAGEMENT BLOCK */

const isFoodEaten = (food) => {
    if (snake && food) {
        switch(snake.direction) {
            case Direction.RIGHT:
                return snake.head.X + snake.step === food.X && snake.head.Y === food.Y;
            case Direction.LEFT:
                return snake.head.X - snake.step === food.X && snake.head.Y === food.Y;
            case Direction.UP:
                return snake.head.X === food.X && snake.head.Y - snake.step === food.Y;
            case Direction.DOWN:
                return snake.head.X === food.X && snake.head.Y + snake.step === food.Y;
            default:
                return false;
        }
    }

    return false;
}

const isFruitEaten = food => [FoodType.APPLE, FoodType.PEAR, FoodType.GRAPES].includes(food);

const isGameBoardCellOccupied = (X, Y) => {
    let snakeCell = snake.head;

    // check for the area around the snake head not to add food there
    if (Math.abs(X - snakeCell.X) <= snakeCell.width && Math.abs(Y - snakeCell.Y) <= snakeCell.height) {
        return true;
    }

    if (foodList.length && foodList[0].X === X && foodList[0].Y === Y) {
        return true;
    }

    if (bonusFoodList.length && bonusFoodList[0].X === X && bonusFoodList[0].Y === Y) {
        return true;
    }

    // check for the snake area
    while (snakeCell !== null) {
        if (snakeCell.X === X && snakeCell.Y === Y) {
            return true;
        }

        snakeCell = snakeCell.next;
    }

    return false;
}

const createRandomFoodPosition = () => {
    let X = Math.floor(Math.random() * (gameBoard.width / size)) * size;
    let Y = Math.floor(Math.random() * (gameBoard.height / size)) * size;
    const isPositionOcupied = isGameBoardCellOccupied(X, Y);
    
    if (isPositionOcupied) {
        return createRandomFoodPosition();
    } 

    return { X, Y };
}

const addFoodToGameBoard = (type, isBonus = false) => {
    const foodPosition = createRandomFoodPosition();
    const food = new Food(type, foodPosition.X, foodPosition.Y, size);
    gameBoard.domElem.appendChild(food.domElem);
    if (isBonus) {
        bonusFoodList.push(food);
    } else {
        foodList.push(food);
    }
} 

const removeFoodFromGameBoard = (isBonus = false) => {
    const food = isBonus ? bonusFoodList.pop() : foodList.pop();
    gameBoard.domElem.removeChild(food.domElem);
}

const chooseRandomBonusFoodType = () => {
    const random = Math.random();

    if (random > 0.98 || random < 0.02) {
        return FoodType.DOUBLE;
    }

    if (random < 0.12 && random >= 0.02 || random > 0.88 && random <= 0.98) {
        const innerRandom = Math.random();
        if (innerRandom < 0.5) {
            return FoodType.GRAPES;
        } 

        return FoodType.BOMB;
    }

    if (random < 0.34 && random >= 0.12 || random > 0.68 && random <= 0.88) {
        const innerRandom = Math.random();
        if (innerRandom < 0.5) {
            return FoodType.SLOWDOWN;
        } 

        return FoodType.BOOST;
    }

    if (random >= 0.34 && random <= 0.68) {
        return FoodType.PEAR;
    }
}

const applyBonuses = foodType => {
    const bonuses = FoodBonus[foodType];

    for (let bonusType in bonuses) {
        if (bonusType === BonusType.POINTS) {
            points += bonuses[bonusType];
        }

        if (bonusType === BonusType.DEAD) {
            gameOver = true;
        }

        if (bonusType === BonusType.SPEED) {
            const nextMoveInterval = snakeMoveInterval / bonuses[bonusType];
            
            snakeMoveInterval = nextMoveInterval;

            // slowdown just for 6s time in case of the slow speed
            if (nextMoveInterval > maxSnakeMoveInterval) {
                setTimeout(() => {
                    snakeMoveInterval = maxSnakeMoveInterval;
                }, 6000);
            }
        }

        if (bonusType === BonusType.MULTIPLY) {
            points *= bonuses[bonusType];
        }
    }

    pointsDomElem.textContent = points;
}

const addBonusFoodToGameBoard = () => {
    if (!gameOver) {
        if (bonusFoodList.length) {
            removeFoodFromGameBoard(true);
        }
        const foodType = chooseRandomBonusFoodType();
        addFoodToGameBoard(foodType, true);
    
        addBonusFoodTimeoutId = setTimeout(addBonusFoodToGameBoard, bonusFoodCreationInterval);
    }
} 

const soundPath = (options) => {
    if (options.soundType) {
        let soundName = SoundFileName[options.soundType];

        if (options.foodType) {
            soundName = soundName[options.foodType];
        }

        return `./assets/sounds/${soundName}.mp3`;
    }

    return null;
}

const playSound = (options) => {
    const path = soundPath(options);
    
    if (path) {
        const sound = new Audio(path);
        sound.play();
    }
}

const checkSnakeNutrition = (isBonus = false) => {
    let shouldSnakeGrow = false;
    const food = isBonus ? bonusFoodList[0] : foodList[0]; 

    if (isFoodEaten(food)) {
        if (isSoundOn) {
            playSound({soundType: SoundType.FOOD, foodType: food.type});
        }
        applyBonuses(food.type);
        shouldSnakeGrow = isFruitEaten(food.type);
        removeFoodFromGameBoard(isBonus);

        if (!isBonus) {
            addFoodToGameBoard(FoodType.APPLE);
        }
    }

    return shouldSnakeGrow;
} 

/** FOOD AND BONUSES MANAGEMENT BLOCK END*/


/** SNAKE MOVEMENT BLOCK */

const changeSnakeDirectionByKeyDown = keyCode => {
    if (keyCode < 37 || keyCode > 40 || isKeyAlreadyPressedInCycle)
        return;

    isKeyAlreadyPressedInCycle = true;

    switch(keyCode) {
        // arrow left
        case 37:
            if (snake.direction !== Direction.RIGHT)
                snake.direction = Direction.LEFT;
            break;
        // arrow up
        case 38:
            if (snake.direction !== Direction.DOWN)
                snake.direction = Direction.UP;
            break;
        // arrow right
        case 39:
            if (snake.direction !== Direction.LEFT)
                snake.direction = Direction.RIGHT;
            break;
        // arrow down
        case 40:
            if (snake.direction !== Direction.UP)
                snake.direction = Direction.DOWN;
            break;
        default:
            return;
    }
}

const changeSnakeDirectionBySwipe = (xDiff, yDiff) => {
    if (isKeyAlreadyPressedInCycle) 
        return;

    isKeyAlreadyPressedInCycle = true;

    if (Math.abs(xDiff) >= minSwipeThreshold || Math.abs(yDiff) >= minSwipeThreshold) {
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if ( xDiff > 0 && snake.direction !== Direction.RIGHT) {
                snake.direction = Direction.LEFT;
            } else if (snake.direction !== Direction.LEFT) {
                snake.direction = Direction.RIGHT;
            }   
        } else {
            if ( yDiff > 0 && snake.direction !== Direction.DOWN) {
                snake.direction = Direction.UP;
            } else if (snake.direction !== Direction.UP) { 
                snake.direction = Direction.DOWN;
            } 
        }
    }
}

const logGameOver = () => {
    if (points > bestScore) {
        bestScore = points;
        saveParam("bestScore", bestScore);
        bestScoreDomElem.textContent = bestScore;
        gameOverMessageDomElem.textContent = `${GameOverMessage.BESTSCORE}: ${bestScore}`;
    } else {
        gameOverMessageDomElem.textContent = GameOverMessage.OOPS;
    }
    gameOverDomElem.classList.remove("hide");
    setActiveGameControl(GameControlType.START);
}

const isSnakeHitGameBoardWall = () => {    
    switch(snake.direction) {
        case Direction.UP:
            return snake.head.Y - snake.step < 0;
        case Direction.DOWN:
            return snake.head.Y + snake.step > gameBoard.height - snake.head.height;
        case Direction.RIGHT:
            return snake.head.X + snake.step > gameBoard.width - snake.head.width;
        case Direction.LEFT:
            return snake.head.X - snake.step < 0;
        default:
            return false;
    }
}

const moveSnake = () => {            
    const shouldSnakeGrow = checkSnakeNutrition() || checkSnakeNutrition(true);

    if (shouldSnakeGrow) {
        snake.addSnakeCell(size, snake.tail.X, snake.tail.Y);
    }

    const snakeHitWall = isSnakeHitGameBoardWall();

    if (snakeHitWall && isSoundOn) {
        playSound({soundType: SoundType.HITWALL});
    }

    // checking gameOver in condition, because of possibility to eat the bomb type food
    if (gameOver || snakeHitWall) {
        gameOver = true;
        clearTimers();
        logGameOver();
        return;
    }

    if (snake.hitBody) {
        if (isSoundOn) {
            playSound({soundType: SoundType.CUT});
        }
        points = Math.round((points / 2) / 10) * 10;
        pointsDomElem.textContent = points;
    }

    snake.move();

    isKeyAlreadyPressedInCycle = false;

    moveSnakeTimeoutId = setTimeout(moveSnake, snakeMoveInterval);
}

/** SNAKE MOVEMENT BLOCK END */


/** GAME CONTROLS BLOCK */

const launchSafariSound = () => {
    new Audio().play();
}

const runTimers = () => {
    addBonusFoodTimeoutId = setTimeout(addBonusFoodToGameBoard, bonusFoodCreationInterval);
    moveSnakeTimeoutId = setTimeout(moveSnake, snakeMoveInterval);
} 

const clearTimers = () =>  {
    clearTimeout(moveSnakeTimeoutId);
    clearTimeout(addBonusFoodTimeoutId)
}

const setSoundOnImg = () => {
    soundTogglerDomElem.classList.remove("off");
    soundTogglerDomElem.classList.add("on");
}

const setSoundOffImg = () => {
    soundTogglerDomElem.classList.remove("on");
    soundTogglerDomElem.classList.add("off");
}

const toggleSound = (event, initial = false) => {
    if (!initial) {
        isSoundOn = !isSoundOn;
        saveParam("isSoundOn", isSoundOn);
    }

    if (isSoundOn) {
        setSoundOnImg();
    } else {
        setSoundOffImg();
    }
}

const setActiveGameControl = (gameControlType) => {
    for (let gameControlElemType in gameControlDomElems) {
        if (gameControlElemType === gameControlType) {
            gameControlDomElems[gameControlElemType].classList.remove("hide");
        } else {
            gameControlDomElems[gameControlElemType].classList.add("hide");
        }
    }
}

const clearPreviousGame = () => {
    gameBoard.domElem.textContent = "";
    pointsDomElem.textContent = 0;
    foodList.length = 0;
    bonusFoodList.length = 0;
    keyDownEvent.stopListen();
    swipeEvent.stopListen();
    clearTimers();
    gameOverDomElem.classList.add("hide");
}

const initializeGameVariables = () => {
    clearPreviousGame();
    gameOver = false;
    points = 0;
    size = window.innerWidth > 768 ? 30 : 20;
    snakeMoveInterval = maxSnakeMoveInterval;
    isKeyAlreadyPressedInCycle = false;
    snake = new Snake(gameBoard, size, initialSnakeCellsAmount);
}

const pauseGame = () => {
    clearTimers();
    gameBoard.domElem.classList.add("paused");
    setActiveGameControl(GameControlType.CONTINUE);
}

const continueGame = () => {
    runTimers();
    gameBoard.domElem.classList.remove("paused");
    setActiveGameControl(GameControlType.PAUSE);
}

const startGame = () => {
    // Safari turns on sound just on user action, because of this is added launchSafariSound function
    launchSafariSound();
    initializeGameVariables();
    addFoodToGameBoard(FoodType.APPLE);
    keyDownEvent.startListen(changeSnakeDirectionByKeyDown)
    swipeEvent.startListen(changeSnakeDirectionBySwipe);
    runTimers();
    setActiveGameControl(GameControlType.PAUSE);
}

/** GAME CONTROLS BLOCK END */


/** GAME START BLOCK */

bestScoreDomElem.textContent = bestScore;
gameControlDomElems[GameControlType.START].addEventListener("click", startGame);
gameControlDomElems[GameControlType.PAUSE].addEventListener("click", pauseGame);

// added IOS check for touch event instead of click to have possibility of having sound on Safari for IOS
if (isIOS()) {
    gameControlDomElems[GameControlType.CONTINUE].addEventListener("touchstart", continueGame);
} else {
    gameControlDomElems[GameControlType.CONTINUE].addEventListener("click", continueGame);
}
soundTogglerDomElem.addEventListener("click", toggleSound);
// preload sound on and off images not to have blinking, when sound is toggled
preloadImages(["./assets/img/sound-on.png", "./assets/img/sound-off.png"]);
toggleSound(null, true);

/** GAME START BLOCK END */