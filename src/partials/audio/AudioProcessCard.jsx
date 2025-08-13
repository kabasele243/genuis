import React from 'react';
import { Link } from 'react-router-dom';

function AudioProcessCard({ step, title, description, icon, color, link, status, count = 0 }) {

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          count: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500', 
          badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
          count: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500',
          badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', 
          count: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
        };
      case 'green':
        return {
          bg: 'bg-green-500',
          badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          count: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
        };
      default:
        return {
          bg: 'bg-gray-500',
          badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
          count: 'bg-gray-50 text-gray-600 dark:bg-gray-700/20 dark:text-gray-400'
        };
    }
  };

  const colors = getColorClasses(color);

  const renderIcon = () => {
    switch (icon) {
      case 'upload':
        return (
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        );
      case 'transcribe':
        return (
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'process':
        return (
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 15L6 12.5l1.4-1.4 3.1 3.1L16.6 8l1.4 1.4L10.5 17z"/>
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        );
      case 'complete':
        return (
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <div className="flex flex-col h-full p-5">
        <header>
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${colors.bg}`}>
              {renderIcon()}
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.count}`}>
                Step {step}
              </span>
              {count > 0 && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}>
                  {count} files
                </span>
              )}
            </div>
          </div>
        </header>
        
        <div className="grow mt-4">
          <Link className="inline-flex text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white mb-2" to={link}>
            <h2 className="text-xl leading-snug font-semibold">{title}</h2>
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
        </div>
        
        <footer className="mt-5">
          <div className="flex justify-between items-center">
            <div>
              <div className={`text-xs inline-flex font-medium rounded-full text-center px-2.5 py-1 ${colors.badge}`}>
                {status}
              </div>
            </div>
            <div>
              <Link className="text-sm font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" to={link}>
                Open →
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AudioProcessCard;