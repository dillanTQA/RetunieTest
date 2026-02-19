import { useState } from "react";
import { RecommendationCard } from "@/components/RecommendationCard";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, RefreshCw } from "lucide-react";
import type { TriageRequest, Recommendation } from "@shared/schema";
import { useUpdateTriageRequest, useGenerateRecommendation } from "@/hooks/use-triage";

interface TriageRecommendationProps {
  request: TriageRequest;
  onNext: () => void;
  onBack: () => void;
}

export default function TriageRecommendation({ request, onNext, onBack }: TriageRecommendationProps) {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const { mutate: updateRequest, isPending: isSaving } = useUpdateTriageRequest();
  const { mutate: regenerate, isPending: isRegenerating } = useGenerateRecommendation(request.id);

  // Cast the stored JSON recommendation to our type
  const recommendation = request.recommendation as Recommendation | null;

  const handleNext = () => {
    // In a real app, we would save the selected route here
    if (!selectedRoute) return;
    updateRequest({ 
      id: request.id, 
      // We might store selection in answers or a separate field. For MVP, assuming backend handles it or we proceed.
      // Let's assume we update the title based on selection just to show mutation usage:
      title: `${recommendation?.routes.find(r => r.type === selectedRoute)?.title} Request`
    }, {
      onSuccess: () => onNext()
    });
  };

  if (!recommendation) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold mb-4">No recommendations generated yet.</h3>
        <Button onClick={() => regenerate()} disabled={isRegenerating}>
          <RefreshCw className="mr-2 w-4 h-4" /> Generate Recommendation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-display font-bold mb-4">Recommended Engagement Routes</h2>
        <p className="text-muted-foreground">{recommendation.summary}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendation.routes.map((route) => (
          <RecommendationCard
            key={route.type}
            route={route}
            isSelected={selectedRoute === route.type}
            onSelect={() => setSelectedRoute(route.type)}
          />
        ))}
      </div>

      <div className="flex justify-between pt-8 border-t border-border mt-8">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="mr-2 w-4 h-4" /> Back to Discovery
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!selectedRoute || isSaving}
          size="lg"
          className="px-8"
        >
          Generate Specification <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
