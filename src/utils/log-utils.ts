// import * as Sentry from "@sentry/react";

/*  This log utility allows us to keep useful console.log calls out of production.
    ...args allows us to accept any number of arguments and unknown[] is a safe, type-agnostic
    placeholder for those arguments' types. So, for example, we could do:
   
        log("Version:", version, { status: "ok" });

    and this would come in as:

        ["Version:", version, { status: "ok" }]
        
    We then user the spread operator to write out all elements of this array to console.
*/
export const safeLog = (...args: unknown[]) => {
    if (import.meta.env.MODE === "development") {
        console.log(...args);
    }
};