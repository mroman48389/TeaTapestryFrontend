import { HeroTitle } from "@/components/HeroTitle";
import { Pages, pageIDs } from "@/constants/pages";
import UnderConstructionImg from "../assets/teacup mascots/construction-teacup.png";

export default function GrowingProcessingPage() {
    const underConstructionImg = 
        <div className="fade-in-component mt-5 flex flex-1 flex-col items-center">
            <h2 className="title--heading mb-3 text-center text-lg sm:text-xl md:text-2xl">
                {"This area is currently under construction. Please visit \"Tea profiles\" in the meantime."}
            </h2>

            <img src={UnderConstructionImg} alt="Teacup with hardhat" className="h-auto w-100"/>
        </div>;

    return (
        <>
            <HeroTitle>{Pages[pageIDs.growingAndProcessing].title}</HeroTitle>
            {underConstructionImg}
        </>
    );
}