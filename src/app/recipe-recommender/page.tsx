'use client';

import { useState, KeyboardEvent } from 'react';
import Link from 'next/link';
import ErrorBoundary from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowLeft, ChefHat, Search, Utensils, Clock, Globe, Shuffle, X, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import useTheme from '@/lib/useTheme';

// Cuisine options
const CUISINE_OPTIONS = [
  'African', 'Asian', 'American', 'British', 'Cajun', 'Caribbean', 'Chinese', 
  'Eastern European', 'European', 'French', 'German', 'Greek', 'Indian', 'Irish', 
  'Italian', 'Japanese', 'Jewish', 'Korean', 'Latin American', 'Mediterranean', 
  'Mexican', 'Middle Eastern', 'Nordic', 'Southern', 'Spanish', 'Thai', 'Vietnamese', 'Any'
];

// Meal time options
const MEAL_TIME_OPTIONS = ['Śniadanie', 'Obiad', 'Kolacja', 'Deser'];



export default function RecipeRecommenderPage() {
  // Recipe Finder state
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [cuisine, setCuisine] = useState('Any');
  const [mealTime, setMealTime] = useState('Dinner');
  const [dietaryMain, setDietaryMain] = useState<string[]>([]);
  const [dietaryMainInput, setDietaryMainInput] = useState('');

  // Random Recipe state
  const [randomCuisine, setRandomCuisine] = useState('Any');
  const [dietaryRandom, setDietaryRandom] = useState<string[]>([]);
  const [recipeCount, setRecipeCount] = useState(3);
  const { isDark } = useTheme();
  const [dietaryRandomInput, setDietaryRandomInput] = useState('');

  // legacy toggles removed (chips UI instead)



  const handleRecipeFinder = () => {
    // TODO: Implement recipe finder webhook
    console.log('Recipe Finder:', { ingredients: ingredients.join(', '), cuisine, mealTime, dietary_restrictions: dietaryMain.join(', ') });
  };

  const handleRandomRecipe = () => {
    // TODO: Implement random recipe webhook
    console.log('Random Recipe:', { randomCuisine, dietary_restrictions: dietaryRandom, recipeCount });
  };

  // Theme handled by useTheme hook

  // Map textarea to ingredients array (comma-separated)
  const ingredientsText = ingredients.join(', ');
  const onIngredientsTextChange = (value: string) => {
    const parsed = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setIngredients(parsed);
  };

  const handleAddDietaryMain = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && dietaryMainInput.trim()) {
      const newItem = dietaryMainInput.trim();
      if (!dietaryMain.includes(newItem)) {
        setDietaryMain((prev) => [...prev, newItem]);
        setDietaryMainInput('');
      }
    }
  };
  const handleRemoveDietaryMain = (item: string) => {
    setDietaryMain((prev) => prev.filter((d) => d !== item));
  };

  const handleAddDietaryRandom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && dietaryRandomInput.trim()) {
      const newItem = dietaryRandomInput.trim();
      if (!dietaryRandom.includes(newItem)) {
        setDietaryRandom((prev) => [...prev, newItem]);
        setDietaryRandomInput('');
      }
    }
  };
  const handleRemoveDietaryRandom = (item: string) => {
    setDietaryRandom((prev) => prev.filter((d) => d !== item));
  };

  return (
    <ErrorBoundary>
      <div className={cn('min-h-screen', isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900')}>
        <div className="max-w-6xl mx-auto p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className={cn('inline-flex items-center mb-4 transition-colors', isDark ? 'text-slate-400 hover:text-orange-300' : 'text-slate-500 hover:text-orange-600')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Powrót do Hub
            </Link>
            <Header
              title="Rekomendator Przepisów"
              description="Znajdź przepisy na podstawie składników i preferencji"
              accent="orange"
              isDark={isDark}
              icon={<ChefHat className="w-8 h-8" />}
            />
          </div>

          {/* Main Content - single form card inspired by image */}
          <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h2 className={cn('text-2xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Co chcesz ugotować?</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Ingredients */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Dostępne Składniki *</h3>
                </div>
                <textarea
                  value={ingredientsText}
                  onChange={(e) => onIngredientsTextChange(e.target.value)}
                  placeholder="np. kurczak, pomidory, czosnek, cebula, ryż, szpinak..."
                  className={cn('w-full min-h-[140px] px-4 py-3 rounded-lg resize-y focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-orange-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-orange-500')}
                />
              </div>

              {/* Cuisine Type */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Rodzaj Kuchni</h3>
                </div>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-orange-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-orange-500')}
                >
                  {CUISINE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Dietary Restrictions */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Ograniczenia Żywieniowe (Opcjonalne)</h3>
                </div>
                <input
                  type="text"
                  value={dietaryMainInput}
                  onChange={(e) => setDietaryMainInput(e.target.value)}
                  onKeyDown={handleAddDietaryMain}
                  placeholder="Wpisz ograniczenie i naciśnij Enter (np. wegetariański, weganski, bezglutenowy...)"
                  className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-orange-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-orange-500')}
                />
                {dietaryMain.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {dietaryMain.map((item, index) => (
                      <div
                        key={index}
                        className={cn('group relative rounded-lg px-3 py-2 transition-all duration-300 min-w-[80px]', isDark ? 'bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30' : 'bg-orange-50 border border-orange-200 hover:bg-orange-100')}
                      >
                        <span className={cn('text-sm text-center block group-hover:translate-x-[-8px] transition-transform duration-300', isDark ? 'text-slate-200' : 'text-slate-700')}>{item}</span>
                        <button
                          onClick={() => handleRemoveDietaryMain(item)}
                          className={cn('absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300', isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700')}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Meal Type */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Rodzaj Posiłku</h3>
                </div>
                <select
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-orange-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-orange-500')}
                >
                  {MEAL_TIME_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <div className="relative inline-block">
                <div className={cn('absolute inset-0 rounded-xl blur-xl', isDark ? 'bg-orange-500/10' : 'bg-orange-500/10')}></div>
                <button
                  onClick={handleRecipeFinder}
                  disabled={ingredientsText.trim().length === 0}
                  className={cn('relative flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed', 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700')}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Uzyskaj Rekomendacje Przepisów
                </button>
              </div>
            </div>
          </div>

          {/* Random Recipe Section */}
          <div className={cn('mt-8 rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="flex items-center gap-3 mb-6">
              <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', 'bg-orange-500')}>
                <Shuffle className="w-5 h-5 text-white" />
              </div>
              <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Uzyskaj Losowy Przepis</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Kuchnia</h3>
                </div>
                <select
                  value={randomCuisine}
                  onChange={(e) => setRandomCuisine(e.target.value)}
                  className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-orange-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-orange-500')}
                >
                  {CUISINE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Ograniczenia Żywieniowe</h3>
                </div>
                <input
                  type="text"
                  value={dietaryRandomInput}
                  onChange={(e) => setDietaryRandomInput(e.target.value)}
                  onKeyDown={handleAddDietaryRandom}
                  placeholder="Wpisz ograniczenie i naciśnij Enter (np. bez nabiału, bez orzechów...)"
                  className={cn('w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-orange-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-orange-500')}
                />
                {dietaryRandom.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {dietaryRandom.map((item, index) => (
                      <div
                        key={index}
                        className={cn('group relative rounded-lg px-3 py-2 transition-all duration-300 min-w-[80px]', isDark ? 'bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30' : 'bg-orange-50 border border-orange-200 hover:bg-orange-100')}
                      >
                        <span className={cn('text-sm text-center block group-hover:translate-x-[-8px] transition-transform duration-300', isDark ? 'text-slate-200' : 'text-slate-700')}>{item}</span>
                        <button
                          onClick={() => handleRemoveDietaryRandom(item)}
                          className={cn('absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300', isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700')}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Liczba Przepisów</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((number) => (
                    <button
                      key={number}
                      onClick={() => setRecipeCount(number)}
                      className={cn('w-12 h-12 rounded-lg border-2 font-semibold transition-all duration-300',
                        recipeCount === number
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-orange-500 hover:text-orange-400' : 'bg-white border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600')
                      )}
                    >
                      {number}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="relative inline-block">
                <div className={cn('absolute inset-0 rounded-xl blur-xl', isDark ? 'bg-orange-500/10' : 'bg-orange-500/10')}></div>
                <button
                  onClick={handleRandomRecipe}
                  className={cn('relative flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300', 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700')}
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  Uzyskaj Losowe Przepisy
                </button>
              </div>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </ErrorBoundary>
  );
}
