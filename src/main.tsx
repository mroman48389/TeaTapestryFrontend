import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store'; 
import { BrowserRouter } from "react-router-dom";
// import { SWRConfig } from 'swr';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.css';

// import { fetcher } from "./utils/fetcher";
import { safeLog } from './utils/log-utils';
import App from './App';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';

if (!import.meta.env.VITE_API_URL) {
    throw new Error("VITE_API_URL is missing. Check your .env files.");
}
else {
    safeLog("Connecting to: ", import.meta.env.VITE_API_URL);
}

/* Optimization - Dynamically import heavy libraries that will not interfere with hydration. Only
   non-critical / development only libraries should exist here. */

let Devtools: React.ComponentType<{ initialIsOpen?: boolean }> | null = null;

if (import.meta.env.DEV) {
    import('@tanstack/react-query-devtools').then((mod) => {
        Devtools = mod.ReactQueryDevtools;

        /* Trigger a re-render once Devtools is loaded. */
        rootElement?.dispatchEvent(new Event("devtools-loaded"));
    });
}

function loadSentry() {
    /*  Dynamically import everything from Sentry to keep it out of our critical path. 
        We don't want it loading/initializing before the app can paint meaningful content.
        Critical path is everything the browser has to do before it can show
        the first meaningful part of a page:

            -downloading JS bundle
            -parsing and executing JS
            -rendering hero text
            -rendering layout
            -showing initial content

        Anything that blocks/slows these things delays the largest contentful paint
        (LCP). The user doesn't need Sentry immediately and it doesn't affect UI.

        dsn: Where to send events.

        integrations: 
            browserTracingIntegration: Performance instrumentation (page load tracing,
                navigation tracing, API call spans, React component lifecycle spans,
                SWR fetch spans).

            replayIntegration: Session Replay (DOM snapshots, user interactions, console 
                logs, network activity).

        traces_sample_rate: Control performance tracing where 0.0 = disabled and 
            1.0 = capture all traces.

        replaysSessionSampleRate: Controls Session Replay sampling where 0.0 = disabled and 
            1.0 = capture all sessions.
    */
    import("@sentry/react").then((Sentry) => {
        const { browserTracingIntegration, replayIntegration } = Sentry;

        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN, 
            integrations: [
                browserTracingIntegration(),
                replayIntegration(),
            ],
            tracesSampleRate: 0.0, // disable for now
            replaysSessionSampleRate: 0.0, // disable for now
        });
    });
}

/* Guarantee that Sentry loads after the page paints, after hydration, when the
   browser is idle and does not block the LCP. */
if ("requestIdleCallback" in window) {
    requestIdleCallback(loadSentry);
} 
else {
    setTimeout(loadSentry, 0);
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 60, // 1 hour
            refetchOnWindowFocus: false,
            retry: 2,
        },
    },
});

const rootElement = document.getElementById('root');

if (!rootElement) throw new Error('Root element not found');

function renderApp() {
    // createRoot(rootElement!).render(<div>Minimal test</div>);

    createRoot(rootElement!).render(
        /* StrictMode will cause everything to render twice but will not be in the production when built. StrictMode
        helps detect bugs and potential issues and enforces best practices. */
        <StrictMode>
            {/* Make variables in store available to entire app. */}
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        {/* Prevent user from ever seeing a white screen from a rendering error. */}
                        <GlobalErrorBoundary>
                            {/* Suspense prevents blank screens and ensures lazy loaded routes load safely. */}
                            <Suspense fallback={<div>Loading...</div>}>
                                <App/>
                            </Suspense>
                        </GlobalErrorBoundary>
                    </BrowserRouter>

                    {/* React Query Devtools will be null if we're not in development mode. */}
                    {Devtools && <Devtools initialIsOpen={false}/>}
                </QueryClientProvider>
            </Provider>
        </StrictMode>
    );
}

/* Initial render. */
renderApp();

/* If the root exists, listen for a devtools-loaded event and render the app once it occurs. This will
   keep DevTools out of the initial JS bundle and avoids hydration mismatches. */
rootElement?.addEventListener("devtools-loaded", renderApp);