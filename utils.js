export const saveParam = (param, value) => {
    window.localStorage.setItem(param, JSON.stringify(value));
}

export const getParam = (param) => JSON.parse(window.localStorage.getItem(param));

export const preloadImages = (images) => {
    const preloadImages = [];
    for (let i = 0; i < images.length; i++) {
        preloadImages[i] = new Image()
        preloadImages[i].src = images[i]
    }
};
