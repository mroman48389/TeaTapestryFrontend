import { z } from "zod";

/* This file defines the shape of the Tea Tapestry user tea profile notes. The notes are
   a subset of the TeaProfile schema fields. Used for validating user inut before saving
   and typing JSONB storage in the database. */

export const UserTeaProfileNotesSchema = z.object({
    alternative_names: z.string().default(""),
    subregions: z.string().default(""),
    cultural_significance: z.string().default(""),
    cultural_significance_source: z.string().default(""),
    oxidation_level: z.string().default(""),
    cultivars: z.string().default(""),
    pricing: z.string().default(""),
    processing: z.string().default(""),
    dry_leaf_appearance: z.string().default(""),
    dry_leaf_aroma: z.string().default(""),
    liquor_appearance: z.string().default(""),
    liquor_aroma: z.string().default(""),
    liquor_taste: z.string().default(""),
    liquor_body_mouthfeel: z.string().default(""),
    body_effect: z.string().default(""),
    wet_leaf_appearance: z.string().default(""),
    wet_leaf_aroma: z.string().default(""),
});

/* For typing user notes throughout the app. */
export type UserTeaProfileNotes = z.infer<typeof UserTeaProfileNotesSchema>;
