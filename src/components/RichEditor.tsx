'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Bold, Italic, Underline, RotateCcw } from 'lucide-react';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  forceLight?: boolean;
}

export default function RichEditor({ value, onChange, placeholder = "Enter your text here...", className, forceLight = false }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      // Basic sanitization to prevent XSS
      const content = editorRef.current.innerHTML;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Remove any script tags or dangerous attributes
      const scripts = tempDiv.querySelectorAll('script');
      scripts.forEach(script => script.remove());
      
      // Remove any onclick or other event handlers
      const elementsWithEvents = tempDiv.querySelectorAll('[onclick], [onload], [onerror]');
      elementsWithEvents.forEach(el => {
        el.removeAttribute('onclick');
        el.removeAttribute('onload');
        el.removeAttribute('onerror');
      });
      
      onChange(tempDiv.innerHTML);
    }
  };

  const formatText = (command: string, value?: string) => {
    // Use modern selection API instead of deprecated execCommand
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      switch (command) {
        case 'bold':
          document.execCommand('bold', false);
          break;
        case 'italic':
          document.execCommand('italic', false);
          break;
        case 'underline':
          document.execCommand('underline', false);
          break;
        default:
          document.execCommand(command, false, value);
      }
    }
    editorRef.current?.focus();
    handleInput();
  };

  const clearFormatting = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      onChange('');
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Formatting toolbar */}
      <div className={cn(
        'flex items-center space-x-2 p-2 rounded-lg ring-1',
        forceLight ? 'ring-slate-200 bg-white' : 'ring-slate-200 bg-white dark:bg-slate-800 dark:ring-slate-700'
      )}>
        <button
          type="button"
          onClick={() => formatText('bold')}
          className={cn(
            'p-2 rounded transition-colors',
            forceLight
              ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
          )}
          title="Bold"
          aria-label="Make text bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className={cn(
            'p-2 rounded transition-colors',
            forceLight
              ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
          )}
          title="Italic"
          aria-label="Make text italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className={cn(
            'p-2 rounded transition-colors',
            forceLight
              ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
          )}
          title="Underline"
          aria-label="Underline text"
        >
          <Underline size={16} />
        </button>
        <div className={cn('w-px h-6', forceLight ? 'bg-slate-200' : 'bg-slate-200 dark:bg-slate-600')} />
        <button
          type="button"
          onClick={clearFormatting}
          className={cn(
            'p-2 rounded transition-colors',
            forceLight
              ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
          )}
          title="Clear formatting"
          aria-label="Clear all formatting"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* ContentEditable div */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        role="textbox"
        aria-label="Text editor"
        aria-multiline="true"
        className={cn(
          'min-h-[200px] p-4 rounded-lg transition-colors',
          'ring-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
          forceLight
            ? 'ring-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
            : 'ring-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:ring-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500'
        )}
        style={{ 
          minHeight: '200px',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        data-placeholder={placeholder}
      />
      
      {/* Placeholder styling */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
} 