import { z } from "zod";

export const TeaProfileSchema = z.object({
    id: z.number(),
    name: z.string(),
    alternative_names: z.array(z.string()).nullable(),
    tea_type: z.string(),
    cultivars: z.array(z.string()),
    processing: z.string().nullable(),
    oxidation_level: z.string().nullable(),
    cultural_significance: z.string().nullable(),
    cultural_significance_source: z.string().nullable(),
    country_of_origin: z.string(),
    subregions: z.array(z.string()).nullable(),
    avg_price_per_oz_usd: z.number().nullable(),
    liquor_appearance: z.array(z.string()),
    liquor_aroma: z.array(z.string()),
    liquor_taste: z.array(z.string()),
    liquor_body_mouthfeel: z.array(z.string()).nullable(),
    body_effect: z.array(z.string()).nullable(),
    dry_leaf_appearance: z.array(z.string()).nullable(),
    dry_leaf_aroma: z.array(z.string()).nullable(),
    wet_leaf_appearance: z.array(z.string()).nullable(),
    wet_leaf_aroma: z.array(z.string()).nullable(),
});

export const TeaProfilesResponseSchema = z.array(TeaProfileSchema);