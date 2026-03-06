import { z } from "zod";

/* This file defines the shape of the Tea Tapestry tea profiles domain object. 
   It's focus is data modeling and validation. */

/* For: validating/typing a single tea  profile or working with a tea profile 
   inside loops, handlers, components. 
   
   Use .default([]) on optional arrays to avoid needing to check that they
   are not null everywhere. */
export const TeaProfileSchema = z.object({
    id: z.number(),
    name: z.string(),
    alternative_names: z.array(z.string()).default([]),
    tea_type: z.string(),
    cultivars: z.array(z.string()),
    processing: z.string().nullable(),
    oxidation_level: z.string().nullable(),
    cultural_significance: z.string().nullable(),
    cultural_significance_source: z.string().nullable(),
    country_of_origin: z.string(),
    subregions: z.array(z.string()).default([]),
    avg_price_per_oz_usd: z.number().nullable(),
    liquor_appearance: z.array(z.string()),
    liquor_aroma: z.array(z.string()),
    liquor_taste: z.array(z.string()),
    liquor_body_mouthfeel: z.array(z.string()).default([]),
    body_effect: z.array(z.string()).default([]),
    dry_leaf_appearance: z.array(z.string()).default([]),
    dry_leaf_aroma: z.array(z.string()).default([]),
    wet_leaf_appearance: z.array(z.string()).default([]),
    wet_leaf_aroma: z.array(z.string()).default([]),
});

/* For: validating the entire response from the server and parsing it. */
export const TeaProfilesResponseSchema = z.array(TeaProfileSchema);

/* For: filtering, sorting, mapping, dealing with subsets of tea profiles, 
   memoizing derived lists. */
export type TeaProfile = z.infer<typeof TeaProfileSchema>; 
export type TeaProfiles = TeaProfile[];