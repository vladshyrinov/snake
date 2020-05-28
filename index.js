import Snake from "./models/Snake.js";
import GameBoard from "./models/GameBoard.js";
import Food from "./models/Food.js";
import { Direction } from "./enums/Direction.js";
import { FoodType } from "./enums/FoodType.js";
import { FoodBonus } from "./models/FoodBonus.js";
import { BonusType } from "./enums/BonusType.js";

/** GLOBAL VARIABLES DECLARATION BLOCK  */

// initialization of let variables is located in initializeGameVariables function
let addBonusFoodTimeoutId;
let moveSnakeTimeoutId;
let points;
let gameOver;
let snakeMoveInterval;
let keyDownEventListener;
let isKeyAlreadyPressedinCycle;

// game constants
const size = 20; // size (width and height) of elements are equal to step of the snake
const initialSnakeCellsAmount = 10;
const bonusFoodCreationinterval = 10000;
const foodList = []; // apples food list 
const bonusFoodList = []; // other food list
const gameBoard = new GameBoard("game-board");

/** GLOBAL VARIABLES DECLARATION BLOCK END */


/** FOOD AND BONUSES MANAGEMENT BLOCK */

const isFoodEaten = (snake, food) => {
    if (snake && food && snake.head.X === food.X && snake.head.Y === food.Y) 
        return true;

    return false;
}

const isFruitEaten = food => [FoodType.APPLE, FoodType.PEAR, FoodType.BANANA].includes(food);

const createRandomFoodPosition = (size, boardWidth, boardHeight) => {
    let X = Math.floor(Math.random() * (boardWidth / size)) * size;
    let Y = Math.floor(Math.random() * (boardHeight / size)) * size;
    return { X, Y };
}

const addFoodToGameBoard = (type, size, gameBoard, isBonus = false) => {
    const foodPosition = createRandomFoodPosition(size, gameBoard.width, gameBoard.height);
    const food = new Food(type, foodPosition.X, foodPosition.Y, size);
    gameBoard.domElem.appendChild(food.domElem);
    if (isBonus) {
        bonusFoodList.push(food);
    } else {
        foodList.push(food);
    }
} 

const removeFoodFromGameBoard = (gameBoard, isBonus = false) => {
    const food = isBonus ? bonusFoodList.pop() : foodList.pop();
    gameBoard.domElem.removeChild(food.domElem);
}

// Standard Normal variate using Box-Muller transform.
function normalDistributionRandom() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return normalDistributionRandom(); // resample between 0 and 1
    return num;
}

const chooseRandomBonusFoodType = () => {
    const random = Math.random();

    if (random > 0.98 || random < 0.02) {
        return FoodType.DOUBLE;
    }

    if (random < 0.12 && random >= 0.02 || random > 0.88 && random <= 0.98) {
        const innerRandom = Math.random();
        if (innerRandom < 0.5) {
            return FoodType.BANANA;
        } 

        return FoodType.BOMB;
    }

    if (random < 0.32 && random >= 0.12 || random > 0.68 && random <= 0.88) {
        const innerRandom = Math.random();
        if (innerRandom < 0.5) {
            return FoodType.SLOWDOWN;
        } 

        return FoodType.BOOST;
    }

    if (random >= 0.32 && random <= 0.68) {
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
            snakeMoveInterval /= bonuses[bonusType];
        }

        if (bonusType === BonusType.MULTIPLY) {
            points *= bonuses[bonusType];
        }
    }

    console.log("Current score:", points);
    console.log("Snake move period", snakeMoveInterval);
}

const addBonusFoodToGameBoard = (size, gameBoard) => () => {
    if (!gameOver) {
        if (bonusFoodList.length) {
            removeFoodFromGameBoard(gameBoard, true);
        }
        const foodType = chooseRandomBonusFoodType();
        addFoodToGameBoard(foodType, size, gameBoard, true);
    
        addBonusFoodTimeoutId = setTimeout(addBonusFoodToGameBoard(size, gameBoard), bonusFoodCreationinterval);
    }
} 

