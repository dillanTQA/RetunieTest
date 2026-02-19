import { useTriageRequests, useCreateTriageRequest } from "@/hooks/use-triage";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Clock, FileText, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { clsx } from "clsx";

export default function Dashboard() {
  const { data: requests, isLoading } = useTriageRequests();
  const { mutate: createRequest, isPending: isCreating } = useCreateTriageRequest();
  const [, setLocation] = useLocation();

  const handleCreateNew = () => {
    createRequest({}, {
      onSuccess: (data) => {
        setLocation(`/triage/${data.id}`);
      }
    });
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your service requirements and ongoing triage requests.</p>
          </div>
          <Button 
            onClick={handleCreateNew} 
            disabled={isCreating}
            size="lg"
            className="shadow-md hover:shadow-lg transition-all"
          >
            {isCreating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
            New Requirement
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="grid gap-4">
            {requests.map((req) => (
              <Link key={req.id} href={`/triage/${req.id}`}>
                <div className="group bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {req.title || "Untitled Requirement"}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {req.updatedAt ? format(new Date(req.updatedAt), "MMM d, yyyy") : "Just now"}
                        </span>
                        <span className={clsx(
                          "px-2 py-0.5 rounded-full text-xs font-medium uppercase",
                          req.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        )}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card border border-dashed border-border rounded-2xl">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Requests Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start a new triage process to define requirements and find suppliers.</p>
            <Button onClick={handleCreateNew} disabled={isCreating}>
              Start First Requirement
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
