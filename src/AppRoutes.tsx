import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { Pages, pageIDs } from "./constants/pages";

/* Optimization: Lazy load pages in routes so they're not all included in the main bundle when they
   don't need to be. We'll get a faster initial load and smoother user experience. */
const Home = lazy(() => import("./pages/HomePage"));
const WhatIsTeaPage = lazy(() => import("./pages/WhatIsTeaPage"));
const WhereDoesTeaComeFromPage = lazy(() => import("./pages/WhereDoesTeaComeFromPage"));
const GrowingProcessingPage = lazy(() => import("./pages/GrowingProcessingPage"));
const BrewingMethodsPage = lazy(() => import("./pages/BrewingMethodsPage"));
const ExperiencingTeaPage = lazy(() => import("./pages/ExperiencingTeaPage"));
const TeaProfilesPage = lazy(() => import("./pages/TeaProfilesPage"));
const TeawarePage = lazy(() => import("./pages/TeawarePage"));
const TeaTerminologyPage = lazy(() => import("./pages/TeaTerminologyPage"));
const FAQsPage = lazy(() => import("./pages/FAQsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const WhatsNewPage = lazy(() => import("./pages/WhatsNewPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LogInPage = lazy(() => import("./pages/LogInPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export function AppRoutes() {
    /* Wrap routes that both lazy load and fetch data with ErrorBoundary to protect the user from 
       ever seeing a blank white page. Only do this if the page is sufficiently complex, such as Tea Profiles.
       To test, in Chrome, do F12 --> Network --> Change No throttling to Offline --> Navigate to a page with
       the ErrorBoundary. Change to 3G if you want to be sure to see the Loading message. */
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <Routes>
                <Route path="/" element={<Navigate to={Pages[pageIDs.teaProfiles].path} replace />} />

                <Route path={Pages[pageIDs.home].path} element={<Home />} />
                <Route path={Pages[pageIDs.whatIsTea].path} element={<WhatIsTeaPage />} />
                <Route path={Pages[pageIDs.whereDoesTeaComeFrom].path} element={<WhereDoesTeaComeFromPage />} />
                <Route path={Pages[pageIDs.growingAndProcessing].path} element={<GrowingProcessingPage />} />
                <Route path={Pages[pageIDs.brewingMethods].path} element={<BrewingMethodsPage />} />
                <Route path={Pages[pageIDs.experiencingTea].path} element={<ExperiencingTeaPage />} />

                <Route
                    path={Pages[pageIDs.teaProfiles].path}
                    element={
                        <GlobalErrorBoundary>
                            <Suspense fallback={<p>Loading tea profiles...</p>}>
                                <TeaProfilesPage />
                            </Suspense>
                        </GlobalErrorBoundary>
                    }
                />

                <Route path={Pages[pageIDs.teaware].path} element={<TeawarePage />} />
                <Route path={Pages[pageIDs.teaTerminology].path} element={<TeaTerminologyPage />} />
                <Route path={Pages[pageIDs.FAQs].path} element={<FAQsPage />} />

                <Route path={Pages[pageIDs.about].path} element={<AboutPage />} />
                <Route path={Pages[pageIDs.whatsNew].path} element={<WhatsNewPage />} />
                <Route path={Pages[pageIDs.contact].path} element={<ContactPage />} />
                <Route path={Pages[pageIDs.logIn].path} element={<LogInPage />} />

                <Route path={Pages[pageIDs.notFound].path} element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
}
