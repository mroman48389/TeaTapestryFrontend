import { useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { TransitionOverlay } from "./components/TransitionOverlay";
import LandingPage from "./pages/LandingPage";
import App from "./App";

/* Had to move content out of main.tsx into a React component in order to use hooks. */
export function RootLayout() {
    const [transitioning, setTransitioning] = useState(false);
    /* Set up reference to call in the function below, since hooks can only be called at
       the top level of React components. */
    const navigate = useNavigate();

    function triggerTransition(path: string) {
        setTransitioning(true);

        /* Navigate to the new route with the overlay transitioning smoothly.*/
        setTimeout(() => {
            navigate(path);
            setTransitioning(false);
        }, 180);
    }

    return (
        <>
            <TransitionOverlay active={transitioning} />

            <Routes>
                <Route path="/" element={<LandingPage onNavigate={triggerTransition} />} />
                <Route path="/*" element={<App onNavigate={triggerTransition} />} />
            </Routes>
        </>
    );
}
