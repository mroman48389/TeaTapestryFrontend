import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

import { 
    selectIsLoggedIn,
    selectUser,
    selectIsInitializing,
    selectError
} from "@/store/auth/authSelectors";
import { 
    checkSession as authCheckSession, 
    logout as authLogout 
} from "@/store/auth/authSlice";

export function useAuth() {
    const dispatch = useDispatch<AppDispatch>();

    const isLoggedIn = useSelector(selectIsLoggedIn);
    const user = useSelector(selectUser);
    const isInitializing = useSelector(selectIsInitializing);
    const error = useSelector(selectError);

    /* () => dispatch(...) will be new function references every time
       useAuth runs unless we use useCallback(). */

    const checkSession = useCallback(() => {
        dispatch(authCheckSession());
    }, [dispatch]);

    const logout = useCallback(() => {
        dispatch(authLogout());
    }, [dispatch]);

    return {
        isLoggedIn,
        user,
        isInitializing,
        error,
        checkSession,
        logout,
    };
}
