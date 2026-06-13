import { HeroTitle } from "@/components/HeroTitle";
import { Pages, pageIDs } from "@/constants/pages";
import ThinkingImg from "../assets/teacup mascots/thinking-teacup.webp";

export default function WhatsNewPage() {
  
    return (
        <>
            <HeroTitle>{Pages[pageIDs.whatsNew].title}</HeroTitle>
            <img src={ThinkingImg} alt="Thinking teacup" width={582} height={880} className="mt-7 ml-5 h-65 w-auto"/>

            <p className="text--body mt-3">
                12 June 2026 - Version 1.1.0 
            </p>

            <ul className="text-dark-mahogany-brown list-disc pt-3 pl-10">
                <li>
                    Added a landing page.
                </li>
            </ul>
        </>
    );
}