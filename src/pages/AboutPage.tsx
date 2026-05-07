import { useQuery } from "@tanstack/react-query";

// import useFetch from "@/hooks/integration/useFetch";
import { isApiError } from "@/api/errors/errors";
import { apiRequest } from "@/api/apiClient/apiClient";
// import {log} from "./../utils/log-utils";
import { VersionResponse } from "@/types/serverResponses";
import { HeroTitle } from "@/components/HeroTitle";
import { Pages, pageIDs } from "@/constants/pages";
import GreetingImg from "../assets/teacup mascots/waving-teacup-looking-straight-on.webp";

export default function AboutPage() {

    const { data, isLoading, error } = useQuery({
        queryKey: ['version'],
        queryFn: () => apiRequest<VersionResponse>('/version'),
    });


    if (isLoading) return <p>Loading version...</p>;
    if (error) {
        if (isApiError(error)) {
            return <p>Error loading version: {error.message}</p>;
        }
        return <p>Error loading version.</p>;
    }

    // const underConstructionImg = 
    //     <div className="fade-in-component flex flex-col flex-1 items-center">
    //         <h2 className="title--heading mb-3 text-lg sm:text-xl md:text-2xl text-center mt-5">
    //             {"This area is currently under construction. Please visit \"Tea profiles\" in the meantime."}
    //         </h2>

    //         <img src={UnderConstructionImg} alt="Teacup with hardhat" className="h-auto w-100"/>
    //     </div>;
    
    return (
        <>
            <HeroTitle>{Pages[pageIDs.about].title}</HeroTitle>
            
            <img src={GreetingImg} alt="Teacup waving" width={375} height={418} className="mt-7 h-65 w-auto"/>

            <h2 className="title--heading mt-5">
                Mission
            </h2>

            <p className="text--body mt-3">
                Tea Tapestry aims to educate people about the world of tea, provide tools for exploring this fascinating world, 
                and bring the tea community together to share their experiences and passion for all things tea!
            </p>

            <h2 className="title--heading mt-10">
                Version
            </h2>

            <p className="text--body mt-3">{data?.version}</p>

            <h2 className="title--heading mt-10">
                Credits
            </h2>

            <p className="text--body mt-3">
                Washi paper background used on tea profile cards by&nbsp;
                
                <a 
                    className="underline" 
                    target="_blank"
                    href="https://unsplash.com/@360floralflaves?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" rel="noreferrer"
                >
                    360floralflaves
                </a> 
                
                &nbsp;on&nbsp; 
                
                <a 
                    className="underline" 
                    target="_blank"
                    href="https://unsplash.com/photos/a-person-riding-a-snowboard-down-a-snow-covered-slope-2nKcZGDHpEs?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" rel="noreferrer"
                >
                    Unsplash
                </a>

                .
            </p>

            {/* {underConstructionImg} */}
        </>
    );
}