/* Minimal version of the browser's IdleDeadline object that tells us
   if the callback ran because of a timeout and the idel time left. */
export interface IdleDeadline {
    didTimeout: boolean
    timeRemaining: () => number
}

export type IdleCallback = (deadline: IdleDeadline) => void

export function runWhenIdle(cb: IdleCallback): void {
    /* requestIdleCallback doesn't work on iOs Safari / Chrome, so we need a
       fallback. */
    if ("requestIdleCallback" in window) {
        /* Treat window as an object that has a requestIdleCallback method with the
           provided signature. */
        (window as unknown as {
            requestIdleCallback: (cb: IdleCallback) => number
        }).requestIdleCallback(cb);
    } 
    else {
        /* Safari fallback. Run soon, but off the critical path. We pass cb a fake
           IdleDeadline object. */
        setTimeout(() => {
            cb({
                didTimeout: false,
                timeRemaining: () => 0,
            });
        }, 1);
    }
}
