import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { apiRequest } from "@/api/apiClient/apiClient"
import { ApiError } from "@/api/errors/errors";
import { TeaProfilesResponse } from "@/types/serverResponses";
import { TeaProfilesResponseSchema } from "@/schemas/teaProfiles";

/* Async thunk to fetch tea profiles. The pending, fulfilled, and rejected attributes
   it auto generates (the lifecycle of async requests) are handled by extraReducers.
   
   The action prefix "teaProfiles/fetch" generates teaProfiles/fetch/pending, 
   teaProfiles/fetch/fulfilled, and teaProfiles/fetch/rejected. */
export const fetchTeaProfiles = createAsyncThunk<
    TeaProfilesResponse,
    void,
    { rejectValue: ApiError }
>(
    "teaProfiles/fetch",
    async (_, thunkAPI) => {
        try {
            const data = await apiRequest<TeaProfilesResponse>(
                import.meta.env.VITE_API_URL + "/api/v1/tea_profiles"
            );

            /* Validate JSON with Zod. */
            const parsed = TeaProfilesResponseSchema.safeParse(data);

            if (!parsed.success) {
                return thunkAPI.rejectWithValue({
                    type: "ClientValidationError",
                    message: "Invalid tea_profiles response format",
                    details: parsed.error.format(),
                    request_id: "client",
                    timestamp: new Date().toISOString(),
                    status: 0,
                });
            };

            /* Return fully validated, typed data. */
            return parsed.data;
        }
        catch (err) {
            if (err && (typeof err === "object") && ("type" in err)) {
                return thunkAPI.rejectWithValue(err as ApiError);
            };

            throw err;
        }
    }
);

interface TeaProfilesState {
    data: TeaProfilesResponse;
    loading: boolean;
    error: string | null;
}

const initialState: TeaProfilesState = {
    data: [],
    loading: false,
    error: null,
};

const teaProfilesSlice = createSlice({
    name: "teaProfiles",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchTeaProfiles.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchTeaProfiles.fulfilled, (state, action: PayloadAction<TeaProfilesResponse>) => {
            state.loading = false;
            state.data = action.payload;
        })
        .addCase(fetchTeaProfiles.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? "Unknown error";
        });
    },
});

export default teaProfilesSlice.reducer;