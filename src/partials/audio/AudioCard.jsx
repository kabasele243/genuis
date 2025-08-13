import React, { useState } from 'react';

function AudioCard({ file, onProcessText, showProcessButton = false, onTranscribe, onGenerateAudio }) {
  const [showTranscription, setShowTranscription] = useState(false);
  const [showProcessedText, setShowProcessedText] = useState(false);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration (if available)
  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status color
  const getStatusColor = () => {
    switch (file.status) {
      case 'upload': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'transcribing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'generating': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'complete': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 w-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate flex-1 mr-2">
            {file.name}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor()}`}>
            {file.status}
          </span>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span>{formatFileSize(file.size)}</span>
          {file.duration && <span> • {formatDuration(file.duration)}</span>}
        </div>
      </div>

      {/* Progress bar */}
      {file.progress > 0 && file.progress < 100 && (
        <div className="mb-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-violet-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {file.progress}% complete
          </div>
        </div>
      )}

      {/* Error message */}
      {file.error && (
        <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
          {file.error}
        </div>
      )}

      {/* Original audio player */}
      {file.file && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Original Audio
          </label>
          <audio 
            controls 
            className="w-full h-8"
            src={URL.createObjectURL(file.file)}
          />
        </div>
      )}

      {/* Transcription */}
      {file.transcription && (
        <div className="mb-4">
          <button
            onClick={() => setShowTranscription(!showTranscription)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Transcription
            </span>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showTranscription ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTranscription && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
              {file.transcription}
            </div>
          )}
        </div>
      )}

      {/* Processed text */}
      {file.processedText && (
        <div className="mb-4">
          <button
            onClick={() => setShowProcessedText(!showProcessedText)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Enhanced Text
            </span>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showProcessedText ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showProcessedText && (
            <div className="mt-2 p-2 bg-violet-50 dark:violet-900/20 rounded text-xs text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto border border-violet-200 dark:border-violet-800">
              {file.processedText}
            </div>
          )}
        </div>
      )}

      {/* Generated audio player */}
      {file.audioUrl && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Generated Audio
          </label>
          <audio 
            controls 
            className="w-full h-8"
            src={file.audioUrl}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        {/* Transcribe button for files in upload status */}
        {file.status === 'upload' && onTranscribe && (
          <button
            onClick={() => onTranscribe(file.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Transcribe</span>
          </button>
        )}
        
        {/* Process Text button for files with transcription */}
        {showProcessButton && (
          <button
            onClick={onProcessText}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Enhance</span>
          </button>
        )}
        
        {/* Generate Audio button for files in processing status */}
        {file.status === 'processing' && file.processedText && onGenerateAudio && (
          <button
            onClick={() => onGenerateAudio(file.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span>Generate</span>
          </button>
        )}
        
        {/* Download button for completed files */}
        {file.audioUrl && (
          <a
            href={file.audioUrl}
            download={`${file.name.replace(/\.[^/.]+$/, '')}_regenerated.wav`}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </a>
        )}
      </div>

      {/* Timestamp */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-400 dark:text-gray-500">
          Added {file.createdAt.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default AudioCard;