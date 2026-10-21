import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";

import { apiRequest, apiDownload } from "@/api/apiClient/apiClient";
import { ApiError, isApiError } from "@/api/errors/errors";
import { AuthStatus } from "@/types/auth";
import { AUTH_STATUS } from "@/constants/auth";
import {
    SignupRequest,
    VerifyEmailRequest,
    LoginRequest,
    PasswordResetRequestRequest,
    PasswordResetSubmissionRequest,
    ConfirmPasswordRequest,
    TerminateSessionRequest
} from "@/types/serverRequests";
import { 
    LoginResponse, 
    LogoutResponse,
    LogoutAllResponse,
    UserResponse,
    SendVerificationResponse,
    VerifyEmailResponse,
    PasswordResetRequestResponse,
    PasswordResetSubmissionResponse,
    ActiveSessionsResponse,
    TerminateSessionResponse
} from "@/types/serverResponses";
import { UserResponseSchema } from "@/schemas/auth/userSchema";
import { LoginResponseSchema } from "@/schemas/auth/loginSchema";
import { 
    LogoutResponseSchema, 
    LogoutAllResponseSchema 
} from "@/schemas/auth/logoutSchema";
import { 
    SendVerificationResponseSchema, 
    VerifyEmailResponseSchema 
} from "@/schemas/auth/emailVerificationSchema";
import { 
    PasswordResetRequestResponseSchema,
    PasswordResetSubmissionResponseSchema,
} from "@/schemas/auth/passwordResetSchema";
import { 
    ActiveSessionsResponseSchema,
    TerminateSessionResponseSchema
} from "@/schemas/auth/sessionsSchema";
import { safeLog } from "@/utils/log-utils";

export interface AuthState {
    status: AuthStatus;
    user: UserResponse | null;
    error: ApiError | string | null;
}

const initialState: AuthState = {
    status: AUTH_STATUS.ANONYMOUS,
    user: null,
    error: null,
};

const clearAuthState = (state: AuthState) => {
    state.status = AUTH_STATUS.ANONYMOUS;
    state.user = null;
    state.error = null;
};

/******************************   Thunk helpers   ************************************/

/**
 * Validates raw API response data against a Zod schema or aborts the thunk execution.
 *
 * Parses the incoming payload using the provided schema. If validation succeeds, 
 * it returns the strongly-typed parsed data. If validation fails, it formats the Zod
 * validation errors and throws `thunkAPI.rejectWithValue` with a structured `ClientValidationError`.
 *
 * @template T - The expected output type inferred from the Zod schema.
 * @param data - The raw, unvalidated JSON response returned from `apiRequest`.
 * @param schema - The Zod schema (`z.ZodType<T>`) used to validate and type-check `data`.
 * @param thunkAPI - The Redux Toolkit thunk API object containing `rejectWithValue`. The `rejectWithValue`
 *   function takes our `ApiError` and returns an `unkown` value. The `unknown` accepts whatever payload 
 *   action Redux returns without triggering errors.
 * 
 * @returns The validated and typed data of type `T`.
 * @throws {ReturnType<typeof thunkAPI.rejectWithValue>} Rejects the thunk payload if parsing fails.
 */
function validateOrReject<T>(
    data: unknown,
    schema: z.ZodType<T>,
    thunkAPI: { rejectWithValue: (value: ApiError) => unknown }
): T {
    safeLog("[validateOrReject] Received raw data:", data);
    
    /* Validate JSON with Zod. schema will be inferred as type T 
       (such as UserResponse for the me endpoint). */
    const parsed = schema.safeParse(data);

    if (!parsed.success) {

        safeLog("[validateOrReject] Zod validation failed! Issues:", parsed.error);

        /* Something went wrong during parsing. Reject the value using our `ApiError` shape. */
        throw thunkAPI.rejectWithValue({
            type: "ClientValidationError",
            message: "Invalid API response format.",
            details: z.treeifyError(parsed.error),
            request_id: "client",
            timestamp: new Date().toISOString(),
            status: 0,
        });

    }

    /* Return fully validated and typed data. */
    return parsed.data;
}

/**
 * Safely handles thrown thunk errors by extracting structured API errors.
 *
 * Inspects thrown errors from `apiRequest`. If the error matches our structured
 * `ApiError` format, it throws `thunkAPI.rejectWithValue` to forward the typed 
 * error payload to Redux. Otherwise, it re-throws the raw error.
 *
 * @param err - The caught error object of unknown structure.
 * @param thunkAPI - The Redux Toolkit thunk API object containing `rejectWithValue`.
 *
 * @returns Never returns normally; always throws via `rejectWithValue` or re-throws `err`.
 * @throws {ReturnType<typeof thunkAPI.rejectWithValue>} Rejects the thunk payload with an `ApiError`.
 */
