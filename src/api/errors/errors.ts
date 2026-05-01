/* This is the target shape for all backend errors to have. */
export interface ApiError {
    type: string
    message: string
    details?: Record<string, unknown>
    request_id: string
    timestamp: string
    status: number
}

/* Determines if an error is our target ApiError or not by
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

/* Local type describing the actual, raw backend error shape. */
interface BackendErrorShape {
    error: {
        type: string;
        message: string;
        details?: Record<string, unknown>;
        request_id: string;
        timestamp: string;
    };
}

/* Type guard to safely narrow unknown to BackendErrorShape */
function isBackendErrorShape(data: unknown): data is BackendErrorShape {
    if (
        (typeof data !== "object") ||
        (data === null) ||
        !("error" in data)
    ) {
        return false;
    }

    const err = (data as { error: unknown }).error;

    if (
        typeof err !== "object" ||
        err === null ||
        !("type" in err) ||
        !("message" in err)
    ) {
        return false;
    }

    const e = err as Record<string, unknown>;

    return (
        (typeof e.type === "string") &&
        (typeof e.message === "string") &&
        ((e.details === undefined || typeof e.details === "object")) &&
        (typeof e.request_id === "string") &&
        (typeof e.timestamp === "string")
    );
}

/* Converts JSON from backend into an ApiError so every frontend error
   will have the same shape. 
   
   Prefer the HTTP status code passed via parameter rather than data.error.status
   for the status field, since the HTTP status code is the source of truth and the
   status code from the server could potentially be missing, malformed,
   replaced by proxies or middleware. The backend includes "status" is the JSON
   for convenience. */
export function normalizeApiError(data: unknown, status: number): ApiError {
    if (isBackendErrorShape(data)) {
        const error = data.error;

        return {
            type: error.type,
            message: error.message,
            details: error.details,
            request_id: error.request_id,
            timestamp: error.timestamp,
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