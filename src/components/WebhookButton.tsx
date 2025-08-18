'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface WebhookButtonProps {
  webhookName: string;
  payload: Record<string, unknown>;
  onLoading?: (loading: boolean) => void;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function WebhookButton({
  webhookName,
  payload,
  onLoading,
  onSuccess,
  onError,
  children,
  className,
  disabled = false
}: WebhookButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    onLoading?.(true);

    try {
      const response = await api.post(`/api/webhook/${webhookName}`, payload);

      toast.success('Żądanie zakończone pomyślnie!');
      onSuccess?.(response.data);
    } catch (error: unknown) {
      console.error('Webhook error:', error);
      
      // More robust error handling
      let errorMessage = 'Wystąpił błąd podczas przetwarzania Twojego żądania';
      
      if (error && typeof error === 'object') {
        if ('response' in error && error.response && typeof error.response === 'object') {
          const response = error.response as { data?: { message?: string; error?: string }; status?: number };
          if (response.data && typeof response.data === 'object') {
            if ('message' in response.data && response.data.message) {
              errorMessage = response.data.message;
            } else if ('error' in response.data && response.data.error) {
              errorMessage = response.data.error;
            } else if (response.status) {
              errorMessage = `Błąd serwera: ${response.status}`;
            }
          }
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      onError?.(error);
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={cn(
        "px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-emerald-400 disabled:to-teal-500",
        "text-white font-medium rounded-lg transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
        "disabled:cursor-not-allowed",
        "transform active:scale-95 hover:scale-105",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size={16} thickness={2} className="text-white" colorClassName="border-white" />
          <span>Przetwarzanie...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
} 