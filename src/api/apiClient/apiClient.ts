import { StatusCodes } from "http-status-codes";

import { normalizeApiError } from "../errors/errors";
import { getBaseUrl } from "@/utils/getBaseUrl";

//  console.log("API URL:", import.meta.env.VITE_API_URL);

/* Lazy Sentry helpers. These ensure Sentry is only loaded when needed,
   and never pulled into the main bundle. */
function addSentryBreadcrumb(breadcrumb: {
    category: string;
    message: string;
    level: "error" | "info" | "warning";
}) {
    import("@sentry/react").then((Sentry) => {
        Sentry.addBreadcrumb(breadcrumb);
    });
}

function captureSentryException(error: unknown) {
    import("@sentry/react").then((Sentry) => {
        Sentry.captureException(error);
    });
}

/* Flag and subscriber queue for handling concurrent 401 refreshes. 
   
   isRefreshing tells us if we are awaiting a call to the refresh endpoint.
   It is normally false but should switch to true when we encounter a 401 from
   a request.

   refreshSubscribers is an array of paused Promises; the resolve functions for
   all requests that came in while we were already in the process of calling
   refresh. Once the call to refresh finishes, the array should fire off all
   Promises so the rest of the requests can retry. refreshSubscribers is 
   mechanically a FIFO queue. */
let isRefreshing = false;
let refreshSubscribers: Array<(success: boolean) => void> = [];

/* Do not inline the subscribeTokenRefresh and onRefreshed helpers. They 
   are not arbitrary, but a part of a Pub/Sub Queue event loop pattern (an
   event bus) specifically for handling concurrent 401 errors. Separating 
   these functions out will make the code easier to reason about / read and 
   help prevent accidents when manipulating refreshSubscribers.
   
   If multiple requests return 401 at the same time, these functions help ensure 
   that only one of them calls the refresh endpoint. The other requests are 
   paused and register their Promise resolve callbacks here.
*/

/* This listener adds a waiting request callback to the queue. */
function subscribeTokenRefresh(callback: (success: boolean) => void) {
    refreshSubscribers.push(callback);
}

/* Resolves all waiting request callbacks once refresh finishes. */
function onRefreshed(success: boolean) {
    /* Notify all paused requests of the result. */
    refreshSubscribers.forEach((callback) => callback(success));

    /* Immediately flush the queue to prevent retriggering requests during
       the next refresh. */
    refreshSubscribers = [];
}

