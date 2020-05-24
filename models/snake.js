import { Direction } from "../enums/Direction.js";

class Snake {
    constructor(snakeId, size, X, Y) {
        this.initSnakeParams(snakeId, size, X, Y);
    }

    get direction() {
        return this.currentDirection;
    }

    set direction(direction) {
        this.currentDirection = direction;
    }

    initSnakeParams = (snakeId, size, X = 0, Y = 0) => {
        const snake = document.getElementById(snakeId);
        this.domElem = snake;
        this.height = size;
        this.width = size;
        this.step = size;
        this.setWidthAndHeight(size);
        this.setXYPosition(X, Y);
        this.currentDirection = Direction.RIGHT;
    }

    setWidthAndHeight = (size) => {
        this.domElem.style.width = `${size}px`;
        this.domElem.style.height = `${size}px`;
    }

    getXYPosition = () => ({X: this.X, Y: this.Y});

    setXYPosition = (X, Y) => {
        this.X = X;
        this.Y = Y;
        this.domElem.style.transform = `translate(${X}px, ${Y}px)`;
    }

    move = () => {
        switch(this.currentDirection) {
            case Direction.RIGHT:
                this.setXYPosition(this.X + this.step, this.Y);
                break;
            case Direction.LEFT:
                this.setXYPosition(this.X - this.step, this.Y);
                break;
            case Direction.UP:
                this.setXYPosition(this.X, this.Y - this.step);
                break;
            case Direction.DOWN:
                this.setXYPosition(this.X, this.Y + this.step);
                break;
            default:
                return;
        }
    }
}

export default Snake;


