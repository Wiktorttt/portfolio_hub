'use client';

import Link from 'next/link';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ArrowLeft, Construction } from 'lucide-react';

export default function WorkInProgress2Page() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-slate-400 hover:text-slate-300 mb-4 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Hub
            </Link>
            
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-500/10 to-gray-600/10 rounded-xl p-6 border border-slate-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-gray-600/5"></div>
              <div className="relative flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-lg">
                  <Construction className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-100 mb-2">
                    Work in Progress 2
                  </h1>
                  <p className="text-slate-300 text-lg">
                    This feature is currently under development
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
