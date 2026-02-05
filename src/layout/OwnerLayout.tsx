import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import LogoutButton from "../components/LogoutButton"
import { 
  Home, Building2, Calendar, DollarSign, User, LogOut, ChevronLeft, IndianRupee
} from "lucide-react"

export default function OwnerLayout() {
  const nav = useNavigate()
  const location = useLocation()

  const navItems = [
    { to: "/app/owner", label: "Dashboard", icon: Home, end: true },
    { to: "/app/owner/turfs", label: "Turfs", icon: Building2 },
    { to: "/app/owner/bookings", label: "Bookings", icon: Calendar },
    { to: "/app/owner/earnings", label: "Earnings", icon: IndianRupee },
    { to: "/app/owner/profile", label: "Profile", icon: User },
  ]

  // Check if we're on a detail/edit page (should show back button and hide bottom nav)
  const isDetailPage = 
    location.pathname.includes('/edit') ||
    location.pathname.includes('/manage') ||
    location.pathname.includes('/images') ||
    location.pathname.includes('/schedule') ||
    location.pathname.includes('/slots') ||
    location.pathname.match(/\/turfs\/\d+$/) || // Matches /turfs/123 but not /turfs
    location.pathname.match(/\/booking-details\/[^/]+$/)

  const showBackButton = isDetailPage
  const hideBottomNav = isDetailPage

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col lg:flex-row">
      
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden lg:flex w-64 bg-neutral-surface border-r border-neutral-border flex-col fixed left-0 top-0 bottom-0 shadow-subtle">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold text-sm">T</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-text-primary">TurfEra</h1>
              <p className="text-xs text-text-muted font-medium">Owner Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-neutral-hover hover:text-text-primary active:scale-[0.98]"
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button - Desktop Only */}
        <div className="p-4 border-t border-neutral-border">
          <LogoutButton className="w-full flex items-center gap-2 justify-center border border-red-200 rounded-xl py-3 text-sm font-medium text-danger hover:bg-red-50 hover:border-red-300 transition-all duration-200 active:scale-[0.98]">
            <LogOut size={16} />
            <span>Logout</span>
          </LogoutButton>
        </div>
      </aside>

      {/* Main Content Area - Offset for fixed sidebar */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        
        {/* Header - Only show on non-detail pages */}
        {!isDetailPage && (
          <header className="h-16 bg-neutral-surface border-b border-neutral-border flex items-center sticky top-0 z-30 shadow-subtle">
            <div className="w-full max-w-7xl mx-auto px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-page-title font-semibold text-text-primary">Owner Dashboard</h1>
                </div>
                {/* Removed mobile logout button from header as requested */}
              </div>
            </div>
          </header>
        )}

        {/* Content */}
        <main className={`flex-1 ${hideBottomNav ? 'pb-0' : 'pb-16'} lg:pb-0`}>
          <div className={`${isDetailPage ? 'p-0' : 'p-4 lg:p-6'} max-w-7xl mx-auto`}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Hidden on detail pages */}
      {!hideBottomNav && (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-neutral-surface border-t border-neutral-border flex items-center z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-all duration-200 relative active:scale-[0.92] active:opacity-80 ${
                  isActive ? "text-primary" : "text-text-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
                  )}
                  <item.icon size={20} className="transition-transform duration-200 active:scale-110" />
                  <span className="mt-0.5 transition-all duration-200 active:scale-95">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}