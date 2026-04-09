import { HeroTitle } from "@/components/HeroTitle";
import { Pages, pageIDs } from "@/constants/pages";
import UnderConstructionImg from "../assets/teacup mascots/construction-teacup.png";
// import {
//     Accordion,
//     AccordionItem,
//     AccordionTrigger,
//     AccordionContent,
// } from "@/components/ui/accordion";

export default function FAQsPage() {
    const underConstructionImg = 
        <div className="fade-in-component flex flex-col flex-1 items-center mt-5">
            <h2 className="title--heading mb-3 text-lg sm:text-xl md:text-2xl text-center">
                This area is currently under construction. Please visit "Tea profiles" in the meantime.
            </h2>

            <img src={UnderConstructionImg} alt="Teacup with hardhat" className="h-auto w-100"/>
        </div>;

    //     <Accordion type="single" collapsible className="w-full">
    //     <AccordionItem value="item-1">
    //         <AccordionTrigger className='font-bold'>What is Tea Tapestry?</AccordionTrigger>
    //         <AccordionContent>
    //             Tea Tapestry is my demo project — this accordion is powered by shadcn + Radix.
    //         </AccordionContent>
    //     </AccordionItem>

    //     <AccordionItem value="item-2">
    //         <AccordionTrigger>Does it work?</AccordionTrigger>
    //         <AccordionContent>
    //             Yes! If you can expand and collapse these sections, shadcn is set up correctly.
    //         </AccordionContent>
    //     </AccordionItem>
    // </Accordion>
    return (
        <>
            <HeroTitle>{Pages[pageIDs.FAQs].title}</HeroTitle>
            {underConstructionImg}
        </>
    );
}