function handleThunkError(
    err: unknown,
    thunkAPI: { rejectWithValue: (value: ApiError) => unknown }
): never {
    if (err && typeof err === "object" && err !== null && "type" in err) {
        throw thunkAPI.rejectWithValue(err as ApiError);
    }

    throw err;
}

/**********************************   Thunks   ************************************/

/*  Checks for a user session by calling the `me` endpoint.

    Do this once on app load so we immediately know if the user is
    logged in or not. This allows us to immediately assess whether 
    we can render content that should only be shown when logged in. 
*/
export const checkSessionThunk = createAsyncThunk<
    UserResponse,
    void,
    { rejectValue: ApiError }
>("auth/checkSessionAction", async (_, thunkAPI) => {

    try {
        const data = await apiRequest<UserResponse>("/auth/me");
        return validateOrReject(data, UserResponseSchema, thunkAPI);
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI)
    }

});

export const signupThunk = createAsyncThunk<
    UserResponse,
    SignupRequest,
    { rejectValue: ApiError }
>("auth/signupAction", async (credentials, thunkAPI) => {

    try {
        const data = await apiRequest<UserResponse>("/auth/signup", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
        return validateOrReject(data, UserResponseSchema, thunkAPI);
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }

});

export const verifyEmailThunk = createAsyncThunk<
    VerifyEmailResponse,
    VerifyEmailRequest,
    { rejectValue: ApiError }
>("auth/verifyEmailAction", async ({ token }, thunkAPI) => {

    try {
        const data = await apiRequest<VerifyEmailResponse>(
            `/auth/verify_email?token=${encodeURIComponent(token)}`, 
            {
                method: "POST",
            }
        );
        return validateOrReject(data, VerifyEmailResponseSchema, thunkAPI);
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }

});

export const sendVerificationThunk = createAsyncThunk<
    SendVerificationResponse,
    void,
    { rejectValue: ApiError }
>("auth/sendVerificationAction", async (_, thunkAPI) => {

    try {
        const data = await apiRequest<SendVerificationResponse>(
            "/auth/send_verification", 
            {
                method: "POST",
            }
        );
        return validateOrReject(data, SendVerificationResponseSchema, thunkAPI);
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }

});

export const loginThunk = createAsyncThunk<
    LoginResponse,
    LoginRequest,
    { rejectValue: ApiError }
>("auth/loginAction", async (credentials, thunkAPI) => {

    try {
        const data = await apiRequest<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
        return validateOrReject(data, LoginResponseSchema, thunkAPI);
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }

});

export const logoutThunk = createAsyncThunk<
    LogoutResponse,
    void,
    { rejectValue: ApiError }
>("auth/logoutAction", async (_, thunkAPI) => {

    try {
        const data = await apiRequest<LogoutResponse>("/auth/logout", { method: "POST" });
        return validateOrReject(data, LogoutResponseSchema, thunkAPI);
    } 
    catch {
        /* Ignore network failure on logout so client-side state wipes regardless. */
        return {
            message: "Logged out",
        };
    }
});

export const logoutAllThunk = createAsyncThunk<
    LogoutAllResponse,
    void,
    { rejectValue: ApiError }
>("auth/logoutAllAction", async (_, thunkAPI) => {

    try {
        const data = await apiRequest<LogoutAllResponse>("/auth/logout_all", { method: "POST" });
        return validateOrReject(data, LogoutAllResponseSchema, thunkAPI);
    } 
    catch {
        /* Ignore network failure on logout so client-side state wipes regardless. */
        return {
            message: "Logged out",
        };
    }
});

export const requestPasswordResetThunk = createAsyncThunk<
    PasswordResetRequestResponse,
    PasswordResetRequestRequest,
    { rejectValue: ApiError }
>("auth/requestPasswordResetAction", async (credentials, thunkAPI) => {

    try {
        const data = await apiRequest<PasswordResetRequestResponse>("/auth/request_password_reset", { 
            method: "POST" ,
            body: JSON.stringify(credentials),
        });
        return validateOrReject(data, PasswordResetRequestResponseSchema, thunkAPI);
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }
});

export const passwordResetSubmissionThunk = createAsyncThunk<
    PasswordResetSubmissionResponse,
    PasswordResetSubmissionRequest,
    { rejectValue: ApiError }
>("auth/passwordResetSubmissionAction", async (credentials, thunkAPI) => {

    try {
        const data = await apiRequest<PasswordResetSubmissionResponse>("/auth/reset_password", { 
            method: "POST" ,
            body: JSON.stringify(credentials),
        });
        return validateOrReject(data, PasswordResetSubmissionResponseSchema, thunkAPI);
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }
});

export const confirmPasswordThunk = createAsyncThunk<
    void,
    ConfirmPasswordRequest,
    { rejectValue: ApiError }
>("auth/confirmPasswordAction", async (credentials, thunkAPI) => {

    try {
        /* This endpoint has no response body, simply returing a 204. 
           So, there is no data to validate. */
        await apiRequest("/auth/confirm_password", { 
            method: "POST" ,
            body: JSON.stringify(credentials),
        });
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }
});

export const activeSessionsThunk = createAsyncThunk<
    ActiveSessionsResponse,
    void,
    { rejectValue: ApiError }
>("auth/activeSessionsAction", async (_, thunkAPI) => {

    try {
        const data = await apiRequest<ActiveSessionsResponse>("/auth/active_sessions", { 
            method: "GET" ,
        });
        return validateOrReject(data, ActiveSessionsResponseSchema, thunkAPI);
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }
});

export const terminateSessionThunk = createAsyncThunk<
    TerminateSessionResponse,
    TerminateSessionRequest,
    { rejectValue: ApiError }
>("auth/terminateSessionAction", async ({session_id}, thunkAPI) => {

    try {
        const data = await apiRequest<TerminateSessionResponse>(
            `/auth/terminate_session/${session_id}`, { 
                method: "POST" ,
            }
        );
        return validateOrReject(data, TerminateSessionResponseSchema, thunkAPI);
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }
});

export const exportUserDataThunk = createAsyncThunk<
    void, 
    void,
    { rejectValue: ApiError }
>("auth/exportUserDataAction", async (_, thunkAPI) => {

    try {
        /* We should be getting a raw response / blob for this endpoint. */
        const { blob, fileName } = await apiDownload(
            "/auth/export_user_data", { 
                method: "GET" ,
            }
        );
        
        /* Create temporary object URL in browser memory. */
        const url = window.URL.createObjectURL(blob);

        /* Create invisible <a> DOM element. */
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;
        
        /* Mount element to DOM and trigger download. */
        document.body.appendChild(link);
        link.click();
        
        /* Unmount element and free browser memory. */
        link.remove();
        window.URL.revokeObjectURL(url);
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }
});

export const deleteUserDataThunk = createAsyncThunk<
    void,
    void,
    { rejectValue: ApiError }
>("auth/deleteUserDataAction", async (_, thunkAPI) => {

    try {
        await apiRequest("/auth/delete_user_data", {method: "DELETE"});
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }

});

export const deleteUserAccountThunk = createAsyncThunk<
    void,
    void,
    { rejectValue: ApiError }
>("auth/deleteUserAccountAction", async (_, thunkAPI) => {

    try {
        await apiRequest("/auth/delete_user_account", {method: "DELETE"});
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }

});

const authSlice = createSlice({
    name: "auth",

    initialState,

    /* For state updates by actions belonging exclusively to this slice. */
    reducers: {
        /* Give components a way to clear stale errors without needing to 
           wait for a full thunk dispatch (such as when as user starts
           typing on a form to fix an error). */
        clearAuthError: (state) => {
            state.error = null;
        }
    },

    /* For state updates by actions defined outside of this slice. */
    extraReducers: (builder) => {
        builder
            .addCase(checkSessionThunk.pending, (state) => {
                state.status = AUTH_STATUS.INITIALIZING;
                state.error = null;
            })
            .addCase(checkSessionThunk.fulfilled, (state, action: PayloadAction<UserResponse>) => {
                state.status = AUTH_STATUS.AUTHENTICATED;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(checkSessionThunk.rejected, (state) => {
                state.status = AUTH_STATUS.ANONYMOUS;
                state.user = null;
                state.error = null;

            })

            .addCase(loginThunk.pending, (state) => {
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state) => {
                state.status = AUTH_STATUS.AUTHENTICATED;
                state.error = null;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.status = AUTH_STATUS.ANONYMOUS;
                state.user = null;
                state.error = action.payload ?? action.error.message ?? "Login failed";
            })

            .addCase(logoutThunk.fulfilled, clearAuthState)

            .addCase(logoutAllThunk.fulfilled, clearAuthState)

            .addCase(passwordResetSubmissionThunk.fulfilled, clearAuthState)

            .addCase(deleteUserAccountThunk.fulfilled, clearAuthState);
    },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
