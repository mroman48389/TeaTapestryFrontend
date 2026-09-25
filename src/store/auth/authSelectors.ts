import { RootState } from "@/store/store";

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsInitializing = (state: RootState) => state.auth.isInitializing;
export const selectError = (state: RootState) => state.auth.error;