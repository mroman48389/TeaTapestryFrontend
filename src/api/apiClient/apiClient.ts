import { normalizeApiError } from "../errors/errors";
import { getBaseUrl } from "@/utils/getBaseUrl";

// console.log("API URL:", import.meta.env.VITE_API_URL);

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

/* This generic function takes care of a lot of boilerplate-type code 
   associated with fetching data and makes the process consistent. */
export async function apiRequest<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    // const base = getBaseUrl();
    // console.log("apiRequest --> base URL:", base);
    // console.log("apiRequest --> endpoint:", url);
    // console.log("apiRequest --> final URL:", base + url);

    const response = await fetch(getBaseUrl() + url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
        },
    });

    // console.log("apiRequest --> response.url:", response.url);
    // console.log("apiRequest --> response.ok:", response.ok);
    // console.log("apiRequest --> response.status:", response.status);

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
