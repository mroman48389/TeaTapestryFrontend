import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
    isLoggedIn: boolean;
    user: null | { id: string; email: string }; // placeholder
    accessToken: null | string; //placeholder
}

const initialState: AuthState = {
    isLoggedIn: false,
    user: null,
    accessToken: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ id: string; email: string }>) => {
            state.isLoggedIn = true;
            state.user = action.payload;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
