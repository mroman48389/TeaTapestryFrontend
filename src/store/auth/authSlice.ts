import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { apiRequest } from "@/api/apiClient/apiClient";
import { ApiError } from "@/api/errors/errors";
import { UserResponse } from "@/types/serverResponses";
import { UserResponseSchema } from "@/schemas/auth/user";

export interface AuthState {
    isLoggedIn: boolean;
    user: UserResponse | null;
    isInitializing: boolean;
    error: ApiError | string | null;
    // accessToken: null | string; 
}

const initialState: AuthState = {
    isLoggedIn: false,
    user: null,
    isInitializing: true,
    error: null,
    // accessToken: null,
};

/* Check for a user session on app load (once). */
export const checkSession = createAsyncThunk<
    UserResponse,
    void,
    { rejectValue: ApiError }
>(
    "auth/checkSession",
    async (_, thunkAPI) => {
        try {
            const data = await apiRequest<UserResponse>("/auth/me");

            /* Validate JSON with Zod. */
            const parsed = UserResponseSchema.safeParse(data);

            if (!parsed.success) {
                return thunkAPI.rejectWithValue({
                    type: "ClientValidationError",
                    message: "Invalid auth user response format.",
                    details: parsed.error.format(),
                    request_id: "client",
                    timestamp: new Date().toISOString(),
                    status: 0,
                });
            }

            /* Return fully validated, typed user data. */
            return parsed.data;
        } 
        catch (err) {
            if (err && (typeof err === "object") && ("type" in err)) {
                return thunkAPI.rejectWithValue(err as ApiError);
            }

            throw err;
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<UserResponse>) => {
            state.isLoggedIn = true;
            state.user = action.payload;
            state.error = null;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkSession.pending, (state) => {
                state.isInitializing = true;
                state.error = null;
            })
            .addCase(checkSession.fulfilled, (state, action: PayloadAction<UserResponse>) => {
                state.isInitializing = false;
                state.isLoggedIn = true;
                state.user = action.payload;
            })
            .addCase(checkSession.rejected, (state, action) => {
                state.isInitializing = false;
                state.isLoggedIn = false;
                state.user = null;
                /* A 401 on session check means the user has no active session,
                   but attach the error if a rejected payload exists. */
                if (action.payload) {
                    state.error = action.payload;
                } 
                else {
                    state.error = action.error.message ?? "Unknown error";
                }
            });
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
