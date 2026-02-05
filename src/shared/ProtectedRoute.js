import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
export default function ProtectedRoute() {
    const { isAuthenticated, role, status } = useAuthStore();
    console.log("ProtectedRoute", {
        isAuthenticated,
        role,
        status,
        path: window.location.pathname,
    });
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/auth/login", replace: true });
    }
    if (role === "OWNER" && status === "PENDING") {
        return _jsx(Navigate, { to: "/pending", replace: true });
    }
    return _jsx(Outlet, {});
}
