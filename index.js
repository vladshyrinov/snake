import Snake from "./models/snake.js";
import GameBoard from "./models/gameBoard.js";
import { Direction } from "./enums/Direction.js";

const gameOver = () => {
    alert("Game Over");
}

const isGameOver = (snake, gameBoard) => {    
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

const startListenKeyDown = (snake) => {
    window.addEventListener('keydown', event => {
        if (event.keyCode < 37 || event.keyCode > 40)
            return;
    
        switch(event.keyCode) {
            // arrow left
            case 37:
                snake.direction = Direction.LEFT;
                break;
            // arrow up
            case 38:
                snake.direction = Direction.UP;
                break;
            // arrow right
            case 39:
                snake.direction = Direction.RIGHT;
                break;
            // arrow down
            case 40:
                snake.direction = Direction.DOWN;
                break;
            default:
                return;
        }
    });
}

const startGame = () => {
    const step = 40;
    const gameBoard = new GameBoard("game-board");
    const snake = new Snake("snake", step, 0, 0);

    startListenKeyDown(snake);

    const moveSnake = () => {    
        
        if (isGameOver(snake, gameBoard)) {
            gameOver();
            return;
        }
        
        snake.move();

        setTimeout(moveSnake, 300);
    }

    requestAnimationFrame(moveSnake, 300);
}

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", startGame);

