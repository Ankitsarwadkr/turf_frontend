import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { Home, Building2, Calendar, User, LogOut, IndianRupee } from "lucide-react";
export default function OwnerLayout() {
    const nav = useNavigate();
    const location = useLocation();
    const navItems = [
        { to: "/app/owner", label: "Dashboard", icon: Home, end: true },
        { to: "/app/owner/turfs", label: "Turfs", icon: Building2 },
        { to: "/app/owner/bookings", label: "Bookings", icon: Calendar },
        { to: "/app/owner/earnings", label: "Earnings", icon: IndianRupee },
        { to: "/app/owner/profile", label: "Profile", icon: User },
    ];
    // Check if we're on a detail/edit page (should show back button and hide bottom nav)
    const isDetailPage = location.pathname.includes('/edit') ||
        location.pathname.includes('/manage') ||
        location.pathname.includes('/images') ||
        location.pathname.includes('/schedule') ||
        location.pathname.includes('/slots') ||
        location.pathname.match(/\/turfs\/\d+$/) || // Matches /turfs/123 but not /turfs
        location.pathname.match(/\/booking-details\/[^/]+$/);
    const showBackButton = isDetailPage;
    const hideBottomNav = isDetailPage;
    return (_jsxs("div", { className: "min-h-screen bg-neutral-bg flex flex-col lg:flex-row", children: [_jsxs("aside", { className: "hidden lg:flex w-64 bg-neutral-surface border-r border-neutral-border flex-col fixed left-0 top-0 bottom-0 shadow-subtle", children: [_jsx("div", { className: "h-16 flex items-center px-6 border-b border-neutral-border", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-xl flex items-center justify-center", children: _jsx("span", { className: "text-white font-semibold text-sm", children: "T" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-sm font-semibold tracking-tight text-text-primary", children: "TurfEra" }), _jsx("p", { className: "text-xs text-text-muted font-medium", children: "Owner Panel" })] })] }) }), _jsx("nav", { className: "flex-1 p-4 space-y-1 overflow-y-auto", children: navItems.map((item) => (_jsxs(NavLink, { to: item.to, end: item.end, className: ({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-primary text-white shadow-sm"
                                : "text-text-secondary hover:bg-neutral-hover hover:text-text-primary active:scale-[0.98]"}`, children: [_jsx(item.icon, { size: 20 }), item.label] }, item.to))) }), _jsx("div", { className: "p-4 border-t border-neutral-border", children: _jsxs(LogoutButton, { className: "w-full flex items-center gap-2 justify-center border border-red-200 rounded-xl py-3 text-sm font-medium text-danger hover:bg-red-50 hover:border-red-300 transition-all duration-200 active:scale-[0.98]", children: [_jsx(LogOut, { size: 16 }), _jsx("span", { children: "Logout" })] }) })] }), _jsxs("div", { className: "lg:ml-64 flex-1 flex flex-col min-h-screen", children: [!isDetailPage && (_jsx("header", { className: "h-16 bg-neutral-surface border-b border-neutral-border flex items-center sticky top-0 z-30 shadow-subtle", children: _jsx("div", { className: "w-full max-w-7xl mx-auto px-4 lg:px-6", children: _jsx("div", { className: "flex items-center justify-between", children: _jsx("div", { className: "flex items-center gap-2", children: _jsx("h1", { className: "text-page-title font-semibold text-text-primary", children: "Owner Dashboard" }) }) }) }) })), _jsx("main", { className: `flex-1 ${hideBottomNav ? 'pb-0' : 'pb-16'} lg:pb-0`, children: _jsx("div", { className: `${isDetailPage ? 'p-0' : 'p-4 lg:p-6'} max-w-7xl mx-auto`, children: _jsx(Outlet, {}) }) })] }), !hideBottomNav && (_jsx("nav", { className: "lg:hidden fixed bottom-0 inset-x-0 h-16 bg-neutral-surface border-t border-neutral-border flex items-center z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]", children: navItems.map((item) => (_jsx(NavLink, { to: item.to, end: item.end, className: ({ isActive }) => `flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-all duration-200 relative active:scale-[0.92] active:opacity-80 ${isActive ? "text-primary" : "text-text-muted"}`, children: ({ isActive }) => (_jsxs(_Fragment, { children: [isActive && (_jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" })), _jsx(item.icon, { size: 20, className: "transition-transform duration-200 active:scale-110" }), _jsx("span", { className: "mt-0.5 transition-all duration-200 active:scale-95", children: item.label })] })) }, item.to))) }))] }));
}
