import { RootState } from "@/store/store";

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
