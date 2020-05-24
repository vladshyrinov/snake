import Snake from "./models/Snake.js";
import GameBoard from "./models/GameBoard.js";
import Food from "./models/Food.js";
import { Direction } from "./enums/Direction.js";
import { FoodType } from "./enums/FoodType.js";
import { FoodBonus } from "./models/FoodBonus.js";
import { BonusType } from "./enums/BonusType.js";

let addFoodBonusTimeoutId;
let moveSnakeTimeoutId;
let points = 0;
let gameOver = false;
let snakeMoveInterval = 300;
// size (width and height) of elements are equal to step of the snake
const size = 40;
const bonusFoodCreationinterval = 10000;
const foodList = [];
const bonusFoodList = [];
const gameBoard = new GameBoard("game-board");

const applyBonuses = (foodType) => {
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

const logGameOver = () => {
    const failSound = new Audio("./assets/sounds/fail.mp3");
    failSound.play();
    console.log("Game Over");
}

const isHitWall = (snake, gameBoard) => {    
    if (snake.direction === Direction.UP) {
        if (snake.Y - snake.step < 0) {
            return true;
        } 
    }

    if (snake.direction === Direction.DOWN) {
        if (snake.Y + snake.step > gameBoard.height - snake.height) {
            return true;
        }
    }

    if (snake.direction === Direction.RIGHT) {
        if (snake.X + snake.step > gameBoard.width - snake.width) {
            return true;
        }
    }

    if (snake.direction === Direction.LEFT) {
        if (snake.X - snake.step < 0) {
            return true;
        } 
    }

    return false;
}

const isFoodEaten = (snake, food) => {
    if (snake && food && snake.X === food.X && snake.Y === food.Y) 
        return true;

    return false;
}

const startListenKeyDown = (snake) => {
    window.addEventListener('keydown', event => {
        if (event.keyCode < 37 || event.keyCode > 40)
            return;
    
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
    });
}

const createRandomFoodPosition = (size, boardWidth, boardHeight) => {
    let X = Math.floor(Math.random() * (boardWidth / size)) * size;
    let Y = Math.floor(Math.random() * (boardHeight / size)) * size;
    return { X, Y };
}

const addFoodToGameBoard = (type, size, gameBoard, isBonus = false) => {
    const foodPosition = createRandomFoodPosition(size, gameBoard.width, gameBoard.height);
    const food = new Food(type, size, foodPosition.X, foodPosition.Y);
    gameBoard.domElem.appendChild(food.domElem);
    if (isBonus) {
        bonusFoodList.push(food);
    } else {
        foodList.push(food);
    }
} 

const removeFoodFromGameBoard = (gameBoard, isBonus = false) => {
    let food;
    if (isBonus) {
        food = bonusFoodList.pop();
    } else {
        food = foodList.pop();
    }
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

const addFoodBonus = (size, gameBoard) => () => {
    if (!gameOver) {
        if (bonusFoodList.length) {
            removeFoodFromGameBoard(gameBoard, true);
        }
        const foodType = chooseRandomBonusFoodType();
        addFoodToGameBoard(foodType, size, gameBoard, true);
    
        addFoodBonusTimeoutId = setTimeout(addFoodBonus(size, gameBoard), bonusFoodCreationinterval);
    }
} 

const moveSnake = (snake, gameBoard) => () => {            
    if (isFoodEaten(snake, foodList[0])) {
        const failSound = new Audio("./assets/sounds/tasty.mp3");
        failSound.play();
        applyBonuses(foodList[0].type);
        removeFoodFromGameBoard(gameBoard)
        addFoodToGameBoard(FoodType.APPLE, size, gameBoard);
    }

    if (isFoodEaten(snake, bonusFoodList[0])) {
        const failSound = new Audio("./assets/sounds/tasty.mp3");
        failSound.play();
        applyBonuses(bonusFoodList[0].type);
        removeFoodFromGameBoard(gameBoard, true);
    }

    if (gameOver || isHitWall(snake, gameBoard)) {
        gameOver = true;
        clearTimeout(moveSnakeTimeoutId);
        clearTimeout(addFoodBonusTimeoutId);
        logGameOver();
        return;
    }
    
    snake.move();

    moveSnakeTimeoutId = setTimeout(moveSnake(snake, gameBoard), snakeMoveInterval);
}

const clearPreviousGame = (gameBoard) => {
    gameOver = false;
    points = 0;
    snakeMoveInterval = 300;

    for (let i = 0; i < foodList.length; i++) {
        removeFoodFromGameBoard(gameBoard);
    }

    for (let i = 0; i < bonusFoodList.length; i++) {
        removeFoodFromGameBoard(gameBoard, true);
    }
}

const startGame = () => {
    const snake = new Snake("snake", size, 0, 0);
    clearPreviousGame(gameBoard);
    addFoodToGameBoard(FoodType.APPLE, size, gameBoard);
    startListenKeyDown(snake);
    addFoodBonusTimeoutId = setTimeout(addFoodBonus(size, gameBoard), bonusFoodCreationinterval);
    moveSnakeTimeoutId = setTimeout(moveSnake(snake, gameBoard), snakeMoveInterval);
}

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", startGame);

