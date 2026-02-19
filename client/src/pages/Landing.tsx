import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingUp, ShieldCheck, LayoutDashboard, PlusCircle, LogIn, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/queryClient";

export default function LandingPage() {
  const { user } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleDemoLogin = async () => {
    setIsSigningIn(true);
    try {
      await fetch("/api/auth/demo-login", { method: "POST", credentials: "include" });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const stats = [
    { 
      label: "Faster Fulfilment", 
      value: "6 days", 
      desc: "Average reduction in filling your requirement",
      icon: CheckCircle2,
      color: "text-primary"
    },
    { 
      label: "Budget Savings", 
      value: "12%", 
      desc: "Average savings delivered for budget holders",
      icon: TrendingUp,
      color: "text-primary"
    },
    { 
      label: "Risk Managed", 
      value: "35%", 
      desc: "Cost exposure from risk managed upfront",
      icon: ShieldCheck,
      color: "text-primary"
    },
  ];

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-16 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-enter">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-4">
            Retinue Triage Portal
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black leading-tight text-foreground tracking-tight">
            Design, build and <br />
            <span className="text-primary italic">
              engage
            </span> your <br />
            workforce.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Retinue Solutions provides tailored workforce solutions to help organisations manage their talent and overcome challenges around cost control, continuity and compliance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all"
                    data-testid="button-go-to-dashboard"
                  >
                    <LayoutDashboard className="mr-2 w-5 h-5" />
                    View Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full" data-testid="button-new-request">
                    <PlusCircle className="mr-2 w-5 h-5" />
                    New Request
                  </Button>
                </Link>
              </>
            ) : (
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all"
                onClick={handleDemoLogin}
                disabled={isSigningIn}
                data-testid="button-sign-in"
              >
                {isSigningIn ? (
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 w-5 h-5" />
                )}
                {isSigningIn ? "Signing in..." : "Sign In"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              className="bg-card p-8 rounded-2xl shadow-lg border border-border hover:border-primary/30 transition-colors"
            >
              <div className={`p-3 rounded-xl bg-background w-fit mb-6 ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold text-foreground mb-2 font-display">{stat.value}</h3>
              <p className="text-lg font-semibold text-foreground mb-1">{stat.label}</p>
              <p className="text-muted-foreground">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="fixed top-0 left-0 w-full h-full -z-50 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
        </div>
      </div>
    </Layout>
  );
}
