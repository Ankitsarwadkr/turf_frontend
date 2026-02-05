export default function OwnerHome() {
  return (
    <div className="max-w-4xl animate-fadeIn">

      {/* Page Title with refined typography */}
      <h1 className="text-page-title mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Upcoming Bookings */}
        <div className="bg-neutral-card border border-neutral-border rounded-2xl p-6 shadow-card 
                       hover:shadow-card-hover transition-all duration-350 premium
                       hover:border-primary/20 group">
          <div className="text-sm text-text-muted mb-2">Upcoming Bookings</div>
          <div className="font-mono text-3xl font-medium text-text-primary mt-1 
                         group-hover:animate-number-count">10</div>
          <div className="h-1 w-12 bg-primary/30 rounded-full mt-4 group-hover:bg-primary 
                         transition-colors duration-350"></div>
        </div>

        {/* Card 2: Weekly Earnings */}
        <div className="bg-neutral-card border border-neutral-border rounded-2xl p-6 shadow-card 
                       hover:shadow-card-hover transition-all duration-350 premium
                       hover:border-primary/20 group relative overflow-hidden">
          <div className="text-sm text-text-muted mb-2">Weekly Earnings</div>
          <div className="font-mono text-3xl font-medium text-text-primary mt-1 
                         flex items-center gap-1">
            <span className="text-text-accent">₹</span>
            <span className="group-hover:animate-price-float">65,800</span>
          </div>
          <div className="h-1 w-12 bg-primary/30 rounded-full mt-4 group-hover:bg-primary 
                         transition-colors duration-350"></div>
        </div>

        {/* Card 3: Total Turfs */}
        <div className="bg-neutral-card border border-neutral-border rounded-2xl p-6 shadow-card 
                       hover:shadow-card-hover transition-all duration-350 premium
                       hover:border-primary/20 group">
          <div className="text-sm text-text-muted mb-2">Total Turfs</div>
          <div className="font-mono text-3xl font-medium text-text-primary mt-1 
                         group-hover:animate-number-count">2</div>
          <div className="h-1 w-12 bg-primary/30 rounded-full mt-4 group-hover:bg-primary 
                         transition-colors duration-350"></div>
        </div>

      </div>

      {/* Note with refined styling */}
      <div className="mt-8 p-4 bg-primary-subtle border border-primary-light rounded-xl 
                     text-sm text-text-secondary animate-slideUp">
        <p className="font-medium text-primary mb-1">Coming Soon</p>
        <p>Metrics will activate once booking & settlement modules go live.</p>
      </div>

    </div>
  );
}