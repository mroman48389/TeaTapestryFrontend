import { HeroTitle } from "@/components/HeroTitle";
import { Pages, pageIDs } from "@/constants/pages";
import UnderConstructionImg from "../assets/teacup mascots/construction-teacup.webp";

export default function WhatIsTeaPage() {
    const underConstructionImg = 
        <div className="fade-in-component mt-10 flex flex-1 flex-col items-center">
            <h2 className="title--subheading text-center">
                {"This area is currently under construction. Please visit \"Tea profiles\" in the meantime."}
            </h2>

            <img src={UnderConstructionImg} alt="Teacup with hardhat" width={1024} height={1024} className="h-auto w-75"/>
        </div>;

    return (
        <>
            <HeroTitle>{Pages[pageIDs.whatIsTea].title}</HeroTitle>
            {underConstructionImg}
        </>
    );
}