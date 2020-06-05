import { Direction } from "../enums/Direction.js";
import SnakeCell from "./SnakeCell.js";

class Snake {
    constructor(gameBoard, size, initialCellsAmount) {
        this.gameBoard = gameBoard;
        this.length = 0;
        this.hitBody = false;
        this.initialize(size, initialCellsAmount);
    }

    get direction() {
        return this.currentDirection;
    }

    set direction(direction) {
        this.currentDirection = direction;
    }

    initialize(size, initialCellsAmount) {
        this.step = size;
        this.currentDirection = Direction.RIGHT;
        this.initializeSnakeCells(size, initialCellsAmount);
    }
    
    initializeSnakeCells(size, initialCellsAmount) {
        for (let i = 1; i <= initialCellsAmount; i++) {
            const X = (initialCellsAmount - i) * size;
            const Y = 0;
            // special case for first child (head)
            if (i === 1) {
                this.addSnakeCell(size, X, Y, true);
            } else {
                this.addSnakeCell(size, X, Y);
            }
        }
    }

    addSnakeCell(size, X, Y, isHead) {
        let snakeCell;
        if (isHead) {
            snakeCell = new SnakeCell(X, Y, size, this.currentDirection)
            this.head = snakeCell;
        } else {
            snakeCell = new SnakeCell(X, Y, size)
            this.tail.next = snakeCell;
            snakeCell.prev = this.tail;
        }
        this.tail = snakeCell;
        this.length++;
        this.gameBoard.domElem.appendChild(snakeCell.domElem);
    }

    isHitBody(bodyCell) {
        if (this.head.Y === bodyCell.Y && this.head.X === bodyCell.X) {
            return true;
        }

        return false;
    }

    cutSnake(snakeCell) {
        const startCell = snakeCell;
        let currentCell = snakeCell;

        while (currentCell !== null) {
            this.gameBoard.domElem.removeChild(currentCell.domElem);
            currentCell = currentCell.next;
        }

        this.tail = startCell.prev;
        this.tail.next = null;
    }

    moveCells(headX, headY) {
        let newCoords = {X: headX, Y: headY};
        let oldCoords = null;
        let snakeCell = this.head;

        this.hitBody = false;

        while (snakeCell !== null) {
            oldCoords = {X: snakeCell.X, Y: snakeCell.Y};
            
            if (snakeCell === this.head) {
                snakeCell.setXYPosition(newCoords.X, newCoords.Y, this.currentDirection);
            } else {
                snakeCell.setXYPosition(newCoords.X, newCoords.Y);

                if (this.isHitBody(snakeCell)) {
                    this.hitBody = true;
                    break;
                }
            }

            newCoords = oldCoords;
            snakeCell = snakeCell.next;
        }

        if (this.hitBody) {
            this.cutSnake(snakeCell);
        }
    }

    move() {
        switch(this.currentDirection) {
            case Direction.RIGHT:
                this.moveCells(this.head.X + this.step, this.head.Y);
                break;
            case Direction.LEFT:
                this.moveCells(this.head.X - this.step, this.head.Y);
                break;
            case Direction.UP:
                this.moveCells(this.head.X, this.head.Y - this.step);
                break;
            case Direction.DOWN:
                this.moveCells(this.head.X, this.head.Y + this.step);
                break;
            default:
                return;
        }
    }
}

export default Snake;


