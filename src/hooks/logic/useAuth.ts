import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "@/store/auth/authSelectors";

export function useAuth() {
    const isLoggedIn = useSelector(selectIsLoggedIn);

    return {
        isLoggedIn,
        // Later: user, roles, permissions, token, refresh(), logout(), etc.
    };
}
