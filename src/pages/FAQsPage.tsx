import { HeroTitle } from "@/components/HeroTitle";
import { Pages, pageIDs } from "@/constants/pages";
import UnderConstructionImg from "../assets/teacup mascots/construction-teacup.webp";
// import {
//     Accordion,
//     AccordionItem,
//     AccordionTrigger,
//     AccordionContent,
// } from "@/components/ui/accordion";

export default function FAQsPage() {
    const underConstructionImg = 
        <div className="fade-in-component mt-10 flex flex-1 flex-col items-center">
            <h2 className="title--subheading text-center">
                {"This area is currently under construction. Please visit \"Tea profiles\" in the meantime."}
            </h2>

            <img src={UnderConstructionImg} alt="Teacup with hardhat" width={1024} height={1024} className="h-auto w-75"/>
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