import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

/* Load Playwright-specific .env file */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/* Do not override CI env variables. */
dotenv.config({ 
    path: path.resolve(__dirname, 'playwright_tests/.env') ,
    override: false,
});

export default defineConfig({
    testDir: './playwright_tests',
    timeout: 10000,
    /* In case of flaky network. */
    retries: 1,
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
    },
});
