class Food {
    constructor(type, X, Y, size) {
        this.initialize(type, X, Y, size);
    }

    initialize(type, X, Y, size) {
        this.type = type;
        this.domElem = document.createElement("div");
        this.domElem.classList.add('food');
        this.domElem.classList.add(`${type.toLowerCase()}`);
        this.setXYPosition(X, Y);
        this.setWidthAndHeight(size);
    }

    setXYPosition(X, Y) {
        this.X = X;
        this.Y = Y;
        this.domElem.style.transform = `translate(${X}px, ${Y}px)`;
    }

    setWidthAndHeight(size) {
        this.width = size;
        this.height = size;
        this.domElem.style.width = `${size}px`;
        this.domElem.style.height = `${size}px`;
    }
}

export default Food;