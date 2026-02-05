import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
export default function RoleGate({ allow }) {
    const { role } = useAuthStore();
    if (!role || !allow.includes(role))
        return _jsx(Navigate, { to: "/unauthorized", replace: true });
    return _jsx(Outlet, {});
}
