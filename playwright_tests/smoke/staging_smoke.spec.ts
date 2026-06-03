import { test, expect } from '@playwright/test';

/* Run via "npx playwright test" */

console.log('PLAYWRIGHT FRONTEND_STAGING_URL:', process.env.FRONTEND_STAGING_URL);
console.log('PLAYWRIGHT BACKEND_STAGING_URL:', process.env.BACKEND_STAGING_URL);

test('Staging app loads.', async ({ page }) => {
    await page.goto(process.env.FRONTEND_STAGING_URL!);

    /* Page loads */
    await expect(page).toHaveTitle(/Tea Tapestry/i);

    /* Wheel renders */
    await expect(page.locator('[data-testid="aroma-wheel-rotation-group"]')).toBeVisible();
});

test('Backend API is reachable.', async ({ request }) => {
    const response = await request.get(process.env.BACKEND_STAGING_URL! + "/api/v1/tea_profiles");
    expect(response.ok()).toBeTruthy();
});
