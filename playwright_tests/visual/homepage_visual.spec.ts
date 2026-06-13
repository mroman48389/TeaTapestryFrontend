import { test, expect } from '@playwright/test';

/* If you purposefully changed the first thing the user sees, you will need to update the staging
   snapshots for the visual regression tests to work.
   
   First, test locally. Make sure you're using the local URL below. Then do:

       $env:VITE_PLAYWRIGHT_VISUAL="true"; 
       scripts\PowerShell\run.ps1 
       Open localhost in a browser. Nothing should be moving on the screen.
       Open a new terminal.
       $env:VITE_PLAYWRIGHT_VISUAL="true"; 
       Get-ChildItem Env:VITE_PLAYWRIGHT_VISUAL (to verify IS_VISUAL_TEST was set)
       npx playwright test visual/homepage_visual.spec.ts (should fail)
       npx playwright test visual/homepage_visual.spec.ts --update-snapshots
       npx playwright test visual/homepage_visual.spec.ts (should pass)

    If the test passes, change the URL back to the staging URL below and do 

        Remove-Item Env:VITE_PLAYWRIGHT_VISUAL
        npx playwright test visual/homepage_visual.spec.ts --update-snapshots

    This will generate the baseline snapshots used by CI.
*/

test('Landing page visual regression.', async ({ page }) => {
    await page.goto(process.env.FRONTEND_STAGING_URL!);
    // await page.goto('http://localhost:5173');
    await expect(page).toHaveScreenshot();
});
