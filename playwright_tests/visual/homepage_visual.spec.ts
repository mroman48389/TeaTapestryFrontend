import { test, expect } from '@playwright/test';

/* Run via 

       npx playwright test visual/homepage_visual.spec.ts
   
   This will take the screenshots set up below and save them to a snapshots folder
   in the same directory like homepage_visual.spec.ts-snapshots. Then do
   
       npx playwright test --update-snapshots

    to approve the screenshot(s) and make them the baseline.
*/

test('Homepage visual regression.', async ({ page }) => {
    await page.goto(process.env.FRONTEND_STAGING_URL!);
    await expect(page).toHaveScreenshot();
});
