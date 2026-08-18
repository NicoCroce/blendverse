const localStorageKey = 'logged';

export const setLogged = () => localStorage.setItem(localStorageKey, 'true');
export const isLogged = () => localStorage.getItem(localStorageKey) === 'true';
