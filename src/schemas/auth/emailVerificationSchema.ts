import { z } from "zod";

/* Validates the response payload returned by the /auth/send_verification endpoint. */
export const SendVerificationResponseSchema = z.object({
    message: z.string(),
});

/* Validates the response payload returned by the /auth/verify_email endpoint. */
export const VerifyEmailResponseSchema = z.object({
    message: z.string(),
});