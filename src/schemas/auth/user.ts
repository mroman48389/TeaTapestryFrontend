import { z } from "zod";

/* This file defines the shape of a Tea Tapestry user object. 
   It's focus is data modeling and validation. */

/* For: validating/typing a single user profile or working with a user
   inside handlers, components. Matches UserOutboundSchema from the backend. */
export const UserSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    display_name: z.string().min(1).max(30),
    created_at: z.iso.datetime(),
    verified_at: z.iso.datetime().nullable().optional(),
});

/* For: validating the /auth/me endpoint response payload from the backend. */
export const UserResponseSchema = UserSchema;

export type User = z.infer<typeof UserSchema>; 