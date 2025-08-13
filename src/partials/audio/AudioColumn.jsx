import React from 'react';

const colorClasses = {
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
};

function AudioColumn({ title, color = 'gray', count = 0, children, actionButton }) {
  return (
    <div className="flex-shrink-0 w-80">
      {/* Column header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
              {title}
            </h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[color]}`}>
              {count}
            </span>
          </div>
          {actionButton && (
            <div className="ml-auto">
              {actionButton}
            </div>
          )}
        </div>
        
        {/* Cards container */}
        <div className="space-y-4 min-h-96">
          {children}
          
          {/* Empty state */}
          {count === 0 && (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                No files in {title.toLowerCase()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AudioColumn;