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

    initialize = (size, initialCellsAmount) => {
        this.step = size;
        this.currentDirection = Direction.RIGHT;
        this.initializeSnakeCells(size, initialCellsAmount);
    }
    
    initializeSnakeCells = (size, initialCellsAmount) => {
        for (let i = 0; i < initialCellsAmount; i++) {
            const X = (initialCellsAmount - i) * size;
            const Y = 0;
            // special case for first child (head)
            if (i === 0) {
                this.addSnakeCell(size, X, Y, true);
            } else {
                this.addSnakeCell(size, X, Y);
            }
        }
    }

    addSnakeCell = (size, X, Y, isHead) => {
        const snakeCell = new SnakeCell(X, Y, size);
        if (isHead) {
            this.head = snakeCell;
        } else {
            this.tail.next = snakeCell;
            snakeCell.prev = this.tail;
        }
        this.tail = snakeCell;
        this.length++;
        this.gameBoard.domElem.appendChild(snakeCell.domElem);
    }

    // checkHitBody = (bodyCell) => {
    //     if (this.currentDirection === Direction.UP) {
    //         if (this.head.Y === bodyCell.Y + bodyCell.height && this.head.X === bodyCell.X) {
    //             this.hitBody = true;
    //         }
    //     }

    //     if (this.currentDirection === Direction.DOWN) {
    //         if (this.head.Y + this.head.height === bodyCell.Y && this.head.X === bodyCell.X) {
    //             this.hitBody = true;
    //         }
    //     }

    //     if (this.currentDirection === Direction.RIGHT) {
    //         if (this.head.X + this.head.width === bodyCell.X && this.head.Y === bodyCell.Y) {
    //             this.hitBody = true;
    //         }
    //     }

    //     if (this.currentDirection === Direction.LEFT) {
    //         if (this.head.X === bodyCell.X + bodyCell.width && this.head.Y === bodyCell.Y) {
    //             this.hitBody = true;
    //         }
    //     }
    // }

    checkHitBody = (bodyCell) => {
        if (this.head.Y === bodyCell.Y && this.head.X === bodyCell.X) {
            this.hitBody = true;
        }
    }

    moveCells = (headX, headY) => {
        let newCoords = {X: headX, Y: headY};
        let oldCoords = null;
        let snakeCell = this.head;

        while (snakeCell !== null) {
            oldCoords = {X: snakeCell.X, Y: snakeCell.Y};
            snakeCell.setXYPosition(newCoords.X, newCoords.Y);

            if (snakeCell !== this.head) {
                this.checkHitBody(snakeCell);
            }

            newCoords = oldCoords;
            snakeCell = snakeCell.next;
        }
    }

    move = () => {
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


