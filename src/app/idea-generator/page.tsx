'use client';

import { useState } from 'react';
import Link from 'next/link';
import RichEditor from '@/components/RichEditor';
import WebhookButton from '@/components/WebhookButton';
import ErrorBoundary from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowLeft, Lightbulb, DollarSign, Clock, Sparkles, Target, Brain, Rocket } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { IdeaItem, IdeaGeneratorResponse } from '@/lib/webhook_config';
import { cn } from '@/lib/utils';
import useTheme from '@/lib/useTheme';

// Function to format time from seconds to human readable format
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

export default function IdeaGeneratorPage() {
  const [context, setContext] = useState('');
  const [myThoughts, setMyThoughts] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<IdeaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useTheme();

  // Theme handled by useTheme hook

  // Function to generate random color
  const generateRandomColor = (index: number): string => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-violet-500'
    ];
    return colors[index % colors.length];
  };

  // Function to get color variants for background and ring
  const getColorVariants = (colorClass: string) => {
    const colorMap: Record<string, { bg: string; ring: string; bgDark: string }> = {
      'bg-red-500': { bg: 'bg-red-50', ring: 'ring-red-500', bgDark: 'dark:bg-red-900/20' },
      'bg-blue-500': { bg: 'bg-blue-50', ring: 'ring-blue-500', bgDark: 'dark:bg-blue-900/20' },
      'bg-green-500': { bg: 'bg-green-50', ring: 'ring-green-500', bgDark: 'dark:bg-green-900/20' },
      'bg-yellow-500': { bg: 'bg-yellow-50', ring: 'ring-yellow-500', bgDark: 'dark:bg-yellow-900/20' },
      'bg-purple-500': { bg: 'bg-purple-50', ring: 'ring-purple-500', bgDark: 'dark:bg-purple-900/20' },
      'bg-pink-500': { bg: 'bg-pink-50', ring: 'ring-pink-500', bgDark: 'dark:bg-pink-900/20' },
      'bg-indigo-500': { bg: 'bg-indigo-50', ring: 'ring-indigo-500', bgDark: 'dark:bg-indigo-900/20' },
      'bg-teal-500': { bg: 'bg-teal-50', ring: 'ring-teal-500', bgDark: 'dark:bg-teal-900/20' },
      'bg-orange-500': { bg: 'bg-orange-50', ring: 'ring-orange-500', bgDark: 'dark:bg-orange-900/20' },
      'bg-cyan-500': { bg: 'bg-cyan-50', ring: 'ring-cyan-500', bgDark: 'dark:bg-cyan-900/20' },
      'bg-emerald-500': { bg: 'bg-emerald-50', ring: 'ring-emerald-500', bgDark: 'dark:bg-emerald-900/20' },
      'bg-violet-500': { bg: 'bg-violet-50', ring: 'ring-violet-500', bgDark: 'dark:bg-violet-900/20' }
    };
    return colorMap[colorClass] || { bg: 'bg-amber-50', ring: 'ring-amber-500', bgDark: 'dark:bg-amber-900/20' };
  };

  const handleSuccess = (data: unknown) => {
    try {
      // Handle the specific JSON schema format
      let ideasData: IdeaItem[] = [];
      
      if (Array.isArray(data)) {
        // Handle the nested structure: [{ output: [ideas] }]
        const firstItem = data[0];
        if (firstItem && typeof firstItem === 'object' && 'output' in firstItem) {
          const output = (firstItem as { output: IdeaItem[] }).output;
          if (Array.isArray(output)) {
            ideasData = output;
          }
        } else {
          // Direct array of ideas
          ideasData = data as IdeaItem[];
        }
      } else if (typeof data === 'object' && data !== null) {
        const responseData = data as IdeaGeneratorResponse;
        
        if (Array.isArray(responseData.ideas)) {
          ideasData = responseData.ideas;
        } else if (Array.isArray(responseData.result)) {
          ideasData = responseData.result;
        } else if (Array.isArray(responseData.output)) {
          // Direct output array
          ideasData = responseData.output;
        } else if (responseData.output?.sanitized) {
          // Try to parse JSON from sanitized output
          try {
            const parsed = JSON.parse(responseData.output.sanitized);
            if (Array.isArray(parsed)) {
              ideasData = parsed;
            }
          } catch {
            // If parsing fails, treat as string
    
          }
        } else if (responseData.output?.text) {
          // Try to parse JSON from text output
          try {
            const parsed = JSON.parse(responseData.output.text);
            if (Array.isArray(parsed)) {
              ideasData = parsed;
            }
          } catch {
            // If parsing fails, treat as string

          }
        }
      }
      
      setIdeas(ideasData);
    } catch (error) {
      
      setIdeas([]);
    }
  };

  const handleError = (error: unknown) => {
    // Handle error silently
  };

  return (
    <ErrorBoundary>
      <div className={cn('min-h-screen', isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900')}>
        <div className="max-w-6xl mx-auto p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className={cn('inline-flex items-center mb-4 transition-colors', isDark ? 'text-slate-400 hover:text-violet-300' : 'text-slate-500 hover:text-violet-600')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Powrót do Hub
            </Link>
            <Header
              title="Generator Pomysłów"
              description="Rozpal kreatywność dzięki sesjom burzy mózgów"
              accent="violet"
              isDark={isDark}
              icon={<Lightbulb className="w-8 h-8" />}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Context Input Section */}
              <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-violet-600 flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Główny Kontekst</h2>
                  </div>
                  <RichEditor 
                    value={context}
                    onChange={setContext}
                    placeholder="Opisz kontekst do generowania pomysłów. Na przykład: 'Prezent na urodziny przyjaciela' lub 'Nowa koncepcja biznesowa dla lokalnego rynku'..."
                    forceLight={!isDark}
                  />
                </div>
              </div>

              {/* My Thoughts Input Section */}
              <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-violet-600 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Dodatkowe przemyślenia (opcjonalne)</h2>
                  </div>
                  <RichEditor 
                    value={myThoughts}
                    onChange={setMyThoughts}
                    placeholder="Podziel się swoimi dodatkowymi myślami, potencjalnymi pomysłami lub konkretnymi wymaganiami, aby lepiej nakierować AI..."
                    forceLight={!isDark}
                  />
                </div>
              </div>

              {/* Quantity Input Section */}
              <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-violet-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Liczba Pomysłów</h2>
                  </div>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-10 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                        <button
                          key={number}
                          onClick={() => setQuantity(number.toString())}
                          className={cn(
                            'w-10 h-10 rounded-lg border-2 font-semibold transition-all duration-300',
                            quantity === number.toString()
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-violet-500 hover:text-violet-400' : 'bg-white border-slate-200 text-slate-700 hover:border-violet-500 hover:text-violet-600')
                          )}
                        >
                          {number}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Results */}
            <div className="flex flex-col h-full">
              <div className={cn('rounded-2xl p-6 shadow-sm ring-1 min-h-[420px] flex flex-col', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-violet-50 ring-violet-100')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-violet-600 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Pomysły</h2>
                </div>

                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <LoadingSpinner size={24} thickness={2} colorClassName="border-violet-500" />
                    <span className={cn(isDark ? 'text-slate-300' : 'text-slate-700')}>Generowanie kreatywnych pomysłów...</span>
                  </div>
                ) : ideas.length === 0 ? (
                  <div className={cn('flex-1 border-2 border-dashed rounded-xl flex items-center justify-center text-center p-8', isDark ? 'border-slate-700' : 'border-violet-200')}>
                    <div>
                      <Lightbulb className={cn('mx-auto mb-3', isDark ? 'text-slate-400' : 'text-violet-500')} />
                      <p className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>Twoje wygenerowane pomysły pojawią się tutaj</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ideas.map((idea, index) => {
                      const colorClass = generateRandomColor(index);
                      const colorVariants = getColorVariants(colorClass);
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedIdea(selectedIdea === idea ? null : idea)}
                          className={cn(
                            'cursor-pointer transition-all duration-200 rounded-lg p-4 hover:shadow-md',
                            selectedIdea === idea
                              ? cn('ring-2', colorVariants.ring, colorVariants.bg, colorVariants.bgDark)
                              : (isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50')
                          )}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-4 h-4 rounded-full ${colorClass} flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <h3 className={cn('text-lg font-semibold whitespace-normal break-words line-clamp-2', isDark ? 'text-slate-100' : 'text-slate-900')}>{idea.title}</h3>
                            </div>
                            <div className="flex-shrink-0">
                              <div className={cn('w-6 h-6 transition-transform duration-200', selectedIdea === idea ? 'rotate-180' : '')}>
                                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          {selectedIdea === idea && (
                            <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                              <div className="space-y-4">
                                <div>
                                  <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Opis</h4>
                                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{idea.description}</p>
                                </div>
                                <div className="flex items-center space-x-6">
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className={cn('w-4 h-4', isDark ? 'text-amber-400' : 'text-amber-600')} />
                                    <span className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>{idea.price_point}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-600')} />
                                    <span className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>{formatTime(idea.time_to_make)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Button under results */}
              <div className="mt-4 lg:mt-6 self-start">
                <div className="relative">
                  <div className={cn('absolute inset-0 rounded-xl blur-xl', isDark ? 'bg-violet-500/10' : 'bg-violet-500/10')}></div>
                  <div className="relative">
                    <WebhookButton
                      webhookName="generate_idea"
                      payload={{
                        context,
                        my_thoughts: myThoughts,
                        quantity: quantity ? parseInt(quantity) : 1,
                      }}
                      onLoading={setIsLoading}
                      onSuccess={handleSuccess}
                      onError={handleError}
                      disabled={!context.trim()}
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Wygeneruj Pomysły
                    </WebhookButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ThemeToggle />
      </div>
    </ErrorBoundary>
  );
}