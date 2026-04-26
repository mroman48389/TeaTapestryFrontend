import { isApiError, normalizeApiError, ApiError } from "./errors";

describe("isApiError", () => {
    test("Unit test: Returns true for valid ApiError shape.", () => {
        const err = {
            type: "SomeError",
            message: "Something went wrong",
            request_id: "abc",
            timestamp: "2024-01-01T00:00:00Z",
            status: 400
        };

        expect(isApiError(err)).toBe(true);
    });

    test("Unit test: Returns false for non-object.", () => {
        expect(isApiError(null)).toBe(false);
        expect(isApiError("string")).toBe(false);
        expect(isApiError(123)).toBe(false);
    });

    test("Unit test: Returns false for object missing required fields.", () => {
        expect(isApiError({ type: "X" })).toBe(false);
        expect(isApiError({ message: "X" })).toBe(false);
        expect(isApiError({})).toBe(false);
    });
});

describe("normalizeApiError", () => {
    test("Unit test: Normalizes backend error shape correctly,", () => {
        const backend = {
            error: {
                type: "BadRequest",
                message: "Invalid input",
                details: { field: "name" },
                request_id: "req-123",
                timestamp: "2024-01-01T00:00:00Z",
                status: 400
            }
        };

        const result = normalizeApiError(backend, 400);

        expect(result).toEqual<ApiError>({
            type: "BadRequest",
            message: "Invalid input",
            details: { field: "name" },
            request_id: "req-123",
            timestamp: "2024-01-01T00:00:00Z",
            status: 400
        });
    });

    test("Unit test: Falls back to UnknownError for unexpected shapes.", () => {
        const result = normalizeApiError({ something: "weird" }, 500);

        expect(result.type).toBe("UnknownError");
        expect(result.status).toBe(500);
        expect(result.details).toEqual({ raw: { something: "weird" } });
        expect(typeof result.timestamp).toBe("string");
    });

    test("Unit test: Handles null data gracefully.", () => {
        const result = normalizeApiError(null, 503);

        expect(result.type).toBe("UnknownError");
        expect(result.status).toBe(503);
    });
});
