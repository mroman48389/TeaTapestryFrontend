import { HeroTitle } from "@/components/HeroTitle";
import { Pages, pageIDs } from "@/constants/pages";
import UnderConstructionImg from "../assets/teacup mascots/construction-teacup.png";

export default function WhereDoesTeaComeFromPage() {
    const underConstructionImg = 
        <div className="fade-in-component flex flex-col flex-1 items-center mt-5">
            <h2 className="title--heading mb-3 text-lg sm:text-xl md:text-2xl text-center">
                This area is currently under construction. Please visit "Tea profiles" in the meantime.
            </h2>

            <img src={UnderConstructionImg} alt="Teacup with hardhat" className="h-auto w-100"/>
        </div>;

    return (
        <>
            <HeroTitle>{Pages[pageIDs.whereDoesTeaComeFrom].title}</HeroTitle>
            {underConstructionImg}
        </>
    );
}