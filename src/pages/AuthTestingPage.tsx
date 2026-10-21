import { useState } from 'react';
import { AUTH_STATUS } from '@/constants/auth';
import { ActiveSessionsResponse } from '@/types/serverResponses';
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { 
    signupThunk, 
    sendVerificationThunk, 
    verifyEmailThunk, 
    checkSessionThunk, 
    loginThunk, 
    logoutThunk,
    logoutAllThunk,
    requestPasswordResetThunk,
    passwordResetSubmissionThunk,
    confirmPasswordThunk,
    activeSessionsThunk,
    terminateSessionThunk,
    exportUserDataThunk,
    deleteUserDataThunk,
    deleteUserAccountThunk
} from "@/store/auth/authSlice";
import { apiRequest } from "@/api/apiClient/apiClient";
import { extractErrorMessage } from '@/api/errors/errors';

export default function AuthTestingPage() {
    const dispatch = useAppDispatch();
    const [statusMessage, setStatusMessage] = useState<string>("Waiting for action.");
    const [emailVerificationToken, setEmailVerificationToken] = useState<string>("");
    const [passwordResetToken, setPasswordResetToken] = useState<string>("");
    const [activeSessions, setActiveSessions] = useState<ActiveSessionsResponse | null>(null);
    const authStatus = useAppSelector((state) => state.auth.status);

    const email = "a";
    const displayName = "b";
    const original_password = "c";
    const new_password = "d"

    const onCheckSession = async () => {
        try {
            setStatusMessage("Checking session...");

            const sessionUser = await dispatch(checkSessionThunk()).unwrap();

            setStatusMessage(`Active session found for ${sessionUser.email}`);
        } 
        catch (err: unknown) {
            setStatusMessage(`Session check: ${extractErrorMessage(err, "No active session found.")}`);
        }
    };

    const onRefresh = async () => {
        try {
            setStatusMessage("Triggering  refresh...");

            await apiRequest("/auth/refresh", { method: "POST" });

            setStatusMessage("Token refreshed successfully!");
        } 
        catch (err: unknown) {
            setStatusMessage(`Refresh failed: ${extractErrorMessage(err, "Refresh failed.")}`);
        }
    };

    const onActiveSessions = async () => {
        try {
            setStatusMessage("Retrieving a list of active sessions...");

            const activeSessions = await dispatch(activeSessionsThunk()).unwrap();
            setActiveSessions(activeSessions);

            setStatusMessage(`Active session list retrieved. There are ${activeSessions.sessions.length} active sessions.`);
        } 
        catch (err: unknown) {
            setStatusMessage(`Error while retrieving action sessions: ${extractErrorMessage(err, "Error retrieving active sessions.")}`);
        }
    };

    const onTerminateSession = async () => {
        try {
            if (activeSessions && activeSessions.sessions[0]) {
                setStatusMessage("Terminating the active session...");

                await dispatch(terminateSessionThunk({
                    session_id: activeSessions.sessions[0].id
                })).unwrap();

                setStatusMessage("Active session terminated.");
            }
            else {
                setStatusMessage("No active session.");
            }
        } 
        catch (err: unknown) {
            setStatusMessage(`
                Error while termininating the active session: 
                ${extractErrorMessage(err, "Error while terminating active session.")}
            `);
        }
    };

    const onSignup = async () => {
        try {
            setStatusMessage("Signing up...");

            const sessionUser = await dispatch(signupThunk({
                email: email,
                password: original_password,
                display_name: displayName
            })).unwrap();

            setStatusMessage(
                `Signed up a user, ${sessionUser.display_name}, 
                with email: ${sessionUser.email}, 
                created at ${new Date(sessionUser.created_at).toLocaleDateString()}`
            );
        } 
        catch (err: unknown) {
            setStatusMessage(`Failed to sign user up: ${extractErrorMessage(err, "Failed to sign user up.")}`);
        }
    };

    const onSendVerification = async () => {
        try {
            const result = await dispatch(sendVerificationThunk()).unwrap();

            setStatusMessage(result.message);
        } 
        catch (err) {
            setStatusMessage(extractErrorMessage(err));
        }
    };

    const onVerifyEmail = async () => {
        try {
            const result = await dispatch(verifyEmailThunk({
                token: emailVerificationToken
            })).unwrap();

            setStatusMessage(result.message);
        } 
        catch (err) {
            setStatusMessage(extractErrorMessage(err));
        }
    };

    const onLogin = async (pw: string) => {
        try {
            setStatusMessage("Logging in...");

            /* .unwrap() extracts the resolved UserResponse payload or throws the rejected ApiError */
            const userData = await dispatch(
                loginThunk({
                    email: email,
                    password: pw,
                })
            ).unwrap();

            setStatusMessage(`Login successful! Received token of type ${userData.token_type}`); 
        } 
        catch (err: unknown) {
            setStatusMessage(`Login failed: ${extractErrorMessage(err, "Login failed.")}`)
        }
    };

    const onLogout = async () => {
        try {
            setStatusMessage("Logging out...");

            await dispatch(logoutThunk()).unwrap();

            setStatusMessage("Logged out successfully.");
        } 
        catch (err: unknown) {
            setStatusMessage(`Logged out with errors: ${extractErrorMessage(err, "Logged out with errors.")}`);
        }
    };

    const onLogoutAll = async () => {
        try {
            setStatusMessage("Logging out of all devices...");

            await dispatch(logoutAllThunk()).unwrap();

            setStatusMessage("Logged out of all devices successfully.");
        } 
        catch (err: unknown) {
            setStatusMessage(`Logged out of all devices with errors: ${extractErrorMessage(err, "Logged out of all devices with errors.")}`);
        }
    };

    const onRequestPasswordReset = async () => {
        try {
            setStatusMessage("Sending password reset email...");

            await dispatch(requestPasswordResetThunk({
                email: email
            })).unwrap();

            setStatusMessage("Password reset email sent.");
        } 
        catch (err: unknown) {
            setStatusMessage(`Error while sending password reset email: ${extractErrorMessage(err, "Error while sending password reset email.")}`);
        }
    };

    const onResetPassword = async () => {
        try {
            setStatusMessage("Resetting password...");

            await dispatch(passwordResetSubmissionThunk({
                token: passwordResetToken,
                new_password: new_password
            })).unwrap();

            setStatusMessage("Password has been reset.");
        } 
        catch (err: unknown) {
            setStatusMessage(`Error while resetting password: ${extractErrorMessage(err, "Error while resetting password.")}`);
        }
    };

    const onConfirmPassword = async () => {
        try {
            setStatusMessage("Confirming password...");

            await dispatch(confirmPasswordThunk({
                password: new_password
            })).unwrap();

            setStatusMessage("Password confirmed.");
        } 
        catch (err: unknown) {
            setStatusMessage(`Error while confirming password: ${extractErrorMessage(err, "Error while confirming password.")}`);
        }
    };

    const onExportUserData = async () => {
        try {
            setStatusMessage("Exporting user data...");

            await dispatch(exportUserDataThunk()).unwrap();

            setStatusMessage("User data has been exported.");
        } 
        catch (err: unknown) {
            setStatusMessage(`Error while exporting user data: ${extractErrorMessage(err, "Error while exporting user data.")}`);
        }
    };

    const onDeleteUserData = async () => {
        try {
            setStatusMessage("Deleting user data...");

            await dispatch(deleteUserDataThunk()).unwrap();

            setStatusMessage("User data has been deleted.");
        } 
        catch (err: unknown) {
            setStatusMessage(`Error while deleting user data: ${extractErrorMessage(err, "Error while deleting user data.")}`);
        }
    };

    const onDeleteUserAccount = async () => {
        try {
            setStatusMessage("Deleting user data...");

            await dispatch(deleteUserAccountThunk()).unwrap();

            setStatusMessage("User data has been deleted.");
        } 
        catch (err: unknown) {
            setStatusMessage(`Error while deleting user data: ${extractErrorMessage(err, "Error while deleting user data.")}`);
        }
    };

    /* Auth system testing order:
       
       1. Unauthenticated Checks
           a) ME - Initial unauthenticated fetch should fail gracefully with a 401.
           b) REFRESH - Manual refresh without existing session cookies should fail gracefully.

       2. Account Creation and Verification
           a) SIGNUP - Register new user account.
           b) SEND_VERIFICATION - Request email verification.
           c) VERIFY_EMAIL - Pass the token to confirm the user account is active.

       3. Password Reset Flow (Unauthenticated)
           a) REQUEST_PASSWORD_RESET - Trigger password recovery email generation for user.
           b) RESET_PASSWORD - Pass the reset token and new password to confirm credential reset flow.

       4. Core Authentication & Session Verification
           a) LOGIN - Authenticate with newly verified credentials. Browser should only get HTTP-only session cookies.
           b) ME - Verify user profile state in Redux store and valid session cookies.

       5. Sensitive Action Security Guardrail
           a) CONFIRM_PASSWORD - Verify password re-entry prior to destructive avents.

       6. Session Management and Refresh Mechanics
           a) ACTIVE_SESSIONS - Get all active devices and sessions for the logged-in user.
           b) REFRESH - Trigger token rotation to test isRefreshing and refreshSubscribers.
           c) TERMINATE_SESSION - Invalidate one of the sessions from the active sessions list.
           d) ACTIVE_SESSIONS - Make sure the targeted session is no longer there.

       7. Teardown and Multi-Device Revocation
           a) LOGOUT - Log out of the current device and verify cookies were cleared and store is reset.
           b) LOGIN 
           c) LOGOUT_ALL - Revoke session tokens from all devices.
           d) LOGIN

       8. Data Privacy and Account Teardown
           a) EXPORT_USER_DATA
           b) DELETE_USER_DATA
           c) DELETE_USER_ACCOUNT
           d) ME - We should get a 401 and reset Redux state.
    */

    const standardBtnClassName = "rounded-lg px-4 py-2 mr-5 bg-zisha-brown text-white"

    const disabledBtnClassName = 
        `                                
            transition 
            hover:bg-zisha-brown/50
            disabled:cursor-not-allowed
            disabled:opacity-50
            disabled:hover:bg-zisha-brown
        `
    return (
        <>
            <div className = "border-2 border-blue-600 p-2 m-2">
                <div className = "pb-2">
                    {`1. Unauthenticated Checks`}
                </div>
                
                <button
                    className = {standardBtnClassName}
                    onClick = {onCheckSession}
                >
                    Check session
                </button>

                <button
                    className = {standardBtnClassName}
                    onClick = {onRefresh}
                >
                    Refresh
                </button>

                <div className = "text-zisha-brown p-2">
                    {statusMessage}
                </div>
            </div>

            <div className = "border-2 border-blue-600 p-2 m-2">
                <div className = "pb-2">
                    {`2. Account Creation and Initial Verification`}
                </div>

                <button
                    className = {standardBtnClassName}
                    onClick = {onSignup}
                >
                    Sign up
                </button>

                <label 
                    htmlFor = "verification-token"
                    className = "p-2"
                >
                    Enter verification token
                </label>
                <input 
                    type = "text" 
                    id = "verification-token" 
                    name = "verification-token-input" 
                    className = "bg-zisha-brown text-white p-2 mr-5"
                    onChange = {(e) => setEmailVerificationToken(e.target.value)}
                >
                
                </input>

                <button
                    className = {standardBtnClassName}
                    onClick = {onVerifyEmail}
                >
                    Verify email
                </button>

                <div className = "text-zisha-brown p-2">
                    {statusMessage}
                </div>
            </div>

            <div className = "border-2 border-blue-600 p-2 m-2">
                <div className = "pb-2">
                    {`3. Resend Verification`}
                </div>

                <button
                    className = {standardBtnClassName}
                    onClick = {onSignup}
                >
                    Sign up
                </button>

                <button
                    className = {standardBtnClassName}
                    onClick = {() => onLogin(original_password)}
                >
                    Log in
                </button>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onSendVerification}
                >
                    Resend verification email
                </button>

                <label 
                    htmlFor = "verification-token"
                    className = "p-2"
                >
                    Enter verification token
                </label>
                <input 
                    type = "text" 
                    id = "verification-token" 
                    name = "verification-token-input" 
                    className = "bg-zisha-brown text-white p-2 mr-5"
                    onChange = {(e) => setEmailVerificationToken(e.target.value)}
                >
                
                </input>

                <button
                    className = {standardBtnClassName}
                    onClick = {onVerifyEmail}
                >
                    Verify email
                </button>

                <div className = "text-zisha-brown p-2">
                    {statusMessage}
                </div>

            </div>

            <div className = "border-2 border-blue-600 p-2 m-2">
                <div className = "pb-2">
                    {`4. Password Recovery`}
                </div>

                <button
                    className = {standardBtnClassName}
                    onClick = {onRequestPasswordReset}
                >
                    Request password reset
                </button>

                <label 
                    htmlFor = "password-reset-token"
                    className = "p-2"
                >
                    Enter password reset token
                </label>
                <input 
                    type = "text" 
                    id = "password-reset-token" 
                    name = "password-reset-token-input" 
                    className = "bg-zisha-brown text-white p-2 mr-5"
                    onChange = {(e) => setPasswordResetToken(e.target.value)}
                >
                
                </input>

                <button
                    className = {standardBtnClassName}
                    onClick = {onResetPassword}
                >
                    Reset password
                </button>

                <div className = "text-zisha-brown p-2">
                    {statusMessage}
                </div>
            </div>

            <div className = "border-2 border-blue-600 p-2 m-2">
                <div className = "pb-2">
                    {`5. Authentication and Initial Identity Check`}
                </div>

                <button
                    className = {standardBtnClassName}
                    onClick = {() => onLogin(new_password)}
                >
                    Login
                </button>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onCheckSession}
                >
                    Check session
                </button>
                
                <div className = "text-zisha-brown p-2">
                    {statusMessage}
                </div>
            </div>

            <div className = "border-2 border-blue-600 p-2 m-2">
                <div className = "pb-2">
                    {`6. Sensitive Action Security Guardrail`}
                </div>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onConfirmPassword}
                >
                    Confirm password
                </button>
                
                <div className = "text-zisha-brown p-2">
                    {statusMessage}
                </div>
            </div>

            <div className = "border-2 border-blue-600 p-2 m-2">
                <div className = "pb-2">
                    {`7. Session Management and Refresh Interceptor Mechanics`}
                </div>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onActiveSessions}
                >
                    Active sessions
                </button>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onRefresh}
                >
                    Refresh
                </button>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {(authStatus !== AUTH_STATUS.AUTHENTICATED) || (!activeSessions)} 
                    onClick = {onTerminateSession}
                >
                    Terminate session
                </button>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onActiveSessions}
                >
                    Active sessions
                </button>
                
                <div className = "text-zisha-brown p-2">
                    {statusMessage}
                </div>
            </div>

            <div className = "border-2 border-blue-600 p-2 m-2">
                <div className = "pb-2">
                    {`8. Session Teardown and Global Invalidation`}
                </div>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onLogout}
                >
                    Logout
                </button>

                <button
                    className = {standardBtnClassName}
                    onClick = {() => onLogin(new_password)}
                >
                    Login
                </button>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onLogoutAll}
                >
                    Logout all
                </button>

                <button
                    className = {standardBtnClassName}
                    onClick = {() => onLogin(new_password)}
                >
                    Login
                </button>

                <div className = "text-zisha-brown p-2">
                    {statusMessage}
                </div>
            </div>

            <div className = "border-2 border-blue-600 p-2 m-2">
                <div className = "pb-2">
                    {`9. Data Privacy and Account Deletion`}
                </div>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onExportUserData}
                >
                    Export user data
                </button>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onDeleteUserData}
                >
                    Delete user data
                </button>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onDeleteUserAccount}
                >
                    Delete user account
                </button>

                <button
                    className = {`${standardBtnClassName} ${disabledBtnClassName}`}
                    disabled = {authStatus !== AUTH_STATUS.AUTHENTICATED} 
                    onClick = {onCheckSession}
                >
                    Check session
                </button>

                <div className = "text-zisha-brown p-2">
                    {statusMessage}
                </div>
            </div>
        </>
    );
}