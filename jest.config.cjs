module.exports = {
    /* This was causing a double transform with testing coverage, giving wrong results. */
    // preset: "ts-jest",

    testEnvironment: "jest-environment-jsdom",
    
    /* Use native V8 coverage rather than Istanbul for better sourcemaps for 
       React + TypeScript + hooks during testing. */
    coverageProvider: "v8",

    /* 
        test --> prints summary table to terminal. 
        html --> generates HTML report.
        lcov --> generates lcov.info for Coverage Gutters.
    */
    coverageReporters: ["text", "text-summary", "html", "lcov"],

    /*  
        Realistic coverage thresholds are used because Jest’s V8 coverage 
        provider doesn't support "istanbul ignore next".

        V8 coverage gives more accurate sourcemaps for React + TypeScript, but 
        it can still misreport coverage inside React hook closures (useCallback, 
        useMemo, useEffect). These closures are transformed by Babel and wrapped 
        by React, which sometimes causes V8 to map executed lines to the wrong 
        locations in the original .tsx file.

        As a result, certain code like early returns or optional callback 
        branches may appear "uncovered" even though tests execute them. These 
        are documented in coverage-notes.md as known false negatives.

        The below thresholds make sure that 
            -CI passes as long as overall coverage is healthy
            -Occasional hook-closure sourcemap drift doesn't break the pipeline
    */
    coverageThreshold: {
        global: {
            lines: 80, 
            statements: 80, 
            branches: 70, 
            functions: 80, 
        }
    },

    /* Sanity check to tell if Jest can read this file. If yes, this should
       cause immediate failure. */
    // testTimeout: 1,
    
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

    /* Tell Jest how to resolve path aliases with @ for src. */
    moduleNameMapper: {
        "^@/utils/getBaseUrl$": "<rootDir>/src/utils/getBaseUrl.node.ts", // must be first.
        "^@/(.*)$": "<rootDir>/src/$1",
        '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/__mocks__/fileMock.js',
    },

    coveragePathIgnorePatterns: [
        "/node_modules/",
        "<rootDir>/src/components/ui/"
    ],

    testPathIgnorePatterns: [
        "/node_modules/",
        "<rootDir>/src/components/ui/"
    ],

    /* Make sure Jest only runs tests from the src/ folder. */
    roots: ["<rootDir>/src"], 
    testMatch: ["**/*.test.(ts|tsx)"],

    /* Tell Jest to transform the d3 packages, ignoring node_modules. */
    transform: { 
        "^.+\\.(ts|tsx|js|jsx)$": "babel-jest" 
    },
    transformIgnorePatterns: [ 
        "node_modules/(?!(d3|d3-[a-z-]+|internmap|delaunator|robust-predicates)/)"
    ],
    
    /* Tell Jest to include all relevant src files in coverage reports, not just
       the ones that are covered by tests. 
       
       Philosophy: 
           Include all files with testable business logic.
           Exclude files that are static, auto-generated, purley presentational,
           or that provide no meaningful benefit from testing.
    */
    collectCoverageFrom: [ 
        /***********   Include   **********/
        "src/**/*.{ts,tsx}", 

        /***********   Exclude   **********/

        /* Auto-generated. */
        "!src/stories/**", 

        /* Types, interfaces, constants, definitions, configurations. */
        "!src/app/**",
        "!src/constants/**", 
        "!src/schemas/**",
        "!src/types/**", 
        "!src/vite-env.d.ts",
        "!src/store/**",
        "!src/components/AromaWheel/AromaWheelTypes.ts",
        "!src/data/**",
        "!src/global.d.ts",

        /* Routing shells, layout containers, wiring points, and
           presentational components with no business logic. No branching, 
           data transformations, UI behavior of its own. 
           Testing anything here would require heavy mocking or produce
           brittle tests that provide no real benefits. */
        "!src/pages/**", 
        "!src/App.tsx", 
        "!src/AppRoutes.tsx",
        "!src/main.tsx",
        "!src/components/Skeleton.tsx",
        "!src/components/LoadableArea.tsx",
        "!src/components/GlobalErrorBoundary.tsx",
        "!src/components/Button.tsx", 
        "!src/components/Footer.tsx", 
        "!src/components/NavListItem.tsx", 
        "!src/components/NavListItem.test.defunct.tsx", 
        "!src/components/TwistedThreadsUnderline.tsx",
        "!src/components/TeaProfileCard.tsx",
        "!src/components/HeroTitle.tsx",

        /* Testing files. These do not reflect the app's behavior */
        "!src/utils/test-utils.tsx",
        "!src/utils/getBaseUrl.ts",
        "!src/utils/getBaseUrl.node.ts",
        "!src/utils/test-utils.test.defunct.tsx",

        /* Ensure no test files are covered (needed since we 
           included all .ts and .tsx src files above). */
        "!src/**/*.test.{ts,tsx}",
        
        /* Other files that don't benefit from testing. */
        "!src/hooks/integration/**",
        "!src/utils/utils.ts",
        "!src/utils/log-utils.ts",
        "!src/utils/fetcher.ts",
        "!src/utils/svg-utils.ts",
        "!src/utils/aromaWheelDataUtils.ts",
        "!src/api/query/queryFn.ts"
    ]
};