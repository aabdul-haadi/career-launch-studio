import { useState, useRef, useCallback, useEffect, TextareaHTMLAttributes } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { SuggestionPopover } from './SuggestionPopover';
import { useSuggestions } from '@/hooks/useSuggestions';
import { cn } from '@/lib/utils';

interface SuggestibleTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  context?: Record<string, unknown>;
  suggestionPosition?: 'bottom' | 'right';
  onSuggestionApplied?: (suggestion: string) => void;
}

export function SuggestibleTextarea({
  fieldName,
  value,
  onChange,
  context,
  suggestionPosition = 'bottom',
  onSuggestionApplied,
  className,
  ...textareaProps
}: SuggestibleTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { suggestions, isLoading, fetchSuggestions, clearSuggestions } = useSuggestions({
    debounceMs: 800,
    minLength: 5,
  });

  // Fetch suggestions when value changes and input is focused
  useEffect(() => {
    if (isFocused && value.length >= 5) {
      fetchSuggestions(fieldName, value, context);
      setShowSuggestions(true);
    } else if (value.length < 5) {
      clearSuggestions();
      setShowSuggestions(false);
    }
  }, [value, isFocused, fieldName, context, fetchSuggestions, clearSuggestions]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (value.length >= 5) {
      fetchSuggestions(fieldName, value, context);
      setShowSuggestions(true);
    }
  }, [value, fieldName, context, fetchSuggestions]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Delay blur to allow clicking suggestions
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setShowSuggestions(false);
      }
    }, 150);
  }, []);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    // For textareas, append the suggestion with proper formatting
    const newValue = value.trim() ? `${value.trim()}\n\n${suggestion}` : suggestion;
    onChange(newValue);
    
    setShowSuggestions(false);
    clearSuggestions();
    onSuggestionApplied?.(suggestion);
  }, [value, onChange, clearSuggestions, onSuggestionApplied]);

  return (
    <div ref={containerRef} className="relative">
      <Textarea
        {...textareaProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "transition-all min-h-[100px]",
          isFocused && (isLoading || suggestions.length > 0) && "ring-2 ring-teal/20",
          className
        )}
      />
      
      {showSuggestions && (
        <SuggestionPopover
          suggestions={suggestions}
          isLoading={isLoading}
          onSelect={handleSelectSuggestion}
          onDismiss={() => setShowSuggestions(false)}
          position={suggestionPosition}
        />
      )}
    </div>
  );
}
