import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
export default function AdminLayout() {
    return (_jsxs("div", { className: "min-h-screen flex bg-neutral-bg", children: [_jsxs("aside", { className: "w-64 bg-white text-text-primary p-6 space-y-4 shadow-premium border-r border-neutral-border", children: [_jsx("h2", { className: "text-xl font-semibold mb-6 text-text-primary", children: "Admin Panel" }), _jsxs("nav", { className: "space-y-2", children: [_jsx(NavLink, { end: true, to: "/app/admin", className: ({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-250 smooth
              ${isActive
                                    ? 'bg-primary-light text-primary border-l-4 border-primary'
                                    : 'hover:bg-neutral-hover text-text-secondary hover:text-text-primary'}
            `, children: "Dashboard" }), _jsx(NavLink, { to: "/app/admin/owners", className: ({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-250 smooth
              ${isActive
                                    ? 'bg-primary-light text-primary border-l-4 border-primary'
                                    : 'hover:bg-neutral-hover text-text-secondary hover:text-text-primary'}
            `, children: "Owner Approvals" }), _jsx(NavLink, { to: "/app/admin/turfs", className: ({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-250 smooth
              ${isActive
                                    ? 'bg-primary-light text-primary border-l-4 border-primary'
                                    : 'hover:bg-neutral-hover text-text-secondary hover:text-text-primary'}
            `, children: "Turfs" }), _jsx(NavLink, { to: "/app/admin/payments", className: ({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-250 smooth
              ${isActive
                                    ? 'bg-primary-light text-primary border-l-4 border-primary'
                                    : 'hover:bg-neutral-hover text-text-secondary hover:text-text-primary'}
            `, children: "Payments" }), _jsx(NavLink, { to: "/app/admin/payouts", className: ({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-250 smooth
              ${isActive
                                    ? 'bg-primary-light text-primary border-l-4 border-primary'
                                    : 'hover:bg-neutral-hover text-text-secondary hover:text-text-primary'}
            `, children: "Payouts" })] }), _jsx("div", { className: "pt-6 mt-6 border-t border-neutral-border", children: _jsx(LogoutButton, {}) })] }), _jsx("main", { className: "flex-1 p-6 overflow-y-auto bg-neutral-bg", children: _jsx("div", { className: "max-w-7xl mx-auto", children: _jsx(Outlet, {}) }) })] }));
}
