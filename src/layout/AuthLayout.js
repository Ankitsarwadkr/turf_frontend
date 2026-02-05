import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, useLocation } from "react-router-dom";
import AuthToast from "../components/AuthToast";
export default function AuthLayout() {
    const { pathname } = useLocation();
    // Status screens must be quiet
    const hideToast = pathname.includes("/auth/pending") ||
        pathname.includes("/auth/unauthorized");
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-neutral-bg px-4", children: _jsxs("div", { className: "\r\n          w-full max-w-sm\r\n          bg-neutral-surface\r\n          border border-neutral-border\r\n          rounded-xl\r\n          shadow-xl\r\n          p-6\r\n          space-y-6\r\n\r\n          opacity-0 scale-[0.98]\r\n          animate-authCardIn\r\n        ", children: [!hideToast && _jsx(AuthToast, {}), _jsx(Outlet, {})] }) }));
}
