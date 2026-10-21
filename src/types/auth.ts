import { AUTH_STATUS } from "@/constants/auth";

export type AuthStatus = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];