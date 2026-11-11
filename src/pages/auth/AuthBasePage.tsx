import TeaTapestryLogo from "../../assets/tea-tapestry-logo-400x150.svg";

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
        onNavigate("/");
    };

    return (
        <div className = "bg-sencha-green overflow-hidden h-screen w-screen flex flex-col items-center gap-5 p-5">
            <a href="/" onClick={handleNavigate}>
                <img src = {TeaTapestryLogo} alt = "Tea Tapestry logo" width = {300} height = {113} className = "h-[113px] w-[300px]"/>
            </a>

            <div className = "bg-white w-full max-w-sm p-10 rounded-2xl">
                <h1 className="title--hero ">
                    {title}
                </h1>
                {children}
            </div>
        </div>
    );
}