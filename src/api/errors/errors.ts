/* Matches the shape of the errors we will get from the backend. */
export interface ApiError {
    type: string
    message: string
    details?: Record<string, unknown>
    request_id: string
    timestamp: string
    status: number
}

/* Determines if an error is from the backend (API error) or not by
   doing minimally needed checks on the shape of the error. 
   
   Return value is a type predicate so TypeScript knows that if the
   function returns true, it can treat error an APIError at compile
   time. */
export function isApiError(error: unknown): error is ApiError {
    return (
        (typeof error === "object") &&
        (error !== null) &&
        ("type" in error) &&
        ("message" in error)
    );
}

/* Converts JSON from backend into an ApiError so every frontend error
   will have the same shape. 
   
   Prefer the HTTP status code passed via parameter rather than data.error.status
   for the status field, since the HTTP status code is the source of truth and the
   status code from the server could potentially be missing, malformed,
   replaced by proxies or middleware. The backend includes "status" is the JSON
   for convenience. */
export function normalizeApiError(data: any, status: number): ApiError {
    if (data?.error) {
        return {
            type: data.error.type,
            message: data.error.message,
            details: data.error.details,
            request_id: data.error.request_id,
            timestamp: data.error.timestamp,
            status,
        };
    };

    /* Fallback for unexpected responses. */
    return {
        type: "UnknownError",
        message: "An unexpected error occurred",
        details: { raw: data },
        request_id: "unknown",
        timestamp: new Date().toISOString(),
        status,
    };
}