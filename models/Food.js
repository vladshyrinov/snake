class Food {
    constructor(type, size, X, Y) {
        this.initFoodParams(type, size, X, Y);
    }

    initFoodParams = (type, size, X, Y) => {
        this.type = type;
        this.width = size;
        this.height = size;
        this.X = X;
        this.Y = Y;
        this.createFood();
    }

    createFood = () => {
        const food = document.createElement("div");
        food.style.width = `${this.width}px`;
        food.style.height = `${this.height}px`;
        food.style.transform = `translate(${this.X}px, ${this.Y}px)`;
        food.classList.add("food");
        food.classList.add(`${this.type.toLowerCase()}`);
        this.domElem = food;
    }
}

export default Food;