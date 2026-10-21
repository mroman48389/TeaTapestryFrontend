import { z } from "zod";
import { TeaProfilesResponseSchema } from "@/schemas/teaProfilesSchema";
import { UserTeaProfileNotesSchema } from "@/schemas/userTeaProfileNotesSchema";
import { LoginResponseSchema } from "@/schemas/auth/loginSchema";
import { 
    LogoutResponseSchema, 
    LogoutAllResponseSchema 
} from "@/schemas/auth/logoutSchema";
import { UserResponseSchema } from "@/schemas/auth/userSchema";
import { 
    SendVerificationResponseSchema,
    VerifyEmailResponseSchema
} from "@/schemas/auth/emailVerificationSchema";
import { 
    PasswordResetRequestResponseSchema, 
    PasswordResetSubmissionResponseSchema 
} from "@/schemas/auth/passwordResetSchema";
import { 
    ActiveSessionsResponseSchema, 
    TerminateSessionResponseSchema 
} from "@/schemas/auth/sessionsSchema";

/* This file defines the API response shapes for Tea Tapestry. It's focus is 
   what the server returns. This file can use schema files such as teaProfiles.ts, 
   but schema files should NOT use this file. */

export interface VersionResponse {
    version: string;
};

export type TeaProfilesResponse = z.infer<typeof TeaProfilesResponseSchema>;
export type UserTeaProfileNotes = z.infer<typeof UserTeaProfileNotesSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type LogoutAllResponse = z.infer<typeof LogoutAllResponseSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type SendVerificationResponse = z.infer<typeof SendVerificationResponseSchema>;
export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;
export type PasswordResetRequestResponse = z.infer<typeof PasswordResetRequestResponseSchema>;
export type PasswordResetSubmissionResponse = z.infer<typeof PasswordResetSubmissionResponseSchema>;
export type ActiveSessionsResponse = z.infer<typeof ActiveSessionsResponseSchema>;
export type TerminateSessionResponse = z.infer<typeof TerminateSessionResponseSchema>;