async function callRefresh(): Promise<boolean> {
    try {
        const response = await fetch(getBaseUrl() + "/auth/refresh", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.ok;
    } 
    catch {
        return false;
    }
}

async function handleUnauthorizedRetry<T>(
    url: string,
    retryCallback: () => Promise<T>
): Promise<T | null> {
    /* Prevent retry loops on core authentication actions that won't 
       benefit (or will cause issues) by trying a refresh. */
    const isAuthRoute =
        url.includes("/auth/refresh") ||
        url.includes("/auth/signup") ||
        url.includes("/auth/login") ||
        url.includes("/auth/logout") ||
        url.includes("/auth/logout_all") ||
        url.includes("/auth/request_password_reset") ||
        url.includes("/auth/reset_password") ||
        url.includes("/auth/verify_email");

    if (isAuthRoute) {
        return null;
    }

    /* If we're already attempting a call to the refresh endpoint,... */
    if (isRefreshing) {
        /* Create a Promise for the request and add a callback for it to the  
           subscription queue. */
        const refreshSucceeded = await new Promise<boolean>((resolve) => {
            subscribeTokenRefresh(resolve);
        });

        /* If the Promise resolves, make a new request for the endpoint so
           we can try it one more time. */
        if (refreshSucceeded) {
            return retryCallback();
        }
    } 
    /* Otherwise, we haven't tried to call the refresh endpoint yet and will do
       so on the request we're on. */
    else {
        /* Apply lock: Prevent requests other than the one we're on from calling the 
           refresh endpoint. */
        isRefreshing = true;

        let refreshSucceeded = false;

        try {
            refreshSucceeded = await callRefresh();
        } 
        finally {
            /* Release lock regardless of success or error so other requests can call refresh. */
            isRefreshing = false;
        }

        /* Notify paused requests as to whether the call to refresh was successful
           and flush the queue. */
        onRefreshed(refreshSucceeded);

        /* If the refresh was successful, retry the original request one more time and 
           get new cookies. */
        if (refreshSucceeded) {
            return retryCallback();
        }
    }

    return null;
};

export interface DownloadResult {
    blob: Blob;
    fileName: string;
}

export async function apiDownload(
    url: string,
    options?: RequestInit,
    isRetry = false
): Promise<DownloadResult> {
    /* Purposefully leave out the content type, as we will not be handling json. */
    const response = await fetch(getBaseUrl() + url, {
        ...options,
        credentials: "include",
        headers: {
            ...(options?.headers || {}),
        },
    });

    /* If the endpoint returned a 401 and apiRequest is not already retrying
       the endpoint, retry the endpoint. */
    if (response.status === StatusCodes.UNAUTHORIZED && !isRetry) {
        const retryResult = await handleUnauthorizedRetry(
            url, () => apiDownload(url, options, true)
        );

        if (retryResult !== null) {
            return retryResult;
        }
    }

    if (!response.ok) {
        let errorData: unknown = null;

        try {
            errorData = await response.json();
        } 
        catch {
            /* ignore */
        }

        addSentryBreadcrumb({
            category: "api",
            message: `API download error: ${url} (${response.status})`,
            level: "error",
        });

        captureSentryException({
            url,
            status: response.status,
            data: errorData,
        });

        throw normalizeApiError(errorData, response.status);
    }

    /* Extract file name from Content-Disposition header. The export_user_data endpoint,
       for example, does something like this for the headers:
           
           "Content-Disposition": f'attachment; filename="{file_name}"'

       and returns  something like:

           attachment; filename="Tea_Tapestry_user_data 24-Aug-2026 at 16-24-00.json.gz"
    */
    const contentDisposition = response.headers.get("Content-Disposition");
    let fileName = "file.json.gz";

    if (contentDisposition) {
        /* Look for "filename" with a regular expression. */
        const match = contentDisposition.match(/filename="?([^"]+)"?/);

        /* match[1] is the file name if a match was found. */
        if (match && match[1]) {
            fileName = match[1];
        }
    }

    /* Read the raw byte stream into a blob (binary large object) in browser memory. */
    const blob = await response.blob();
    return { blob, fileName };
}

/* This generic function takes care of a lot of boilerplate-type code 
   associated with fetching data and makes the process consistent. 
   
   isRetry prevents infinite loops in case a retried request 
   continuously returns 401s. If apiRequest retries a request after a
   successful call to the refresh endpoint, it will pass true. So,
   refresh will only get tried once per request. */
export async function apiRequest<T>(
    url: string,
    options?: RequestInit,
    isRetry = false
): Promise<T> {
    /* By default, fetch omits cookies on cross-orgin requests. We must 
       include credentials on every outbound request so the browser 
       includes HTTP-only auth cookies upon fetching. This will
       save any Set-Cookie headers sent by the backend. Cookies will 
       have auth info we need for many endpoints, and including 
       credentials is harmless for endpoints that don't need them. */
    const response = await fetch(getBaseUrl() + url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
        },
    });

    /* If the endpoint returned a 401 and apiRequest is not already retrying
       the endpoint, retry the endpoint. */
    if ((response.status === StatusCodes.UNAUTHORIZED) && !isRetry) {

        const retryResult = await handleUnauthorizedRetry(
            url, () => apiRequest<T>(url, options, true)
        );

        if (retryResult !== null) {
            return retryResult;  
        }

    }

    let data: unknown = null;

    try {
        data = await response.json();
    } 
    catch {
        /* ignore JSON parse errors — data stays null */
    }

    if (!response.ok) {
        /* For observability pipeline. Tells us what API call failed, its status code,
           the page the user was on, what happened right before the error, and if the
           backend logged the request_id. Perfect here because all API calls go through
           apiRequest and its the realierst place we know about a request failing. 
           Produces something like this in Sentry:
        
           Breadcrumbs:
               api: API error: /api/teas/123 (404)
               console: Uncaught Error: TeaProfileNotFoundError
               navigation: /profile --> /teas/123

        */
        addSentryBreadcrumb({
            category: "api",
            message: `API error: ${url} (${response.status})`,
            level: "error",
        });

        captureSentryException({
            url,
            status: response.status,
            data,
        });

        throw normalizeApiError(data, response.status);
    }

    return data as T;
}
