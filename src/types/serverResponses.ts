import { z } from "zod";
import { TeaProfilesResponseSchema } from "@/schemas/teaProfiles";

/* This file defines the API response shapes for Tea Tapestry. It's focus is 
   what the server returns. This file can use schema files such as teaProfiles.ts, 
   but schema files should NOT use this file. */

export interface VersionResponse {
    version: string;
};

export type TeaProfilesResponse = z.infer<typeof TeaProfilesResponseSchema>;