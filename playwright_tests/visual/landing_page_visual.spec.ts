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
        npx playwright test visual/landing_page_visual.spec.ts --update-snapshots

    This will generate the baseline snapshots used by CI. IMPORTANT: Changing the 
    test name will cause a different snapshot to be generated and you'll have to 
    establish a new baseline. In the Visual Regression Tests job, after Run visual
    regression tests, you should see Upload Playwrite artifacts. Click the link in
    there. Unzip the folder you get an find the png. Copy the png to 
    
        playwright_tests/visual/landing_page_visual.spec.ts-snapshots

    and replace the word "actual" in the file name with "linux". Commit and push and
    CI should now work.

*/

test('Landing page visual regression.', async ({ page }) => {
    await page.goto(process.env.FRONTEND_STAGING_URL!);
    // await page.goto('http://localhost:5173');

    /* Wait for the landing page to render enough to freeze it. */
    await page.waitForTimeout(1500);

    /* Freeze video. */
    await page.evaluate(() => {
        const vids = document.querySelectorAll('video');
        vids.forEach(v => {
            v.pause();
            v.currentTime = 0;
        });
    });

    /* Freeze Framer Motion / JS animations. */
    await page.addStyleTag({
        content: `
            * {
            animation: none !important;
            transition: none !important;
            }
        `
    });

    await expect(page).toHaveScreenshot();
});
