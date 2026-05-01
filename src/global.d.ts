/* Need this or TypeScript complains. */
export {}; 

/* Lets us use gtag in App.tsx. */
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}
