'use client';

import Link from 'next/link';
import { useState, KeyboardEvent } from 'react';
import { ArrowLeft, Globe2, X, MapPin, Building2, BarChart3, Search, MessageSquare, Zap } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import WebhookButton from '@/components/WebhookButton';
import Header from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import useTheme from '@/lib/useTheme';

interface MarketAnalysis {
  id: string;
  name: string;
  score: number;
  gapDescription: string;
  marketSize: string;
  competitors: string;
  businessModel: string;
  targetCustomers: string;
  risks: string;
  opportunities: string;
  links?: string[];
}

export default function MarketAnalyzer() {
  const [region, setRegion] = useState('Global');
  const [industry, setIndustry] = useState('All');
  const [analysisDepth, setAnalysisDepth] = useState(3);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [moreContext, setMoreContext] = useState('');
  const [turboMode, setTurboMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<MarketAnalysis[]>([]);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);
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
      let analysisData: MarketAnalysis[] = [];
      
      if (Array.isArray(data)) {
        // Handle direct array of market analyses
        analysisData = data as MarketAnalysis[];
      } else if (typeof data === 'object' && data !== null) {
        const responseData = data as { 
          analyses?: MarketAnalysis[] | string;
          result?: MarketAnalysis[] | string;
          output?: { sanitized?: string; text?: string } | MarketAnalysis[];
        };
        
        if (Array.isArray(responseData.analyses)) {
          analysisData = responseData.analyses;
        } else if (Array.isArray(responseData.result)) {
          analysisData = responseData.result;
        } else if (Array.isArray(responseData.output)) {
          analysisData = responseData.output;
        } else if (responseData.output?.sanitized) {
          // Try to parse JSON from sanitized output
          try {
            const parsed = JSON.parse(responseData.output.sanitized);
            if (Array.isArray(parsed)) {
              analysisData = parsed;
            } else if (parsed.analyses && Array.isArray(parsed.analyses)) {
              analysisData = parsed.analyses;
            }
          } catch (parseError) {
            console.error('Failed to parse sanitized output:', parseError);
          }
        }
      }
      
      // Sort results by score (highest first) and limit based on analysis depth
      const sortedResults = analysisData.sort((a, b) => b.score - a.score);
      const limitedResults = sortedResults.slice(0, analysisDepth);
      
      setAnalysisResults(limitedResults);
      setHasResults(true);
    } catch (error) {
      console.error('Failed to process market analysis data:', error);
      toast.error('Failed to process analysis results');
    }
  };

  const handleError = (error: unknown) => {
    console.error('Market analysis failed:', error);
    toast.error('Market analysis failed. Please try again.');
  };

  const handleAddKeyword = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      const newKeyword = keywordInput.trim();
      if (!keywords.includes(newKeyword)) {
        setKeywords(prev => [...prev, newKeyword]);
        setKeywordInput('');
      }
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(prev => prev.filter(keyword => keyword !== keywordToRemove));
  };

  return (
    <div className={cn('min-h-screen', isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900')}>
      <div className="max-w-6xl mx-auto p-6 sm:p-8">
        {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className={cn('inline-flex items-center mb-4 transition-colors', isDark ? 'text-slate-400 hover:text-cyan-300' : 'text-slate-500 hover:text-cyan-600')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Powrót do Hub
            </Link>
            <Header
              title="Analizator Rynku"
              description="Analizuj trendy na rynku, słabości oraz pomysły biznesowe"
              accent="cyan"
              isDark={isDark}
              icon={<Globe2 className="w-8 h-8" />}
            />
          </div>

        {/* Main Content - single column grouped sections for better flow */}
        <div className="space-y-6">
          {/* Region Selection Section */}
          <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-cyan-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Region</h2>
              </div>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-cyan-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-cyan-500')}
                aria-label="Select market region for analysis"
              >
                <option value="Global">Global</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="Middle East">Middle East</option>
                <option value="Africa">Africa</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Italy">Italy</option>
                <option value="Spain">Spain</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Sweden">Sweden</option>
                <option value="Norway">Norway</option>
                <option value="Denmark">Denmark</option>
                <option value="Finland">Finland</option>
                <option value="Belgium">Belgium</option>
                <option value="Austria">Austria</option>
                <option value="Poland">Poland</option>
                <option value="Czech Republic">Czech Republic</option>
                <option value="Hungary">Hungary</option>
                <option value="Romania">Romania</option>
                <option value="Bulgaria">Bulgaria</option>
                <option value="Greece">Greece</option>
                <option value="Portugal">Portugal</option>
                <option value="Ireland">Ireland</option>
                <option value="Luxembourg">Luxembourg</option>
                <option value="Slovakia">Slovakia</option>
                <option value="Slovenia">Slovenia</option>
                <option value="Croatia">Croatia</option>
                <option value="Estonia">Estonia</option>
                <option value="Latvia">Latvia</option>
                <option value="Lithuania">Lithuania</option>
                <option value="Malta">Malta</option>
                <option value="Cyprus">Cyprus</option>
                <option value="Japan">Japan</option>
                <option value="China">China</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          {/* Industry Selection Section */}
          <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-cyan-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Branża</h2>
              </div>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-cyan-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-cyan-500')}
                aria-label="Select industry for analysis"
              >
                <option value="All">Wszystkie Branże</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Transportation">Transportation</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Energy">Energy</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Tourism">Tourism</option>
                <option value="Fitness">Fitness</option>
                <option value="Beauty">Beauty</option>
                <option value="Pet Care">Pet Care</option>
                <option value="Home Services">Home Services</option>
                <option value="Legal Services">Legal Services</option>
                <option value="Marketing">Marketing</option>
                <option value="Consulting">Consulting</option>
                <option value="Non-Profit">Non-Profit</option>
                <option value="Gaming">Gaming</option>
                <option value="Music">Music</option>
                <option value="Fashion">Fashion</option>
                <option value="Sports">Sports</option>
                <option value="Media">Media</option>
                <option value="Automotive">Automotive</option>
                <option value="Aerospace">Aerospace</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Insurance">Insurance</option>
                <option value="Construction">Construction</option>
                <option value="Mining">Mining</option>
                <option value="Textiles">Textiles</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Logistics">Logistics</option>
                <option value="E-commerce">E-commerce</option>
                <option value="SaaS">SaaS</option>
                <option value="Fintech">Fintech</option>
                <option value="EdTech">EdTech</option>
                <option value="HealthTech">HealthTech</option>
                <option value="CleanTech">CleanTech</option>
                <option value="PropTech">PropTech</option>
                <option value="InsurTech">InsurTech</option>
                <option value="LegalTech">LegalTech</option>
                <option value="HRTech">HRTech</option>
                <option value="MarTech">MarTech</option>
              </select>
            </div>
          </div>

          {/* Analysis Depth Section */}
          <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-cyan-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Głębokość Analizy</h2>
              </div>
              <select
                id="analysis-depth"
                value={analysisDepth}
                onChange={(e) => setAnalysisDepth(Number(e.target.value))}
                className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-cyan-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-cyan-500')}
                aria-label="Select analysis depth level"
              >
                <option value={1}>Szybki Przegląd (1 skanowanie rynku)</option>
                <option value={2}>Lekka Analiza (2 skanowania rynku)</option>
                <option value={3}>Standardowa Analiza (3 skanowania rynku)</option>
                <option value={4}>Szczegółowa Analiza (4 skanowania rynku)</option>
                <option value={5}>Głęboka Analiza (5 skanowan rynku)</option>
              </select>
            </div>
          </div>

          {/* Keywords Input Section */}
          <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-cyan-600 flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Słowa Kluczowe</h2>
              </div>
              
              {/* Keyword Input Field */}
              <div className="mb-4">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Wpisz słowo kluczowe i naciśnij Enter (np. zrównoważony, lokalny, wsparcie techniczne...)"
                  className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-cyan-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-cyan-500')}
                  aria-label="Enter keywords for market analysis"
                />
              </div>

              {/* Keywords List */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className={cn('group relative rounded-lg px-3 py-2 transition-all duration-300 min-w-[80px]', isDark ? 'bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30' : 'bg-cyan-50 border border-cyan-200 hover:bg-cyan-100')}
                    >
                      <span className={cn('text-sm text-center block group-hover:translate-x-[-8px] transition-transform duration-300', isDark ? 'text-slate-200' : 'text-slate-700')}>
                        {keyword}
                      </span>
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className={cn('absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300', isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700')}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* More Context Input Section */}
          <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-cyan-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Więcej Kontekstu (Opcjonalne)</h2>
              </div>
              <textarea
                id="more-context"
                value={moreContext}
                onChange={(e) => setMoreContext(e.target.value)}
                placeholder="Opisz dokładniej, czego szukasz. np. 'Chcę znaleźć niedosłużone rynki na obszarach wiejskich' lub 'Skup się na możliwościach B2B z modelami powtarzających się przychodów'"
                className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 resize-none', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-cyan-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 placeholder:text-slate-500 focus:ring-cyan-500')}
                rows={3}
                aria-label="Enter additional context for market analysis"
              />
            </div>
          </div>

          {/* Analysis Turbo Mode Toggle Section */}
          <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-cyan-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Turbo Tryb Analizy</h2>
              </div>
              <div className={cn('flex items-center justify-between p-4 rounded-lg', isDark ? 'bg-slate-900 border border-slate-700' : 'bg-slate-50 ring-1 ring-slate-200')}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={cn('text-sm font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Turbo Tryb Analizy</h3>
                    <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-600')}>Zajmuje więcej czasu, ale jest dokładniejszy w wynikach</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTurboMode(!turboMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    turboMode ? 'bg-orange-500' : 'bg-slate-600'
                  }`}
                  aria-label="Toggle Analysis Turbo Mode"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      turboMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={cn('absolute inset-0 rounded-xl blur-xl', isDark ? 'bg-cyan-500/10' : 'bg-cyan-500/10')}></div>
              <div className="relative">
                <WebhookButton
                  webhookName="analyzer"
                  payload={{
                    region,
                    industry,
                    analysis_depth: analysisDepth,
                    keywords: keywords.join(', '),
                    more_context: moreContext.trim(),
                    turbo_mode: turboMode
                  }}
                  onLoading={setIsAnalyzing}
                  onSuccess={handleSuccess}
                  onError={handleError}
                  disabled={keywords.length === 0}
                >
                  <Globe2 className="w-5 h-5 mr-2" />
                  Analizuj Rynek
                </WebhookButton>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <div className={cn('rounded-2xl p-8 shadow-sm ring-1 mt-6', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="flex items-center justify-center gap-4">
              <LoadingSpinner size={24} thickness={2} colorClassName="border-cyan-500" />
              <span className={cn('text-lg', isDark ? 'text-slate-300' : 'text-slate-700')}>Analizowanie danych rynkowych...</span>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {hasResults && !isAnalyzing && (
          <div className="mt-6 space-y-6">
            <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-cyan-50 ring-cyan-100')}>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-cyan-600 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Wyniki Analizy Rynku</h2>
                </div>
                
                <div className="space-y-3">
                  {analysisResults.map((analysis, index) => {
                    const colorClass = generateRandomColor(index);
                    const colorVariants = getColorVariants(colorClass);
                    
                    return (
                      <div 
                        key={analysis.id}
                        onClick={() => setExpandedAnalysis(expandedAnalysis === analysis.id ? null : analysis.id)}
                        className={cn(
                          'cursor-pointer transition-all duration-200 rounded-lg p-4 hover:shadow-md',
                          expandedAnalysis === analysis.id
                            ? cn('ring-2', colorVariants.ring, colorVariants.bg, colorVariants.bgDark)
                            : (isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50')
                        )}
                      >
                        {/* Analysis Bar */}
                        <div className="flex items-center space-x-4">
                          {/* Color Indicator */}
                          <div className={`w-4 h-4 rounded-full ${colorClass} flex-shrink-0`} />
                          
                          {/* Title and Score */}
                          <div className="flex-1 min-w-0">
                            <h3 className={cn('text-lg font-semibold whitespace-normal break-words line-clamp-2', isDark ? 'text-slate-100' : 'text-slate-900')}>{analysis.name}</h3>
                          </div>
                          
                          {/* Score */}
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${colorClass}`}>
                            {analysis.score}%
                          </div>
                          
                          {/* Expand/Collapse Icon */}
                          <div className="flex-shrink-0">
                            <div className={`w-6 h-6 transition-transform duration-200 ${
                              expandedAnalysis === analysis.id ? 'rotate-180' : ''
                            }`}>
                              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                          {expandedAnalysis === analysis.id && (
                            <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                            <div className="space-y-4">
                              <div>
                                  <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Opis Luki</h4>
                                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{analysis.gapDescription}</p>
                              </div>
                              
                              <div>
                                  <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Wielkość Rynku</h4>
                                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{analysis.marketSize}</p>
                              </div>
                              
                              <div>
                                  <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Konkurenci</h4>
                                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{analysis.competitors}</p>
                              </div>
                              
                              <div>
                                  <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Model Biznesowy</h4>
                                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{analysis.businessModel}</p>
                              </div>
                              
                              <div>
                                  <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Docelowi Klienci</h4>
                                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{analysis.targetCustomers}</p>
                              </div>
                              
                              <div>
                                  <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Ryzyko</h4>
                                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{analysis.risks}</p>
                              </div>
                              
                              <div>
                                  <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Możliwości</h4>
                                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{analysis.opportunities}</p>
                              </div>
                              
                              <div>
                                  <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Linki Referencyjne</h4>
                                <div className="space-y-2">
                                  {analysis.links && analysis.links.length > 0 ? (
                                    analysis.links.map((link, linkIndex) => (
                                      <a
                                        key={linkIndex}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                          className={cn('block text-sm underline transition-colors', isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700')}
                                      >
                                        {link}
                                      </a>
                                    ))
                                  ) : (
                                      <p className={cn('text-sm italic', isDark ? 'text-slate-400' : 'text-slate-500')}>Brak dostępnych linków referencyjnych</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ThemeToggle />
    </div>
  );
}