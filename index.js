import Snake from "./models/Snake.js";
import GameBoard from "./models/GameBoard.js";
import Food from "./models/Food.js";
import { Direction } from "./enums/Direction.js";
import { FoodType } from "./enums/FoodType.js";
import { FoodBonus } from "./models/FoodBonus.js";
import { BonusType } from "./enums/BonusType.js";
import { SoundType } from "./enums/SoundType.js";
import { SoundFileName } from "./models/SoundFIleName.js";

/** GLOBAL VARIABLES DECLARATION BLOCK  */

// initialization of let variables is located in initializeGameVariables function
let addBonusFoodTimeoutId;
let moveSnakeTimeoutId;
let points;
let gameOver;
let snakeMoveInterval;
let keyDownEventListener;
let isKeyAlreadyPressedInCycle;

// game constants
const size = 30; // size (width and height) of elements are equal to step of the snake
const initialSnakeCellsAmount = 3;
const maxSnakeMoveInterval = 150;
const bonusFoodCreationInterval = 10000;
const foodList = []; // apples food list 
const bonusFoodList = []; // other food list
const gameBoard = new GameBoard("game-board");
const pointsDomElem = document.querySelector(".points");

/** GLOBAL VARIABLES DECLARATION BLOCK END */


/** FOOD AND BONUSES MANAGEMENT BLOCK */

const isFoodEaten = (snake, food) => {
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

const isFruitEaten = food => [FoodType.APPLE, FoodType.PEAR, FoodType.BANANA].includes(food);

const isGameBoardCellOccupied = (snake, X, Y) => {
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

const createRandomFoodPosition = (size, gameBoard, snake) => {
    let X = Math.floor(Math.random() * (gameBoard.width / size)) * size;
    let Y = Math.floor(Math.random() * (gameBoard.height / size)) * size;
    const isPositionOcupied = isGameBoardCellOccupied(snake, X, Y);
    
    if (isPositionOcupied) {
        return createRandomFoodPosition(size, gameBoard, snake);
    } 

    return { X, Y };
}

const addFoodToGameBoard = (type, size, gameBoard, snake, isBonus = false) => {
    const foodPosition = createRandomFoodPosition(size, gameBoard, snake);
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

const addBonusFoodToGameBoard = (size, gameBoard, snake) => () => {
    if (!gameOver) {
        if (bonusFoodList.length) {
            removeFoodFromGameBoard(gameBoard, true);
        }
        const foodType = chooseRandomBonusFoodType();
        addFoodToGameBoard(foodType, size, gameBoard, snake, true);
    
        addBonusFoodTimeoutId = setTimeout(addBonusFoodToGameBoard(size, gameBoard, snake), bonusFoodCreationInterval);
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

const checkSnakeNutrition = (snake, isBonus = false) => {
    let shouldSnakeGrow = false;
    const food = isBonus ? bonusFoodList[0] : foodList[0]; 

    if (isFoodEaten(snake, food)) {
        playSound({soundType: SoundType.Food, foodType: food.type});
        applyBonuses(food.type);
        shouldSnakeGrow = isFruitEaten(food.type);
        removeFoodFromGameBoard(gameBoard, isBonus);

        if (!isBonus) {
            addFoodToGameBoard(FoodType.APPLE, size, gameBoard, snake);
        }
    }

    return shouldSnakeGrow;
} 

/** FOOD AND BONUSES MANAGEMENT BLOCK END*/


/** SNAKE MOVEMENT BLOCK */

const keyDownHandler = snake => event => {
    if (event.keyCode < 37 || event.keyCode > 40 || isKeyAlreadyPressedInCycle)
        return;

    isKeyAlreadyPressedInCycle = true;

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
    console.log("Game Over");
}

const isSnakeHitGameBoardWall = (snake, gameBoard) => {    
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

const moveSnake = (snake, gameBoard) => () => {            
    const shouldSnakeGrow = checkSnakeNutrition(snake) || checkSnakeNutrition(snake, true);

    if (shouldSnakeGrow) {
        snake.addSnakeCell(size, snake.tail.X, snake.tail.Y);
    }

    const snakeHitWall = isSnakeHitGameBoardWall(snake, gameBoard);

    if (snakeHitWall) {
        playSound({soundType: SoundType.HitWall});
    }

    // checking gameOver in condition, because of possibility to eat the bomb type food
    if (gameOver || snakeHitWall) {
        gameOver = true;
        clearTimeout(moveSnakeTimeoutId);
        clearTimeout(addBonusFoodTimeoutId);
        logGameOver();
        return;
    }

    if (snake.hitBody) {
        playSound({soundType: SoundType.Cut});
        points = Math.round((points / 2) / 10) * 10;
        pointsDomElem.textContent = points;
    }

    snake.move();

    isKeyAlreadyPressedInCycle = false;

    moveSnakeTimeoutId = setTimeout(moveSnake(snake, gameBoard), snakeMoveInterval);
}

/** SNAKE MOVEMENT BLOCK END */


/** GAME START BLOCK */
 
const clearPreviousGame = () => {
    gameBoard.domElem.textContent = "";
    pointsDomElem.textContent = 0;
    foodList.length = 0;
    bonusFoodList.length = 0;
    stopListenKeyDownEvent();
}

const initializeGameVariables = () => {
    clearPreviousGame();
    gameOver = false;
    points = 0;
    snakeMoveInterval = maxSnakeMoveInterval;
    isKeyAlreadyPressedInCycle = false;
}

const startGame = () => {
    initializeGameVariables();
    const snake = new Snake(gameBoard, size, initialSnakeCellsAmount);
    addFoodToGameBoard(FoodType.APPLE, size, gameBoard, snake);
    startListenKeyDownEvent(snake);
    addBonusFoodTimeoutId = setTimeout(addBonusFoodToGameBoard(size, gameBoard, snake), bonusFoodCreationInterval);
    moveSnakeTimeoutId = setTimeout(moveSnake(snake, gameBoard), snakeMoveInterval);
}

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", startGame);

/** GAME START BLOCK END */
