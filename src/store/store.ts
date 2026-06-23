import { configureStore } from "@reduxjs/toolkit";

import selectedPageReducer from "./selectedPageSlice";
import teaProfilesReducer from "./teaProfilesSlice";
import authReducer from "./auth/authSlice";

export const store = configureStore({
    reducer: {
        selectedPage: selectedPageReducer,
        teaProfiles: teaProfilesReducer,
        auth: authReducer,
    },
});

/* Entire Redux state tree for app. */
export type RootState = ReturnType<typeof store.getState>; // entire Redux state tree (app state)
export type AppDispatch = typeof store.dispatch;

//console.log(typeof selectedPageReducer);