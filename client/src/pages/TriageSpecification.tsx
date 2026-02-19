import { useState, useEffect } from "react";
import { useSpecification, useSaveSpecification } from "@/hooks/use-triage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ChevronLeft, Save, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TriageSpecificationProps {
  requestId: number;
  onNext: () => void;
  onBack: () => void;
}

export default function TriageSpecification({ requestId, onNext, onBack }: TriageSpecificationProps) {
  const { data: spec, isLoading } = useSpecification(requestId);
  const { mutate: saveSpec, isPending: isSaving } = useSaveSpecification();
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const stripMarkdown = (text: string) => {
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^[\s]*\*\s+/gm, '- ')
      .replace(/```[\s\S]*?```/g, '');
  };

  useEffect(() => {
    if (spec) {
      setContent(stripMarkdown(spec.content));
    } else if (!isLoading) {
      // Default placeholder if no spec exists yet (simulated generation)
      setContent(`SERVICE SPECIFICATION\n\nOVERVIEW\n[Auto-generated from discovery] Need for a senior frontend developer...\n\nDELIVERABLES\n- React Application\n- Documentation\n\nTIMELINE\n- Start: ASAP\n- Duration: 6 months`);
    }
  }, [spec, isLoading]);

  const handleSave = () => {
    saveSpec({ id: requestId, content });
  };

  const handleNext = () => {
    // Ensure we save before proceeding
    saveSpec({ id: requestId, content }, {
      onSuccess: () => onNext()
    });
  };

  if (isLoading) {
    return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold">Review Specification</h2>
          <p className="text-muted-foreground">Review and edit the generated specification before finalising.</p>
        </div>
        <Button variant="outline" onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Draft
        </Button>
      </div>

      <div className="grid md:grid-cols-[1fr,300px] gap-8">
        <div className="space-y-4">
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-muted-foreground w-5 h-5" />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[500px] pl-12 font-mono text-sm leading-relaxed resize-y p-6 rounded-xl border-border focus:border-primary focus:ring-primary/20"
              placeholder="Generating specification..."
            />
          </div>
        </div>

        <div className="bg-secondary/30 rounded-xl p-6 h-fit border border-border/50">
          <h3 className="font-bold mb-4 text-foreground">AI Tips</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              Ensure deliverables are clearly defined to avoid scope creep.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              Specify the required working hours and location policies.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              Add any specific compliance certifications required (e.g., ISO 27001).
            </li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-border mt-8">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="mr-2 w-4 h-4" /> Back to Discovery
        </Button>
        <Button onClick={handleNext} size="lg" disabled={isSaving}>
          Continue to Summary <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
