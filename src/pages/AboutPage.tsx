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

            <p className="text--body mt-3">
                The video loop on the landing page was constructed using the following free, publicly-licensed videos: 
            </p>

            <ul className="list-disc pl-10 pt-3 text-dark-mahogany-brown">
                <li>
                    <a 
                        className="underline" 
                        target="_blank"
                        href="http://www.videezy.com" 
                        rel="noreferrer"
                    >
                        Free Broll by Videezy
                    </a>

                    .&nbsp;Artist:&nbsp;
            
                    <a 
                        className="underline" 
                        target="_blank"
                        href="https://www.videezy.com/members/ohmratthpon" 
                        rel="noreferrer"
                    >
                        ohmratthpon
                    </a> 
                    .
                </li>

                <li>
                    Video by&nbsp;
            
                    <a 
                        className="underline" 
                        target="_blank"
                        href="https://www.pexels.com/@jaturapond-pungtong-1762405466/" 
                        rel="noreferrer"
                    >
                        Jaturapond Pungtong
                    </a> 
                    
                    &nbsp;on&nbsp; 
                    
                    <a 
                        className="underline" 
                        target="_blank"
                        href="https://www.pexels.com/video/traditional-asian-tea-roasting-process-32586150/" 
                        rel="noreferrer"
                    >
                        Pexels
                    </a>

                    .
                </li>

                <li>
                    Video by&nbsp;
            
                    <a 
                        className="underline" 
                        target="_blank"
                        href="https://www.pexels.com/@tima-miroshnichenko/" 
                        rel="noreferrer"
                    >
                        Tima Miroshnichenko
                    </a> 
                    
                    &nbsp;on&nbsp; 
                    
                    <a 
                        className="underline" 
                        target="_blank"
                        href="https://www.pexels.com/video/video-of-a-woman-tea-set-6540523/" 
                        rel="noreferrer"
                    >
                        Pexels
                    </a>

                    .
                </li>

                <li>
                    Video by&nbsp;
            
                    <a 
                        className="underline" 
                        target="_blank"
                        href="https://www.pexels.com/@rdne/" 
                        rel="noreferrer"
                    >
                        RDNE Stock project
                    </a> 
                    
                    &nbsp;on&nbsp; 
                    
                    <a 
                        className="underline" 
                        target="_blank"
                        href="https://www.pexels.com/video/traditional-tea-served-during-chinese-new-year-6691600/" 
                        rel="noreferrer"
                    >
                        Pexels
                    </a>

                    .
                </li>

                <li>
                    Video by&nbsp;
            
                    <a 
                        className="underline" 
                        target="_blank"
                        href="https://www.pexels.com/@roman-odintsov/" 
                        rel="noreferrer"
                    >
                        ROMAN ODINTSOV
                    </a> 
                    
                    &nbsp;on&nbsp; 
                    
                    <a 
                        className="underline" 
                        target="_blank"
                        href="https://www.pexels.com/video/a-person-pouring-tea-on-a-cup-8190636/" 
                        rel="noreferrer"
                    >
                        Pexels
                    </a>

                    .
                </li>
            </ul>
        </>
    );
}