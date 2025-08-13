import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import AudioColumn from '../partials/audio/AudioColumn';
import AudioCard from '../partials/audio/AudioCard';
import FileUpload from '../partials/audio/FileUpload';
import TextProcessingModal from '../partials/audio/TextProcessingModal';

function AudioRegeneration() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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

  // Transcribe all files in upload column
  const transcribeAll = async () => {
    const uploadFiles = audioFiles.filter(file => file.status === 'upload');
    
    for (const file of uploadFiles) {
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

  // Generate audio for all files in processing column
  const generateAudioAll = async () => {
    const processingFiles = audioFiles.filter(file => 
      file.status === 'processing' && file.processedText
    );
    
    for (const file of processingFiles) {
      try {
        moveFile(file.id, 'generating');
        updateFileProgress(file.id, 0);
        
        // Call Kokoro TTS API
        const response = await fetch('http://localhost:8880/v1/audio/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            input: file.processedText,
            voice: 'af_heart',
            response_format: 'mp3',
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

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <button 
                  onClick={transcribeAll}
                  disabled={getFilesForColumn('upload').length === 0}
                  className="btn bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Transcribe All ({getFilesForColumn('upload').length})
                </button>
                <button 
                  onClick={generateAudioAll}
                  disabled={getFilesForColumn('processing').length === 0}
                  className="btn bg-purple-500 text-white hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Generate Audio All ({getFilesForColumn('processing').length})
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
                >
                  {getFilesForColumn(column.id).map(file => (
                    <AudioCard
                      key={file.id}
                      file={file}
                      onProcessText={() => openProcessingModal(file.id)}
                      showProcessButton={column.id === 'transcribing' && file.transcription && !file.error}
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
      />
    </div>
  );
}

export default AudioRegeneration;