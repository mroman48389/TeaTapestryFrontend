import TeaTapestryLogo from "../../assets/tea-tapestry-logo-400x150.svg";
import { HeroTitle } from "@/components/HeroTitle";

type AuthBasePageProps = {
    title: string;
    children: React.ReactNode;
    onNavigate: (path: string) => void;
};

export default function AuthBasePage({
    title, 
    children,
    onNavigate
}: AuthBasePageProps) {

    function handleNavigate(e: React.MouseEvent<HTMLAnchorElement>) {
        e.preventDefault();
        onNavigate("/log-in");
    };

    return (
        <div className = "bg-sencha-green w-full h-full flex flex-col items-center gap-5">
            <a href="/" onClick={handleNavigate}>
                <img src = {TeaTapestryLogo} alt = "Tea Tapestry logo" width = {200} height = {75} className = "h-[75px] w-[200px]"/>
            </a>

            <div className = "bg-white w-50">
                <HeroTitle>{title}</HeroTitle>
                {children}
            </div>
        </div>
    );
}