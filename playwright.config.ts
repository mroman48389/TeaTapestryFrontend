import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './smoke_tests',
    timeout: 10000,
    /* In case of flaky network. */
    retries: 1,
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
    },
});
