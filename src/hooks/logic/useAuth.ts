import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

import { 
    selectStatus,
    selectUser,
    selectError
} from "@/store/auth/authSelectors";
import { 
    checkSessionThunk as authCheckSession, 
    logoutThunk as authLogout 
} from "@/store/auth/authSlice";

export function useAuth() {
    const dispatch = useDispatch<AppDispatch>();

    const status = useSelector(selectStatus);
    const user = useSelector(selectUser);
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
        status,
        user,
        error,
        checkSession,
        logout,
    };
}
