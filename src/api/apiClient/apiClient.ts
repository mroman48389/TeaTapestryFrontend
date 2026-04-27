import { normalizeApiError } from "../errors/errors";
import * as Sentry from "@sentry/react";

/* This generic function takes care of a lot of boilerplate-type code 
   associated with fetching data and makes the process consistent. */
export async function apiRequest<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
        },
    });

    let data: any = null;

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
        Sentry.addBreadcrumb({
            category: "api",
            message: `API error: ${url} (${response.status})`,
            level: "error",
        });

        throw normalizeApiError(data, response.status);
    }

    return data as T;
}
