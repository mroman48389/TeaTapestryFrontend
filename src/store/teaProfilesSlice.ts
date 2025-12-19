import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { TeaProfilesResponse } from "@/types/serverResponses";
import { TeaProfilesResponseSchema } from "@/schemas/teaProfiles";

/* Async thunk to fetch tea profiles. The pending, fulfilled, and rejected attributes
   it auto generates (the lifecycle of async requests) are handled by extraReducers. */
export const fetchTeaProfiles = createAsyncThunk<TeaProfilesResponse>(
    "teaProfiles/fetch",
    async () => {
        /* Fetch data (remember, we can't use hooks since we're not in a component!), 
           raising an error if something went wrong. */
        const res = await fetch(import.meta.env.VITE_API_URL + "/api/v1/tea_profiles");
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        /* Convert response to JSON. */
        const json = await res.json();

        /* Validate JSON with Zod. */
        const parsed = TeaProfilesResponseSchema.safeParse(json);

        /* If we did not successfully parse the JSON, raise an error. */
        if (!parsed.success) {
            console.error("Tea profiles validation error:", parsed.error);
            throw new Error("Invalid tea_profiles response format.");
        }

        /* Return fully validated, typed data. */
        return parsed.data;
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