import { test, expect } from '@playwright/test';

const FRONTEND_STAGING_URL = 'https://tea-tapestry-staging.netlify.app';
const BACKEND_STAGING_URL = 'https://tea-tapestry-backend-staging.fly.dev';

test('Staging app loads.', async ({ page }) => {
    await page.goto(FRONTEND_STAGING_URL);

    /* Page loads */
    await expect(page).toHaveTitle(/Tea Tapestry/i);

    /* Wheel renders */
    await expect(page.locator('[data-testid="aroma-wheel-rotation-group"]')).toBeVisible();
});

test('Backend API is reachable.', async ({ request }) => {
    const response = await request.get(BACKEND_STAGING_URL + "/api/v1/tea_profiles");
    expect(response.ok()).toBeTruthy();
});
