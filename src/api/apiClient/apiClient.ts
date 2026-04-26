import { normalizeApiError } from "../errors/errors"

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
        throw normalizeApiError(data, response.status);
    }

    return data as T;
}
