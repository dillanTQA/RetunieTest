import { useState, useRef, useEffect } from "react";
import { useTriageChat } from "@/hooks/use-triage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, ClipboardList, Info, ChevronRight, CheckCircle2, Paperclip, FileText, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import type { TriageRequest } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface TriageChatProps {
  request: TriageRequest;
  onComplete: () => void;
}

interface Message {
  role: "ai" | "user";
  content: string;
  isDocument?: boolean;
  fileName?: string;
}

export default function TriageChat({ request, onComplete }: TriageChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi there. I'm your Retinue triage consultant — think of me as your commercial partner for getting this requirement nailed down and routed properly.\n\nSo, what role or requirement are you looking to fill? Give me the headline and I'll take it from there." }
  ]);
  const [input, setInput] = useState("");
  const [recommendationAgreed, setRecommendationAgreed] = useState(false);
  const [specificationReady, setSpecificationReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { mutate: sendMessage, isPending: isSending } = useTriageChat(request.id);
  const [currentRequest, setCurrentRequest] = useState(request);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (request.recommendation) {
      setRecommendationAgreed(true);
    }
    if (request.status === "completed") {
      setSpecificationReady(true);
    }
  }, [request]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");

    sendMessage(userMsg, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: "ai", content: (data.reply || "").trim() }]);
        if (data.updatedRequest) {
          setCurrentRequest(data.updatedRequest);
        }
        if (data.recommendationAgreed) {
          setRecommendationAgreed(true);
        }
        if (data.specificationReady) {
          setSpecificationReady(true);
        }
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "text/csv",
      "text/markdown",
    ];
    const allowedExtensions = ["pdf", "docx", "doc", "txt", "csv", "md"];
    const ext = file.name.toLowerCase().split('.').pop() || "";

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      toast({ title: "Unsupported file type", description: "Please upload a PDF, Word document, text file, or CSV.", variant: "destructive" });
      return;
    }

    setMessages(prev => [...prev, { role: "user", content: `Uploaded document: ${file.name}`, isDocument: true, fileName: file.name }]);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("document", file);

      const res = await fetch(`/api/triage/${request.id}/upload-document`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      const data = await res.json();

      setMessages(prev => [...prev, { role: "ai", content: (data.reply || "").trim() }]);

      if (data.updatedRequest) {
        setCurrentRequest(data.updatedRequest);
        queryClient.setQueryData(['/api/triage/:id', request.id], data.updatedRequest);
      }

      toast({ title: "Document processed", description: `Extracted ${data.extractedFields || 0} data points from ${data.fileName}.` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || "Could not process the document.", variant: "destructive" });
      setMessages(prev => prev.filter(m => !(m.isDocument && m.fileName === file.name)));
    } finally {
      setIsUploading(false);
    }
  };

  const formatMessageContent = (content: string) => {
    const trimmed = content.trim();
    const parts = trimmed.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const isBusy = isSending || isUploading;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="flex-1 flex flex-col lg:w-[70%] min-h-0">
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-4 min-h-0" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  "flex gap-4 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                  msg.role === "ai" ? "bg-primary text-primary-foreground border-primary" : "bg-white text-gray-600 border-gray-200"
                )}>
                  {msg.role === "ai" ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div className={clsx(
                  "p-4 rounded-md text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                  msg.role === "ai" 
                    ? "bg-secondary text-white/90 rounded-tl-none" 
                    : "bg-primary text-white rounded-tr-none"
                )}>
                  {msg.isDocument ? (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>{msg.content}</span>
                    </div>
                  ) : (
                    formatMessageContent(msg.content)
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isBusy && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="bg-secondary p-4 rounded-md rounded-tl-none flex items-center gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-primary/60 animate-spin" />
                    <span className="text-sm text-white/70">Processing document...</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-200" />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border pt-4">
          {recommendationAgreed && !specificationReady && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-primary/5 border border-primary/10 rounded-md flex items-center gap-3"
              data-testid="route-agreed-info-banner"
            >
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-bold text-sm text-foreground">Engagement route agreed</p>
                <p className="text-xs text-muted-foreground">Now gathering the specific details needed to build your specification...</p>
              </div>
            </motion.div>
          )}
          {specificationReady && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-between gap-4"
              data-testid="specification-ready-banner"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-sm text-foreground">Ready to generate specification</p>
                  <p className="text-xs text-muted-foreground">All the details have been gathered. You can continue chatting or proceed.</p>
                </div>
              </div>
              <Button 
                onClick={onComplete}
                data-testid="button-proceed-specification"
              >
                Proceed to Specification <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt,.csv,.md"
            onChange={handleFileUpload}
            data-testid="input-file-upload"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              data-testid="button-upload-document"
              title="Upload a document (PDF, Word, text)"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 h-12 text-base"
              disabled={isBusy}
              autoFocus
              data-testid="input-chat-message"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isBusy}
              size="icon" 
              className="shrink-0"
              data-testid="button-send-message"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 ml-12">
            Supports PDF, Word (.docx/.doc), text, and CSV files up to 10MB
          </p>
        </div>
      </div>

      <div className="lg:w-[30%] min-h-0 overflow-y-auto">
        <div className="bg-secondary/5 rounded-md p-6 border border-border flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <ClipboardList className="w-5 h-5" />
            <h3 className="font-display font-bold text-lg">Requirement Summary</h3>
          </div>
          
          <div className="space-y-6 flex-1">
            {recommendationAgreed && (currentRequest.recommendation as any)?.routes?.length > 0 && (
              <div className="space-y-1.5" data-testid="section-agreed-routes">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Agreed Route(s)</label>
                <div className="p-4 bg-background rounded-md border border-border shadow-sm text-sm text-foreground space-y-3">
                  {((currentRequest.recommendation as any)?.routes || []).map((route: any, idx: number) => {
                    const routeTypeLabels: Record<string, string> = {
                      sow: "Statement of Work",
                      independent: "Independent Contractor",
                      agency: "Agency Labour",
                      permanent: "Permanent Hire",
                    };
                    const isPrimary = route.priority === "primary" || (idx === 0 && route.priority !== "secondary");
                    const routeLabel = routeTypeLabels[route.type] || route.title || route.type;
                    return (
                      <div key={idx} className="flex items-start gap-2" data-testid={`route-entry-${idx}`}>
                        <Badge variant={isPrimary ? "default" : "secondary"} className="shrink-0 text-xs mt-0.5" data-testid={`badge-route-priority-${idx}`}>
                          {isPrimary ? "Primary" : "Secondary"}
                        </Badge>
                        <div className="flex flex-col">
                          <span className="font-semibold" data-testid={`text-route-title-${idx}`}>{routeLabel}</span>
                          {route.description && (
                            <span className="text-xs text-muted-foreground mt-0.5">{route.description}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Extracted Details</label>
              <div className="p-4 bg-background rounded-md border border-border shadow-sm min-h-[150px] text-sm text-foreground">
                {Object.keys(currentRequest.answers || {}).length > 0 ? (
                  <ul className="space-y-2">
                    {Object.entries(currentRequest.answers || {}).map(([key, val]) => (
                      <li key={key} className="flex flex-col border-b border-border last:border-0 pb-2 mb-2 last:pb-0 last:mb-0">
                        <span className="text-xs text-muted-foreground capitalize font-medium">{key.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-primary">{String(val)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-4 space-y-2 opacity-60">
                    <Info className="w-6 h-6 text-muted-foreground" />
                    <p className="italic leading-tight">Details will appear here as we discuss your requirements...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-md border border-primary/10">
                <h4 className="text-sm font-bold text-primary mb-1">How this works</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {specificationReady
                    ? "All details gathered. You can proceed to generate your specification, or continue chatting to refine anything."
                    : recommendationAgreed
                    ? "Route agreed. Now gathering the specific details needed for your specification."
                    : "We'll discuss your requirement, recommend the right engagement route, then gather the specific details needed to generate a complete specification."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-bold text-primary">
                {specificationReady ? "Ready for Specification" : recommendationAgreed ? "Gathering Route Details" : Object.keys(currentRequest.answers || {}).length > 3 ? "Reviewing Requirements" : "Gathering Info"}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-background rounded-full overflow-hidden border border-border">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: specificationReady ? "100%" : recommendationAgreed ? "65%" : `${Math.min(45, (Object.keys(currentRequest.answers || {}).length / 8) * 45)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
