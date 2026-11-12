import clsx from "clsx";

import TeaTapestryLogo from "../../assets/tea-tapestry-logo-400x150.svg";

type TitleRightImage = React.ReactElement<React.ComponentProps<'img'>, 'img'>;

type AuthBasePageProps = {
    title: string;
    titleRightImage?: TitleRightImage;
    children: React.ReactNode;
    onNavigate: (path: string) => void;
};

export default function AuthBasePage({
    title, 
    titleRightImage,
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
                <img src = {TeaTapestryLogo} alt = "Tea Tapestry logo" width = {300} height = {113} className = "h-28.25 w-75"/>
            </a>

            <div className={clsx("bg-white w-full max-w-sm p-10 rounded-2xl", titleRightImage && "pt-3")}>
                <div className={clsx("h-12.5", titleRightImage && "h-37.5 flex items-center justify-between")}>
                    <h1 className="title--hero ">
                        {title}
                    </h1>

                    {titleRightImage}
                </div>

                {children}
            </div>
        </div>
    );
}