/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from "vite-tsconfig-paths";
import { sentryVitePlugin } from "@sentry/vite-plugin";

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
    }
});