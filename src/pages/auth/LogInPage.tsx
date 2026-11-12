import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

import AuthBasePage from "./AuthBasePage";
import { Pages, pageIDs } from "../../constants/pages";
import WavingMascotImg from "../../assets/teacup mascots/waving-teacup-looking-straight-on.webp";

type LoginPageProps = {
    onNavigate: (path: string) => void;
};

export default function LogInPage({ onNavigate }: LoginPageProps) {
    const [usernameOrEmail, setUsernameOrEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    /* Set up reference to call in the function below, since hooks can only be called at
       the top level of React components. */
    const navigate = useNavigate();

    return (
        <AuthBasePage 
            title = "Sign in" 
            titleRightImage={<img src={WavingMascotImg} alt="Teacup with hardhat" width={135} height={150} className="w-33.75 h-37.5"/>}
            onNavigate={onNavigate}
        >

            <p className="text--body">
                Username or Email
            </p>

            <div className="flex flex-col gap-1">
                <Input
                    data-testid="username-email-textarea"
                    className="h-10 mt-1 w-full resize-none overflow-auto"
                    maxLength={30}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    value={usernameOrEmail}
                />

                {/* <small data-testid={`char-counter-${String(userTeaProfileNotesField)}`} className="text--small text-right opacity-70">
                    Please enter a valid username
                </small> */}
            </div>

            <p className="text--body mt-5">
                Password
            </p>

            <div className="flex flex-col gap-1">
                <Input
                    data-testid="password-textarea"
                    className="h-10 mt-1 w-full resize-none overflow-auto"
                    maxLength={30}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                />

                {/* <small data-testid={`char-counter-${String(userTeaProfileNotesField)}`} className="text--small text-right opacity-70">
                    {maxChars - notes[userTeaProfileNotesField].length} characters left
                </small> */}
            </div>

            <p className="text--small mt-3">
                Forgot your password? &nbsp;
                
                <a 
                    className="underline cursor-pointer" 
                    onClick={() => navigate(Pages[pageIDs.requestPasswordReset].path)}
                >
                    Click here to reset it.
                </a> 
            </p>

            <button
                className="auth-btn mt-10"
                onClick={()=>{}}
            >
                Sign in
            </button>

            <p className="text--small mt-10">
                Don't have an account? &nbsp;
                
                <a 
                    className="underline cursor-pointer" 
                    onClick={() => navigate(Pages[pageIDs.signUp].path)}
                >
                    Click here to sign up.
                </a> 
            </p>



        </AuthBasePage>
    );
}