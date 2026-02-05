import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, User, LogOut } from "lucide-react";
import LogoutButton from "../components/LogoutButton";
export default function CustomerLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    // Determine which bottom nav should be active for mobile
    const isHomeActive = location.pathname.startsWith('/app/customer') &&
        !location.pathname.includes('/bookings') &&
        !location.pathname.includes('/profile');
    const isBookingsActive = location.pathname.includes('/bookings');
    const isProfileActive = location.pathname.includes('/profile');
    // Check if we're on pages that have their own headers
    const isDashboard = location.pathname === '/app/customer';
    const isBookingsList = location.pathname === '/app/customer/bookings';
    const isProfile = location.pathname === '/app/customer/profile';
    const isTurfDetails = location.pathname.includes('/turfs/');
    const isSlotsPage = location.pathname.includes('/slots');
    const isBookingReview = location.pathname.includes('/booking/review');
    const isPaymentPage = location.pathname.includes('/payment');
    const isBookingDetails = location.pathname.includes('/bookings/') && location.pathname.split('/').length > 4;
    // Pages that have their own headers (don't show layout header)
    const hasOwnHeader = isTurfDetails || isSlotsPage || isBookingReview || isPaymentPage || isBookingDetails;
    // Pages that should hide bottom navigation (full-screen experiences)
    const hideBottomNav = isTurfDetails || isBookingReview || isPaymentPage || isBookingDetails;
    // Only show back button on mobile header when not on main sections (dashboard, bookings list, profile)
    const showBackButton = !isDashboard && !isBookingsList && !isProfile;
    return (_jsxs("div", { className: "min-h-screen flex bg-neutral-bg", children: [_jsxs("aside", { className: "hidden lg:flex w-72 bg-gradient-to-b from-neutral-surface to-neutral-bg border-r border-neutral-border flex-col fixed left-0 top-0 bottom-0 z-40", children: [_jsx("div", { className: "px-6 py-8", children: _jsxs("div", { className: "flex items-center gap-3.5", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-primary/20 blur-xl rounded-full" }), _jsx("div", { className: "relative w-12 h-12 bg-gradient-to-br from-primary via-primary to-primary-hover rounded-2xl flex items-center justify-center shadow-lg", children: _jsx("span", { className: "text-white font-black text-lg", children: "T" }) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-black text-text-primary tracking-tight bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text", children: "TurfEra" }), _jsx("div", { className: "text-xs text-text-muted font-medium mt-0.5", children: "Customer Dashboard" })] })] }) }), _jsxs("nav", { className: "flex-1 px-4 py-2 space-y-2 overflow-y-auto", children: [_jsx(SideLink, { to: "/app/customer", icon: _jsx(Home, { size: 20, strokeWidth: 2.5 }), children: "Home" }), _jsx(SideLink, { to: "/app/customer/bookings", icon: _jsx(Calendar, { size: 20, strokeWidth: 2.5 }), children: "My Bookings" }), _jsx(SideLink, { to: "/app/customer/profile", icon: _jsx(User, { size: 20, strokeWidth: 2.5 }), children: "Profile" })] }), _jsx("div", { className: "p-4 mt-auto", children: _jsxs(LogoutButton, { className: "w-full flex items-center gap-3 justify-center bg-danger/5 border border-danger/10 rounded-2xl py-3.5 text-sm font-bold text-danger hover:bg-danger/10 hover:border-danger/20 hover:shadow-sm transition-all duration-300 active:scale-[0.97]", children: [_jsx(LogOut, { size: 18, strokeWidth: 2.5 }), _jsx("span", { children: "Logout" })] }) })] }), _jsxs("main", { className: `flex-1 bg-neutral-bg lg:ml-72 ${hideBottomNav ? 'pb-0' : 'pb-16 lg:pb-0'}`, children: [!hasOwnHeader && (_jsxs("header", { className: "lg:hidden sticky top-0 bg-neutral-surface/95 backdrop-blur-xl border-b border-neutral-border px-5 py-4 flex items-center justify-between z-30", children: [_jsxs("div", { className: "flex items-center gap-3", children: [showBackButton && (_jsx("button", { onClick: () => navigate(-1), className: "p-2 hover:bg-neutral-hover rounded-xl transition-all duration-200 active:scale-95", children: _jsx("svg", { className: "w-5 h-5 text-text-primary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M15 19l-7-7 7-7" }) }) })), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-md", children: _jsx("span", { className: "text-white font-black text-sm", children: "T" }) }), _jsx("span", { className: "text-lg font-black text-text-primary tracking-tight", children: "TurfEra" })] })] }), _jsx(LogoutButton, { className: "p-2.5 rounded-xl hover:bg-danger/5 text-danger transition-all duration-200 active:scale-95", children: _jsx(LogOut, { size: 20, strokeWidth: 2.5 }) })] })), _jsx(Outlet, {})] }), !hideBottomNav && (_jsxs("nav", { className: "fixed bottom-0 left-0 right-0 lg:hidden bg-neutral-surface border-t border-neutral-border flex justify-around h-16 shadow-[0_-2px_16px_rgba(0,0,0,0.04)] z-50", children: [_jsx(BottomLink, { active: isHomeActive, icon: _jsx(Home, { size: 22, strokeWidth: 2.5 }), onClick: () => navigate('/app/customer'), children: "Home" }), _jsx(BottomLink, { active: isBookingsActive, icon: _jsx(Calendar, { size: 22, strokeWidth: 2.5 }), onClick: () => navigate('/app/customer/bookings'), children: "Bookings" }), _jsx(BottomLink, { active: isProfileActive, icon: _jsx(User, { className: "w-6 h-6" }), onClick: () => navigate('/app/customer/profile'), children: "Profile" })] }))] }));
}
function SideLink({ to, icon, children }) {
    const location = useLocation();
    const isActive = () => {
        if (to === '/app/customer') {
            return location.pathname === '/app/customer' ||
                location.pathname.includes('/turfs/') ||
                location.pathname.includes('/booking/review') ||
                location.pathname.includes('/payment');
        }
        if (to === '/app/customer/bookings')
            return location.pathname.includes('/bookings');
        return location.pathname === to;
    };
    const active = isActive();
    return (_jsxs(NavLink, { to: to, className: `flex items-center gap-4 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 relative group overflow-hidden ${active ? "bg-primary text-white shadow-lg" : "text-text-secondary hover:bg-neutral-hover hover:text-text-primary active:scale-[0.98]"}`, children: [active && _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-primary-hover/20 to-transparent opacity-50" }), _jsx("span", { className: `relative z-10 transition-all duration-300 ${active ? "text-white" : "text-text-muted group-hover:text-text-primary"}`, children: icon }), _jsx("span", { className: "relative z-10 tracking-tight", children: children })] }));
}
function BottomLink({ active, icon, children, onClick }) {
    return (_jsxs("button", { onClick: onClick, className: `flex flex-col items-center justify-center text-[11px] font-bold transition-all duration-300 active:scale-95 relative flex-1 gap-1.5 ${active ? "text-primary" : "text-text-muted"}`, children: [active && _jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-b-full transition-all duration-300" }), _jsx("span", { className: `transition-all duration-300 ${active && !children.includes('Profile') ? "scale-110" : ""}`, children: icon }), _jsx("span", { className: "tracking-tight", children: children })] }));
}
