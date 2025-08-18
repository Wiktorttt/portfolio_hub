'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrorBoundary from '@/components/ErrorBoundary';
import ThemeToggle from '@/components/ThemeToggle';
import {
  FileText,
  Lightbulb,
  TestTube,
  ChefHat,
  LineChart,
    Gamepad2,
    MessageSquareText,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import useTheme from '@/lib/useTheme';
import { STATUS_POLL_INTERVAL_MS } from '@/lib/config';
import { WebhookStatusResponse, ErrorResponse } from '@/lib/types';

export default function Home() {
  const [n8nStatus, setN8nStatus] = useState<string>('Checking...');
  const [isServerDown, setIsServerDown] = useState<boolean>(false);
  const [testMode, setTestMode] = useState<boolean>(false);
  const { isDark } = useTheme();



  // Active tools displayed as colored cards
  const activeTools = [
    {
      id: 'chat-gpt-2',
      name: 'Terminal AI',
      description: 'Plac zabaw dla szybkich odpowiedzi z wybranym modelem AI',
      icon: MessageSquareText,
      accent: 'indigo',
    },
    {
      id: 'summarizer',
      name: 'Sumaryzator Tekstów',
      description: 'Przekształć długie treści w praktyczne podsumowania',
      icon: FileText,
      accent: 'blue',
    },
    {
      id: 'idea-generator',
      name: 'Generator Pomysłów',
      description: 'Rozpal kreatywność dzięki sesjom burzy mózgów',
      icon: Lightbulb,
      accent: 'violet',
    },
    {
      id: 'game-idea-generator',
      name: 'Generator Pomysłów Dla Gier',
      description: 'Stwórz pomysł na bazie gatunku, designu, motywów oraz historii',
      icon: Gamepad2,
      accent: 'indigo',
    },
    {
      id: 'market-analyzer',
      name: 'Analizator Rynku',
      description: 'Analizuj trendy na rynku, słabości oraz pomysły biznesowe',
      icon: LineChart,
      accent: 'teal',
    },
    {
      id: 'recipe-recommender',
      name: 'Rekomendator Przepisów',
      description: 'Odkryj spersonalizowane przepisy dopasowane do Twoich preferencji',
      icon: ChefHat,
      accent: 'orange',
    },
  ] as const;

  // No upcoming tools shown on the main page

  // Function to check N8N status
  const checkN8nStatus = async () => {
    try {
      const response = await api.post('/api/webhook/status', {});
      const data = response.data as WebhookStatusResponse;

      const code: number | undefined = typeof data?.code === 'string' ? parseInt(data.code, 10) : data?.code;
      const statusText: string = (data?.status ?? '').toString();

      if (code === 201 || statusText.toLowerCase() === 'connected') {
        setN8nStatus('Połączony');
        setIsServerDown(false);
      } else if (code === 503 || statusText.toLowerCase().includes('down')) {
        setN8nStatus('Serwer wyłączony');
        setIsServerDown(true);
      } else {
        setN8nStatus(statusText || 'Status nieznany');
        setIsServerDown(true);
      }
    } catch (error: unknown) {
      console.error('N8N status check failed:', error);
      
      // Check if it's a connection refused error
      const errorObj = error as ErrorResponse;
      if (errorObj?.response?.status === 400 || errorObj?.code === 'ECONNREFUSED') {
        setN8nStatus('Serwer wyłączony');
        setIsServerDown(true);
      } else {

        setN8nStatus('Serwer wyłączony');
        setIsServerDown(true);
      }
    }
  };

  // Set up interval for status checking
  useEffect(() => {
    // Initial check
    checkN8nStatus();
    
    // Set up interval with backoff when down
    const interval = setInterval(
      checkN8nStatus,
      isServerDown ? STATUS_POLL_INTERVAL_MS.down : STATUS_POLL_INTERVAL_MS.connected
    );
    
    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, [isServerDown]);

  // Theme handled by useTheme hook

  // Keep component responsive to server status only; no animated background on the new design

  return (
    <ErrorBoundary>
      <div className={cn('min-h-screen', isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900')}>
        {/* Test Mode Toggle */}
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={() => setTestMode(!testMode)}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-300 shadow-sm',
              testMode
                ? (isDark ? 'bg-orange-500/20 border-orange-400 text-orange-300 hover:bg-orange-500/25' : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100')
                : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')
            )}
          >
            <TestTube size={16} />
            <span className="text-sm font-medium">Tryb Testowy</span>
            <div
              className={cn(
                'w-3 h-3 rounded-full transition-colors duration-300',
                testMode ? 'bg-orange-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
              )}
            />
          </button>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        <div className="max-w-7xl mx-auto px-6 py-14">
          {/* Header */}
          <div className="text-center mb-12">
            <div className={cn('text-4xl sm:text-5xl font-extrabold tracking-tight', isDark ? 'text-slate-100' : 'text-slate-900')}>
              <span>Portfolio </span>
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">AI Hub</span>
            </div>
            <p className={cn('mt-4 max-w-2xl mx-auto', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Kliknij dowolne narzędzie, aby rozpocząć!
            </p>

            {/* N8N Status pill */}
            <div className="mt-4 flex justify-center">
              <div
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1',
                  n8nStatus === 'Połączony' && (isDark ? 'bg-emerald-900/30 ring-emerald-700 text-emerald-300' : 'bg-emerald-50 ring-emerald-200 text-emerald-700'),
                  (n8nStatus === 'Serwer wyłączony' || n8nStatus === 'Status nieznany') && (isDark ? 'bg-red-900/30 ring-red-700 text-red-300' : 'bg-red-50 ring-red-200 text-red-700'),
                  n8nStatus !== 'Połączony' && n8nStatus !== 'Serwer wyłączony' && n8nStatus !== 'Status nieznany' && (isDark ? 'bg-orange-900/30 ring-orange-700 text-orange-300' : 'bg-orange-50 ring-orange-200 text-orange-700')
                )}
              >
                <span
                  className={cn('h-2 w-2 rounded-full',
                    n8nStatus === 'Połączony' && 'bg-emerald-500',
                    (n8nStatus === 'Serwer wyłączony' || n8nStatus === 'Status nieznany') && 'bg-red-500',
                    n8nStatus !== 'Połączony' && n8nStatus !== 'Serwer wyłączony' && n8nStatus !== 'Status nieznany' && 'bg-orange-500'
                  )}
                />
                <span className="font-medium">Status N8N:</span>
                <span className="font-semibold">{n8nStatus}</span>
              </div>
            </div>
          </div>

          {/* Active tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {activeTools.map(({ id, name, description, icon: Icon, accent }) => {
              const isDisabled = isServerDown && !testMode;
              const colors = {
                blue: isDark ? 'bg-slate-900 ring-slate-800 hover:ring-slate-700' : 'bg-blue-50 ring-blue-100 hover:ring-blue-200',
                violet: isDark ? 'bg-slate-900 ring-slate-800 hover:ring-slate-700' : 'bg-violet-50 ring-violet-100 hover:ring-violet-200',
                indigo: isDark ? 'bg-slate-900 ring-slate-800 hover:ring-slate-700' : 'bg-indigo-50 ring-indigo-100 hover:ring-indigo-200',
                teal: isDark ? 'bg-slate-900 ring-slate-800 hover:ring-slate-700' : 'bg-teal-50 ring-teal-100 hover:ring-teal-200',
                orange: isDark ? 'bg-slate-900 ring-slate-800 hover:ring-slate-700' : 'bg-orange-50 ring-orange-100 hover:ring-orange-200',
              } as const;
              const iconBg = {
                blue: 'bg-blue-600 text-white',
                violet: 'bg-violet-600 text-white',
                indigo: 'bg-indigo-600 text-white',
                teal: 'bg-teal-600 text-white',
                orange: 'bg-orange-500 text-white',
              } as const;
              const dot = {
                blue: 'bg-blue-500',
                violet: 'bg-violet-500',
                indigo: 'bg-indigo-500',
                teal: 'bg-teal-500',
                orange: 'bg-orange-500',
              } as const;

              const Card = (
                <div
                  className={cn(
                    'group relative rounded-2xl p-6 shadow-sm ring-1 transition-all min-h-[200px] flex flex-col',
                    colors[accent],
                    isDisabled && 'opacity-60 cursor-not-allowed'
                  )}
                  aria-disabled={isDisabled}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn('h-16 w-16 aspect-square shrink-0 rounded-xl flex items-center justify-center', iconBg[accent])}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn('font-semibold text-lg leading-tight mb-2', isDark ? 'text-slate-100' : 'text-slate-900')}>{name}</div>
                      <div className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{description}</div>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium">AKTYWNE</span>
                    <span className={cn('inline-block h-2 w-2 rounded-full', dot[accent])} />
                  </div>
                </div>
              );

              return isDisabled ? (
                <div key={id}>{Card}</div>
              ) : (
                <Link key={id} href={`/${id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl">
                  {Card}
                </Link>
              );
            })}
          </div>

          {/* No in-progress panels */}

          {/* Footer */}
          <div className={cn('mt-10 text-center text-sm', isDark ? 'text-slate-500' : 'text-slate-500')}>
            Panel narzędzi AI wykonany przez <span className={cn(isDark ? 'text-slate-300' : 'text-slate-700')}>Wiktor Siemiński</span>
          </div>

        </div>
      </div>
    </ErrorBoundary>
  );
}
