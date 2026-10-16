// Silent architectural walkthrough: no audio assets, state, storage or services.
const silent = () => {};
export const sfx = new Proxy(Object.freeze({}), { get: () => silent });
export const initAudio = silent;
export const updateListener = silent;
export const toggleMuted = silent;
export const isMuted = () => true;
export const audioParts = () => null;
