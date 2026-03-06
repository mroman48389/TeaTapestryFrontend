import { z } from "zod";
import { TeaProfilesResponseSchema } from "@/schemas/teaProfiles";

/* This file defines the API response shapes for Tea Tapestry. It's focus is 
   what the server returns. */

export interface VersionResponse {
    version: string;
};

export type TeaProfilesResponse = z.infer<typeof TeaProfilesResponseSchema>;