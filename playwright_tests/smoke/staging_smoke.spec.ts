import { test, expect } from '@playwright/test';

test('Staging app loads.', async ({ page }) => {
    await page.goto(process.env.FRONTEND_STAGING_URL!);
    //await page.goto('http://localhost:5173');

    /* Page loads. */
    await expect(page).toHaveTitle(/Tea Tapestry/i);

    /* Landing page content is visible. The logo is static so it's one of the safest
       pieces of content to check. */
    await page.waitForSelector('[data-testid="teapot-logo"]', { state: 'visible' });
    await expect(page.getByTestId('teapot-logo')).toBeVisible();
});

test('Backend API is reachable.', async ({ request }) => {
    const response = await request.get(process.env.BACKEND_STAGING_URL! + "/api/v1/tea_profiles");
    expect(response.ok()).toBeTruthy();
});
