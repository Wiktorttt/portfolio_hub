'use client';

import { useState } from 'react';
import Link from 'next/link';
import ErrorBoundary from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';
import WebhookButton from '@/components/WebhookButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, ChefHat, Search, Utensils, Clock, Globe, Shuffle, Users, Sparkles, DollarSign, Star, ExternalLink } from 'lucide-react';

import { cn } from '@/lib/utils';
import useTheme from '@/lib/useTheme';
import { RecipeItem, RecipeRecommenderResponse } from '@/lib/webhook_config';

// Cuisine options with Polish translations
const CUISINE_OPTIONS = [
  { polish: 'Dowolna', english: 'Any' },
  { polish: 'Afrykańska', english: 'african' },
  { polish: 'Azjatycka', english: 'asian' },
  { polish: 'Amerykańska', english: 'american' },
  { polish: 'Brytyjska', english: 'british' },
  { polish: 'Cajun', english: 'cajun' },
  { polish: 'Karaibska', english: 'caribbean' },
  { polish: 'Chińska', english: 'chinese' },
  { polish: 'Wschodnioeuropejska', english: 'eastern european' },
  { polish: 'Europejska', english: 'european' },
  { polish: 'Francuska', english: 'french' },
  { polish: 'Niemiecka', english: 'german' },
  { polish: 'Grecka', english: 'greek' },
  { polish: 'Indyjska', english: 'indian' },
  { polish: 'Irlandzka', english: 'irish' },
  { polish: 'Włoska', english: 'italian' },
  { polish: 'Japońska', english: 'japanese' },
  { polish: 'Żydowska', english: 'jewish' },
  { polish: 'Koreańska', english: 'korean' },
  { polish: 'Latynoamerykańska', english: 'latin american' },
  { polish: 'Śródziemnomorska', english: 'mediterranean' },
  { polish: 'Meksykańska', english: 'mexican' },
  { polish: 'Bliskowschodnia', english: 'middle eastern' },
  { polish: 'Nordycka', english: 'nordic' },
  { polish: 'Południowa', english: 'southern' },
  { polish: 'Hiszpańska', english: 'spanish' },
  { polish: 'Tajska', english: 'thai' },
  { polish: 'Wietnamska', english: 'vietnamese' }
];

// Meal time options with Polish translations
const MEAL_TIME_OPTIONS = [
  { polish: 'Dowolne', english: 'any' },
  { polish: 'Danie główne', english: 'main course' },
  { polish: 'Przystawka', english: 'side dish' },
  { polish: 'Deser', english: 'dessert' },
  { polish: 'Przekąska przed daniem', english: 'appetizer' },
  { polish: 'Sałatka', english: 'salad' },
  { polish: 'Chleb', english: 'bread' },
  { polish: 'Śniadanie', english: 'breakfast' },
  { polish: 'Zupa', english: 'soup' },
  { polish: 'Napój', english: 'beverage' },
  { polish: 'Sos', english: 'sauce' },
  { polish: 'Marynata', english: 'marinade' },
  { polish: 'Na jeden kęs', english: 'fingerfood' },
  { polish: 'Przekąska', english: 'snack' },
  { polish: 'Drink', english: 'drink' }
];

// Intolerance options with Polish translations
const INTOLERANCE_OPTIONS = [
  { polish: 'Nabiał', english: 'dairy' },
  { polish: 'Jajka', english: 'egg' },
  { polish: 'Gluten', english: 'gluten' },
  { polish: 'Zboża', english: 'grain' },
  { polish: 'Orzeszki ziemne', english: 'peanut' },
  { polish: 'Owoce morza', english: 'seafood' },
  { polish: 'Sezam', english: 'sesame' },
  { polish: 'Skorupiaki', english: 'shellfish' },
  { polish: 'Soja', english: 'soy' },
  { polish: 'Siarczyny', english: 'sulfite' },
  { polish: 'Orzechy drzewne', english: 'tree nut' },
  { polish: 'Pszenica', english: 'wheat' }
];

// Diet options with Polish translations
const DIET_OPTIONS = [
  { polish: 'Bezglutenowa', english: 'gluten free' },
  { polish: 'Keto', english: 'ketogenic' },
  { polish: 'Wegetariańska', english: 'vegetarian' },
  { polish: 'Wegańska', english: 'vegan' },
  { polish: 'Pescetariańska', english: 'pescetarian' },
  { polish: 'Paleo', english: 'paleo' },
  { polish: 'Primal (Ooga booga)', english: 'primal' },
  { polish: 'Low FODMAP', english: 'low fodmap' },
  { polish: 'Whole30', english: 'whole30' }
];

