// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from "vite-tsconfig-paths";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
    plugins: [
        react(), 
        tailwindcss(),
        sentryVitePlugin({
            org: "self-bst", // matches Sentry
            project: "teatapestry-frontend", // matches slug entered in Sentry when creating project
        }),
        /* Enable visualizer in build mode but not normal development mode so we can analyze bundles
           only when we need to (on npm run build). */
        visualizer({ 
            open: false,
            filename: "bundle-stats.html",
         }),
    ],
    /* Tell bundler (Vite) to look in src/ when building. */
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    // Pre-bundle Emotion to avoid runtime resolution issues since we're using MUI and Vite.
    optimizeDeps: {
        include: ["@emotion/react", "@emotion/styled"],
    },
    test: {
        projects: [{
            extends: true,
            plugins: [
                react(),
                tailwindcss(),
                tsconfigPaths(),
                // The plugin will run tests for the stories defined in your Storybook config
                // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                storybookTest({
                    configDir: path.join(dirname, '.storybook')
                })
            ],
            test: {
                name: 'storybook',
                browser: {
                    enabled: true,
                    headless: true,
                    provider: 'playwright',
                    instances: [{
                        browser: 'chromium'
                    }]
                },
                setupFiles: ['.storybook/vitest.setup.ts']
            }
        }]
    },
    build: {
        rollupOptions: {
            output: {
                /* Optimization - Codesplitting/chunking: Split our JavaScript bundle into 
                   chunks so the main bundle isn't huge. This will improve performance by
                   reducing initial page load time. We want to split off code from 
                   libraries that is heavy, shared across pages, and can be safely
                   isolated. You can view bundles to choose from in dist/assets/*.js 
                   after running npm run build. You will notice that lazy loaded route
                   files will be in there too. */ 
                manualChunks: {
                    react: ["react", "react-dom"],
                    router: ["react-router-dom"],
                    query: ["@tanstack/react-query"],
                    sentry: ["@sentry/react"],
                    vendor: [
                        "clsx"
                    ]
                }
            }
        }
    },
    /* Never reuse stale module caches. Speeds up launches after server restructures. */
    server: {
        host: "127.0.0.1",
        port: 5173,
        strictPort: true,
    },
});