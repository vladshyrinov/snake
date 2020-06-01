export const keyDownEvent = (function () {
    let keyDownEventListener;
    
    const keyDownHandler = action => event => {
        action(event.keyCode);
    }

    const startListenKeyDownEvent = (action) => {
        keyDownEventListener = keyDownHandler(action);
        window.addEventListener('keydown', keyDownEventListener);
    }
    
    const stopListenKeyDownEvent = () => {
        window.removeEventListener('keydown', keyDownEventListener);
    }

    return {
        startListen: startListenKeyDownEvent,
        stopListen: stopListenKeyDownEvent
    }
})();