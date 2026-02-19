import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useTriageRequest } from "@/hooks/use-triage";
import { Layout } from "@/components/Layout";
import { StatusStepper, type Step } from "@/components/StatusStepper";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import TriageChat from "./TriageChat";
import TriageSpecification from "./TriageSpecification";
import TriageSummary from "./TriageSummary";

export default function TriageFlow() {
  const { id } = useParams<{ id: string }>();
  const requestId = parseInt(id || "0");
  const { data: request, isLoading, error } = useTriageRequest(requestId);
  const [currentStep, setCurrentStep] = useState<Step>("discovery");
  const [location, setLocation] = useLocation();

  // Basic routing/state logic to persist step in URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get("step");
    if (stepParam === "discovery" || stepParam === "specification" || stepParam === "summary") {
      setCurrentStep(stepParam);
    } else if (stepParam === "recommendation" || stepParam === "suppliers") {
      setCurrentStep(stepParam === "suppliers" ? "summary" : "discovery");
    }
  }, [location]);

  const handleStepChange = (step: Step) => {
    setCurrentStep(step);
    // Update URL without reloading
    const url = new URL(window.location.href);
    url.searchParams.set("step", step);
    window.history.pushState({}, "", url.toString());
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
        </div>
      </Layout>
    );
  }

  if (error || !request) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Request Not Found</h2>
          <p className="text-muted-foreground mb-6">This triage request doesn't exist or you don't have permission.</p>
          <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">{request.title}</h1>
          <p className="text-sm text-muted-foreground">ID: #{request.id} • Created on {new Date(request.createdAt!).toLocaleDateString()}</p>
        </div>

        <StatusStepper currentStep={currentStep} onStepClick={handleStepChange} />

        <div className="bg-card rounded-2xl border border-border shadow-sm p-0 overflow-hidden animate-enter" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
          {currentStep === "discovery" && (
            <div className="p-6 md:p-8 h-full">
              <TriageChat 
                request={request} 
                onComplete={() => handleStepChange("specification")} 
              />
            </div>
          )}
          {currentStep !== "discovery" && (
            <div className="p-6 md:p-8">
              {currentStep === "specification" && (
                <TriageSpecification 
                  requestId={requestId}
                  onNext={() => handleStepChange("summary")}
                  onBack={() => handleStepChange("discovery")}
                />
              )}
              {currentStep === "summary" && (
                <TriageSummary 
                  request={request}
                  onBack={() => handleStepChange("specification")}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
