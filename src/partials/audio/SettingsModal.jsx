import React, { useState, useEffect } from 'react';

function SettingsModal({ isOpen, onClose, settings, onSave }) {
  const [localSettings, setLocalSettings] = useState({
    textProcessing: {
      prompt: '',
      instructions: ''
    },
    voice: {
      voiceId: 'af_heart',
      speed: 1.0,
      pitch: 1.0,
      responseFormat: 'mp3'
    }
  });
  
  const [playingVoice, setPlayingVoice] = useState(null);
  const [audioElements] = useState({});
  const [availableVoices, setAvailableVoices] = useState([]);
  const [combinedVoices, setCombinedVoices] = useState([]);
  const [selectedVoicesForCombination, setSelectedVoicesForCombination] = useState([]);
  const [customVoiceName, setCustomVoiceName] = useState('');
  const [isCreatingCombination, setIsCreatingCombination] = useState(false);
  const [showCombineInterface, setShowCombineInterface] = useState(false);
  const [activeTab, setActiveTab] = useState('text');

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableVoices();
      loadCombinedVoices();
    }
  }, [isOpen]);

  const fetchAvailableVoices = async () => {
    try {
      const response = await fetch('http://localhost:8880/v1/audio/voices');
      if (response.ok) {
        const data = await response.json();
        const voices = data.voices || [];
        const formattedVoices = voices.map(voice => {
          const parts = voice.split('_');
          const accent = parts[0][0] === 'a' ? 'American' : parts[0][0] === 'b' ? 'British' : 'Other';
          const gender = parts[0][1] === 'f' ? 'Female' : parts[0][1] === 'm' ? 'Male' : 'Unknown';
          const name = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : voice;
          
          return {
            id: voice,
            name: name,
            gender: gender,
            accent: accent,
            isBase: true
          };
        });
        setAvailableVoices(formattedVoices);
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      setAvailableVoices([
        { id: 'af_heart', name: 'Heart', gender: 'Female', accent: 'American', isBase: true },
        { id: 'af_sky', name: 'Sky', gender: 'Female', accent: 'American', isBase: true },
        { id: 'af_river', name: 'River', gender: 'Female', accent: 'American', isBase: true },
        { id: 'am_adam', name: 'Adam', gender: 'Male', accent: 'American', isBase: true },
        { id: 'am_echo', name: 'Echo', gender: 'Male', accent: 'American', isBase: true },
        { id: 'am_michael', name: 'Michael', gender: 'Male', accent: 'American', isBase: true },
        { id: 'bf_emma', name: 'Emma', gender: 'Female', accent: 'British', isBase: true },
        { id: 'bf_lily', name: 'Lily', gender: 'Female', accent: 'British', isBase: true },
        { id: 'bm_george', name: 'George', gender: 'Male', accent: 'British', isBase: true },
        { id: 'bm_lewis', name: 'Lewis', gender: 'Male', accent: 'British', isBase: true }
      ]);
    }
  };

  const getPredefinedCombinedVoices = () => {
    return [
      {
        id: 'af_heart+af_sky',
        name: 'Harmony',
        gender: 'Female',
        accent: 'American',
        isBase: false,
        isPredefined: true,
        components: ['af_heart', 'af_sky'],
        description: 'Warm and clear female voice'
      },
      {
        id: 'af_heart+af_river',
        name: 'Serenity',
        gender: 'Female',
        accent: 'American',
        isBase: false,
        isPredefined: true,
        components: ['af_heart', 'af_river'],
        description: 'Gentle and flowing female voice'
      },
      {
        id: 'am_adam+am_echo',
        name: 'Thunder',
        gender: 'Male',
        accent: 'American',
        isBase: false,
        isPredefined: true,
        components: ['am_adam', 'am_echo'],
        description: 'Strong and confident male voice'
      },
      {
        id: 'bf_emma+bf_lily',
        name: 'Royal',
        gender: 'Female',
        accent: 'British',
        isBase: false,
        isPredefined: true,
        components: ['bf_emma', 'bf_lily'],
        description: 'Elegant and sophisticated British female'
      },
      {
        id: 'bm_george+bm_lewis',
        name: 'Gentleman',
        gender: 'Male',
        accent: 'British',
        isBase: false,
        isPredefined: true,
        components: ['bm_george', 'bm_lewis'],
        description: 'Distinguished British gentleman'
      },
      {
        id: 'af_heart+am_adam',
        name: 'Dynamic Duo',
        gender: 'Mixed',
        accent: 'American',
        isBase: false,
        isPredefined: true,
        components: ['af_heart', 'am_adam'],
        description: 'Balanced mix of warm female and strong male'
      },
      {
        id: 'af_heart+af_river+af_sky',
        name: 'Chorus',
        gender: 'Female',
        accent: 'American',
        isBase: false,
        isPredefined: true,
        components: ['af_heart', 'af_river', 'af_sky'],
        description: 'Rich harmonious female voice'
      },
      {
        id: 'am_adam+am_echo+am_michael',
        name: 'Commander',
        gender: 'Male',
        accent: 'American',
        isBase: false,
        isPredefined: true,
        components: ['am_adam', 'am_echo', 'am_michael'],
        description: 'Deep authoritative male voice'
      }
    ];
  };

  const loadCombinedVoices = () => {
    const predefined = getPredefinedCombinedVoices();
    const saved = localStorage.getItem('combinedVoices');
    let userCreated = [];
    if (saved) {
      try {
        userCreated = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load combined voices:', error);
      }
    }
    const allCombined = [...predefined, ...userCreated];
    setCombinedVoices(allCombined);
  };

  const saveCombinedVoices = (voices) => {
    const userCreated = voices.filter(v => !v.isPredefined);
    localStorage.setItem('combinedVoices', JSON.stringify(userCreated));
    const predefined = getPredefinedCombinedVoices();
    setCombinedVoices([...predefined, ...userCreated]);
  };

  const createCombinedVoice = async () => {
    if (selectedVoicesForCombination.length < 2 || !customVoiceName.trim()) {
      alert('Please select at least 2 voices and provide a name');
      return;
    }

    setIsCreatingCombination(true);
    try {
      const combinedId = selectedVoicesForCombination.join('+');
      const response = await fetch('http://localhost:8880/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: "Testing combined voice",
          voice: combinedId,
          response_format: 'mp3',
          stream: false
        })
      });
      
      if (response.ok) {
        const newCombinedVoice = {
          id: combinedId,
          name: customVoiceName,
          gender: 'Mixed',
          accent: 'Combined',
          isBase: false,
          isPredefined: false,
          components: selectedVoicesForCombination
        };
        
        const updatedCombinedVoices = [...combinedVoices, newCombinedVoice];
        saveCombinedVoices(updatedCombinedVoices);
        
        setSelectedVoicesForCombination([]);
        setCustomVoiceName('');
        setShowCombineInterface(false);
        
        alert(`Successfully created combined voice: ${customVoiceName}`);
      } else {
        throw new Error('Failed to create combined voice');
      }
    } catch (error) {
      console.error('Failed to create combined voice:', error);
      alert('Failed to create combined voice. Please try again.');
    } finally {
      setIsCreatingCombination(false);
    }
  };

  const toggleVoiceForCombination = (voiceId) => {
    setSelectedVoicesForCombination(prev => {
      if (prev.includes(voiceId)) {
        return prev.filter(id => id !== voiceId);
      } else {
        return [...prev, voiceId];
      }
    });
  };

  const deleteCombinedVoice = (voiceId) => {
    const voiceToDelete = combinedVoices.find(v => v.id === voiceId);
    if (voiceToDelete?.isPredefined) {
      alert('Cannot delete predefined voices. You can only delete custom voices you created.');
      return;
    }
    
    const updatedVoices = combinedVoices.filter(v => v.id !== voiceId);
    saveCombinedVoices(updatedVoices);
    
    if (localSettings.voice.voiceId === voiceId) {
      setLocalSettings(prev => ({
        ...prev,
        voice: {
          ...prev.voice,
          voiceId: 'af_heart'
        }
      }));
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleVoiceSelect = (voiceId) => {
    setLocalSettings(prev => ({
      ...prev,
      voice: {
        ...prev.voice,
        voiceId
      }
    }));
  };

  const playVoiceSample = async (voiceId) => {
    try {
      setPlayingVoice(voiceId);
      const sampleText = "Hello! This is a sample of my voice.";
      
      const response = await fetch('http://localhost:8880/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: sampleText,
          voice: voiceId,
          response_format: 'mp3',
          stream: false
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate voice sample');
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioElements[voiceId]) {
        audioElements[voiceId].pause();
      }
      
      const audio = new Audio(audioUrl);
      audioElements[voiceId] = audio;
      
      audio.onended = () => {
        setPlayingVoice(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Failed to play voice sample:', error);
      setPlayingVoice(null);
    }
  };

  const stopAllAudio = () => {
    Object.values(audioElements).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setPlayingVoice(null);
  };

  if (!isOpen) return null;

  const predefinedCombined = combinedVoices.filter(v => v.isPredefined);
  const userCombined = combinedVoices.filter(v => !v.isPredefined);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customize your audio generation preferences</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('text')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'text'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Text Processing</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'voice'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>Voice & Audio</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'text' && (
            <div className="space-y-6">
              {/* Persona Presets */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Processing Persona
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {[
                    {
                      id: 'professional',
                      name: 'Professional',
                      icon: '💼',
                      prompt: 'You are a professional editor. Transform the transcribed text into clear, professional language suitable for business communications. Fix grammar, improve clarity, and maintain a formal tone.',
                      description: 'Business & formal tone'
                    },
                    {
                      id: 'casual',
                      name: 'Casual',
                      icon: '😊',
                      prompt: 'You are a friendly editor. Transform the transcribed text into clear, conversational language. Fix grammar while maintaining a casual, approachable tone.',
                      description: 'Conversational & friendly'
                    },
                    {
                      id: 'academic',
                      name: 'Academic',
                      icon: '🎓',
                      prompt: 'You are an academic editor. Transform the transcribed text into scholarly language with proper structure. Use formal vocabulary, correct grammar, and ensure academic precision.',
                      description: 'Scholarly & precise'
                    },
                    {
                      id: 'creative',
                      name: 'Creative',
                      icon: '🎨',
                      prompt: 'You are a creative writer. Transform the transcribed text into engaging, vivid language. Use creative expressions, improve flow, and make the content more compelling.',
                      description: 'Engaging & expressive'
                    },
                    {
                      id: 'technical',
                      name: 'Technical',
                      icon: '🔧',
                      prompt: 'You are a technical writer. Transform the transcribed text into clear, precise technical documentation. Maintain technical accuracy, use proper terminology, and ensure clarity.',
                      description: 'Precise & accurate'
                    },
                    {
                      id: 'summary',
                      name: 'Summarizer',
                      icon: '📝',
                      prompt: 'You are a summarization expert. Transform the transcribed text into a concise summary that captures the key points and main ideas clearly and efficiently.',
                      description: 'Concise key points'
                    }
                  ].map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => setLocalSettings(prev => ({
                        ...prev,
                        textProcessing: {
                          ...prev.textProcessing,
                          prompt: persona.prompt
                        }
                      }))}
                      className={`p-3 text-left border-2 rounded-lg transition-all hover:shadow-md ${
                        localSettings.textProcessing.prompt === persona.prompt
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{persona.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{persona.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{persona.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                      Custom Processing Prompt
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLocalSettings(prev => ({
                          ...prev,
                          textProcessing: {
                            ...prev.textProcessing,
                            prompt: 'You are a professional editor. Please process the following transcribed text:\n\n{TRANSCRIPT}\n\nInstructions: {INSTRUCTIONS}\n\nImproved text:'
                          }
                        }))}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={localSettings.textProcessing.prompt}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        textProcessing: {
                          ...prev.textProcessing,
                          prompt: e.target.value
                        }
                      }))}
                      placeholder="Enter your custom prompt for text processing..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-colors"
                      rows={5}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Available variables: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">{'{TRANSCRIPT}'}</code>, <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">{'{INSTRUCTIONS}'}</code>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { var: '{TRANSCRIPT}', desc: 'Original transcribed text' },
                        { var: '{INSTRUCTIONS}', desc: 'Additional instructions below' },
                        { var: '{FILENAME}', desc: 'Original filename' },
                        { var: '{LENGTH}', desc: 'Text length in words' }
                      ].map((variable) => (
                        <button
                          key={variable.var}
                          onClick={() => {
                            const textarea = document.querySelector('textarea[placeholder*="custom prompt"]');
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const newValue = localSettings.textProcessing.prompt.substring(0, start) + variable.var + localSettings.textProcessing.prompt.substring(end);
                              setLocalSettings(prev => ({
                                ...prev,
                                textProcessing: {
                                  ...prev.textProcessing,
                                  prompt: newValue
                                }
                              }));
                            }
                          }}
                          className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          title={variable.desc}
                        >
                          {variable.var}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Additional Instructions
                  </label>
                  <div className="relative">
                    <textarea
                      value={localSettings.textProcessing.instructions}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        textProcessing: {
                          ...prev.textProcessing,
                          instructions: e.target.value
                        }
                      }))}
                      placeholder="Add any specific processing instructions..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-colors"
                      rows={3}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    These instructions will be inserted into the {'{INSTRUCTIONS}'} variable in your prompt.
                  </p>
                </div>

                {/* Quick Actions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Quick Actions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        name: 'Grammar Fix Only',
                        instruction: 'Only fix grammar and spelling errors. Do not change the tone, style, or content.'
                      },
                      {
                        name: 'Remove Filler Words',
                        instruction: 'Remove filler words like "um", "uh", "you know", "like" while maintaining natural flow.'
                      },
                      {
                        name: 'Add Punctuation',
                        instruction: 'Add proper punctuation and paragraph breaks for better readability.'
                      },
                      {
                        name: 'Maintain Technical Terms',
                        instruction: 'Keep all technical terms, jargon, and specialized vocabulary unchanged.'
                      }
                    ].map((action) => (
                      <button
                        key={action.name}
                        onClick={() => setLocalSettings(prev => ({
                          ...prev,
                          textProcessing: {
                            ...prev.textProcessing,
                            instructions: prev.textProcessing.instructions 
                              ? `${prev.textProcessing.instructions}\n\n${action.instruction}`
                              : action.instruction
                          }
                        }))}
                        className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        + {action.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-8">
              {/* Voice Selection */}
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Voice Selection</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose from preset combinations or base voices</p>
                </div>

                {/* Preset Combined Voices */}
                {predefinedCombined.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Preset Voices
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {predefinedCombined.map(voice => (
                        <div
                          key={voice.id}
                          className={`group p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            localSettings.voice.voiceId === voice.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                          }`}
                          onClick={() => handleVoiceSelect(voice.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="font-semibold text-gray-900 dark:text-white">{voice.name}</h5>
                                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                  Preset
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                {voice.gender} • {voice.accent}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {voice.description}
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                {voice.components.join(' + ')}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (playingVoice === voice.id) {
                                  stopAllAudio();
                                } else {
                                  playVoiceSample(voice.id);
                                }
                              }}
                              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              {playingVoice === voice.id ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Created Voices */}
                {userCombined.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Your Custom Voices
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userCombined.map(voice => (
                        <div
                          key={voice.id}
                          className={`group p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            localSettings.voice.voiceId === voice.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                          }`}
                          onClick={() => handleVoiceSelect(voice.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-1">{voice.name}</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                {voice.gender} • {voice.accent}
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-400">
                                {voice.components.join(' + ')}
                              </p>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (playingVoice === voice.id) {
                                    stopAllAudio();
                                  } else {
                                    playVoiceSample(voice.id);
                                  }
                                }}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              >
                                {playingVoice === voice.id ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete voice "${voice.name}"?`)) {
                                    deleteCombinedVoice(voice.id);
                                  }
                                }}
                                className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Base Voices */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Base Voices
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableVoices.filter(v => v.isBase).map(voice => (
                      <div
                        key={voice.id}
                        className={`group p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          localSettings.voice.voiceId === voice.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleVoiceSelect(voice.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">{voice.name}</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{voice.gender}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (playingVoice === voice.id) {
                                stopAllAudio();
                              } else {
                                playVoiceSample(voice.id);
                              }
                            }}
                            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            {playingVoice === voice.id ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audio Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Speed: {localSettings.voice.speed}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={localSettings.voice.speed}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        voice: {
                          ...prev.voice,
                          speed: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Pitch: {localSettings.voice.pitch}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={localSettings.voice.pitch}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        voice: {
                          ...prev.voice,
                          pitch: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Output Format
                    </label>
                    <select
                      value={localSettings.voice.responseFormat}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        voice: {
                          ...prev.voice,
                          responseFormat: e.target.value
                        }
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="mp3">MP3</option>
                      <option value="wav">WAV</option>
                      <option value="opus">Opus</option>
                      <option value="aac">AAC</option>
                      <option value="flac">FLAC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Save Settings
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}

export default SettingsModal;