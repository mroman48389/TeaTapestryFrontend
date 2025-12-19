import { z } from "zod";
import { TeaProfilesResponseSchema } from "@/schemas/teaProfiles";

export interface VersionResponse {
    version: string;
};

export type TeaProfilesResponse = z.infer<typeof TeaProfilesResponseSchema>;