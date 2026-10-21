import { z } from "zod";

export const ActiveSessionSchema = z.object({
    id: z.uuid(),
    created_at: z.iso.datetime({ offset: true }),
    expires_at: z.iso.datetime({ offset: true }),
    revoked_at: z.iso.datetime({ offset: true }).nullable(),
    user_agent: z.string().nullable(),
    ip_address: z.string().nullable(),
});

export type ActiveSession = z.infer<typeof ActiveSessionSchema>;

/* Validates the response payload returned by the /auth/active_sessions endpoint. */
export const ActiveSessionsResponseSchema = z.object({
    sessions: z.array(ActiveSessionSchema),
});

/* Validates the response payload returned by the /auth/terminate_session endpoint. */
export const TerminateSessionResponseSchema = z.object({
    message: z.string(),
});