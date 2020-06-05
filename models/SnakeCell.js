import { DirectionRotateDegree } from "./DirectionRotateDegree.js";

class SnakeCell {
    constructor(X, Y, size, rotateDirection) {
        // snake is implemented as a doubly linked list, so each snake cell stores links to the previous and next cell
        this.next = null;
        this.prev = null;
        this.initialize(X, Y, size, rotateDirection);
    }

    initialize(X, Y, size, rotateDirection) {
        this.domElem = document.createElement("div");
        this.domElem.classList.add('snake-cell');
        if (rotateDirection) {
            this.domElem.classList.add('snake-head');
        }
        this.setXYPosition(X, Y, rotateDirection);
        this.setWidthAndHeight(size);
    }

    setXYPosition(X, Y, rotateDirection) {
        this.X = X;
        this.Y = Y;

        let transform = `translate(${X}px, ${Y}px)`;

        if (rotateDirection) {
            const rotateDeg = DirectionRotateDegree[rotateDirection];
            transform += ` rotate(${rotateDeg})`;
        }   

        this.domElem.style.transform = transform;
    }

    setWidthAndHeight(size) {
        this.width = size;
        this.height = size;
        this.domElem.style.width = `${size}px`;
        this.domElem.style.height = `${size}px`;
    }
}

export default SnakeCell;