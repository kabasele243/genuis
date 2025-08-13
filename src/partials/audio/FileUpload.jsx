import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function FileUpload({ onFilesAdded }) {
  const onDrop = useCallback((acceptedFiles) => {
    console.log('Files dropped:', acceptedFiles);
    
    // Log file details for debugging
    acceptedFiles.forEach(file => {
      console.log(`File: ${file.name}, Type: ${file.type}, Size: ${file.size}`);
    });
    
    const audioFiles = acceptedFiles.filter(file => {
      const isAudioType = file.type.startsWith('audio/');
      const hasAudioExtension = ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.mp4', '.mov', '.avi', '.mkv'].some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      
      console.log(`File ${file.name}: audioType=${isAudioType}, audioExt=${hasAudioExtension}`);
      return isAudioType || hasAudioExtension;
    });
    
    console.log('Filtered audio files:', audioFiles);
    
    if (audioFiles.length > 0) {
      console.log('Calling onFilesAdded with:', audioFiles);
      onFilesAdded(audioFiles);
    } else {
      console.log('No audio files found in dropped files');
    }
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
        ${isDragActive 
          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center">
        {/* Upload Icon */}
        <div className="w-16 h-16 mb-4 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        {/* Text */}
        <div className="mb-2">
          {isDragActive ? (
            <p className="text-lg font-medium text-violet-600 dark:text-violet-400">
              Drop audio/video files here...
            </p>
          ) : (
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Drag & drop audio/video files here
            </p>
          )}
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          or click to select files
        </p>
        
        {/* Supported formats */}
        <div className="flex flex-wrap gap-2 justify-center">
          {['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.mp4', '.mov', '.avi', '.mkv'].map(format => (
            <span 
              key={format}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
            >
              {format}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FileUpload;