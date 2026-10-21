import { z } from "zod";

/* Validates the response payload returned by the /auth/login endpoint. */
export const LoginResponseSchema = z.object({
    access_token: z.string(),
    token_type: z.string(),
});