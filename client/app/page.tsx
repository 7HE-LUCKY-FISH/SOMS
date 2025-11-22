import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Users, Activity, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 h-25">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 h-full">
            <img src="/SOMS-Logo3.svg" alt="SOMS Logo" className="h-full" />
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Roles</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance">
              Soccer Operation Management System
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed text-balance max-w-2xl mx-auto">
            Streamline your club management with intuitive lineup builders, medical tracking, and statistics for coaches, medical staff, and players.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Everything you need to manage your club</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete suite of tools designed for modern soccer operations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-background p-6 rounded-2xl border border-border">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Dream Team Builder</h3>
              <p className="text-muted-foreground leading-relaxed">
                Drag-and-drop lineup creation with formation presets and availability tracking.
              </p>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border">
              <div className="size-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <Activity className="size-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Medical Center</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track injuries, recovery timelines, and player availability in real-time.
              </p>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border">
              <div className="size-12 rounded-xl bg-info/20 flex items-center justify-center mb-4">
                <Users className="size-6 text-info-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Multi-Team Support</h3>
              <p className="text-muted-foreground leading-relaxed">
                Manage multiple teams with separate rosters and permissions.
              </p>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border">
              <div className="size-12 rounded-xl bg-warning/20 flex items-center justify-center mb-4">
                <BarChart3 className="size-6 text-warning-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Analytics Dashboard</h3>
              <p className="text-muted-foreground leading-relaxed">
                View player availability, match history, and team wins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Built for your entire team</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each role gets the tools they need, with the right level of access.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card p-8 rounded-2xl border border-border">
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Coach & Manager</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Create lineups, manage rosters, track matches, and add training notes.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Full lineup creation and editing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Roster management and team assignments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Match creation and event tracking</span>
                </li>
              </ul>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border">
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Medical Staff</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Log injuries, set recovery timelines, and manage player availability.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent-foreground mt-1">•</span>
                  <span>Injury logging and tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-foreground mt-1">•</span>
                  <span>Medical notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-foreground mt-1">•</span>
                  <span>Availability updates</span>
                </li>
              </ul>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border">
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Player</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                View your stats, upcoming matches, and personal medical information.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-info-foreground mt-1">•</span>
                  <span>Personal stats and match history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info-foreground mt-1">•</span>
                  <span>Team schedule and lineup visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info-foreground mt-1">•</span>
                  <span>Medical status overview</span>
                </li>
              </ul>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border">
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Admin</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Manage users, configure settings, and oversee operations.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-warning-foreground mt-1">•</span>
                  <span>User management and role assignment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning-foreground mt-1">•</span>
                  <span>Organization and season settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning-foreground mt-1">•</span>
                  <span>Data import and system configuration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card h-16">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-2 h-full">
              <img src="/SOMS-Logo.png" alt="SOMS Logo" className="h-full" />
            </div>
            <p className="text-sm text-muted-foreground">
              2025 Soccer Operations Management System
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
