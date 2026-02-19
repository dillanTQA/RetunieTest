import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";

interface RecommendationRoute {
  type: 'independent' | 'sow' | 'agency';
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  matchScore: number;
}

interface RecommendationCardProps {
  route: RecommendationRoute;
  isSelected?: boolean;
  onSelect: () => void;
}

export function RecommendationCard({ route, isSelected, onSelect }: RecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={clsx(
        "relative flex flex-col h-full p-6 rounded-2xl border-2 transition-all duration-300 bg-card",
        isSelected 
          ? "border-primary shadow-xl shadow-primary/10 ring-1 ring-primary" 
          : "border-border hover:border-primary/50 hover:shadow-lg"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={clsx(
            "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2",
            route.matchScore > 80 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
          )}>
            {route.matchScore}% Match
          </span>
          <h3 className="text-2xl font-display font-bold text-foreground">{route.title}</h3>
        </div>
        {isSelected && (
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
        )}
      </div>

      <p className="text-muted-foreground mb-6 flex-grow">{route.description}</p>

      <div className="space-y-4 mb-8">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> Pros
          </h4>
          <ul className="space-y-1">
            {route.pros.map((pro, i) => (
              <li key={i} className="text-sm text-muted-foreground pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-green-500">
                {pro}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <X className="w-4 h-4 text-red-500" /> Considerations
          </h4>
          <ul className="space-y-1">
            {route.cons.map((con, i) => (
              <li key={i} className="text-sm text-muted-foreground pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-red-500">
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button 
        onClick={onSelect}
        variant={isSelected ? "default" : "outline"}
        className="w-full gap-2 group"
      >
        {isSelected ? "Selected" : "Select this Route"}
        {!isSelected && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
      </Button>
    </motion.div>
  );
}
