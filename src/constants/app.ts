export const APP_TITLE = 'Tea Tapestry';

export const APP_COLORS = {
    DUANNI_YELLOW : '#C9A873',
    ZISHA_BROWN   : '#7B5446',
};

export enum SidebarSettingType {
    Width = "width",
    MarginLeft = "marginLeft",
};

export const MATCHING_MODE = {
    FLAVOR_ONLY : "flavor-only",
    FULL_AROMA_PROFILE : "full-aroma-profile",
} as const;

export type MatchingMode = typeof MATCHING_MODE[keyof typeof MATCHING_MODE];