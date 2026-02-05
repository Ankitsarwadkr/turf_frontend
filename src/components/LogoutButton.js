import { jsx as _jsx } from "react/jsx-runtime";
import { logout } from "../engine/authEngine";
export default function LogoutButton({ children, className = "" }) {
    return (_jsx("button", { onClick: logout, className: `px-4 py-2 rounded transition ${className}`, children: children || "Logout" }));
}
