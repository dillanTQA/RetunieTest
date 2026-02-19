import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, Download } from "lucide-react";
import { Link } from "wouter";
import type { TriageRequest } from "@shared/schema";
import { useUpdateTriageRequest } from "@/hooks/use-triage";

interface TriageSummaryProps {
  request: TriageRequest;
  onBack: () => void;
}

export default function TriageSummary({ request, onBack }: TriageSummaryProps) {
  const { mutate: completeRequest } = useUpdateTriageRequest();
  const recommendation = request.recommendation as { routes?: { type: string; title: string; description?: string }[]; summary?: string } | null;

  // Mark as complete on mount if not already
  if (request.status !== "completed") {
    completeRequest({ id: request.id, status: "completed" });
  }

  return (
    <div className="text-center py-10 max-w-2xl mx-auto animate-enter">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <h2 className="text-4xl font-display font-bold mb-4 text-foreground">Triage Completed!</h2>
      <p className="text-xl text-muted-foreground mb-8">
        Your requirement has been processed and the specification has been saved.
      </p>

      <div className="bg-secondary/30 rounded-2xl p-8 mb-10 text-left border border-border">
        <h3 className="font-bold mb-4 text-lg">Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground">Reference ID</span>
            <span className="font-mono font-bold" data-testid="text-reference-id">#{request.id}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground">Title</span>
            <span className="font-medium" data-testid="text-title">{request.title}</span>
          </div>
          {recommendation && recommendation.routes && recommendation.routes.length > 0 ? (
            <div className="border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Agreed Route{recommendation.routes.length > 1 ? "s" : ""}</span>
              <div className="mt-2 space-y-2" data-testid="routes-list">
                {recommendation.routes.map((route: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-md border border-border" data-testid={`route-item-${idx}`}>
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <span className="font-medium">{route.title}</span>
                      {route.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{route.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Route</span>
              <span className="font-medium text-muted-foreground">Not yet determined</span>
            </div>
          )}
          {recommendation?.summary && (
            <div className="pt-1 pb-2">
              <span className="text-muted-foreground text-sm">Recommendation Summary</span>
              <p className="text-sm mt-1" data-testid="text-recommendation-summary">{recommendation.summary}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="lg">
            Return to Dashboard
          </Button>
        </Link>
        <Button size="lg" className="shadow-lg shadow-primary/20">
          <Download className="mr-2 w-4 h-4" /> Download Report PDF
        </Button>
      </div>
    </div>
  );
}
