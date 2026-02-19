import ocsLogoImg from "@assets/image_1770917351459.png";
import retinueLogoImg from "@assets/retinue-logo-cropped.png";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, FileText, UserCircle, Briefcase } from "lucide-react";
import { clsx } from "clsx";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "New Request", href: "/new-request", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-secondary backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between text-white">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <img src={retinueLogoImg} alt="Retinue Solutions" className="h-7 w-auto object-contain mix-blend-lighten" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {user && navItems.map((item, idx) => (
              <Link key={`${item.href}-${idx}`} href={item.href}>
                <div className={clsx(
                  "flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer hover:text-primary",
                  location === item.href ? "text-primary" : "text-white/80"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {user && (
              <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Client Organisation</span>
                  <span className="text-xs font-bold text-white/90">OCS Group</span>
                </div>
                <div className="h-8 w-16 bg-white/5 rounded p-1 flex items-center justify-center">
                  <img src={ocsLogoImg} alt="OCS Logo" className="h-full w-auto object-contain opacity-80" />
                </div>
              </div>
            )}
            
            {user ? (
              <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold">{user.firstName} {user.lastName}</span>
                  <span className="text-xs text-white/60">{user.email}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => logout()}
                  className="text-white/60 hover:text-destructive transition-colors hover:bg-white/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Link href="/api/login">
                <Button className="bg-primary hover:bg-primary/90 text-white">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6 lg:px-12 min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2025 Retinue Solutions. Workforce management expertise.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
