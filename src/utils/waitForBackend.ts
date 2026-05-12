export async function waitForBackend(url: string, timeoutMs = 10000) {
    const start = Date.now();

    /* Keep trying the provided url until we get a response or we
       timeout. By default, timeout after 10 seconds. */
    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(url);
            if (res.ok) return true;
        } 
        catch {

        }

        /* If we did not reach the url, try again after 300ms. */
        await new Promise(r => setTimeout(r, 300));
    }

    return false;
}
