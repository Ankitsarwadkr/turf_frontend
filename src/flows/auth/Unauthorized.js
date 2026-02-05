import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
export default function Unauthorized() {
    const nav = useNavigate();
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-neutral-bg px-4", children: _jsxs("div", { className: "\r\n          w-full\r\n          max-w-sm\r\n          bg-neutral-surface\r\n          rounded-xl\r\n          shadow-lg\r\n          border border-neutral-border\r\n          p-6\r\n          text-center\r\n          space-y-6\r\n        ", children: [_jsx("h1", { className: "text-[20px] font-semibold text-danger", children: "Access Denied" }), _jsx("p", { className: "text-sm text-text-secondary leading-relaxed", children: "You are not authorized to access this page." }), _jsx("button", { onClick: () => nav("/auth/login"), className: "\r\n            w-full\r\n            h-12\r\n            bg-primary\r\n            text-white\r\n            text-sm\r\n            font-semibold\r\n            rounded-xl\r\n            hover:bg-primary-hover\r\n            active:bg-primary-active\r\n          ", children: "Go to Login" })] }) }));
}
