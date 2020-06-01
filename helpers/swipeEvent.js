export const swipeEvent = (function () {
    let touchEndEventListener;
    let startTouchClientX;
    let startTouchClientY;
    let endTouchClientX;
    let endTouchClientY;

    const getTouchClientX = event => event.touches[0].clientX;
    const getTouchClientY = event => event.touches[0].clientY;

    const touchStart = event => {   
        startTouchClientX = getTouchClientX(event);
        startTouchClientY = getTouchClientY(event);
    }  

    const touchMove = event => {
        endTouchClientX = getTouchClientX(event);
        endTouchClientY = getTouchClientY(event);
    }

    const touchEnd = action => () => {
        const xDiff = startTouchClientX - endTouchClientX;
        const yDiff = startTouchClientY - endTouchClientY;
        action(xDiff, yDiff);
    }

    const startListenSwipeEvent = (action) => {
        touchEndEventListener = touchEnd(action);
        window.addEventListener("touchstart", touchStart);
        window.addEventListener("touchmove", touchMove);
        window.addEventListener("touchend", touchEndEventListener);
    }

    const stopListenSwipeEvent = () => {
        window.removeEventListener("touchstart", touchEndEventListener);
        window.removeEventListener("touchmove", touchMove);
        window.removeEventListener("touchend", touchEnd);
    }

    return {
        startListen: startListenSwipeEvent,
        stopListen: stopListenSwipeEvent
    }
})();
