import { z } from "zod";

/* Validates the response payload returned by the /auth/request_password_reset endpoint. */
export const PasswordResetRequestResponseSchema = z.object({
    message: z.string(),
});

/* Validates the response payload returned by the /auth/reset_password endpoint. */
export const PasswordResetSubmissionResponseSchema = z.object({
    message: z.string(),
});