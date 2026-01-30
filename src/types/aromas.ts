export interface Aroma {
    id: string;
    name: string;
    /** If not supplied, the aroma color will be derived based on
        its category. */
    color?: string;
}

export interface AromaCategory {
    id: string;
    name: string;
    color: string;
    aromas: Aroma[];
}

export interface AromaCategories {
    categories: AromaCategory[];
}
