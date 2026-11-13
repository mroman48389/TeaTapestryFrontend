import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = {

} & React.InputHTMLAttributes<HTMLInputElement>;

export function PasswordInput({
    className,
    ...props
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Input
                type={showPassword ? "text" : "password"}
                className={cn("pr-10", className)}
                {...props}
            />

            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={props.disabled}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="
                    absolute inset-y-0 right-0 flex items-center px-3 
                    cursor-pointer 
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                {
                    showPassword ? 
                    <EyeOff className="h-4 w-4" aria-hidden="true" /> : 
                    <Eye className="h-4 w-4" aria-hidden="true" />
                }
            </button>
        </div>
    );
}