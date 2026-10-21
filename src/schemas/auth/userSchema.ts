import { z } from "zod";

/* Validates the response payload returned by endpoints which return a UserResponseSchema. 
   This includes the /auth/signup and /auth/me endpoints. */
export const UserResponseSchema = z.object({
    id: z.uuid("Invalid UUID format"),

    email: z.email("Invalid email address"),
    
    display_name: z
        .string()
        .min(1, "Display name is required")
        .max(30, "Display name cannot exceed 30 characters")
        .regex(/^[A-Za-z0-9\-\s]+$/, "Display name contains invalid characters"),

    /* Allow ISO strings with timezone offsets like -04:00, or Zod will not accept 
       our timestamps from the backend. */
    created_at: z.iso.datetime({ offset: true }),
    
    verified_at: z.iso.datetime({ offset: true }).nullable(),
});