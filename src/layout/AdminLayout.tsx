import { NavLink, Outlet } from "react-router-dom"
import LogoutButton from "../components/LogoutButton"

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-neutral-bg">
      {/* Sidebar - Using premium warm stone with green accents */}
      <aside className="w-64 bg-white text-text-primary p-6 space-y-4 shadow-premium border-r border-neutral-border">
        <h2 className="text-xl font-semibold mb-6 text-text-primary">Admin Panel</h2>

        <nav className="space-y-2">
          <NavLink 
            end 
            to="/app/admin" 
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-250 smooth
              ${isActive 
                ? 'bg-primary-light text-primary border-l-4 border-primary' 
                : 'hover:bg-neutral-hover text-text-secondary hover:text-text-primary'
              }
            `}
          >
            Dashboard
          </NavLink>

          <NavLink 
            to="/app/admin/owners" 
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-250 smooth
              ${isActive 
                ? 'bg-primary-light text-primary border-l-4 border-primary' 
                : 'hover:bg-neutral-hover text-text-secondary hover:text-text-primary'
              }
            `}
          >
            Owner Approvals
          </NavLink>

          <NavLink 
            to="/app/admin/turfs" 
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-250 smooth
              ${isActive 
                ? 'bg-primary-light text-primary border-l-4 border-primary' 
                : 'hover:bg-neutral-hover text-text-secondary hover:text-text-primary'
              }
            `}
          >
            Turfs
          </NavLink>

          <NavLink 
            to="/app/admin/payments" 
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-250 smooth
              ${isActive 
                ? 'bg-primary-light text-primary border-l-4 border-primary' 
                : 'hover:bg-neutral-hover text-text-secondary hover:text-text-primary'
              }
            `}
          >
            Payments
          </NavLink>

          <NavLink 
            to="/app/admin/payouts" 
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-250 smooth
              ${isActive 
                ? 'bg-primary-light text-primary border-l-4 border-primary' 
                : 'hover:bg-neutral-hover text-text-secondary hover:text-text-primary'
              }
            `}
          >
            Payouts
          </NavLink>
        </nav>

        <div className="pt-6 mt-6 border-t border-neutral-border">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto bg-neutral-bg">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}