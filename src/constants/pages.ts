/*  pageIDs: A constant object that maps semantic page identifiers (the keys) to symbolic string values.
    These values act as stable, type-safe keys for routing, metadata, analytics, and onboarding logic. */
export const pageIDs = {
    whatIsTea             : 'WHAT_IS_TEA',
    whereDoesTeaComeFrom  : 'WHERE_DOES_TEA_COME_FROM',
    growingAndProcessing  : 'GROWING_AND_PROCESSING',
    brewingMethods        : 'BREWING_METHODS',
    experiencingTea       : 'EXPERIENCING_TEA',
    teaProfiles           : 'TEA_PROFILES',
    teaware               : 'TEAWARE',
    teaTerminology        : 'TEA_TERMINOLOGY',
    FAQs                  : 'FAQS',
    
    home                  : 'HOME', 
    about                 : 'ABOUT',
    whatsNew              : 'WHATS_NEW',
    contact               : 'CONTACT',

    authTesting           : 'AUTH_TESTING',
    logIn                 : 'LOG_IN',
    signUp                : 'SIGN_UP',
    verifyEmail           : 'VERIFY_EMAIL',
    requestPasswordReset  : 'REQUEST_PASSWORD_RESET',
    completePasswordReset : 'COMPLETE_PASSWORD_RESET',
    passwordResetExpired  : 'PASSWORD_RESET_EXPIRED',

    notFound              : 'NOT_FOUND',
} as const;
  
export const routeSegments = {
    whatIsTea            : 'what-is-tea',
    whereDoesTeaComeFrom : 'where-does-tea-come-from',
    growingAndProcessing : 'growing-and-processing',
    brewingMethods       : 'brewing-methods',
    experiencingTea      : 'experiencing-tea',
    teaProfiles          : 'tea-profiles',
    teaware              : 'teaware',
    teaTerminology       : 'tea-terminology',
    FAQs                 : 'FAQs',

    home                 : 'home',
    about                : 'about',
    whatsNew             : 'whats-new',
    contact              : 'contact',

    authTesting           : 'auth-testing',
    logIn                 : 'log-in',
    signUp                : 'sign-up',
    verifyEmail           : 'verify-email',
    requestPasswordReset  : 'request-reset-password',
    completePasswordReset : 'complete-password-reset',
    passwordResetExpired  : 'password-reset-expired'
} as const;

export const AUTH_PREFIX = "/auth";

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
        path  : `/${routeSegments.whatIsTea}`
    },

    [pageIDs.whereDoesTeaComeFrom]: {
        title : 'Where does tea come from?',
        path  : `/${routeSegments.whereDoesTeaComeFrom}`
    },

    [pageIDs.growingAndProcessing]: {
        title : 'Growing and processing',
        path  : `/${routeSegments.growingAndProcessing}`
    },

    [pageIDs.brewingMethods]: {
        title : 'Brewing methods',
        path  : `/${routeSegments.brewingMethods}`
    },

    [pageIDs.experiencingTea]: {
        title : 'Experiencing tea',
        path : `/${routeSegments.experiencingTea}`
    },

    [pageIDs.teaProfiles]: {
        title : 'Tea profiles',
        path  : `/${routeSegments.teaProfiles}`
    },

    [pageIDs.teaware]: {
        title : 'Teaware',
        path  : `/${routeSegments.teaware}`
    },

    [pageIDs.teaTerminology]: {
        title : 'Tea terminology',
        path  : `/${routeSegments.teaTerminology}`
    },

    [pageIDs.FAQs]: {
        title : 'FAQs',
        path  : `/${routeSegments.FAQs}`
    },
    
    /* Use /home instead of / so we can click on Home if we start the app on something other than Home. */
    [pageIDs.home]: {
        title : 'Home',
        path  : `/${routeSegments.home}`
    },

    [pageIDs.about]: {
        title : 'About',
        path  : `/${routeSegments.about}`
    },

    [pageIDs.whatsNew]: {
        title : 'What\'s new?',
        path  : `/${routeSegments.whatsNew}`
    },

    [pageIDs.contact]: {
        title : 'Contact',
        path  : `/${routeSegments.contact}`
    },

    [pageIDs.authTesting]: {
        title : 'Auth testing',
        path  : `${AUTH_PREFIX}/${routeSegments.authTesting}`
    },

    [pageIDs.logIn]: {
        title : 'Log in',
        path  : `${AUTH_PREFIX}/${routeSegments.logIn}`
    },

    [pageIDs.signUp]: {
        title : 'Sign up',
        path  : `${AUTH_PREFIX}/${routeSegments.signUp}`
    },

    [pageIDs.verifyEmail]: {
        title : 'Verify email',
        path  : `${AUTH_PREFIX}/${routeSegments.verifyEmail}`
    },

    [pageIDs.requestPasswordReset]: {
        title : 'Request password reset',
        path  : `${AUTH_PREFIX}/${routeSegments.requestPasswordReset}`
    },

    [pageIDs.completePasswordReset]: {
        title : 'Complete password reset',
        path  : `${AUTH_PREFIX}/${routeSegments.completePasswordReset}`
    },

    [pageIDs.passwordResetExpired]: {
        title : 'Password reset expired',
        path  : `${AUTH_PREFIX}/${routeSegments.passwordResetExpired}`
    },

    [pageIDs.notFound]: {
        title : 'Not found',
        path  : '*',
    },

} as const;

export type Page = keyof typeof Pages;