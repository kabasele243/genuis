import React from 'react';
import { Link } from 'react-router-dom';

function AudioJobCard({ file }) {

  const getStatusColor = (status) => {
    switch (status) {
      case 'upload':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'transcribing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'generating':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'complete':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upload':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-500">
            <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
        );
      case 'transcribing':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-500">
            <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
        );
      case 'processing':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-yellow-500">
            <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
              <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
        );
      case 'generating':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-purple-500">
            <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </div>
        );
      case 'complete':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-green-500">
            <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-500">
            <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-500">
            <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
              <path d="M9 19V6l12 7-12 6z"/>
            </svg>
          </div>
        );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'upload': return 'Uploaded';
      case 'transcribing': return 'Transcribing';
      case 'processing': return 'Processing';
      case 'generating': return 'Generating';
      case 'complete': return 'Complete';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <div className="flex flex-col h-full p-5">
        <header>
          <div className="flex items-center justify-between">
            {getStatusIcon(file.status)}
            <div className="flex items-center gap-2">
              {file.progress > 0 && file.progress < 100 && (
                <div className="w-8 h-8 relative">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200 dark:text-gray-700"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-violet-500"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={`${file.progress}, 100`}
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {file.progress}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <div className="grow mt-3">
          <Link className="inline-flex text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white mb-1" to="/audio-regeneration">
            <h2 className="text-lg leading-snug font-semibold truncate">{file.name}</h2>
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {formatFileSize(file.size)} • {formatDuration(file.duration)}
          </div>
          {file.error && (
            <div className="text-sm text-red-600 dark:text-red-400 mb-2">
              {file.error}
            </div>
          )}
          {file.transcription && (
            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {file.transcription.substring(0, 100)}...
            </div>
          )}
        </div>
        
        <footer className="mt-4">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Started {file.createdAt} • Updated {file.updatedAt}
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className={`text-xs inline-flex font-medium rounded-full text-center px-2.5 py-1 ${getStatusColor(file.status)}`}>
                {getStatusDisplay(file.status)}
              </div>
            </div>
            <div>
              <Link className="text-sm font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" to="/audio-regeneration">
                View →
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AudioJobCard;