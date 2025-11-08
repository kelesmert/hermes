const isBrowser = typeof window !== 'undefined';
export const SESSION_STORAGE_KEY = 'hermes.session';

export const storage = {
  get(key) {
    if (!isBrowser) return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error('Storage parse error', err); // eslint-disable-line no-console
      return null;
    }
  },
  set(key, value) {
    if (!isBrowser) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    if (!isBrowser) return;
    window.localStorage.removeItem(key);
  },
};
