'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RichEditor from '@/components/RichEditor';
import WebhookButton from '@/components/WebhookButton';
import ErrorBoundary from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';
import FileUpload from '@/components/FileUpload';
import { ArrowLeft, FileText, Scissors, BookOpen, Paperclip } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SummarizerResponse, FileAttachment } from '@/lib/webhook_config';
import { sanitizeHtml } from '@/lib/sanitize';
import { cn } from '@/lib/utils';
import useTheme from '@/lib/useTheme';

// Function to format text with markdown-style formatting
const formatSummaryText = (text: string): string => {
  if (!text) return '';
  
  let formatted = text
    // Convert escaped \n to actual newlines first, then to <br> tags
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    // Convert actual newlines to <br> tags
    .replace(/\n/g, '<br>');
  
  // Convert ***text*** to <strong><em>text</em></strong> (bold and italic)
  formatted = formatted.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  
  // Convert **text** to <strong>text</strong> (bold) - using non-greedy and more specific pattern
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert *text* to <em>text</em> (italic) - only if not already processed
  formatted = formatted.replace(/(?<!<strong>)\*([^*]+)\*(?!<\/strong>)/g, '<em>$1</em>');
  
  return formatted;
};

export default function SummarizerPage() {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useTheme();

  // Theme handled by useTheme hook

  const handleSuccess = (data: unknown) => {
    const responseData = data as SummarizerResponse;
    
    // Try to get the actual text from different possible locations
    let rawResult = '';
    
    if (responseData.output?.sanitized) {
      rawResult = responseData.output.sanitized;
    } else if (responseData.output?.text) {
      rawResult = responseData.output.text;
    } else if (responseData.summary && responseData.summary !== '{{ $json.output.sanitized }}') {
      rawResult = responseData.summary;
    } else if (responseData.result) {
      rawResult = responseData.result;
    } else {
      rawResult = JSON.stringify(data);
    }
    
    setResult(rawResult);
  };

  const handleError = (error: unknown) => {
    console.error('Summarizer error:', error);
  };

  const handleFilesChange = (files: FileAttachment[]) => {
    setAttachments(files);
  };

  // Format the result for display
  const formattedResult = sanitizeHtml(formatSummaryText(result));

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
              title="Summarizer"
              description="AI-powered text summarization with rich formatting preservation"
              accent="blue"
              isDark={isDark}
              icon={<FileText className="w-8 h-8" />}
            />
          </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input and Attachments */}
          <div className="space-y-6">
            {/* Input Section */}
            <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Input Text</h2>
                </div>
                <RichEditor 
                  value={content}
                  onChange={setContent}
                  placeholder="Paste or type your article, document, or any text you'd like to summarize..."
                  forceLight={!isDark}
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className={cn('rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Paperclip className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Attachments (Optional)</h2>
                </div>
                <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-600')}>
                  Upload up to 3 files to include in your summary. Supported: Images, Text Files, Spreadsheets, Code Files.
                </p>
                <FileUpload 
                  onFilesChange={handleFilesChange}
                  maxFiles={3}
                  maxFileSize={8 * 1024 * 1024} // 8MB
                  maxTotalSize={24 * 1024 * 1024} // 24MB
                />
              </div>
            </div>

            {/* Action Button now sits below the left column content on small screens and aligns bottom on lg */}
            <div className="hidden lg:block" />

            {/* Loading State */}
            {isLoading && (
              <div className={cn('rounded-2xl p-4 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-200')}>
                <div className="flex items-center gap-3 text-sm">
                  <LoadingSpinner size={20} thickness={2} colorClassName="border-blue-500" />
                  <span className={cn(isDark ? 'text-slate-300' : 'text-slate-700')}>Processing your text...</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="flex flex-col h-full">
            <div className={cn('rounded-2xl p-6 shadow-sm ring-1 min-h-[420px] flex flex-col', isDark ? 'bg-slate-900 ring-slate-800' : 'bg-blue-50 ring-blue-100')}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className={cn('text-xl font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>Summary</h2>
              </div>
              {result ? (
                <div 
                  className={cn('prose max-w-none flex-1', isDark ? 'prose-invert' : 'prose-slate')}
                  dangerouslySetInnerHTML={{ __html: formattedResult }}
                  style={{ lineHeight: '1.6' }}
                />
              ) : (
                <div className={cn('flex-1 border-2 border-dashed rounded-xl flex items-center justify-center text-center p-8', isDark ? 'border-slate-700' : 'border-blue-200')}>
                  <div>
                    <FileText className={cn('mx-auto mb-3', isDark ? 'text-slate-400' : 'text-blue-500')} />
                    <p className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>Your AI-generated summary will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button positioned under the summary card for better balance */}
            <div className="mt-4 lg:mt-6 self-start">
              <div className="relative">
                <div className={cn('absolute inset-0 rounded-xl blur-xl', isDark ? 'bg-indigo-500/10' : 'bg-blue-500/10')}></div>
                <div className="relative">
                  <WebhookButton
                    webhookName="summarizer"
                    payload={{ 
                      text: content,
                      attachments: attachments
                    }}
                    onLoading={setIsLoading}
                    onSuccess={handleSuccess}
                    onError={handleError}
                    disabled={!content.trim() && attachments.length === 0}
                  >
                    <Scissors className="w-5 h-5 mr-2" />
                    Generate Summary
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