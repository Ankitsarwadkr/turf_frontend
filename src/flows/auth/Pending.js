import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
export default function Pending() {
    const { clearMessages } = useAuthStore();
    const nav = useNavigate();
    return (_jsx("div", { className: "min-h-screen bg-neutral-bg flex items-center justify-center", children: _jsx("div", { className: "w-full px-4", children: _jsxs("div", { className: "\r\n            mx-auto\r\n            max-w-sm\r\n            bg-neutral-surface\r\n            rounded-xl\r\n            shadow-lg\r\n            p-6\r\n            text-center\r\n            space-y-5\r\n            animate-authCardIn\r\n          ", children: [_jsx("h1", { className: "text-[20px] font-semibold text-text-primary", children: "Approval Pending" }), _jsxs("p", { className: "text-sm text-text-secondary leading-relaxed", children: ["Your owner account is under verification.", _jsx("br", {}), "You\u2019ll be able to access the dashboard once approved."] }), _jsx("button", { onClick: () => {
                            clearMessages();
                            nav("/auth/login");
                        }, className: "\r\n              w-full h-12\r\n              bg-primary\r\n              text-white\r\n              text-sm font-semibold\r\n              rounded-xl\r\n              transition-all\r\n              hover:bg-primary-hover\r\n              active:bg-primary-active\r\n              active:scale-[0.98]\r\n            ", children: "Back to Login" })] }) }) }));
}