export default function RecipeRecommenderPage() {
  const { isDark } = useTheme();

  // Recipe Finder state
  const [ingredients, setIngredients] = useState<string>('');
  const [cuisine, setCuisine] = useState('Any');
  const [mealTime, setMealTime] = useState('Danie główne');
  const [intolerancesMain, setIntolerancesMain] = useState<string[]>([]);
  const [dietsMain, setDietsMain] = useState<string[]>([]);
  const [recipeCount, setRecipeCount] = useState('3');
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeResults, setRecipeResults] = useState<RecipeItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);

  // Random Recipe state
  const [randomCuisine, setRandomCuisine] = useState('Any');
  const [intolerancesRandom, setIntolerancesRandom] = useState<string[]>([]);
  const [dietsRandom, setDietsRandom] = useState<string[]>([]);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [randomResults, setRandomResults] = useState<RecipeItem[]>([]);
  const [selectedRandomRecipe, setSelectedRandomRecipe] = useState<RecipeItem | null>(null);

  const handleRecipeFinderSuccess = (data: unknown) => {
    try {
      let recipesData: RecipeItem[] = [];
      
      if (Array.isArray(data)) {
        // Handle array response
        if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
          const firstItem = data[0] as { output?: { recipes: RecipeItem[] }; recipes?: RecipeItem[] };
          if (firstItem.output && Array.isArray(firstItem.output.recipes)) {
            recipesData = firstItem.output.recipes;
          } else if (Array.isArray(firstItem.recipes)) {
            recipesData = firstItem.recipes;
          }
        } else {
          recipesData = data as RecipeItem[];
        }
      } else if (typeof data === 'object' && data !== null) {
        const responseData = data as { output?: { recipes: RecipeItem[] }; recipes?: RecipeItem[]; result?: RecipeItem[] };
        if (responseData.output && Array.isArray(responseData.output.recipes)) {
          recipesData = responseData.output.recipes;
        } else if (Array.isArray(responseData.recipes)) {
          recipesData = responseData.recipes;
        } else if (Array.isArray(responseData.result)) {
          recipesData = responseData.result;
        }
      }
      
      setRecipeResults(recipesData);
    } catch (error) {
      console.error('Error parsing recipe results:', error);
    }
  };

  const handleRandomRecipeSuccess = (data: unknown) => {
    try {
      let recipesData: RecipeItem[] = [];
      
      if (Array.isArray(data)) {
        // Handle array response
        if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
          const firstItem = data[0] as { output?: { recipes: RecipeItem[] }; recipes?: RecipeItem[] };
          if (firstItem.output && Array.isArray(firstItem.output.recipes)) {
            recipesData = firstItem.output.recipes;
          } else if (Array.isArray(firstItem.recipes)) {
            recipesData = firstItem.recipes;
          }
        } else {
          recipesData = data as RecipeItem[];
        }
      } else if (typeof data === 'object' && data !== null) {
        const responseData = data as { output?: { recipes: RecipeItem[] }; recipes?: RecipeItem[]; result?: RecipeItem[] };
        if (responseData.output && Array.isArray(responseData.output.recipes)) {
          recipesData = responseData.output.recipes;
        } else if (Array.isArray(responseData.recipes)) {
          recipesData = responseData.recipes;
        } else if (Array.isArray(responseData.result)) {
          recipesData = responseData.result;
        }
      }
      
      setRandomResults(recipesData);
    } catch (error) {
      console.error('Error parsing random recipe results:', error);
    }
  };

  const getEnglishCuisine = (polishCuisine: string): string => {
    const cuisine = CUISINE_OPTIONS.find(c => c.polish === polishCuisine);
    return cuisine ? cuisine.english : 'Any';
  };

  const getEnglishMealTime = (polishMealTime: string): string => {
    const mealTime = MEAL_TIME_OPTIONS.find(m => m.polish === polishMealTime);
    return mealTime ? mealTime.english : 'Lunch';
  };

  const getEnglishIntolerances = (polishIntolerances: string[]): string[] => {
    return polishIntolerances.map(polishIntolerance => {
      const intolerance = INTOLERANCE_OPTIONS.find(i => i.polish === polishIntolerance);
      return intolerance ? intolerance.english : polishIntolerance;
    });
  };

  const getEnglishDiets = (polishDiets: string[]): string[] => {
    return polishDiets.map(polishDiet => {
      const diet = DIET_OPTIONS.find(d => d.polish === polishDiet);
      return diet ? diet.english : polishDiet;
    });
  };

  const handleIntoleranceChange = (intolerance: string, isMain: boolean) => {
    if (isMain) {
      setIntolerancesMain(prev => 
        prev.includes(intolerance) 
          ? prev.filter(i => i !== intolerance)
          : [...prev, intolerance]
      );
    } else {
      setIntolerancesRandom(prev => 
        prev.includes(intolerance) 
          ? prev.filter(i => i !== intolerance)
          : [...prev, intolerance]
      );
    }
  };

  const handleDietChange = (diet: string, isMain: boolean) => {
    if (isMain) {
      setDietsMain(prev => 
        prev.includes(diet) 
          ? prev.filter(d => d !== diet)
          : prev.length < 2 
            ? [...prev, diet]
            : prev
      );
    } else {
      setDietsRandom(prev => 
        prev.includes(diet) 
          ? prev.filter(d => d !== diet)
          : prev.length < 2 
            ? [...prev, diet]
            : prev
      );
    }
  };

  // Helper functions for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const generateRandomColor = (index: number): string => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
    ];
    return colors[index % colors.length];
  };

  const getColorVariants = (colorClass: string) => {
    const colorMap: { [key: string]: { ring: string; bg: string; bgDark: string } } = {
      'bg-red-500': { ring: 'ring-red-500', bg: 'bg-red-50', bgDark: 'bg-red-500/10' },
      'bg-blue-500': { ring: 'ring-blue-500', bg: 'bg-blue-50', bgDark: 'bg-blue-500/10' },
      'bg-green-500': { ring: 'ring-green-500', bg: 'bg-green-50', bgDark: 'bg-green-500/10' },
      'bg-yellow-500': { ring: 'ring-yellow-500', bg: 'bg-yellow-50', bgDark: 'bg-yellow-500/10' },
      'bg-purple-500': { ring: 'ring-purple-500', bg: 'bg-purple-50', bgDark: 'bg-purple-500/10' },
      'bg-pink-500': { ring: 'ring-pink-500', bg: 'bg-pink-50', bgDark: 'bg-pink-500/10' },
      'bg-indigo-500': { ring: 'ring-indigo-500', bg: 'bg-indigo-50', bgDark: 'bg-indigo-500/10' },
      'bg-teal-500': { ring: 'ring-teal-500', bg: 'bg-teal-50', bgDark: 'bg-teal-500/10' },
      'bg-orange-500': { ring: 'ring-orange-500', bg: 'bg-orange-50', bgDark: 'bg-orange-500/10' },
      'bg-cyan-500': { ring: 'ring-cyan-500', bg: 'bg-cyan-50', bgDark: 'bg-cyan-500/10' }
    };
    return colorMap[colorClass] || colorMap['bg-blue-500'];
  };

  const getPolishNutrientName = (englishName: string): string => {
    const translations: { [key: string]: string } = {
      'Saturated Fat': 'Tłuszcze nasycone',
      'Net Carbohydrates': 'Węglowodany netto',
      'Sugar': 'Cukier',
      'Cholesterol': 'Cholesterol',
      'Sodium': 'Sód',
      'Alcohol': 'Alkohol',
      'Alcohol %': 'Alkohol %',
      'Manganese': 'Mangan',
      'Folate': 'Kwas foliowy',
      'Vitamin K': 'Witamina K',
      'Fiber': 'Błonnik',
      'Vitamin B6': 'Witamina B6',
      'Phosphorus': 'Fosfor',
      'Copper': 'Miedź',
      'Vitamin B3': 'Witamina B3',
      'Potassium': 'Potas',
      'Selenium': 'Selen',
      'Iron': 'Żelazo',
      'Vitamin A': 'Witamina A',
      'Vitamin B1': 'Witamina B1',
      'Magnesium': 'Magnez',
      'Vitamin B2': 'Witamina B2',
      'Zinc': 'Cynk',
      'Vitamin C': 'Witamina C',
      'Vitamin E': 'Witamina E',
      'Vitamin B5': 'Witamina B5',
      'Calcium': 'Wapń',
      'Vitamin B12': 'Witamina B12'
    };
    return translations[englishName] || englishName;
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

          {/* Recipe Finder Section */}
          <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h2 className={cn('text-2xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Znajdź Przepis</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Ingredients */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Dostępne Składniki *</h3>
                </div>
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="np. kurczak, pomidory, czosnek, cebula, ryż, szpinak..."
                  className={cn('w-full min-h-[120px] px-4 py-3 rounded-lg resize-y focus:outline-none focus:ring-2', isDark ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-orange-500' : 'bg-white ring-1 ring-slate-200 text-slate-900 focus:ring-orange-500')}
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
                    <option key={opt.english} value={opt.polish}>{opt.polish}</option>
                  ))}
                </select>
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
                    <option key={opt.english} value={opt.polish}>{opt.polish}</option>
                  ))}
                </select>
              </div>

              {/* Recipe Count */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Liczba Przepisów</h3>
                </div>
                <div className="flex justify-center">
                  <div className="grid grid-cols-10 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                      <button
                        key={number}
                        onClick={() => setRecipeCount(number.toString())}
                        className={cn(
                          'w-10 h-10 rounded-lg border-2 font-semibold transition-all duration-300',
                          recipeCount === number.toString()
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

              {/* Intolerances */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Nietolerancje (Opcjonalne)</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {INTOLERANCE_OPTIONS.map((intolerance) => (
                    <label
                      key={intolerance.english}
                      className={cn(
                        'flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200',
                        intolerancesMain.includes(intolerance.polish)
                          ? (isDark ? 'bg-orange-500/20 border-orange-500/50' : 'bg-orange-50 border-orange-300')
                          : (isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50')
                      )}
                    >
                <input
                        type="checkbox"
                        checked={intolerancesMain.includes(intolerance.polish)}
                        onChange={() => handleIntoleranceChange(intolerance.polish, true)}
                        className="sr-only"
                      />
                      <div className={cn(
                        'w-4 h-4 rounded border-2 mr-3 flex items-center justify-center',
                        intolerancesMain.includes(intolerance.polish)
                          ? 'bg-orange-500 border-orange-500'
                          : (isDark ? 'border-slate-600' : 'border-slate-300')
                      )}>
                        {intolerancesMain.includes(intolerance.polish) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={cn(
                        'text-sm',
                        isDark ? 'text-slate-200' : 'text-slate-700'
                      )}>
                        {intolerance.polish}
                      </span>
                    </label>
                    ))}
                  </div>
              </div>

              {/* Diet */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Dieta (Opcjonalne, max 2)</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {DIET_OPTIONS.map((diet) => (
                    <label
                      key={diet.english}
                      className={cn(
                        'flex items-center p-3 rounded-lg border transition-all duration-200',
                        dietsMain.includes(diet.polish)
                          ? (isDark ? 'bg-orange-500/20 border-orange-500/50' : 'bg-orange-50 border-orange-300')
                          : dietsMain.length >= 2 && !dietsMain.includes(diet.polish)
                            ? (isDark ? 'bg-slate-800/50 border-slate-600/50 opacity-50' : 'bg-slate-100 border-slate-200 opacity-50')
                            : (isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 cursor-pointer' : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'),
                        dietsMain.length >= 2 && !dietsMain.includes(diet.polish) ? 'cursor-not-allowed' : 'cursor-pointer'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={dietsMain.includes(diet.polish)}
                        onChange={() => handleDietChange(diet.polish, true)}
                        disabled={dietsMain.length >= 2 && !dietsMain.includes(diet.polish)}
                        className="sr-only"
                      />
                      <div className={cn(
                        'w-4 h-4 rounded border-2 mr-3 flex items-center justify-center',
                        dietsMain.includes(diet.polish)
                          ? 'bg-orange-500 border-orange-500'
                          : dietsMain.length >= 2 && !dietsMain.includes(diet.polish)
                            ? (isDark ? 'border-slate-600/50 bg-slate-700/50' : 'border-slate-300/50 bg-slate-200/50')
                            : (isDark ? 'border-slate-600' : 'border-slate-300')
                      )}>
                        {dietsMain.includes(diet.polish) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={cn(
                        'text-sm',
                        dietsMain.length >= 2 && !dietsMain.includes(diet.polish)
                          ? (isDark ? 'text-slate-400' : 'text-slate-400')
                          : (isDark ? 'text-slate-200' : 'text-slate-700')
                      )}>
                        {diet.polish}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <WebhookButton
                webhookName="recommend_recipe"
                payload={{
                  ingredients: ingredients,
                  cuisine: getEnglishCuisine(cuisine),
                  meal_type: getEnglishMealTime(mealTime),
                  dietary_restrictions: getEnglishIntolerances(intolerancesMain),
                  diets: getEnglishDiets(dietsMain),
                  recipe_count: parseInt(recipeCount)
                }}
                onLoading={setIsLoadingRecipe}
                onSuccess={handleRecipeFinderSuccess}
                disabled={ingredients.trim().length === 0}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-orange-400 disabled:to-red-500 focus:ring-orange-500"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Uzyskaj Rekomendacje Przepisów
              </WebhookButton>
            </div>

            {/* Results */}
            {isLoadingRecipe && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <LoadingSpinner size={24} thickness={2} colorClassName="border-orange-500" />
                <span className={cn(isDark ? 'text-slate-300' : 'text-slate-700')}>Szukanie przepisów...</span>
              </div>
            )}

                        {recipeResults.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Znalezione Przepisy:</h3>
                {recipeResults.map((recipe, index) => {
                  const colorClass = generateRandomColor(index);
                  const colorVariants = getColorVariants(colorClass);
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedRecipe(selectedRecipe === recipe ? null : recipe)}
                      className={cn(
                        'cursor-pointer transition-all duration-200 rounded-lg p-4 hover:shadow-md',
                        selectedRecipe === recipe
                          ? cn('ring-2', colorVariants.ring, colorVariants.bg, colorVariants.bgDark)
                          : (isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50')
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${colorClass} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <h3 className={cn('text-lg font-semibold whitespace-normal break-words line-clamp-2', isDark ? 'text-slate-100' : 'text-slate-900')}>{recipe.title}</h3>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={cn('w-6 h-6 transition-transform duration-200', selectedRecipe === recipe ? 'rotate-180' : '')}>
                            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {selectedRecipe === recipe && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                          <div className="space-y-4">
                            {/* Recipe Image */}
                            {recipe.image_link && (
                              <div className="flex justify-center">
                                <img 
                                  src={recipe.image_link} 
                                  alt={recipe.title}
                                  className="w-full max-w-md h-48 object-cover rounded-lg shadow-md"
                                />
                              </div>
                            )}
                            
                            {/* Description */}
                            <div>
                              <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Opis</h4>
                              <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{recipe.description}</p>
                            </div>

                            {/* Recipe Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className={cn('flex items-center space-x-3 p-4 rounded-lg border', isDark ? 'bg-slate-800 border-slate-700' : 'bg-amber-50 border-amber-200')}>
                                <DollarSign className={cn('w-6 h-6', isDark ? 'text-amber-400' : 'text-amber-600')} />
                                <div>
                                  <div className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-amber-700')}>Cena za porcję</div>
                                  <div className={cn('text-lg font-semibold', isDark ? 'text-slate-200' : 'text-slate-800')}>{recipe.price_per_serving}</div>
                                </div>
                              </div>
                              <div className={cn('flex items-center space-x-3 p-4 rounded-lg border', isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-200')}>
                                <Clock className={cn('w-6 h-6', isDark ? 'text-blue-400' : 'text-blue-600')} />
                                <div>
                                  <div className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-blue-700')}>Czas przygotowania</div>
                                  <div className={cn('text-lg font-semibold', isDark ? 'text-slate-200' : 'text-slate-800')}>{formatTime(recipe.time_to_make)}</div>
                                </div>
                              </div>
                              <div className={cn('flex items-center space-x-3 p-4 rounded-lg border', isDark ? 'bg-slate-800 border-slate-700' : 'bg-yellow-50 border-yellow-200')}>
                                <Star className={cn('w-6 h-6', isDark ? 'text-yellow-400' : 'text-yellow-600')} />
                                <div>
                                  <div className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-yellow-700')}>Ocena żywieniowa</div>
                                  <div className={cn('text-lg font-semibold', isDark ? 'text-slate-200' : 'text-slate-800')}>{recipe.nutrition_score.toFixed(1)}/100</div>
                                </div>
                              </div>
                            </div>

                            {/* Steps */}
                            <div>
                              <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Instrukcje:</h4>
                              <ol className={cn('list-decimal list-inside space-y-2', isDark ? 'text-slate-400' : 'text-slate-600')}>
                                {recipe.steps.map((step, idx) => (
                                  <li key={idx} className="text-sm">{step}</li>
                                ))}
                              </ol>
                            </div>

                            {/* Nutrition Info */}
                            <div className={cn('p-4 rounded-lg border', isDark ? 'bg-slate-800 border-slate-700' : 'bg-green-50 border-green-200')}>
                              <div className="flex items-center gap-2 mb-4">
                                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', isDark ? 'bg-green-500' : 'bg-green-600')}>
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <h4 className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-green-900')}>Wartości odżywcze (na porcję)</h4>
                              </div>
                              
                              {/* Main macros */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                {[
                                  { key: 'Calories', label: 'Kalorie', color: 'orange' },
                                  { key: 'Protein', label: 'Białko', color: 'blue' },
                                  { key: 'Carbohydrates', label: 'Węglowodany', color: 'purple' },
                                  { key: 'Fat', label: 'Tłuszcze', color: 'red' }
                                ].map(({ key, label, color }) => {
                                  const value = recipe.nutritients[key as keyof typeof recipe.nutritients];
                                  return value ? (
                                    <div key={key} className={cn('p-3 rounded-lg border text-center', 
                                      isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200',
                                      color === 'orange' && 'ring-1 ring-orange-200',
                                      color === 'blue' && 'ring-1 ring-blue-200',
                                      color === 'purple' && 'ring-1 ring-purple-200',
                                      color === 'red' && 'ring-1 ring-red-200'
                                    )}>
                                      <div className={cn('text-xs font-medium mb-1', 
                                        isDark ? 'text-slate-400' : 'text-slate-600'
                                      )}>{label}</div>
                                      <div className={cn('text-lg font-bold', 
                                        color === 'orange' && (isDark ? 'text-orange-400' : 'text-orange-600'),
                                        color === 'blue' && (isDark ? 'text-blue-400' : 'text-blue-600'),
                                        color === 'purple' && (isDark ? 'text-purple-400' : 'text-purple-600'),
                                        color === 'red' && (isDark ? 'text-red-400' : 'text-red-600')
                                      )}>{value}</div>
                                    </div>
                                  ) : null;
                                })}
                              </div>

                              {/* All other nutrients */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {Object.entries(recipe.nutritients)
                                  .filter(([key]) => !['Calories', 'Protein', 'Carbohydrates', 'Fat'].includes(key))
                                  .map(([key, value]) => (
                                    <div key={key} className={cn('flex items-center justify-between p-2 rounded border', 
                                      isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'
                                    )}>
                                      <span className={cn('text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>{getPolishNutrientName(key)}</span>
                                      <span className={cn('text-xs font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>{value}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            {/* External Link */}
                            {recipe.food_link && (
                              <div className="pt-2">
                                <a 
                                  href={recipe.food_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={cn('inline-flex items-center space-x-2 text-sm font-medium hover:underline', isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700')}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  <span>Zobacz więcej informacji pod tym linkiem</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Random Recipe Section */}
          <div className={cn('mt-8 rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <Shuffle className="w-5 h-5 text-white" />
              </div>
              <h2 className={cn('text-2xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Losowy Przepis</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cuisine Type */}
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
                    <option key={opt.english} value={opt.polish}>{opt.polish}</option>
                  ))}
                </select>
              </div>

              {/* Intolerances */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Nietolerancje (Opcjonalne)</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {INTOLERANCE_OPTIONS.map((intolerance) => (
                    <label
                      key={intolerance.english}
                      className={cn(
                        'flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200',
                        intolerancesRandom.includes(intolerance.polish)
                          ? (isDark ? 'bg-orange-500/20 border-orange-500/50' : 'bg-orange-50 border-orange-300')
                          : (isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50')
                      )}
                    >
                <input
                        type="checkbox"
                        checked={intolerancesRandom.includes(intolerance.polish)}
                        onChange={() => handleIntoleranceChange(intolerance.polish, false)}
                        className="sr-only"
                      />
                      <div className={cn(
                        'w-4 h-4 rounded border-2 mr-3 flex items-center justify-center',
                        intolerancesRandom.includes(intolerance.polish)
                          ? 'bg-orange-500 border-orange-500'
                          : (isDark ? 'border-slate-600' : 'border-slate-300')
                      )}>
                        {intolerancesRandom.includes(intolerance.polish) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={cn(
                        'text-sm',
                        isDark ? 'text-slate-200' : 'text-slate-700'
                      )}>
                        {intolerance.polish}
                      </span>
                    </label>
                    ))}
                  </div>
              </div>

              {/* Diet */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Dieta (Opcjonalne, max 2)</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {DIET_OPTIONS.map((diet) => (
                    <label
                      key={diet.english}
                      className={cn(
                        'flex items-center p-3 rounded-lg border transition-all duration-200',
                        dietsRandom.includes(diet.polish)
                          ? (isDark ? 'bg-orange-500/20 border-orange-500/50' : 'bg-orange-50 border-orange-300')
                          : dietsRandom.length >= 2 && !dietsRandom.includes(diet.polish)
                            ? (isDark ? 'bg-slate-800/50 border-slate-600/50 opacity-50' : 'bg-slate-100 border-slate-200 opacity-50')
                            : (isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 cursor-pointer' : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'),
                        dietsRandom.length >= 2 && !dietsRandom.includes(diet.polish) ? 'cursor-not-allowed' : 'cursor-pointer'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={dietsRandom.includes(diet.polish)}
                        onChange={() => handleDietChange(diet.polish, false)}
                        disabled={dietsRandom.length >= 2 && !dietsRandom.includes(diet.polish)}
                        className="sr-only"
                      />
                      <div className={cn(
                        'w-4 h-4 rounded border-2 mr-3 flex items-center justify-center',
                        dietsRandom.includes(diet.polish)
                          ? 'bg-orange-500 border-orange-500'
                          : dietsRandom.length >= 2 && !dietsRandom.includes(diet.polish)
                            ? (isDark ? 'border-slate-600/50 bg-slate-700/50' : 'border-slate-300/50 bg-slate-200/50')
                            : (isDark ? 'border-slate-600' : 'border-slate-300')
                      )}>
                        {dietsRandom.includes(diet.polish) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={cn(
                        'text-sm',
                        dietsRandom.length >= 2 && !dietsRandom.includes(diet.polish)
                          ? (isDark ? 'text-slate-400' : 'text-slate-400')
                          : (isDark ? 'text-slate-200' : 'text-slate-700')
                      )}>
                        {diet.polish}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <WebhookButton
                webhookName="generate_random_recipe"
                payload={{
                  cuisine: getEnglishCuisine(randomCuisine),
                  dietary_restrictions: getEnglishIntolerances(intolerancesRandom),
                  diets: getEnglishDiets(dietsRandom)
                }}
                onLoading={setIsLoadingRandom}
                onSuccess={handleRandomRecipeSuccess}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-orange-400 disabled:to-red-500 focus:ring-orange-500"
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  Uzyskaj Losowe Przepisy
              </WebhookButton>
            </div>

            {/* Results */}
            {isLoadingRandom && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <LoadingSpinner size={24} thickness={2} colorClassName="border-orange-500" />
                <span className={cn(isDark ? 'text-slate-300' : 'text-slate-700')}>Generowanie losowych przepisów...</span>
              </div>
            )}

                        {randomResults.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Losowe Przepisy:</h3>
                {randomResults.map((recipe, index) => {
                  const colorClass = generateRandomColor(index);
                  const colorVariants = getColorVariants(colorClass);
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedRandomRecipe(selectedRandomRecipe === recipe ? null : recipe)}
                      className={cn(
                        'cursor-pointer transition-all duration-200 rounded-lg p-4 hover:shadow-md',
                        selectedRandomRecipe === recipe
                          ? cn('ring-2', colorVariants.ring, colorVariants.bg, colorVariants.bgDark)
                          : (isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50')
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${colorClass} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <h3 className={cn('text-lg font-semibold whitespace-normal break-words line-clamp-2', isDark ? 'text-slate-100' : 'text-slate-900')}>{recipe.title}</h3>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={cn('w-6 h-6 transition-transform duration-200', selectedRandomRecipe === recipe ? 'rotate-180' : '')}>
                            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {selectedRandomRecipe === recipe && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                          <div className="space-y-4">
                            {/* Recipe Image */}
                            {recipe.image_link && (
                              <div className="flex justify-center">
                                <img 
                                  src={recipe.image_link} 
                                  alt={recipe.title}
                                  className="w-full max-w-md h-48 object-cover rounded-lg shadow-md"
                                />
                              </div>
                            )}
                            
                            {/* Description */}
                            <div>
                              <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Opis</h4>
                              <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{recipe.description}</p>
                            </div>

                            {/* Recipe Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className={cn('flex items-center space-x-3 p-4 rounded-lg border', isDark ? 'bg-slate-800 border-slate-700' : 'bg-amber-50 border-amber-200')}>
                                <DollarSign className={cn('w-6 h-6', isDark ? 'text-amber-400' : 'text-amber-600')} />
                                <div>
                                  <div className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-amber-700')}>Cena za porcję</div>
                                  <div className={cn('text-lg font-semibold', isDark ? 'text-slate-200' : 'text-slate-800')}>{recipe.price_per_serving}</div>
                                </div>
                              </div>
                              <div className={cn('flex items-center space-x-3 p-4 rounded-lg border', isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-200')}>
                                <Clock className={cn('w-6 h-6', isDark ? 'text-blue-400' : 'text-blue-600')} />
                                <div>
                                  <div className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-blue-700')}>Czas przygotowania</div>
                                  <div className={cn('text-lg font-semibold', isDark ? 'text-slate-200' : 'text-slate-800')}>{formatTime(recipe.time_to_make)}</div>
                                </div>
                              </div>
                              <div className={cn('flex items-center space-x-3 p-4 rounded-lg border', isDark ? 'bg-slate-800 border-slate-700' : 'bg-yellow-50 border-yellow-200')}>
                                <Star className={cn('w-6 h-6', isDark ? 'text-yellow-400' : 'text-yellow-600')} />
                                <div>
                                  <div className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-yellow-700')}>Ocena żywieniowa</div>
                                  <div className={cn('text-lg font-semibold', isDark ? 'text-slate-200' : 'text-slate-800')}>{recipe.nutrition_score.toFixed(1)}/100</div>
                                </div>
                              </div>
                            </div>

                            {/* Steps */}
                            <div>
                              <h4 className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>Instrukcje:</h4>
                              <ol className={cn('list-decimal list-inside space-y-2', isDark ? 'text-slate-400' : 'text-slate-600')}>
                                {recipe.steps.map((step, idx) => (
                                  <li key={idx} className="text-sm">{step}</li>
                                ))}
                              </ol>
                            </div>

                            {/* Nutrition Info */}
                            <div className={cn('p-4 rounded-lg border', isDark ? 'bg-slate-800 border-slate-700' : 'bg-green-50 border-green-200')}>
                              <div className="flex items-center gap-2 mb-4">
                                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', isDark ? 'bg-green-500' : 'bg-green-600')}>
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <h4 className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-green-900')}>Wartości odżywcze (na porcję)</h4>
                              </div>
                              
                              {/* Main macros */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                {[
                                  { key: 'Calories', label: 'Kalorie', color: 'orange' },
                                  { key: 'Protein', label: 'Białko', color: 'blue' },
                                  { key: 'Carbohydrates', label: 'Węglowodany', color: 'purple' },
                                  { key: 'Fat', label: 'Tłuszcze', color: 'red' }
                                ].map(({ key, label, color }) => {
                                  const value = recipe.nutritients[key as keyof typeof recipe.nutritients];
                                  return value ? (
                                    <div key={key} className={cn('p-3 rounded-lg border text-center', 
                                      isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200',
                                      color === 'orange' && 'ring-1 ring-orange-200',
                                      color === 'blue' && 'ring-1 ring-blue-200',
                                      color === 'purple' && 'ring-1 ring-purple-200',
                                      color === 'red' && 'ring-1 ring-red-200'
                                    )}>
                                      <div className={cn('text-xs font-medium mb-1', 
                                        isDark ? 'text-slate-400' : 'text-slate-600'
                                      )}>{label}</div>
                                      <div className={cn('text-lg font-bold', 
                                        color === 'orange' && (isDark ? 'text-orange-400' : 'text-orange-600'),
                                        color === 'blue' && (isDark ? 'text-blue-400' : 'text-blue-600'),
                                        color === 'purple' && (isDark ? 'text-purple-400' : 'text-purple-600'),
                                        color === 'red' && (isDark ? 'text-red-400' : 'text-red-600')
                                      )}>{value}</div>
                                    </div>
                                  ) : null;
                                })}
                              </div>

                              {/* All other nutrients */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {Object.entries(recipe.nutritients)
                                  .filter(([key]) => !['Calories', 'Protein', 'Carbohydrates', 'Fat'].includes(key))
                                  .map(([key, value]) => (
                                    <div key={key} className={cn('flex items-center justify-between p-2 rounded border', 
                                      isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'
                                    )}>
                                      <span className={cn('text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>{getPolishNutrientName(key)}</span>
                                      <span className={cn('text-xs font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>{value}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            {/* External Link */}
                            {recipe.food_link && (
                              <div className="pt-2">
                                <a 
                                  href={recipe.food_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={cn('inline-flex items-center space-x-2 text-sm font-medium hover:underline', isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700')}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  <span>Zobacz więcej informacji pod tym linkiem</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <ThemeToggle />
      </div>
    </ErrorBoundary>
  );
}
