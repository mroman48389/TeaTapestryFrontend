import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/logic/useAuth";
import { Pages, pageIDs } from "@/constants/pages";

interface RequireAuthProps {
    children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
    const { isLoggedIn, isInitializing } = useAuth();
    const location = useLocation();

    /* Do not redirect while checking initial session cookie. */
    if (isInitializing) {
        return null;
    }

    if (!isLoggedIn) {
        return (
            <Navigate 
                to = {Pages[pageIDs.logIn].path} 
                state = {{ from: location }} 
                replace 
            />
        );
    }

    return ( 
        <>
            {children}
        </>
    );
}
