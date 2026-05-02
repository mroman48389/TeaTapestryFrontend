import { apiRequest } from "./apiClient";
import { normalizeApiError } from "../errors/errors";

jest.mock("../errors/errors", () => ({
    normalizeApiError: jest.fn()
}));

process.env.API_URL = "http://localhost:8000";

describe("apiRequest", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("Unit test: Returns parsed JSON on success.", async () => {
        const mockResponse = { hello: "world" };

        /* Replace the real fetch function with a mock of desired behavior
           within our test environment. Instead of a real HTTP request, 
           mimic a Response object. */
        global.fetch = jest.fn().mockResolvedValue({
            ok: true, // simulate a successful HTTP response
            json: () => Promise.resolve(mockResponse) // simulate response.json()
        } as unknown as Response);

        const result = await apiRequest<typeof mockResponse>("/test");

        expect(result).toEqual(mockResponse);
        expect(fetch).toHaveBeenCalledWith("http://localhost:8000/test", expect.any(Object));
    });

    test("Unit test: Throws normalized error on non-OK response.", async () => {
        const backendError = { error: { type: "Bad", message: "Oops" } };
        const normalized = { type: "Bad", message: "Oops", status: 400 };

        /* Treat the normalizeApiError function as a mock function so it can be
           configured to return the normalized object above. */
        (normalizeApiError as jest.Mock).mockReturnValue(normalized);

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: () => Promise.resolve(backendError)
        } as unknown as Response);

        await expect(apiRequest("/test")).rejects.toEqual(normalized);

        expect(normalizeApiError).toHaveBeenCalledWith(backendError, 400);
    });

    test("Unit test: Handles invalid JSON bodies gracefully.", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.reject(new Error("invalid json"))
        } as unknown as Response);

        const result = await apiRequest("/test");

        /* Data stays null, but returned as T */
        expect(result).toBeNull();
    });
});
