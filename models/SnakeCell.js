class SnakeCell {
    constructor(X, Y, size) {
        // snake is implemented as a doubly linked list, so each snake cell stores links to the previous and next cell
        this.next = null;
        this.prev = null;
        this.initialize(X, Y, size);
    }

    initialize(X, Y, size) {
        this.domElem = document.createElement("div");
        this.domElem.classList.add('snake-cell');
        this.setXYPosition(X, Y);
        this.setWidthAndHeight(size);
    }

    setXYPosition = (X, Y) => {
        this.X = X;
        this.Y = Y;
        this.domElem.style.transform = `translate(${X}px, ${Y}px)`;
    }

    setWidthAndHeight = (size) => {
        this.width = size;
        this.height = size;
        this.domElem.style.width = `${size}px`;
        this.domElem.style.height = `${size}px`;
    }
}

export default SnakeCell;