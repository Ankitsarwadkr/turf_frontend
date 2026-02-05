export default function AdminHome() {
  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-page-title text-text-primary mb-2">Admin Dashboard</h2>
        <p className="text-text-secondary">Welcome to the admin panel. Select a section from the navigation.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-350">
          <h3 className="font-semibold text-text-primary mb-2">Quick Stats</h3>
          <p className="text-text-muted text-sm">Pending actions and overview</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-350">
          <h3 className="font-semibold text-text-primary mb-2">Recent Activity</h3>
          <p className="text-text-muted text-sm">Latest system activities</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-350">
          <h3 className="font-semibold text-text-primary mb-2">System Health</h3>
          <p className="text-text-muted text-sm">Platform status and metrics</p>
        </div>
      </div>
    </div>
  )
}