class GameBoard {
    constructor(boardId) {
        this.initialize(boardId);
    }

    initialize(boardId) {
        this.domElem = document.getElementById(boardId);
        this.height = this.domElem.clientHeight;
        this.width = this.domElem.clientWidth;
    }
}

export default GameBoard;
