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
        { id: 'am_rock', name: 'Rock', gender: 'Male', accent: 'American', isBase: true },
        { id: 'am_bolt', name: 'Bolt', gender: 'Male', accent: 'American', isBase: true },
        { id: 'am_marble', name: 'Marble', gender: 'Male', accent: 'American', isBase: true },
        { id: 'bf_emma', name: 'Emma', gender: 'Female', accent: 'British', isBase: true },
        { id: 'bf_isabella', name: 'Isabella', gender: 'Female', accent: 'British', isBase: true },
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
      },
      {
        id: 'bf_emma+af_heart+bm_george',
        name: 'Diplomat',
        gender: 'Mixed',
        accent: 'International',
        isBase: false,
        isPredefined: true,
        components: ['bf_emma', 'af_heart', 'bm_george'],
        description: 'Refined international blend'
      },
      {
        id: 'af_bella+am_michael+bf_emma',
        name: 'Executive',
        gender: 'Mixed',
        accent: 'Professional',
        isBase: false,
        isPredefined: true,
        components: ['af_bella', 'am_michael', 'bf_emma'],
        description: 'Professional and authoritative'
      }
    ];
  };

  const loadCombinedVoices = () => {
    // Start with predefined voices
    const predefined = getPredefinedCombinedVoices();
    
    // Load user-created voices from localStorage
    const saved = localStorage.getItem('combinedVoices');
    let userCreated = [];
    if (saved) {
      try {
        userCreated = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load combined voices:', error);
      }
    }
    
    // Combine predefined and user-created voices
    const allCombined = [...predefined, ...userCreated];
    setCombinedVoices(allCombined);
  };

  const saveCombinedVoices = (voices) => {
    // Only save user-created voices to localStorage (not predefined ones)
    const userCreated = voices.filter(v => !v.isPredefined);
    localStorage.setItem('combinedVoices', JSON.stringify(userCreated));
    
    // Update state with all voices (predefined + user-created)
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
    // Don't allow deletion of predefined voices
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
      
      const sampleText = "Hello! This is a sample of my voice. I can help you with audio generation.";
      
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

  // Organize voices: predefined combined, user-created combined, then base voices
  const predefinedCombined = combinedVoices.filter(v => v.isPredefined);
  const userCombined = combinedVoices.filter(v => !v.isPredefined);
  const allVoices = [...predefinedCombined, ...userCombined, ...availableVoices];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h3>
          <button
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Text Processing Settings
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Processing Prompt
                </label>
                <textarea
                  value={localSettings.textProcessing.prompt}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    textProcessing: {
                      ...prev.textProcessing,
                      prompt: e.target.value
                    }
                  }))}
                  placeholder="Enter the prompt for text processing (e.g., 'Improve clarity and fix grammar')"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Instructions
                </label>
                <textarea
                  value={localSettings.textProcessing.instructions}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    textProcessing: {
                      ...prev.textProcessing,
                      instructions: e.target.value
                    }
                  }))}
                  placeholder="Add any specific instructions for processing (e.g., 'Keep technical terms unchanged')"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Voice Settings
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Voice
                </label>
                <button
                  onClick={() => setShowCombineInterface(!showCombineInterface)}
                  className="text-sm px-3 py-1 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
                >
                  {showCombineInterface ? 'Cancel Combination' : 'Create Combined Voice'}
                </button>
              </div>

              {showCombineInterface && (
                <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800 mb-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom Voice Name
                    </label>
                    <input
                      type="text"
                      value={customVoiceName}
                      onChange={(e) => setCustomVoiceName(e.target.value)}
                      placeholder="Enter a name for your combined voice"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select 2 or more voices to combine:
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {availableVoices.filter(v => v.isBase).map(voice => (
                        <label
                          key={voice.id}
                          className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={selectedVoicesForCombination.includes(voice.id)}
                            onChange={() => toggleVoiceForCombination(voice.id)}
                            className="text-violet-600"
                          />
                          <span className="text-sm">{voice.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={createCombinedVoice}
                    disabled={isCreatingCombination || selectedVoicesForCombination.length < 2 || !customVoiceName.trim()}
                    className="w-full px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreatingCombination ? 'Creating...' : `Create Combined Voice (${selectedVoicesForCombination.length} selected)`}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {allVoices.map(voice => (
                  <div
                    key={voice.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      localSettings.voice.voiceId === voice.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                    onClick={() => handleVoiceSelect(voice.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {voice.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {voice.gender} • {voice.accent}
                          {voice.isPredefined && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                              Preset
                            </span>
                          )}
                        </div>
                        {voice.components && (
                          <div className="text-xs text-violet-600 dark:text-violet-400">
                            Combined: {voice.components.join(' + ')}
                          </div>
                        )}
                        {voice.description && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {voice.description}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (playingVoice === voice.id) {
                              stopAllAudio();
                            } else {
                              playVoiceSample(voice.id);
                            }
                          }}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {playingVoice === voice.id ? (
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        {!voice.isBase && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete combined voice "${voice.name}"?`)) {
                                deleteCombinedVoice(voice.id);
                              }
                            }}
                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Speed
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
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {localSettings.voice.speed}x
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pitch
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
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {localSettings.voice.pitch}x
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
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

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;