import { useState, useRef, useCallback, useEffect, InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { SuggestionPopover } from './SuggestionPopover';
import { useSuggestions } from '@/hooks/useSuggestions';
import { cn } from '@/lib/utils';

interface SuggestibleInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  context?: Record<string, unknown>;
  suggestionPosition?: 'bottom' | 'right';
  onSuggestionApplied?: (suggestion: string) => void;
}

export function SuggestibleInput({
  fieldName,
  value,
  onChange,
  context,
  suggestionPosition = 'bottom',
  onSuggestionApplied,
  className,
  ...inputProps
}: SuggestibleInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { suggestions, isLoading, fetchSuggestions, clearSuggestions } = useSuggestions({
    debounceMs: 600,
    minLength: 2,
  });

  // Fetch suggestions when value changes and input is focused
  useEffect(() => {
    if (isFocused && value.length >= 2) {
      fetchSuggestions(fieldName, value, context);
      setShowSuggestions(true);
    } else {
      clearSuggestions();
      setShowSuggestions(false);
    }
  }, [value, isFocused, fieldName, context, fetchSuggestions, clearSuggestions]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (value.length >= 2) {
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
    // Append or replace based on field type
    const textFields = ['responsibilities', 'achievements', 'objectives', 'methods', 'outcomes'];
    
    if (textFields.some(f => fieldName.toLowerCase().includes(f))) {
      // For text areas, append with proper formatting
      const newValue = value.trim() ? `${value.trim()} ${suggestion}` : suggestion;
      onChange(newValue);
    } else {
      // For other fields, replace
      onChange(suggestion);
    }
    
    setShowSuggestions(false);
    clearSuggestions();
    onSuggestionApplied?.(suggestion);
  }, [value, onChange, fieldName, clearSuggestions, onSuggestionApplied]);

  return (
    <div ref={containerRef} className="relative">
      <Input
        {...inputProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "transition-all",
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
