import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store'; 
import { BrowserRouter } from "react-router-dom";
// import { SWRConfig } from 'swr';
import * as Sentry from "@sentry/react";
import { browserTracingIntegration, replayIntegration } from "@sentry/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/* npm install @fontsource/cabin */
import "@fontsource/cabin/400.css"; // body text, paragraphs, UI labels
import "@fontsource/cabin/500.css"; // slightly emphasized text, subheadings, or buttons
import "@fontsource/cabin/600.css"; // section headings, nav items, or call‑to‑action emphasis
import "@fontsource/cabin/700.css"; // main headings, hero text, or anything that needs strong visual weight

import './index.css';

// import { fetcher } from "./utils/fetcher";
import { safeLog } from './utils/log-utils';
import App from './App';

if (!import.meta.env.VITE_API_URL) {
    throw new Error("VITE_API_URL is missing. Check your .env files.");
}
else {
    safeLog("Connecting to: ", import.meta.env.VITE_API_URL);
}

const rootElement = document.getElementById('root');

if (!rootElement) throw new Error('Root element not found');

/* dsn: Where to send events.

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
Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN, 
    integrations: [
        browserTracingIntegration(),
        replayIntegration(),
    ],
    tracesSampleRate: 0.0, // disable for now
    replaysSessionSampleRate: 0.0, // disable for now
});

/* Optimization */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 60, // 1 hour
            refetchOnWindowFocus: false,
            retry: 2,
        },
    },
});

createRoot(rootElement).render(
    /* StrictMode will cause everything to render twice but will not be in the production when built. StrictMode
       helps detect bugs and potential issues and enforces best practices. */
    <StrictMode>
        {/* Make variables in store available to entire app. */}
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>

                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </Provider>
    </StrictMode>
);

