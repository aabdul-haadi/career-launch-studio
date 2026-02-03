import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/context/ProfileContext';
import { RoleType } from '@/types/student';

interface SuggestionResult {
  suggestions: string[];
  fieldType: string;
  confidence: number;
}

interface UseSuggestionsOptions {
  debounceMs?: number;
  minLength?: number;
}

export function useSuggestions(options: UseSuggestionsOptions = {}) {
  const { debounceMs = 500, minLength = 3 } = options;
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useProfile();
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (
    field: string,
    currentValue: string,
    additionalContext?: Record<string, unknown>
  ) => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Don't fetch for short values
    if (currentValue.length < minLength) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      abortRef.current = new AbortController();

      try {
        // Build context from profile
        const context = {
          ...additionalContext,
          personal: profile.personal,
          education: profile.education,
          selectedRoles: profile.selectedRoles,
          experienceCount: profile.experience.length,
          hasJobDescription: !!profile.jobDescription,
        };

        const { data, error: fnError } = await supabase.functions.invoke<SuggestionResult>('ai-suggestions', {
          body: {
            field,
            currentValue,
            context,
            targetRoles: profile.selectedRoles,
          },
        });

        if (fnError) {
          throw new Error(fnError.message);
        }

        setSuggestions(data?.suggestions || []);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Ignore aborted requests
        }
        console.error('Suggestion error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [profile, debounceMs, minLength]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    clearSuggestions,
  };
}

// Specialized hooks for different field types
export function useFieldSuggestion(field: string) {
  const { suggestions, isLoading, fetchSuggestions, clearSuggestions } = useSuggestions();
  
  const onInputChange = useCallback((value: string, context?: Record<string, unknown>) => {
    fetchSuggestions(field, value, context);
  }, [field, fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    onInputChange,
    clearSuggestions,
  };
}
