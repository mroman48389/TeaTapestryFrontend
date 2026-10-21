import { z } from "zod";

/* Validates the response payload returned by the /auth/logout endpoint. */
export const LogoutResponseSchema = z.object({
    message: z.string(),
});

/* Validates the response payload returned by the /auth/logout_all endpoint. */
export const LogoutAllResponseSchema = z.object({
    message: z.string(),
});