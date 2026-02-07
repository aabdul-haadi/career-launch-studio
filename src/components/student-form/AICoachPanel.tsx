import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AICoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: string;
  formData: Record<string, unknown>;
}

export function AICoachPanel({ isOpen, onClose, currentStep, formData }: AICoachPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 Hi! I'm your AI Career Coach, here to help you fill out your profile effectively.\n\nI'm trained as an expert in pharmacy careers and can help you:\n- Craft compelling experience descriptions\n- Highlight your achievements effectively\n- Choose the right skills to showcase\n- Optimize your profile for your target roles\n\nWhat would you like help with?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: input.trim(),
          currentStep,
          formData,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data?.response || 'Sorry, I had trouble processing that. Please try again.',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Coach error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-card border-l border-border shadow-xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Career Coach</h3>
                <p className="text-xs text-muted-foreground">Expert pharmacy career guidance</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Context Badge */}
          <div className="px-4 py-2 bg-muted/50 border-b border-border">
            <p className="text-xs text-muted-foreground">
              Currently helping with: <span className="font-medium text-foreground">{currentStep}</span>
            </p>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-teal text-white'
                  }`}>
                    {message.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal text-white flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask me anything about your profile..."
                className="min-h-[44px] max-h-32 resize-none"
                rows={1}
              />
              <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Shift+Enter for new line • Enter to send
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
