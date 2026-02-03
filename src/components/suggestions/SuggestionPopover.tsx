import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionPopoverProps {
  suggestions: string[];
  isLoading: boolean;
  onSelect: (suggestion: string) => void;
  onDismiss?: () => void;
  position?: 'bottom' | 'right';
  className?: string;
}

export function SuggestionPopover({
  suggestions,
  isLoading,
  onSelect,
  onDismiss,
  position = 'bottom',
  className,
}: SuggestionPopoverProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!isLoading && suggestions.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'bottom' ? -10 : 0, x: position === 'right' ? -10 : 0 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: position === 'bottom' ? -10 : 0, x: position === 'right' ? -10 : 0 }}
        className={cn(
          "absolute z-50 w-full min-w-[280px] max-w-md",
          position === 'bottom' ? "top-full mt-2 left-0" : "left-full ml-2 top-0",
          className
        )}
      >
        <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
            <Sparkles className="h-4 w-4 text-teal" />
            <span className="text-xs font-medium text-muted-foreground">
              AI Suggestions
            </span>
            {isLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-teal ml-auto" />
            )}
          </div>

          {/* Loading State */}
          {isLoading && suggestions.length === 0 && (
            <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analyzing context...</span>
            </div>
          )}

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onMouseLeave={() => setSelectedIndex(null)}
                  className={cn(
                    "w-full px-3 py-2.5 text-left text-sm transition-colors",
                    "hover:bg-teal/10 focus:bg-teal/10 focus:outline-none",
                    "flex items-start gap-2 group",
                    selectedIndex === index && "bg-teal/5"
                  )}
                >
                  <Lightbulb className="h-4 w-4 mt-0.5 text-amber shrink-0" />
                  <span className="flex-1 text-foreground/90 leading-relaxed">
                    {suggestion}
                  </span>
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 mt-0.5 text-muted-foreground/50 transition-transform shrink-0",
                      "group-hover:translate-x-0.5 group-hover:text-teal"
                    )} 
                  />
                </motion.button>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="px-3 py-2 bg-muted/30 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              Click to apply suggestion • Powered by AI
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
