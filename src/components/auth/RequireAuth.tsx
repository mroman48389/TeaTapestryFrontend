import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/logic/useAuth";
import { Pages, pageIDs } from "@/constants/pages";
import { AUTH_STATUS } from "@/constants/auth";

interface RequireAuthProps {
    children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
    const { status } = useAuth();
    const location = useLocation();

    /* Do not redirect while checking initial session cookie. */
    if (status === AUTH_STATUS.INITIALIZING) {
        return null;
    }

    if (status !== AUTH_STATUS.AUTHENTICATED) {
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
