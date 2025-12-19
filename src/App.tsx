import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "./store/store";
import { setSelectedPageID } from "./store/selectedPageSlice";
import { fetchTeaProfiles } from "./store/teaProfilesSlice";
import type { AppDispatch } from "./store/store";

import { Routes, Route, useLocation } from "react-router-dom";

import NavSidebar from './components/NavSidebar/NavSidebar';
import TopNavbar from './components/TopNavbar/TopNavbar';
import Home from "./pages/HomePage";
import WhatIsTeaPage from "./pages/WhatIsTeaPage";
import WhereDoesTeaComeFromPage from "./pages/WhereDoesTeaComeFromPage";
import GrowingProcessingPage from "./pages/GrowingProcessingPage";
import BrewingMethodsPage from "./pages/BrewingMethodsPage";
import ExperiencingTeaPage from "./pages/ExperiencingTeaPage";
import TeaProfilesPage from "./pages/TeaProfilesPage";
import TeawarePage from "./pages/TeawarePage";
import TeaTerminologyPage from "./pages/TeaTerminologyPage";
import FAQsPage from "./pages/FAQsPage";

import AboutPage from "./pages/AboutPage";
import WhatsNewPage from "./pages/WhatsNewPage";
import ContactPage from "./pages/ContactPage";
import LogInPage from "./pages/LogInPage";

import NotFoundPage from "./pages/NotFoundPage";

import { Pages, PageID, pageIDs } from "./constants/pages";
import { getSidebarWidthOrMarginLeft } from "./utils/class-utils";
import { log } from "./utils/log-utils";

import Footer from "./components/Footer";
import { SidebarSettingType } from "./constants/app";

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    /* Use Redux store instead to prevent App from completely re-rendering. */
    // const [selectedPageID, setSelectedPageID] = useState<PageID>(pageIDs.home);
    const selectedPageID = useSelector((state: RootState) => state.selectedPage);
    const dispatch = useDispatch<AppDispatch>();

    const location = useLocation();

    useEffect(() => {
        dispatch(fetchTeaProfiles());
    }, [dispatch]);

    /* Reset scroll to the top if the user navigates to a new page. */
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    /* Memoize the page selection handler to prevent unnecessary re-renders of memoized child components.
        Without useCallback, this function would be re-created on every render, causing props like onSelectPage
        to change and triggering re-renders in components like NavSidebarListItem (even when their visual state hasn't changed). */
    const handleSetSelectedPageID = useCallback((id: PageID) => {
        dispatch(setSelectedPageID(id));
    }, [dispatch]);

    function handleOpen() {
        setSidebarOpen(!sidebarOpen);
    }

    log("App component rendered");

    return (
        /*  App is one big vertical flex container that spans the entire viewport height. 
            
            Top navbar is positioned fixed to the top of the screen.
            
            Nav sidebar + main content is positioned static and a flex container itself. 
                Nav sidebar is positioned sticky on the left side of the screen.
                main content is positioned static.
                
            Footer is positioned static.    
        */
        <div className="app">
            <TopNavbar selectedPageID={selectedPageID} onSelectPage={handleSetSelectedPageID}/>

            {/* Nav sidebar + main content
                
                flex: Make it a flex container.
                flex-1:
                    flex-grow: 1; Allow it to grow to fill available space.
                    flex-shrink: 1; Allow it to shrink to avoid overflow.
                    flex-basis: 0%: Start it at 0% height, then grow based on available space. 
            */}
            <div className="flex min-h-screen flex-1 overflow-hidden">
                <NavSidebar selectedPageID={selectedPageID} onSelectPage={handleSetSelectedPageID} sidebarOpen={sidebarOpen} onOpenSidebar={handleOpen}/>

                <main className={`main ${getSidebarWidthOrMarginLeft(sidebarOpen, SidebarSettingType.MarginLeft)}`}>
                    <Routes>
                        <Route path={Pages[pageIDs.home].path} element={<Home/>}/>
                        <Route path={Pages[pageIDs.whatIsTea].path} element={<WhatIsTeaPage/>}/>
                        <Route path={Pages[pageIDs.whereDoesTeaComeFrom].path} element={<WhereDoesTeaComeFromPage/>}/>
                        <Route path={Pages[pageIDs.growingAndProcessing].path} element={<GrowingProcessingPage/>}/>
                        <Route path={Pages[pageIDs.brewingMethods].path} element={<BrewingMethodsPage/>}/>
                        <Route path={Pages[pageIDs.experiencingTea].path} element={<ExperiencingTeaPage/>}/>
                        <Route path={Pages[pageIDs.teaProfiles].path} element={<TeaProfilesPage/>}/>
                        <Route path={Pages[pageIDs.teaware].path} element={<TeawarePage/>}/>
                        <Route path={Pages[pageIDs.teaTerminology].path} element={<TeaTerminologyPage/>}/>
                        <Route path={Pages[pageIDs.FAQs].path} element={<FAQsPage/>}/>

                        <Route path={Pages[pageIDs.about].path} element={<AboutPage/>}/>
                        <Route path={Pages[pageIDs.whatsNew].path} element={<WhatsNewPage/>}/>
                        <Route path={Pages[pageIDs.contact].path} element={<ContactPage/>}/>
                        <Route path={Pages[pageIDs.logIn].path} element={<LogInPage/>}/>

                        <Route path={Pages[pageIDs.notFound].path} element={<NotFoundPage/>}/>
                    </Routes>
                </main>
            </div>

            <Footer sidebarOpen={sidebarOpen}/>
        </div>
    );
}
