import { Aroma, AromaCategory } from "@/types/aromas";

/* Aroma Wheel-specific types */

export interface CategoryArc {
    category: AromaCategory;
    startAngle: number;
    endAngle: number;
};

export interface AromaArc {
    category: AromaCategory;
    aroma: Aroma;
    startAngle: number;
    endAngle: number;
};