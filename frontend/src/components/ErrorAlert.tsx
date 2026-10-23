import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-red-50 border border-red-200 text-red-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-sm text-red-900">Backend Communication Error</h3>
          <p className="text-xs text-red-700 mt-0.5">{message}</p>
          <p className="text-[11px] text-red-600/90 mt-1">
            Ensure the FastAPI server is running on <code className="bg-red-100 px-1 py-0.5 rounded font-mono">https://dev-mini-project.onrender.com</code>.
          </p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
};
