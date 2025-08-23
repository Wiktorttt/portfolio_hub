'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';
import LoadingSpinner from '@/components/LoadingSpinner';
import { cn, getOrCreateUUID, clearChatUUID } from '@/lib/utils';
import useTheme from '@/lib/useTheme';
import { ChatGpt2Response, ChatGpt2MemoryResponse } from '@/lib/webhook_config';
import axios from 'axios';
import { API_TIMEOUT_MS } from '@/lib/config';
import {
  ArrowLeft,
  MessageSquareText,
  SendHorizonal,
  Bot,
  Cpu,
  Trash2,
} from 'lucide-react';

// Custom API instance with extended timeout for chat-gpt-2 (5 minutes total)
const chatGptApi = axios.create({
  timeout: API_TIMEOUT_MS + 120000, // 3 minutes + 2 minutes = 5 minutes
  headers: {
    'Content-Type': 'application/json',
  },
});

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  responseTime?: number;
  totalTokens?: number;
}

export default function ChatGptTwoPage() {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMemory, setIsLoadingMemory] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [model, setModel] = useState<string>('gpt-4.1-mini');

  // Load conversation memory on page load
  useEffect(() => {
    const loadConversationMemory = async () => {
      try {
        const uuid = getOrCreateUUID();
        const response = await chatGptApi.post('/api/webhook/chat-gpt-2-memory', {
          uuid: uuid
        });

                const responseData = response.data as ChatGpt2MemoryResponse;
        

        
        // Parse the memory response and convert to ChatMessage format
        if (responseData && Array.isArray(responseData) && responseData.length > 0) {
          const parsedMessages: ChatMessage[] = [];
          
          responseData.forEach((msg: { human: string; ai: string }, index: number) => {
            // Add user message
            parsedMessages.push({
              id: crypto.randomUUID(),
              role: 'user',
              content: msg.human,
              timestamp: Date.now() - (responseData.length - index) * 1000, // Approximate timestamps
            });

            // Parse and add AI message
            try {
              const aiResponse = JSON.parse(msg.ai);
              if (aiResponse.output && Array.isArray(aiResponse.output) && aiResponse.output.length > 0) {
                const firstOutput = aiResponse.output[0];
                parsedMessages.push({
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: firstOutput.output || 'No response received',
                  timestamp: Date.now() - (responseData.length - index) * 1000 + 500, // Slightly after user message
                  totalTokens: firstOutput.total_tokens || 0,
                });
              }
            } catch (parseError) {
              // Fallback: add raw AI response
              parsedMessages.push({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: msg.ai,
                timestamp: Date.now() - (responseData.length - index) * 1000 + 500,
              });
            }
          });
          
          setMessages(parsedMessages);
        }
      } catch (error) {
        // If webhook fails, assume it's a new chat and generate a new UUID
        clearChatUUID();
      } finally {
        setIsLoadingMemory(false);
      }
    };

    loadConversationMemory();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  }, [messages.length]);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    clearChatUUID();
    setMessages([]);
    setShowClearConfirm(false);
  };

  const cancelClearChat = () => {
    setShowClearConfirm(false);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    // Reset textarea height after sending
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.style.height = '44px';
      }
    });
    const requestStartTime = Date.now();
    setIsSending(true);

    try {
      const uuid = getOrCreateUUID();
      const response = await chatGptApi.post('/api/webhook/chat-gpt-2', {
        model: model,
        message: text,
        uuid: uuid
      });

      const responseData = response.data as ChatGpt2Response;
      const endTime = Date.now();
      const responseTime = (endTime - requestStartTime) / 1000;
      
      let outputText = '';
      let totalTokens = 0;
      
      // Handle the response structure
      
      // Handle the actual response structure: { output: [{ output: "...", total_tokens: 28 }] }
      if (responseData && typeof responseData === 'object' && responseData.output && Array.isArray(responseData.output) && responseData.output.length > 0) {
        const firstOutput = responseData.output[0];
        
        outputText = firstOutput.output || 'No response received';
        totalTokens = firstOutput.total_tokens || 0;
      } else {
        outputText = 'No response received';
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: outputText,
        timestamp: Date.now(),
        responseTime: responseTime,
        totalTokens: totalTokens,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: unknown) {
      const endTime = Date.now();
      const responseTime = (endTime - requestStartTime) / 1000;
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Przepraszam, napotkałem błąd. Spróbuj ponownie.',
        timestamp: Date.now(),
        responseTime: responseTime,
        totalTokens: undefined,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsSending(false);
      // Focus input for fast follow-up
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        handleSend();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-grow textarea
    const el = e.currentTarget;
    el.style.height = '0px';
    const next = Math.min(el.scrollHeight, 240); // cap height for usability
    el.style.height = `${next}px`;
  };

  // Show loading spinner while loading memory
  if (isLoadingMemory) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900')}>
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size={32} thickness={3} colorClassName="border-indigo-500" />
          <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>Ładowanie rozmowy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen', isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900')}>
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* Back link + Header */}
        <div className="mb-8">
          <Link
            href="/"
            className={cn('inline-flex items-center mb-4 transition-colors', isDark ? 'text-slate-400 hover:text-indigo-300' : 'text-slate-500 hover:text-indigo-600')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Powrót do Hub
          </Link>
          <Header
            title="Terminal AI"
            description="Plac zabaw dla szybkich odpowiedzi z wybranym modelem AI"
            accent="indigo"
            isDark={isDark}
            icon={<MessageSquareText className="w-8 h-8" />}
          />
        </div>

        {/* Chat Area (stretched) */}
        <div className={cn('rounded-2xl p-0 sm:p-1 ring-1 shadow-sm', isDark ? 'bg-slate-950 ring-slate-800' : 'bg-white ring-slate-200')}>
          <div className={cn('rounded-2xl h-[78vh] sm:h-[80vh] flex flex-col overflow-hidden', isDark ? 'bg-slate-900' : 'bg-indigo-50/60')}>
            {/* Toolbar */}
            <div className={cn('flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b', isDark ? 'border-slate-800' : 'border-indigo-100')}>
              <div className="flex items-center gap-3">
                <div className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Rozmowa</div>
                {model === 'grok-4' && (
                  <div className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Ta AI odpowiada dłużej
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={cn('hidden sm:flex items-center gap-2 text-xs', isDark ? 'text-slate-400' : 'text-slate-600')}>
                  <Cpu size={14} />
                  <span>Model</span>
                </div>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={cn(
                    'text-sm rounded-md px-2.5 py-1.5 ring-1 outline-none transition-colors',
                    isDark ? 'bg-slate-950 text-slate-100 ring-slate-800 hover:ring-slate-700' : 'bg-white text-slate-900 ring-indigo-100 hover:ring-indigo-200'
                  )}
                >
                  <option value="gpt-4.1-mini">Chat GPT 4.1 Mini</option>
                  <option value="gpt-5-mini">Chat GPT 5 Mini</option>
                  <option value="deepseek-r1">Deepseek R1</option>
                  <option value="grok-3-mini">Grok 3 Mini</option>
                  <option value="grok-4">Grok 4</option>
                </select>
                <button
                  onClick={handleClearChat}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ring-1',
                    isDark ? 'bg-slate-950 text-slate-300 ring-slate-800 hover:bg-slate-800 hover:text-red-300' : 'bg-white text-slate-600 ring-indigo-100 hover:bg-red-50 hover:text-red-600'
                  )}
                  title="Clear chat history"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Wyczyść</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 overflow-x-hidden">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} isDark={isDark} />
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-sm opacity-80">
                  <LoadingSpinner size={18} thickness={2} colorClassName="border-indigo-500" />
                  <span className={cn(isDark ? 'text-slate-300' : 'text-slate-700')}>Myślę…</span>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className={cn('border-t p-3 sm:p-4', isDark ? 'border-slate-800' : 'border-indigo-100')}> 
              <div className="relative">
                <div className="absolute inset-0 rounded-xl blur-xl bg-indigo-500/10" />
                <div className={cn('relative rounded-xl ring-1 flex items-end gap-2 p-2 sm:p-3', isDark ? 'bg-slate-950 ring-slate-800' : 'bg-white ring-indigo-100')}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Napisz wiadomość… (Enter aby wysłać, Shift+Enter dla nowej linii)"
                    rows={1}
                    style={{ height: '44px' }}
                    className={cn(
                      'w-full resize-none outline-none bg-transparent text-sm sm:text-base leading-6 placeholder:opacity-70',
                      isDark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'
                    )}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className={cn(
                      'shrink-0 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ring-1',
                      canSend
                        ? (isDark ? 'bg-indigo-600 text-white ring-indigo-500 hover:bg-indigo-500' : 'bg-indigo-600 text-white ring-indigo-500 hover:bg-indigo-500')
                        : (isDark ? 'bg-slate-900 text-slate-500 ring-slate-800' : 'bg-white text-slate-400 ring-slate-200')
                    )}
                    aria-disabled={!canSend}
                  >
                    <SendHorizonal size={16} />
                    Wyślij
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Chat Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={cn('rounded-xl p-6 max-w-sm w-full mx-4 ring-1', isDark ? 'bg-slate-900 ring-slate-700' : 'bg-white ring-slate-200')}>
              <h3 className={cn('text-lg font-semibold mb-2', isDark ? 'text-slate-100' : 'text-slate-900')}>
                Wyczyścić Historię Czatu?
              </h3>
              <p className={cn('text-sm mb-6', isDark ? 'text-slate-300' : 'text-slate-600')}>
                To spowoduje trwałe usunięcie wszystkich wiadomości z tej rozmowy i rozpoczęcie nowego czatu. Tej akcji nie można cofnąć.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelClearChat}
                  className={cn(
                    'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ring-1',
                    isDark ? 'bg-slate-800 text-slate-300 ring-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-200'
                  )}
                >
                  Anuluj
                </button>
                <button
                  onClick={confirmClearChat}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white ring-red-500 hover:bg-red-500 transition-colors ring-1"
                >
                  Wyczyść Czat
                </button>
              </div>
            </div>
          </div>
        )}

        <ThemeToggle />
      </div>
    </div>
  );
}

function MessageBubble({ message, isDark }: { message: ChatMessage; isDark: boolean }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex items-start gap-3 w-full', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className={cn('h-8 w-8 rounded-md flex items-center justify-center shrink-0', isDark ? 'bg-slate-800' : 'bg-indigo-600')}>
          <Bot className={cn('w-4 h-4', isDark ? 'text-slate-200' : 'text-white')} />
        </div>
      )}
      <div className={cn('flex flex-col min-w-0', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-xl px-3.5 py-2.5 text-sm ring-1',
            isUser
              ? (isDark ? 'bg-slate-800 text-slate-100 ring-slate-700' : 'bg-white text-slate-900 ring-slate-200')
              : (isDark ? 'bg-slate-900 text-slate-100 ring-slate-800' : 'bg-white text-slate-900 ring-indigo-100')
          )}
          style={{
            maxWidth: '60%',
            width: 'fit-content'
          }}
        >
          {message.content}
        </div>
        {!isUser && (message.responseTime || message.totalTokens) && (
          <div className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-500')}>
            {message.responseTime && `${message.responseTime.toFixed(3)}s`}
            {message.totalTokens && (
              <span className={message.responseTime ? 'ml-2' : ''}>Tokeny: {message.totalTokens}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


