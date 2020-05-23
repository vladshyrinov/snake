class GameBoard {
    constructor(boardId) {
        this.initBoardParams(boardId);
    }

    initBoardParams(boardId) {
        const board = document.getElementById(boardId);
        this.domElem = board;
        this.height = board.clientHeight;
        this.width = board.clientWidth;
    }
}

export default GameBoard;