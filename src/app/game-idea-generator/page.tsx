'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ErrorBoundary from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';
import WebhookButton from '@/components/WebhookButton';
import RichEditor from '@/components/RichEditor';
import { cn } from '@/lib/utils';
import useTheme from '@/lib/useTheme';
import { ArrowLeft, Gamepad2, Palette, Rocket } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { GameIdeaItem, GameIdeaGeneratorResponse } from '@/lib/webhook_config';

export default function GameIdeaGeneratorPage() {
  const { isDark } = useTheme();

  // Inputs
  const [genre, setGenre] = useState('RPG');
  const [customGenre, setCustomGenre] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [audienceAge, setAudienceAge] = useState('Adults (18-34)');
  const [audienceSkill, setAudienceSkill] = useState('Casual');
  const [playstyle, setPlaystyle] = useState('Solo');
  const [artStyle, setArtStyle] = useState('Pixel Art');
  const [monetization, setMonetization] = useState('Premium');
  const [themes, setThemes] = useState('');
  // Backend always returns one idea now; no quantity state

  // Output
  const [idea, setIdea] = useState<GameIdeaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Theme handled by useTheme hook

  const platforms = ['Mobile', 'Console', 'PC', 'Web'] as const;
  const genres = [
    'Action',
    'Adventure',
    'RPG',
    'Simulation',
    'Strategy',
    'Puzzle',
    'Platformer',
    'Shooter',
    'Fighting',
    'Racing',
    'Survival',
    'Horror',
    'Sports',
    'Sandbox / Open World',
    'Stealth',
    'Music / Rhythm',
    'Visual Novel',
    'Roguelike / Roguelite',
    'MMO',
    'Party / Minigame Collection',
    'Custom'
  ] as const;
  const artStyles = ['Pixel Art', '3D Realistic', 'Hand-Drawn', 'Low-Poly', 'Stylized'] as const;
  const monetizations = ['Free-to-Play', 'Premium', 'Subscription', 'Ads', 'Hybrid'] as const;

  const canSubmit = useMemo(() => {
    if (genre === 'Custom' && !customGenre.trim()) return false;
    if (selectedPlatforms.length === 0) return false;
    return true;
  }, [genre, customGenre, selectedPlatforms.length]);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSuccess = (data: unknown) => {
    try {
      let single: GameIdeaItem | null = null;

      if (Array.isArray(data)) {
        // Could be an array of objects or [{ output: [...] }]
        const first = data[0] as { output?: unknown } | GameIdeaItem | undefined;
        if (first && typeof first === 'object' && 'output' in (first as any)) {
          const output = (first as { output?: unknown }).output;
          if (Array.isArray(output) && output.length > 0) single = output[0] as GameIdeaItem;
        } else if (first && typeof first === 'object') {
          // If it's already a list of ideas, pick first
          single = data[0] as GameIdeaItem;
        }
      } else if (typeof data === 'object' && data !== null) {
        const r = data as GameIdeaGeneratorResponse | GameIdeaItem;
        if ('ideas' in (r as any) && Array.isArray((r as any).ideas)) single = (r as any).ideas[0] || null;
        else if ('result' in (r as any) && Array.isArray((r as any).result)) single = (r as any).result[0] || null;
        else if ('output' in (r as any)) {
          const out = (r as any).output as unknown;
          if (Array.isArray(out)) single = (out as GameIdeaItem[])[0] || null;
          else if (out && typeof out === 'object') {
            const maybe = out as { sanitized?: string; text?: string };
            const text = maybe.sanitized || maybe.text;
            if (text) {
              try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) single = parsed[0] as GameIdeaItem;
                else if (parsed && typeof parsed === 'object') single = parsed as GameIdeaItem;
              } catch {}
            }
          }
        } else {
          // Possibly the idea object directly
          single = r as GameIdeaItem;
        }
      }

      setIdea(single);
    } catch (e) {
      console.error('Parse error:', e);
      setIdea(null);
    }
  };

  const handleError = (error: unknown) => {
    console.error('Game Idea Generator error:', error);
  };

  const payload = useMemo(() => ({
    genre: genre === 'Custom' ? customGenre.trim() : genre,
    custom_genre: genre === 'Custom' ? customGenre.trim() : '',
    platform: selectedPlatforms,
    audience_age: audienceAge,
    audience_skill: audienceSkill,
    playstyle,
    art_style: artStyle,
    monetization,
    themes,
  }), [genre, customGenre, selectedPlatforms, audienceAge, audienceSkill, playstyle, artStyle, monetization, themes]);

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
      <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>{title}</h4>
      <div className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{children}</div>
    </div>
  );

  const renderMaybeList = (value?: string[] | string) => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {value.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
        </ul>
      );
    }
    return <p>{value}</p>;
  };

  return (
    <ErrorBoundary>
      <div className={cn('min-h-screen', isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900')}>
        <div className="max-w-6xl mx-auto p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className={cn('inline-flex items-center mb-4 transition-colors', isDark ? 'text-slate-400 hover:text-indigo-300' : 'text-slate-500 hover:text-indigo-600')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Hub
            </Link>
            <Header
              title="Game Idea Generator"
              description="Generate original game concepts including mechanics, themes, monetization, and platform strategy"
              accent="indigo"
              isDark={isDark}
              icon={<Gamepad2 className="w-8 h-8" />}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column: Inputs */}
            <div className="space-y-6">
              {/* Genre */}
              <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Genre</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenre(g)}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm transition-all',
                        genre === g
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600')
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {genre === 'Custom' && (
                  <input
                    className={cn('mt-3 w-full px-3 py-2 rounded-lg border text-sm', isDark ? 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400')}
                    placeholder="Describe your custom genre (e.g., Mix of RPG and Strategy)"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                  />
                )}
              </div>

              {/* Platforms */}
              <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Platform</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {platforms.map((p) => {
                    const active = selectedPlatforms.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={cn(
                          'px-3 py-2 rounded-lg border text-sm transition-all',
                          active
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600')
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audience */}
              <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Target Audience</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    className={cn('px-3 py-2 rounded-lg border text-sm', isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900')}
                    value={audienceAge}
                    onChange={(e) => setAudienceAge(e.target.value)}
                  >
                    {['Kids (6-12)', 'Teens (13-17)', 'Adults (18-34)', 'Adults (35+)', 'All Ages'].map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <select
                    className={cn('px-3 py-2 rounded-lg border text-sm', isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900')}
                    value={audienceSkill}
                    onChange={(e) => setAudienceSkill(e.target.value)}
                  >
                    {['Casual', 'Hardcore'].map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <select
                    className={cn('px-3 py-2 rounded-lg border text-sm', isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900')}
                    value={playstyle}
                    onChange={(e) => setPlaystyle(e.target.value)}
                  >
                    {['Solo', 'Cooperative', 'Competitive'].map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Art & Monetization */}
              <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Art & Monetization</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    className={cn('px-3 py-2 rounded-lg border text-sm', isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900')}
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                  >
                    {artStyles.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <select
                    className={cn('px-3 py-2 rounded-lg border text-sm', isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900')}
                    value={monetization}
                    onChange={(e) => setMonetization(e.target.value)}
                  >
                    {monetizations.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Themes / Story elements */}
              <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Themes / Story (optional)</h2>
                </div>
                <RichEditor 
                  value={themes}
                  onChange={setThemes}
                  placeholder="Optional: key themes, tone, worldbuilding, narrative beats, references..."
                  forceLight={!isDark}
                />
              </div>

              {/* Quantity removed: backend always returns one idea */}
            </div>

            {/* Right column: Results */}
            <div className="flex flex-col h-full">
              <div className={cn('rounded-2xl p-6 shadow-sm ring-1 min-h-[420px] flex flex-col', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-indigo-50 ring-indigo-100')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Idea</h2>
                </div>

                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <LoadingSpinner size={24} thickness={2} colorClassName="border-indigo-500" />
                    <span className={cn(isDark ? 'text-slate-300' : 'text-slate-700')}>Generating game concepts...</span>
                  </div>
                ) : !idea ? (
                  <div className={cn('flex-1 border-2 border-dashed rounded-xl flex items-center justify-center text-center p-8', isDark ? 'border-slate-700' : 'border-indigo-200')}>
                    <div>
                      <Gamepad2 className={cn('mx-auto mb-3', isDark ? 'text-slate-400' : 'text-indigo-500')} />
                      <p className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>Your generated game idea will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className={cn('transition-all duration-200 rounded-lg p-4', isDark ? 'bg-slate-800' : 'bg-white')}>
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>{idea.title}</h3>
                    </div>
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                      <div className="space-y-4">
                        <Section title="Core Gameplay Loop">{idea.core_loop || 'N/A'}</Section>
                        <Section title="Primary Mechanics">{renderMaybeList(idea.primary_mechanics)}</Section>
                        {idea.secondary_mechanics && (
                          <Section title="Secondary Mechanics">{renderMaybeList(idea.secondary_mechanics)}</Section>
                        )}
                        {idea.story_premise && (
                          <Section title="Story Premise">{idea.story_premise}</Section>
                        )}
                        {idea.level_examples && (
                          <Section title="Level / Mission Examples">{renderMaybeList(idea.level_examples)}</Section>
                        )}
                        <Section title="Progression & Rewards">{idea.progression_rewards}</Section>
                        <Section title="Monetization Strategy">{idea.monetization_strategy}</Section>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4 lg:mt-6 self-start">
                <div className="relative">
                  <div className={cn('absolute inset-0 rounded-xl blur-xl', isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/10')}></div>
                  <div className="relative">
                    <WebhookButton
                      webhookName="game_idea_generator"
                      payload={payload}
                      onLoading={setIsLoading}
                      onSuccess={handleSuccess}
                      onError={handleError}
                      disabled={!canSubmit}
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Generate Game Concept
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


