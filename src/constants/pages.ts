/*  pageIDs: A constant object that maps semantic page identifiers (the keys) to symbolic string values.
    These values act as stable, type-safe keys for routing, metadata, analytics, and onboarding logic. */
export const pageIDs = {
    whatIsTea            : 'WHAT_IS_TEA',
    whereDoesTeaComeFrom : 'WHERE_DOES_TEA_COME_FROM',
    growingAndProcessing : 'GROWING_AND_PROCESSING',
    brewingMethods       : 'BREWING_METHODS',
    experiencingTea      : 'EXPERIENCING_TEA',
    teaProfiles          : 'TEA_PROFILES',
    teaware              : 'TEAWARE',
    teaTerminology       : 'TEA_TERMINOLOGY',
    FAQs                 : 'FAQS',
    
    home                 : 'HOME', 
    about                : 'ABOUT',
    whatsNew             : 'WHATS_NEW',
    contact              : 'CONTACT',
    logIn                : 'LOG_IN',

    notFound             : 'NOT_FOUND',
} as const;
  
/*  PageKey: A type alias that extracts the keys from the pageIDs object as a union type (equivalent to
    "type PageKey = "home" | "whatIsTea" | "whereDoesTeaComeFrom" |..."). These semantic keys provide 
    type-safe access to valid pages throughout the app. Anywhere a page is referenced by its semantic key, 
    TypeScript will validate against this list. */
export type PageKey = keyof typeof pageIDs;
export type PageID = typeof pageIDs[PageKey];

/* Create a reverse mapping without explicitly typing it out. */
export const pageKeyByID = Object.fromEntries(
    Object.entries(pageIDs).map(([k, v]) => [v, k])
) as Record<string, PageKey>;

/*  PageMeta: Defines the shape of metadata for each page. Using an interface instead of a type alias 
    follows linting rules and keeps the structure extensible. */
interface PageMeta {
    title : string;
    path  : string;
};

/*  Pages: A metadata map providing full  IntelliSense, compile-time validation, and centralized control over page behavior. */
export const Pages: Record<typeof pageIDs[PageKey], PageMeta> = {
    [pageIDs.whatIsTea]: {
        title : 'What is tea?',
        path  : '/what-is-tea',
    },

    [pageIDs.whereDoesTeaComeFrom]: {
        title : 'Where does tea come from?',
        path  : '/where-does-tea-come-from',
    },

    [pageIDs.growingAndProcessing]: {
        title : 'Growing and processing',
        path  : '/growing-and-processing',
    },

    [pageIDs.brewingMethods]: {
        title : 'Brewing methods',
        path  : '/brewing-methods',
    },

    [pageIDs.experiencingTea]: {
        title : 'Experiencing tea',
        path : '/experiencing-tea',
    },

    [pageIDs.teaProfiles]: {
        title : 'Tea profiles',
        path  : '/tea-profiles',
    },

    [pageIDs.teaware]: {
        title : 'Teaware',
        path  : '/teaware',
    },

    [pageIDs.teaTerminology]: {
        title : 'Tea terminology',
        path  : '/tea-terminology',
    },

    [pageIDs.FAQs]: {
        title : 'FAQs',
        path  : '/FAQs',
    },
    
    /* Use /home instead of / so we can click on Home if we start the app on something other than Home. */
    [pageIDs.home]: {
        title : 'Home',
        path  : '/home',
    },

    [pageIDs.about]: {
        title : 'About',
        path  : '/about',
    },

    [pageIDs.whatsNew]: {
        title : 'What\'s new?',
        path  : '/whats-new',
    },

    [pageIDs.contact]: {
        title : 'Contact',
        path  : '/contact',
    },

    [pageIDs.logIn]: {
        title : 'Log in',
        path  : '/log-in',
    },

    [pageIDs.notFound]: {
        title : 'Not found',
        path  : '*',
    },

} as const;

export type Page = keyof typeof Pages;