import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import AudioColumn from '../partials/audio/AudioColumn';
import AudioCard from '../partials/audio/AudioCard';
import FileUpload from '../partials/audio/FileUpload';
import TextProcessingModal from '../partials/audio/TextProcessingModal';
import SettingsModal from '../partials/audio/SettingsModal';

function AudioRegeneration() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Load settings from localStorage or use defaults
  const getDefaultSettings = () => ({
    textProcessing: {
      prompt: 'Improve clarity, fix grammar, and enhance readability while maintaining the original meaning',
      instructions: 'Keep technical terms unchanged, maintain the original tone and style'
    },
    voice: {
      voiceId: 'af_heart',
      speed: 1.0,
      pitch: 1.0,
      responseFormat: 'mp3'
    }
  });

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('audioRegenerationSettings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        // Merge with defaults to ensure all properties exist
        return {
          ...getDefaultSettings(),
          ...parsedSettings,
          textProcessing: {
            ...getDefaultSettings().textProcessing,
            ...parsedSettings.textProcessing
          },
          voice: {
            ...getDefaultSettings().voice,
            ...parsedSettings.voice
          }
        };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return getDefaultSettings();
  };

  const [settings, setSettings] = useState(loadSettings());

  // Save settings to localStorage
  const saveSettings = (newSettings) => {
    try {
      localStorage.setItem('audioRegenerationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSettings(newSettings); // Still update state even if localStorage fails
    }
  };

  // Audio processing workflow stages
  const columns = [
    { id: 'upload', title: 'Upload', color: 'gray' },
    { id: 'transcribing', title: 'Transcribing', color: 'blue' },
    { id: 'processing', title: 'Processing', color: 'yellow' },
    { id: 'generating', title: 'Audio Generation', color: 'purple' },
    { id: 'complete', title: 'Complete', color: 'green' }
  ];

  // Add new audio files
  const handleFilesAdded = useCallback((files) => {
    console.log('handleFilesAdded called with:', files);
    
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      status: 'upload',
      transcription: null,
      processedText: null,
      audioUrl: null,
      progress: 0,
      error: null,
      createdAt: new Date()
    }));
    
    console.log('New files created:', newFiles);
    setAudioFiles(prev => {
      console.log('Previous files:', prev);
      const updated = [...prev, ...newFiles];
      console.log('Updated files:', updated);
      return updated;
    });
  }, []);

  // Move file to next stage
  const moveFile = useCallback((fileId, newStatus) => {
    setAudioFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, status: newStatus, progress: 0 }
          : file
      )
    );
  }, []);

  // Update file progress
  const updateFileProgress = useCallback((fileId, progress, updates = {}) => {
    setAudioFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, progress, ...updates }
          : file
      )
    );
  }, []);

  // Transcribe a single file
  const transcribeFile = async (fileId) => {
    const file = audioFiles.find(f => f.id === fileId);
    if (!file) return;
    
    try {
      moveFile(file.id, 'transcribing');
      updateFileProgress(file.id, 0);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file.file);
      
      updateFileProgress(file.id, 50);
      
      // Call Whisper API  
      const response = await fetch('http://localhost:8080/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Transcription failed');
      
      const result = await response.json();
      updateFileProgress(file.id, 100, { 
        transcription: result.text,
        error: null 
      });
      
    } catch (error) {
      updateFileProgress(file.id, 0, { 
        error: error.message,
        status: 'upload'
      });
    }
  };

  // Transcribe all files in upload column
  const transcribeAll = async () => {
    setIsTranscribing(true);
    try {
      const uploadFiles = audioFiles.filter(file => file.status === 'upload');
      for (const file of uploadFiles) {
        await transcribeFile(file.id);
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  // Open text processing modal
  const openProcessingModal = (fileId) => {
    const file = audioFiles.find(f => f.id === fileId);
    if (!file || !file.transcription) return;
    
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  // Update file from modal
  const updateFileFromModal = (fileId, updates) => {
    setAudioFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, ...updates }
          : file
      )
    );
  };

  // Generate audio for a single file
  const generateAudio = async (fileId) => {
    const file = audioFiles.find(f => f.id === fileId);
    if (!file || !file.processedText) return;
    
    try {
      moveFile(file.id, 'generating');
      updateFileProgress(file.id, 0);
      
      // Call Kokoro TTS API with settings
      const response = await fetch('http://localhost:8880/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: file.processedText,
          voice: settings.voice.voiceId,
          response_format: settings.voice.responseFormat,
          stream: false
        })
      });
      
      if (!response.ok) throw new Error('Audio generation failed');
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      updateFileProgress(file.id, 100, { 
        audioUrl,
        error: null 
      });
      moveFile(file.id, 'complete');
      
    } catch (error) {
      updateFileProgress(file.id, 0, { 
        error: error.message,
        status: 'processing'
      });
    }
  };

  // Generate audio for all files in processing column
  const generateAudioAll = async () => {
    setIsGenerating(true);
    try {
      const processingFiles = audioFiles.filter(file => 
        file.status === 'processing' && file.processedText
      );
      for (const file of processingFiles) {
        await generateAudio(file.id);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Get files for each column
  const getFilesForColumn = (columnId) => {
    return audioFiles.filter(file => file.status === columnId);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      {/* Sidebar */}
      {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  Regen
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload, transcribe, enhance, and regenerate audio files
                </p>
              </div>

              {/* Right: Settings Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </div>
            </div>

            {/* File Upload Zone */}
            <div className="mb-8">
              <FileUpload onFilesAdded={handleFilesAdded} />
            </div>

            {/* Kanban Columns */}
            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f3f4f6'
            }}>
              {columns.map(column => (
                <AudioColumn
                  key={column.id}
                  title={column.title}
                  color={column.color}
                  count={getFilesForColumn(column.id).length}
                  actionButton={
                    column.id === 'upload' && getFilesForColumn('upload').length > 0 ? (
                      <button 
                        onClick={transcribeAll}
                        disabled={isTranscribing || audioFiles.some(f => f.status === 'transcribing')}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          isTranscribing || audioFiles.some(f => f.status === 'transcribing')
                            ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                            : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        }`}
                      >
                        {isTranscribing ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        <span>{isTranscribing ? 'Processing...' : 'All'}</span>
                      </button>
                    ) : column.id === 'processing' && getFilesForColumn('processing').filter(f => f.processedText).length > 0 ? (
                      <button 
                        onClick={generateAudioAll}
                        disabled={isGenerating || audioFiles.some(f => f.status === 'generating')}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          isGenerating || audioFiles.some(f => f.status === 'generating')
                            ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                            : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                        }`}
                      >
                        {isGenerating ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        <span>{isGenerating ? 'Processing...' : 'All'}</span>
                      </button>
                    ) : null
                  }
                >
                  {getFilesForColumn(column.id).map(file => (
                    <AudioCard
                      key={file.id}
                      file={file}
                      onProcessText={() => openProcessingModal(file.id)}
                      showProcessButton={column.id === 'transcribing' && file.transcription && !file.error}
                      onTranscribe={transcribeFile}
                      onGenerateAudio={generateAudio}
                    />
                  ))}
                </AudioColumn>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Text Processing Modal */}
      <TextProcessingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        file={selectedFile}
        onUpdateFile={updateFileFromModal}
        settings={settings}
      />
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={saveSettings}
      />
    </div>
  );
}

export default AudioRegeneration;