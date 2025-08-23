'use client';

import { useState } from 'react';
import Link from 'next/link';
import ErrorBoundary from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';
import WebhookButton from '@/components/WebhookButton';
import { ArrowLeft, Plane, MapPin, Calendar, DollarSign, Utensils, Globe } from 'lucide-react';

import { cn } from '@/lib/utils';
import useTheme from '@/lib/useTheme';
import { VacationPlanResponse } from '@/lib/webhook_config';

// Countries with their currencies
const COUNTRIES = [
  { name: 'Albania', currency: 'ALL' },
  { name: 'Australia', currency: 'AUD' },
  { name: 'Austria', currency: 'EUR' },
  { name: 'Belarus', currency: 'BYN' },
  { name: 'Belgium', currency: 'EUR' },
  { name: 'Bosnia and Herzegovina', currency: 'BAM' },
  { name: 'Bulgaria', currency: 'BGN' },
  { name: 'Croatia', currency: 'EUR' },
  { name: 'Czech Republic', currency: 'CZK' },
  { name: 'Denmark', currency: 'DKK' },
  { name: 'Dubai', currency: 'AED' },
  { name: 'Estonia', currency: 'EUR' },
  { name: 'Finland', currency: 'EUR' },
  { name: 'France', currency: 'EUR' },
  { name: 'Germany', currency: 'EUR' },
  { name: 'Greece', currency: 'EUR' },
  { name: 'Hungary', currency: 'HUF' },
  { name: 'Iceland', currency: 'ISK' },
  { name: 'Ireland', currency: 'EUR' },
  { name: 'Italy', currency: 'EUR' },
  { name: 'Japan', currency: 'JPY' },
  { name: 'Latvia', currency: 'EUR' },
  { name: 'Luxembourg', currency: 'EUR' },
  { name: 'Malta', currency: 'EUR' },
  { name: 'Monaco', currency: 'EUR' },
  { name: 'Montenegro', currency: 'EUR' },
  { name: 'Netherlands', currency: 'EUR' },
  { name: 'Norway', currency: 'NOK' },
  { name: 'Peru', currency: 'PEN' },
  { name: 'Poland', currency: 'PLN' },
  { name: 'Portugal', currency: 'EUR' },
  { name: 'Romania', currency: 'RON' },
  { name: 'San Marino', currency: 'EUR' },
  { name: 'Slovakia', currency: 'EUR' },
  { name: 'Slovenia', currency: 'EUR' },
  { name: 'Spain', currency: 'EUR' },
  { name: 'Sweden', currency: 'SEK' },
  { name: 'Switzerland', currency: 'CHF' },
  { name: 'Thailand', currency: 'THB' },
  { name: 'United Kingdom', currency: 'GBP' },
  { name: 'Vatican City', currency: 'EUR' }
];

