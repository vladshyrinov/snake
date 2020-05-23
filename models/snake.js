import { Direction } from "../enums/Direction.js";

class Snake {
    constructor(snakeId, step, X, Y) {
        this.initSnakeParams(snakeId, step, X, Y);
    }

    get direction() {
        return this.currentDirection;
    }

    set direction(direction) {
        this.currentDirection = direction;
    }

    initSnakeParams = (snakeId, step = 1, X = 0, Y = 0) => {
        const snake = document.getElementById(snakeId);
        this.domElem = snake;
        this.height = snake.clientHeight;
        this.width = snake.clientWidth;
        this.setXYPosition(X, Y);
        this.currentDirection = Direction.RIGHT;
        this.step = step;
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


