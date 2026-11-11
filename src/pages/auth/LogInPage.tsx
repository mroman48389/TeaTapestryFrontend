import UnderConstructionImg from "../../assets/teacup mascots/construction-teacup.webp";
import AuthBasePage from "./AuthBasePage";

type LoginPageProps = {
    onNavigate: (path: string) => void;
};

export default function LogInPage({ onNavigate }: LoginPageProps) {
    const underConstructionImg = 
        <div className="fade-in-component mt-10 flex flex-1 flex-col items-center z-10">
            <h2 className="title--subheading text-center">
                {"This area is currently under construction. Please visit \"Tea profiles\" in the meantime."}
            </h2>

            <img src={UnderConstructionImg} alt="Teacup with hardhat" width={1024} height={1024} className="h-auto w-75"/>
        </div>;

    return (
        <AuthBasePage title = "Test" onNavigate={onNavigate}>
            {underConstructionImg}
        </AuthBasePage>
    );
}