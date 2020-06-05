export const saveParam = (param, value) => {
    window.localStorage.setItem(param, JSON.stringify(value));
}

export const getParam = (param) => JSON.parse(window.localStorage.getItem(param));
