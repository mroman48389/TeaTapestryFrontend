import { useState } from 'react';
import { motion, circOut } from "framer-motion";

import TeaTapestryTeapot from '../assets/tea-tapestry-logo-xi-shi-teapot-200x200.svg';
import TeaTapestryLogo from "../assets/tea-tapestry-logo-400x150.svg";
import { Pages, pageIDs } from "@/constants/pages";
import { getIsVisualTest } from "@/utils/getIsVisualTest";
import NavListItem from '@/components/NavListItem';

interface LandingPageProps {
    onNavigate: (path: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
    const [videoReady, setVideoReady] = useState(false);
    const [showLoginExploreDialog, setShowLoginExploreDialog] = useState(false);

    const IS_VISUAL_TEST = getIsVisualTest();

    const handleExploreBtnClick = () => onNavigate(Pages[pageIDs.teaProfiles].path);

    const handleLoginBtnClick = () => {
        setShowLoginExploreDialog(true);
    };

    /* The container variants object controls the animation timing of the children elements.
       It controls when things move. If we wanted equal timing for the children, we could use:
       
           delayChildren: Number of seconds to wait afer the page fades in before the 
           children should start their animations. 
           
           staggerChildren: Number of seconds to pause between animating children
           
       Since we want the children to start at different amounts of time before animating and 
       have different animation lengths, we set the opacity to 1 for the container at all times
       and instead control the timing on the children variants below.
    */
    const containerVariants = {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    };

    /* The item variants control how things move, defining the motions themselves. We will also
       fine-tune the animation timing here so we have more control over individual items.

       The animation for each element should take progressively less time, but the pause between 
       each animation should take progressively more time. This will ground the user on the app
       name and purpose, then invite then gently invite them into the app.
        
       circOut slightly lifts the element as the end of the animation to give it some spring and 
       make it feel more alive. */

    const heroVariants = {
        hidden: {
            opacity: 0,
            scale: 1.14,
            filter: "brightness(2.0)"
        },
        visible: {
            opacity: 1,
            scale: 1,
            filter: "brightness(1)",
            transition: {
                delay: 0.2,      
                duration: 1.8,   
                ease: circOut
            }
        }
    };

    const taglineVariants = {
        hidden: {
            opacity: 0,
            scale: 1.08,
            filter: "brightness(1.6)"
        },
        visible: {
            opacity: 1,
            scale: 1,
            filter: "brightness(1)",
            transition: {
                delay: 1.3,      
                duration: 1.4,  
                ease: circOut
            }
        }
    };

    const exploreVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 2.6,      // tagline finishes + even longer pause
                duration: 0.45,  // shortest animation
                ease: circOut
            }
        }
    };

    /* 
        Animation:

            motion.video: 
                The landing page content is visible immediately to avoid blank screens. The background video
                starts at opacity 0 and fades in once it finishes loading. The 1.2s easeOut transition gives
                more weight to the end of the fade, making the reveal feel smooth and natural. We fade the
                video in only after it's ready to avoid any flicker or partial-frame flashes.

            motion.div: 
                To make the the app file like a living, breathing thing, and guide the user's experience, we wrap the 
                app title, tagline, and main entry point in a motion.div and use variants (see above).


        How the masking works in the header items:

            to right: Make the gradient go from left to right.
            transparent: Make the gradient fully invisible at the left edge.
            black [number]%: How far the left fade extends inward. At [number]% of the width, it will be fully opaque.
            black [number]%: Where the right fade begins. At [number]% of the width, start fading.
            transparent: Make the gradient fully invisible at the right edge.

    */
    return (
        <div className="overflow-hidden] relative h-screen w-screen">
            <header>
                <div className="flex flex-col items-center pt-2 pr-2 pl-2 sm:flex-row sm:justify-between">
                    <div 
                        className="z-1 flex items-center rounded-lg bg-white/45 px-8 py-2 backdrop-blur-sm"
                        style={{
                            maskImage: `
                                linear-gradient(to right, transparent, black 11%, black 83%, transparent), 
                                linear-gradient(to bottom, transparent, black 19%, black 80%, transparent)
                            `,
                            maskComposite: 'intersect',
                            WebkitMaskImage: `
                                linear-gradient(to right, transparent, black 11%, black 83%, transparent), 
                                linear-gradient(to bottom, transparent, black 19%, black 80%, transparent)
                            `,
                            WebkitMaskComposite: 'source-in',
                        }}
                    >
                        <img src={TeaTapestryTeapot} alt="Tea Tapestry teapot" width={50} height={50} className="h-[50px] w-[50px]" data-testid="teapot-logo"/>
                        <img src={TeaTapestryLogo} alt="Tea Tapestry logo" width={200} height={75} className="h-[75px] w-[200px]"/>
                    </div>

                    <div
                        className="z-1 flex h-10 w-30 items-center justify-center rounded-lg bg-white/45 backdrop-blur-sm"
                        style={{
                            maskImage: `
                                linear-gradient(to right, transparent, black 10%, black 83%, transparent), 
                                linear-gradient(to bottom, transparent, black 19%, black 80%, transparent)
                            `,
                            maskComposite: 'intersect',
                            WebkitMaskImage: `
                                linear-gradient(to right, transparent, black 10%, black 83%, transparent), 
                                linear-gradient(to bottom, transparent, black 19%, black 80%, transparent)
                            `,
                            WebkitMaskComposite: 'source-in',
                        }}
                    >
                        <ul> 
                            <NavListItem 
                                forceVisible
                                disableNavigation
                                pageID={pageIDs.logIn}
                                liClassName={"top-navbar-list-item"}
                                linkClassName={"top-navbar-btn"}
                                onClick={handleLoginBtnClick}
                            />
                        </ul>
                    </div>
                </div>
            </header>

            <main>
                <div 
                    className="
                        absolute top-1/2 left-1/2 z-1 flex 
                        w-full -translate-x-1/2
                        -translate-y-1/2 flex-col items-center justify-center gap-20 pt-20 [@media(max-height:700px)]:top-[35%] [@media(max-height:700px)]:-translate-y-0
                    "
                >
                    <motion.div
                        variants={containerVariants}
                        initial={IS_VISUAL_TEST ? false : "hidden"} 
                        animate={IS_VISUAL_TEST ? false : "visible"}
                        className="flex flex-col items-center justify-center gap-5"
                    >
                        <motion.h1 
                            data-testid="landing-hero"
                            variants={heroVariants} 
                            className="text-tea-steam-green text-center font-[Georgia] text-6xl select-none [text-shadow:0_0_3px_#022e23,0_0_6px_#022e23] sm:text-8xl"
                        >
                            Tea Tapestry
                        </motion.h1>

                        <motion.p 
                            variants={taglineVariants}
                            className="text-tea-steam-green text-xl select-none [text-shadow:0_0_3px_#022e23,0_0_6px_#022e23] sm:text-2xl"
                        >
                            Discover the world of tea
                        </motion.p>

                        <motion.button
                            variants={exploreVariants}
                            className="
                                text-tea-steam-green
                                mt-10 cursor-pointer rounded-md
                                bg-white/20 px-9 py-3 font-sans text-2xl
                                shadow-[0_0_20px_rgba(255,255,255,0.35)] backdrop-blur-sm
                                transition
                                select-none [text-shadow:0_0_3px_#022e23,0_0_6px_#022e23]
                                hover:bg-white/40 sm:text-3xl
                            "
                            onClick={handleExploreBtnClick}
                        >
                            Explore
                        </motion.button>
                    </motion.div>
                </div>

                <motion.video
                    className="absolute inset-0 h-full w-full object-cover"
                    src="/videos/tea-tapestry-home-loop.mp4"
                    autoPlay={!IS_VISUAL_TEST}
                    loop={!IS_VISUAL_TEST}
                    muted
                    playsInline
                    onLoadedData={() => setVideoReady(true)}
                    initial={IS_VISUAL_TEST ? { opacity: 1 } : { opacity: 0 }}
                    animate={IS_VISUAL_TEST ? { opacity: 1 } : { opacity: videoReady ? 1 : 0 }}
                    transition={IS_VISUAL_TEST ? { duration: 0 } : { duration: 1.2, ease: "easeOut" }}
                />

                {showLoginExploreDialog && (
                    <div 
                        className="animate-fadeIn absolute inset-0 z-2 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="max-w-sm rounded-xl bg-white/20 px-6 py-4 text-center text-white shadow-xl backdrop-blur-md">
                            <p className="mb-4">
                                Coming soon! In the meantime, please click &quot;Explore&quot; to continue.
                            </p>

                            <button
                                className="rounded-lg bg-white/40 px-4 py-2 text-white transition hover:bg-white/50"
                                onClick={() => setShowLoginExploreDialog(false)}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}