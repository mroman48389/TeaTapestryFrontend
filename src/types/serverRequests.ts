export interface SignupRequest {
    email: string;
    password: string;
    display_name: string;
}

export interface VerifyEmailRequest {
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface PasswordResetRequestRequest {
    email: string;
}

export interface PasswordResetSubmissionRequest {
    token: string;
    new_password: string;
}

export interface ConfirmPasswordRequest {
    password: string;
}

export interface TerminateSessionRequest {
    session_id: string;
}