const checkSnakeNutrition = (snake, isBonus = false) => {
    let shouldSnakeGrow = false;
    const food = isBonus ? bonusFoodList[0] : foodList[0]; 
    
    if (isFoodEaten(snake, food)) {
        // const failSound = new Audio("./assets/sounds/tasty-cut.mp3");
        // failSound.play();
        applyBonuses(food.type);
        shouldSnakeGrow = isFruitEaten(food.type);
        removeFoodFromGameBoard(gameBoard, isBonus);

        if (!isBonus) {
            addFoodToGameBoard(FoodType.APPLE, size, gameBoard);
        }
    }

    return shouldSnakeGrow;
} 

/** FOOD AND BONUSES MANAGEMENT BLOCK END*/


/** SNAKE MOVEMENT BLOCK */

const keyDownHandler = snake => event => {
    if (event.keyCode < 37 || event.keyCode > 40 || isKeyAlreadyPressedinCycle)
        return;

    isKeyAlreadyPressedinCycle = true;

    switch(event.keyCode) {
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

const startListenKeyDownEvent = (snake) => {
    keyDownEventListener = keyDownHandler(snake);
    window.addEventListener('keydown', keyDownEventListener);
}

const stopListenKeyDownEvent = () => {
    window.removeEventListener('keydown', keyDownEventListener);
}

const logGameOver = () => {
    // const failSound = new Audio("./assets/sounds/fail.mp3");
    // failSound.play();
    console.log("Game Over");
}

const isSnakeHitGameBoardWall = (snake, gameBoard) => {    
    if (snake.direction === Direction.UP) {
        if (snake.head.Y - snake.step < 0) {
            return true;
        } 
    }

    if (snake.direction === Direction.DOWN) {
        if (snake.head.Y + snake.step > gameBoard.height - snake.head.height) {
            return true;
        }
    }

    if (snake.direction === Direction.RIGHT) {
        if (snake.head.X + snake.step > gameBoard.width - snake.head.width) {
            return true;
        }
    }

    if (snake.direction === Direction.LEFT) {
        if (snake.head.X - snake.step < 0) {
            return true;
        } 
    }

    return false;
}

const moveSnake = (snake, gameBoard) => () => {            
    const shouldSnakeGrow = checkSnakeNutrition(snake) || checkSnakeNutrition(snake, true);

    if (shouldSnakeGrow) {
        snake.addSnakeCell(size, snake.tail.X, snake.tail.Y);
    }

    // checking gameOver in condition, because of possibility to eat the bomb type food
    if (gameOver || isSnakeHitGameBoardWall(snake, gameBoard) || snake.hitBody) {
        gameOver = true;
        clearTimeout(moveSnakeTimeoutId);
        clearTimeout(addBonusFoodTimeoutId);
        logGameOver();
        return;
    }

    snake.move();

    isKeyAlreadyPressedinCycle = false;

    moveSnakeTimeoutId = setTimeout(moveSnake(snake, gameBoard), snakeMoveInterval);
}

/** SNAKE MOVEMENT BLOCK END */


/** GAME START BLOCK */
 
const clearPreviousGame = () => {
    gameBoard.domElem.textContent = "";
    foodList.length = 0;
    bonusFoodList.length = 0;
    stopListenKeyDownEvent();
}

const initializeGameVariables = () => {
    clearPreviousGame();
    gameOver = false;
    points = 0;
    snakeMoveInterval = 300;
    isKeyAlreadyPressedinCycle = false;
}

const startGame = () => {
    initializeGameVariables();
    const snake = new Snake(gameBoard, size, initialSnakeCellsAmount);
    addFoodToGameBoard(FoodType.APPLE, size, gameBoard);
    startListenKeyDownEvent(snake);
    addBonusFoodTimeoutId = setTimeout(addBonusFoodToGameBoard(size, gameBoard), bonusFoodCreationinterval);
    moveSnakeTimeoutId = setTimeout(moveSnake(snake, gameBoard), snakeMoveInterval);
}

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", startGame);

/** GAME START BLOCK END */