export default function VacationPlannerPage() {
  const { isDark } = useTheme();

  // Form state
  const [country, setCountry] = useState('');
  const [locationType, setLocationType] = useState<'village' | 'city'>('city');
  const [locationName, setLocationName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [mealType, setMealType] = useState<'all-inclusive' | 'self-catering'>('all-inclusive');
  
  // Response state
  const [vacationPlan, setVacationPlan] = useState<VacationPlanResponse | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<number | null>(null);

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

  // Function to get priority label
  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'Trzeba zobaczyć';
      case 2: return 'Wysoko polecane';
      case 3: return 'Polecane';
      case 4: return 'Opcjonalne';
      case 5: return 'Gdy czas pozwoli';
      case 6: return 'Tymczasowe';
      default: return '';
    }
  };

  // Get currency for selected country
  const selectedCountry = COUNTRIES.find(c => c.name === country);
  const currency = selectedCountry?.currency || '';

  // Calculate vacation duration and validate 14-day limit
  const calculateVacationDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const vacationDuration = calculateVacationDuration();
  const isDurationValid = vacationDuration <= 14 && vacationDuration > 0;

  // Prepare webhook payload
  const prepareVacationPayload = () => {
    if (!country || !locationName || !startDate || !endDate || !budget || !isDurationValid) {
      return null;
    }

    // Convert Polish values to English for webhook
    const locationTypeMap: Record<string, string> = {
      'village': 'village',
      'city': 'city'
    };

    const vacationTypeMap: Record<string, string> = {
      'all-inclusive': 'all-inclusive',
      'self-catering': 'self-catering'
    };

    return {
      country,
      location_type: locationTypeMap[locationType],
      location_name: locationName,
      start: startDate,
      end: endDate,
      budget: `${budget} ${currency}`,
      vacation_type: vacationTypeMap[mealType]
    };
  };

  const handleVacationPlanSuccess = (data: unknown) => {
    setVacationPlan(data as VacationPlanResponse);
  };

  const handleVacationPlanError = (error: unknown) => {
    console.error('Vacation planning error:', error);
    setVacationPlan(null);
  };

  return (
    <ErrorBoundary>
      <div className={cn('min-h-screen', isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900')}>
        <div className="max-w-6xl mx-auto p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className={cn('inline-flex items-center mb-4 transition-colors', isDark ? 'text-slate-400 hover:text-pink-300' : 'text-slate-500 hover:text-pink-600')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Powrót do Hub
            </Link>
            <Header
              title="Planer Podróży"
              description="Znajdź najlepsze miejsca do odwiedzenia podczas wakacji"
              accent="pink"
              isDark={isDark}
              icon={<Plane className="w-8 h-8" />}
            />
          </div>

          {/* Main Content */}
          <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-pink-500 flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <h2 className={cn('text-2xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Szczegóły Podróży</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Country */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-pink-500 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Kraj *</h3>
                </div>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-pink-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-pink-500')}
                >
                  <option value="">Wybierz kraj...</option>
                  {COUNTRIES.map((countryOption) => (
                    <option key={countryOption.name} value={countryOption.name}>
                      {countryOption.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Type */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-pink-500 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Typ Lokalizacji</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLocationType('village')}
                    className={cn('flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-300', 
                      locationType === 'village'
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-pink-500 hover:text-pink-400' : 'bg-white border-slate-200 text-slate-700 hover:border-pink-500 hover:text-pink-600')
                    )}
                  >
                    Wieś
                  </button>
                  <button
                    onClick={() => setLocationType('city')}
                    className={cn('flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-300', 
                      locationType === 'city'
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-pink-500 hover:text-pink-400' : 'bg-white border-slate-200 text-slate-700 hover:border-pink-500 hover:text-pink-600')
                    )}
                  >
                    Miasto
                  </button>
                </div>
              </div>

              {/* Village/City Name */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-pink-500 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                    Nazwa {locationType === 'village' ? 'Wsi' : 'Miasta'} *
                  </h3>
                </div>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder={`np. ${locationType === 'village' ? 'Positano, Santorini' : 'Rzym, Barcelona, Ateny'}...`}
                  className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-pink-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-pink-500')}
                />
              </div>

              {/* Date Range */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-pink-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Okres Wakacji *</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={cn('block text-sm mb-1', isDark ? 'text-slate-400' : 'text-slate-600')}>Data rozpoczęcia</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-pink-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-pink-500')}
                    />
                  </div>
                  <div>
                    <label className={cn('block text-sm mb-1', isDark ? 'text-slate-400' : 'text-slate-600')}>Data zakończenia</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={startDate ? new Date(new Date(startDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined}
                      className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-pink-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-pink-500')}
                    />
                  </div>
                </div>
                
                {/* Duration indicator */}
                {startDate && endDate && (
                  <div className="mt-3">
                    <div className={cn('flex items-center gap-2 text-sm', 
                      isDurationValid 
                        ? (isDark ? 'text-green-400' : 'text-green-600')
                        : (isDark ? 'text-red-400' : 'text-red-600')
                    )}>
                      <div className={cn('w-2 h-2 rounded-full', 
                        isDurationValid 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      )}></div>
                      <span>
                        {vacationDuration === 1 
                          ? '1 dzień' 
                          : `${vacationDuration} dni`
                        }
                        {!isDurationValid && vacationDuration > 14 && ' (maksymalnie 14 dni)'}
                        {!isDurationValid && vacationDuration <= 0 && ' (nieprawidłowy zakres dat)'}
                      </span>
                    </div>
                    {!isDurationValid && (
                      <p className={cn('text-xs mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Wybierz zakres dat nie dłuższy niż 14 dni
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Budget */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-pink-500 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                    Budżet (poza hotelem) {currency ? `w ${currency}` : ''} *
                  </h3>
                </div>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder={currency ? `np. 1000 ${currency}` : "np. 1000"}
                  min="0"
                  className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-pink-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-pink-500')}
                />
              </div>

              {/* Meal Type */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-pink-500 flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Typ Wyżywienia</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMealType('all-inclusive')}
                    className={cn('flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-300', 
                      mealType === 'all-inclusive'
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-pink-500 hover:text-pink-400' : 'bg-white border-slate-200 text-slate-700 hover:border-pink-500 hover:text-pink-600')
                    )}
                  >
                    All Inclusive
                  </button>
                  <button
                    onClick={() => setMealType('self-catering')}
                    className={cn('flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-300', 
                      mealType === 'self-catering'
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-pink-500 hover:text-pink-400' : 'bg-white border-slate-200 text-slate-700 hover:border-pink-500 hover:text-pink-600')
                    )}
                  >
                    Na Własną Rękę
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <div className="relative inline-block">
                <div className={cn('absolute inset-0 rounded-xl blur-xl', isDark ? 'bg-pink-500/10' : 'bg-pink-500/10')}></div>
                                 <WebhookButton
                   webhookName="plan-vacation"
                   payload={prepareVacationPayload() || {}}
                   onSuccess={handleVacationPlanSuccess}
                   onError={handleVacationPlanError}
                   disabled={!country || !locationName || !startDate || !endDate || !budget || !isDurationValid}
                   className="relative flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 disabled:from-pink-400 disabled:to-rose-500"
                 >
                   <Plane className="w-5 h-5 mr-2" />
                   Zaplanuj Wakacje
                 </WebhookButton>
              </div>
            </div>
          </div>

          {/* Vacation Plan Results */}
          {vacationPlan && (
            <div className={cn('mt-8 rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-pink-500 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <h2 className={cn('text-2xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Plan Wakacji</h2>
              </div>

              {/* Display vacation plan data */}
              <div className={cn('space-y-6', isDark ? 'text-slate-300' : 'text-slate-700')}>
                {/* Extract POIs and holidays from response */}
                {(() => {
                  const pois = vacationPlan.output?.pois || vacationPlan.result?.pois || vacationPlan.pois || [];
                  const holidays = vacationPlan.output?.holidays || vacationPlan.result?.holidays || vacationPlan.holidays || [];
                  
                  return (
                    <>
                      {/* Points of Interest */}
                      {pois.length > 0 && (
                        <div>
                                                     <h3 className={cn('text-xl font-semibold mb-4', isDark ? 'text-slate-100' : 'text-slate-900')}>
                             Punkty Zainteresowania
                           </h3>
                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pois.map((poi, index) => {
                              const colorClass = generateRandomColor(index);
                              const colorVariants = getColorVariants(colorClass);
                              return (
                                <div
                                  key={index}
                                  onClick={() => setSelectedPOI(selectedPOI === index ? null : index)}
                                  className={cn(
                                    'cursor-pointer transition-all duration-200 rounded-lg p-4 hover:shadow-md',
                                    selectedPOI === index
                                      ? cn('ring-2', colorVariants.ring, colorVariants.bg, colorVariants.bgDark)
                                      : (isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50')
                                  )}
                                >
                                  <div className="flex items-center space-x-4">
                                    <div className={`w-4 h-4 rounded-full ${colorClass} flex-shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <h3 className={cn('text-lg font-semibold whitespace-normal break-words line-clamp-2', isDark ? 'text-slate-100' : 'text-slate-900')}>
                                          {poi.title}
                                        </h3>
                                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0',
                                          poi.priority === 1 ? 'bg-red-100 text-red-800' :
                                          poi.priority === 2 ? 'bg-orange-100 text-orange-800' :
                                          poi.priority === 3 ? 'bg-yellow-100 text-yellow-800' :
                                          poi.priority === 4 ? 'bg-blue-100 text-blue-800' :
                                          'bg-gray-100 text-gray-800'
                                        )}>
                                          {getPriorityLabel(poi.priority)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <div className={cn('w-6 h-6 transition-transform duration-200', selectedPOI === index ? 'rotate-180' : '')}>
                                        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                  {selectedPOI === index && (
                                    <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Opis</h4>
                                          <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{poi.description}</p>
                                        </div>
                                        <div>
                                          <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Dlaczego warto odwiedzić</h4>
                                          <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{poi.why_visit}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Wstęp:</span>
                                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium',
                                            poi.admission === 'FREE' ? 'bg-green-100 text-green-800' :
                                            poi.admission === 'PAID' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                          )}>
                                            {poi.admission === 'FREE' ? 'Darmowy' : 
                                             poi.admission === 'PAID' ? 'Płatny' : 'Różnie'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Holidays */}
                      {holidays.length > 0 && (
                        <div>
                          <h3 className={cn('text-xl font-semibold mb-4', isDark ? 'text-slate-100' : 'text-slate-900')}>
                            Święta i Wydarzenia ({holidays.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {holidays.map((holiday, index) => (
                              <div key={index} className={cn('p-4 rounded-lg border', isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200')}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className={cn('font-semibold text-sm', isDark ? 'text-slate-100' : 'text-slate-900')}>
                                      {holiday.holiday_name}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                      {holiday.holiday_type}
                                    </p>
                                  </div>
                                  <div className={cn('px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800')}>
                                    Święto
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fallback for raw data display */}
                      {pois.length === 0 && holidays.length === 0 && (
                        <div>
                          <h3 className={cn('font-semibold mb-2', isDark ? 'text-slate-100' : 'text-slate-900')}>Odpowiedź</h3>
                          <pre className={cn('text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-700')}>
                            {JSON.stringify(vacationPlan, null, 2)}
                          </pre>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
        <ThemeToggle />
      </div>
    </ErrorBoundary>
  );
}
