import { Suspense, useState, useEffect, lazy }  from "react";
// import { useCallback } from "react";
// import { useDispatch } from "react-redux";
// import { useSelector } from "react-redux";
// import { RootState } from "./store/store";
// import { setSelectedPageID } from "./store/selectedPageSlice";
// import { fetchTeaProfiles } from "./store/teaProfilesSlice";
// import type { AppDispatch } from "./store/store";
import { useLocation } from "react-router-dom";

import TopNavbar from './components/TopNavbar/TopNavbar';
// import { PageID } from "./constants/pages";
import { SidebarSettingType } from "./constants/app";
import { getSidebarWidthOrMarginLeft } from "./utils/class-utils";
import { safeLog } from "./utils/log-utils";
import { waitForBackend } from "./utils/waitForBackend";

/* Optimization: Lazy load components which the app benefits from lazy loading. */
const NavSidebar = lazy(() =>
    import('./components/NavSidebar/NavSidebar')
);
const Footer = lazy(() =>
    import('./components/Footer')
);
const AppRoutes = lazy(() => import("./AppRoutes").then(mod => ({ default: mod.AppRoutes })));

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [ready, setReady] = useState<boolean | "error">(false);

    /* Use Redux store instead to prevent App from completely re-rendering. */
    // const [selectedPageID, setSelectedPageID] = useState<PageID>(pageIDs.home);
    /* UPDATE: Removed selectedPageID state, leaving the URL as the single source of truth.  */
    // const selectedPageID = useSelector((state: RootState) => state.selectedPage);
    // const dispatch = useDispatch<AppDispatch>();

    const location = useLocation();

    /* In development mode, run some code to determine if the app is ready or has failed. */
    useEffect(() => {
        async function init() {
            /* We need to be ready immediately in production. */
            if (!import.meta.env.DEV) {
                setReady(true);
                return;
            }

            const start = performance.now();
            const ok = await waitForBackend(import.meta.env.VITE_API_URL + "/version");

            // If backend never came up, show an error screen
            if (!ok) {
                setReady("error");
                return;
            }

            /* Prevent flash if backend responds instantly. */
            const elapsed = performance.now() - start;
            if (elapsed < 300) {
                await new Promise(r => setTimeout(r, 300 - elapsed));
            }

            setReady(true);
        }

        init();
    }, []);

    /* Use Google Analytics to track route changes. */
    useEffect(() => {
        if (window.gtag) {
            window.gtag("event", "page_view", {
                page_path: location.pathname + location.search,
            });
        }
    }, [location]);

    /* UPDATE: Switched from Redux for server data to React Query. */
    // useEffect(() => {
    //     dispatch(fetchTeaProfiles());
    // }, [dispatch]);

    /* Reset scroll to the top if the user navigates to a new page. */
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    /* useCallback is like useMemo for functions. Memoize the page selection handler 
       to prevent unnecessary re-renders of memoized child components.
       Without useCallback, this function would be re-created on every render, 
       causing props like onSelectPage to change and triggering re-renders in 
       components like NavSidebarListItem (even when their visual state 
       hasn't changed).
    
       UPDATE: Now deriving the page ID from the URL itself so there is one source of
       truth.
    */
    // const handleSetSelectedPageID = useCallback((id: PageID) => {
    //     dispatch(setSelectedPageID(id));
    // }, [dispatch]);

    function handleOpen() {
        setSidebarOpen(!sidebarOpen);
    }

    safeLog("App component rendered");

    if (!ready) {
        return (
            <div className="flex h-screen items-center justify-center text-lg">
                Starting Tea Tapestry...
            </div>
        );
    }

    if (ready === "error") {
        return (
            <div className="flex h-screen items-center justify-center text-lg text-red-600">
                Unable to reach the Tea Tapestry backend.
            </div>
        );
    }

    return (
        /*  App is one big vertical flex container that spans the entire viewport height. 
            
            Top navbar is positioned fixed to the top of the screen.
            
            Nav sidebar + main content is positioned static and a flex container itself. 
                Nav sidebar is positioned sticky on the left side of the screen.
                main content is positioned static.
                
            Footer is positioned static.    
        */
        <div className="app">
            {/* <TopNavbar selectedPageID={selectedPageID} onSelectPage={handleSetSelectedPageID}/> */}
            <TopNavbar/>

            {/* Nav sidebar + main content
                
                flex: Make it a flex container.
                flex-1:
                    flex-grow: 1; Allow it to grow to fill available space.
                    flex-shrink: 1; Allow it to shrink to avoid overflow.
                    flex-basis: 0%: Start it at 0% height, then grow based on available space. 
            */}
            <div className="flex min-h-screen flex-1 overflow-hidden">
                {/* <NavSidebar selectedPageID={selectedPageID} onSelectPage={handleSetSelectedPageID} sidebarOpen={sidebarOpen} onOpenSidebar={handleOpen}/> */}
                <Suspense fallback={
                    <div className={`nav-sidebar ${getSidebarWidthOrMarginLeft(sidebarOpen, SidebarSettingType.Width)}`}/>
                }>
                    <NavSidebar sidebarOpen={sidebarOpen} onOpenSidebar={handleOpen}/>
                </Suspense>

                <main className={`main ${getSidebarWidthOrMarginLeft(sidebarOpen, SidebarSettingType.MarginLeft)}`}>
                    <Suspense fallback={<p>Loading...</p>}>
                        <AppRoutes />
                    </Suspense>
                </main>
            </div>
            
            <Suspense fallback={<div className={`footer ${getSidebarWidthOrMarginLeft(sidebarOpen, SidebarSettingType.MarginLeft)}`}/>}>
                <Footer sidebarOpen={sidebarOpen}/>
            </Suspense>
        </div>
    );
}
