import clsx from "clsx";

import { TeaProfile } from "@/schemas/teaProfiles";
import WashiPaperBackground from "../assets/washi-paper-background-682x1024.jpg";
import TeaLeaf from "../assets/camellia-sinensis-tea-leaf-1064x682.png";

//1024x682
/**
 * Props for the TeaProfileCard component.
 *
 * This is a domain component that displays some subset of TeaProfile data.
 *
 * @property tea - A TeaProfile that contains all possible tea profile data 
 * that can be displayed. Passing the entire domain object keeps this
 * component flexible, scalable, reusable, and API-stable.
 * 
 * @property isActive - Tells us if the card is the "active" card where it is
 * being used. Signals whether we can interact with it.
 * 
 * @property onClick
 * 
 */
interface TeaProfileCardProps {
    teaProfile: TeaProfile;
    isActive: boolean;
    onClick?: () => void;
}

export function TeaProfileCard({ teaProfile, isActive, onClick }: TeaProfileCardProps) {
    console.log(teaProfile.name);

    // if((teaProfile.alternative_names === null) || (teaProfile.liquor_taste === null)) {
    //     console.log(teaProfile.alternative_names);
    //     console.log(teaProfile.liquor_taste);
    // }

    const alternativeNames = (teaProfile.alternative_names.length > 0) ? teaProfile.alternative_names.join(", ") : "none";

    /* Use an overlay with the washi background to make it more subtle. inset-0 stretches the absolutely positioned overlay to
       fill its parent. overflow-hidden prevents any effects from leaking outside of the card.
       
       Other colors that worked well for the card header (in case we change something):
    
           bg-light-leaf-green/35
           bg-amber-300/30
           bg-yellow-100/60
           bg-amber-200/40

       -------------------------------------------------------------------------------------------

       The card is laid out as: 

           CARD DIV (A: fixed height via carousel-shape, flex)
               OVERLAY DIV
           
               CONTENT DIV (B: flex; flex-col, flex-1)
                   HEADER DIV (C)
                   BODY DIV (D: flex-1)

        Here,
            D: flex-1 allows the BODY DIV to fill the remaing space of its parent, CONTENT DIV.
            C: Natural height. 
            B: A flex container for HEADER DIV and BODY DIV in the column direction. Needs flex-1 to 
               fill the remaining space of its parent, CARD DIV.
            A: This must also be a flex container in order for its children's flex properties to work.
            
        ------------------------------------------------------------------------------------------

        The header div is made to be a flex container so we can use space-between to easily position the
        two leaf accent images. The title is absolutely positioned with respect to the content wrapper div
        so that if the name of the tea wraps, we can keep it easily centered. Absolutely positioning means
        the flex container no longer applies to it. The title only benefits from the padding of its 
        immediate parent container.

        ------------------------------------------------------------------------------------------

        We line clamp the text on the cards. The cards' purpose is just to give users a snapshot of a tea,
        and we expect the user can click on the card to get the complete profile anyway.
    */

    return (
        <div
            onClick={onClick}
            className={clsx(
                "carousel-shape relative overflow-hidden",
                "flex",
                "rounded-xl",
                // Base border: subtle warm stroke
                "border border-amber-800/20",
                // Warm drop shadow for lift
                "shadow-[0_6px_20px_rgba(120,80,30,0.18),0_1px_4px_rgba(120,80,30,0.12)]",
                "bg-cover bg-center",
                isActive
                    ? [
                        "cursor-pointer opacity-100",
                        // Active: layered glow (ring close in and diffuse outer glow)
                        "ring-2 ring-amber-400/90",
                        "shadow-[0_0_0_4px_rgba(217,160,50,0.15),0_8px_24px_rgba(160,110,30,0.30)]",
                    ]
                    : "opacity-75 cursor-auto"
            )}
            style={{ backgroundImage: `url(${WashiPaperBackground})` }}
        >
            {/* Extremely light overlay to soften the texture without hiding it. */}
            <div className="absolute inset-0 bg-white/25 pointer-events-none rounded-xl" />

            {/* Inner vignette: slightly stronger on edges for paper feel. */}
            <div className="absolute inset-0 rounded-xl pointer-events-none shadow-[inset_0_0_24px_rgba(100,60,20,0.12)]" />

            {/* Content wrapper */}
            <div className="relative flex flex-col flex-1">

                {/* Header*/}
                <div className="border-b border-amber-800/25 rounded-t-xl bg-amber-200/40 p-4 flex justify-between items-center">
                    <img src={TeaLeaf} alt="Tea leaf" width={50} className="scale-x-[-1]"/>

                    <p className="title--subheading text-dark-mahogany-brown absolute left-1/2 -translate-x-1/2 text-center px-2 line-clamp-3">
                        {teaProfile.name}
                    </p>

                    <img src={TeaLeaf} alt="Tea leaf" width={50} />
                </div>

                {/* Body */}
                <div className="flex-1 p-4">
                    <p className="text--body text-dark-mahogany-brown line-clamp-3">
                        <strong>Alternative names: </strong>{alternativeNames}
                    </p>
                    <p className="pt-2 text--body text-dark-mahogany-brown line-clamp-3">
                        <strong>Origin: </strong>{teaProfile.country_of_origin}
                    </p>
                    <p className="pt-2 text--body text-dark-mahogany-brown line-clamp-3">
                        <strong>Type: </strong>{teaProfile.tea_type}
                    </p>
                    <p className="pt-2 text--body text-dark-mahogany-brown line-clamp-3">
                        <strong>Flavor: </strong>{teaProfile.liquor_taste.join(", ")}
                    </p>
                </div>

            </div>
        </div>
    );
}